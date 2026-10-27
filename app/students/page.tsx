"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import WindowHeader from "../components/WindowHeader";
import AuthGuard from "../components/AuthGuard";
import {
  Student,
  ClassItem,
  STORAGE_KEYS,
  useStore,
  saveStudents,
  logActivity,
  User,
} from "../lib/storage";
import {
  getSupabaseStudents,
  insertSupabaseStudent,
  updateSupabaseStudent,
  deleteSupabaseStudent,
  getSupabaseClasses,
  insertSupabaseActivity,
} from "../lib/supabaseService";
import {
  showWarning,
  showError,
  showSuccess,
  confirmDialog,
  toastSuccess,
} from "../lib/alert";

const DEFAULT_CLASSES = [
  "Pre-Nursery",
  "Nursery",
  "Prep",
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
];

export default function StudentManagement() {
  const router = useRouter();
  const [currentUser] = useStore<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  const [localStudents, setLocalStudents] = useStore<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const [localClasses] = useStore<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
  const [students, setStudents] = useState<Student[]>(localStudents);
  const [classesList, setClassesList] = useState<ClassItem[]>(localClasses);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [remoteSt, remoteCl] = await Promise.all([
        getSupabaseStudents(),
        getSupabaseClasses(),
      ]);
      if (!isMounted) return;
      if (remoteSt.length > 0) {
        setStudents(remoteSt);
        setLocalStudents(remoteSt);
      }
      if (remoteCl.length > 0) {
        setClassesList(remoteCl);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [setLocalStudents]);

  const [formData, setFormData] = useState<Student>({
    id: "",
    name: "",
    fatherName: "",
    class: "10th",
    phone: "",
    gender: "Male",
    dob: "",
    address: "",
    photo: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNew = () => {
    const maxNum = students.reduce((max, s) => {
      const match = s.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const nextId = `STU-${String(maxNum + 1).padStart(4, "0")}`;

    setFormData({
      id: nextId,
      name: "",
      fatherName: "",
      class: classesList.length > 0 ? classesList[0].name : "10th",
      phone: "",
      gender: "Male",
      dob: "",
      address: "",
      photo: null,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showWarning("Required Field", "Student Name is required!");
      return;
    }
    const maxNum = students.reduce((max, s) => {
      const match = s.id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      return num > max ? num : max;
    }, 0);
    const studentId = formData.id.trim() || `STU-${String(maxNum + 1).padStart(4, "0")}`;

    if (students.some((s) => s.id.toLowerCase() === studentId.toLowerCase())) {
      showError(
        "Duplicate ID",
        `Student ID "${studentId}" already exists. Click Update if you want to modify it.`
      );
      return;
    }

    const newStudent: Student = { ...formData, id: studentId };

    // 1. Try Supabase direct write
    const savedInSupabase = await insertSupabaseStudent(newStudent);
    if (savedInSupabase) {
      await insertSupabaseActivity(`Registered new student ${newStudent.name} (${newStudent.id})`);
      const refreshed = await getSupabaseStudents();
      setStudents(refreshed);
      setLocalStudents(refreshed);
      showSuccess("Saved to Supabase!", `Student ${newStudent.name} saved directly to Supabase.`);
    } else {
      // 2. Backup to local if tables not run yet
      const updated = [...students, newStudent];
      setStudents(updated);
      setLocalStudents(updated);
      saveStudents(updated);
      logActivity(`Registered new student ${newStudent.name} (${newStudent.id})`);
      showWarning(
        "Saved (Supabase Pending)",
        `Student ${newStudent.name} saved! Run the SQL schema in Supabase SQL editor to enable cloud syncing.`
      );
    }
    handleClear();
  };

  const handleUpdate = async () => {
    if (!formData.id) {
      showWarning("No Student Selected", "Select a student from the list to update first.");
      return;
    }
    if (!formData.name.trim()) {
      showWarning("Required Field", "Student Name cannot be empty.");
      return;
    }

    const updatedInSupabase = await updateSupabaseStudent(formData);
    const updated = students.map((s) => (s.id === formData.id ? formData : s));
    setStudents(updated);
    setLocalStudents(updated);
    saveStudents(updated);

    if (updatedInSupabase) {
      await insertSupabaseActivity(`Updated student ${formData.name} (${formData.id})`);
      showSuccess("Updated in Supabase!", `Student ${formData.name} record updated.`);
    } else {
      logActivity(`Updated student ${formData.name} (${formData.id})`);
      showSuccess("Updated!", `Student ${formData.name} record updated.`);
    }
    handleClear();
  };

  const handleDelete = async () => {
    if (currentUser?.role !== "Admin") {
      showWarning("Admin Access Required", "Only Administrators have permission to delete student records.");
      return;
    }
    if (!formData.id) {
      showWarning("No Selection", "Please select a student to delete.");
      return;
    }
    const confirmed = await confirmDialog({
      title: "Delete Student?",
      text: `Are you sure you want to delete Student "${formData.name}" (${formData.id})? This action cannot be reversed.`,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#EF4444",
    });

    if (confirmed) {
      await deleteSupabaseStudent(formData.id);
      await insertSupabaseActivity(`Deleted student ${formData.name} (${formData.id})`);
      const updated = students.filter((s) => s.id !== formData.id);
      setStudents(updated);
      setLocalStudents(updated);
      saveStudents(updated);
      logActivity(`Deleted student ${formData.name} (${formData.id})`);
      toastSuccess(`Student "${formData.name}" deleted.`);
      handleClear();
    }
  };

  const handleClear = () => {
    setFormData({
      id: "",
      name: "",
      fatherName: "",
      class: classesList.length > 0 ? classesList[0].name : "10th",
      phone: "",
      gender: "Male",
      dob: "",
      address: "",
      photo: null,
    });
  };

  const handleRowClick = (student: Student) => {
    setFormData(student);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableClassNames = Array.from(
    new Set([...classesList.map((c) => c.name), ...DEFAULT_CLASSES])
  );

  return (
    <AuthGuard allowedRoles={["Admin", "Teacher"]}>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-auto bg-[#F1F5F9]">
        <WindowHeader title="Student Management" onClose={() => router.push("/dashboard")} />

        <div className="p-6 max-w-6xl mx-auto w-full">
          {/* FORM CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-[13px] font-bold text-slate-700 mb-6 tracking-wide">
              Student Information
            </h2>

            <div className="flex gap-8">
              {/* Form Fields Grid */}
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Student ID
                  </label>
                  <input
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="STU-0001"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Class
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    {availableClassNames.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Student Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ali Raza"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Phone
                  </label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Father Name
                  </label>
                  <input
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleInputChange}
                    placeholder="Muhammad Raza"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Address
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House # 123..."
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="w-32 flex flex-col items-center gap-2 shrink-0">
                <span className="text-[13px] text-slate-600 font-medium w-full text-left">
                  Photo
                </span>
                <div className="w-28 h-28 bg-white border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                  {formData.photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={formData.photo}
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-blue-400 w-full h-full flex items-end justify-center relative overflow-hidden">
                      <div className="w-12 h-12 bg-[#FFD1A9] rounded-full absolute top-4"></div>
                      <div className="w-20 h-16 bg-[#FFD1A9] rounded-t-full absolute -bottom-2"></div>
                      <div className="w-24 h-10 bg-[#1E3A8A] rounded-t-full absolute -bottom-6 z-10"></div>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                >
                  Browse
                </button>
                {formData.photo && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, photo: null }))}
                    className="w-full py-1 text-[11px] font-medium text-red-600 bg-white border border-slate-300 rounded hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2.5 mt-8">
              <button
                type="button"
                onClick={handleNew}
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors shadow-sm"
              >
                New
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors shadow-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors shadow-sm"
              >
                Update
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors shadow-sm"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors shadow-sm"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="bg-[#64748B] hover:bg-[#475569] text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>

          {/* LIST CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-bold text-slate-700 tracking-wide">
                Student List
              </h2>
              <input
                type="text"
                placeholder="Search Student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-xs w-60 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold">Student ID</th>
                    <th className="py-2.5 px-4 font-semibold">Student Name</th>
                    <th className="py-2.5 px-4 font-semibold">Father Name</th>
                    <th className="py-2.5 px-4 font-semibold">Class</th>
                    <th className="py-2.5 px-4 font-semibold">Phone</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 divide-y divide-slate-100">
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      onClick={() => handleRowClick(student)}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                        formData.id === student.id ? "bg-blue-50 font-medium" : "bg-white"
                      }`}
                    >
                      <td className="py-2.5 px-4">{student.id}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">
                        {student.name}
                      </td>
                      <td className="py-2.5 px-4">{student.fatherName}</td>
                      <td className="py-2.5 px-4">{student.class}</td>
                      <td className="py-2.5 px-4">{student.phone || "—"}</td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        {students.length === 0
                          ? "No students added yet. Click 'New' above to add your first student."
                          : "No students match your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </AuthGuard>
);
}

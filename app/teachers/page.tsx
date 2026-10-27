"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import WindowHeader from "../components/WindowHeader";
import AuthGuard from "../components/AuthGuard";
import { TeacherAvatarIllustration } from "../components/Illustrations";
import {
  Teacher,
  STORAGE_KEYS,
  useStore,
  saveTeachers,
  getNextTeacherId,
  logActivity,
  User,
} from "../lib/storage";
import {
  getSupabaseTeachers,
  insertSupabaseTeacher,
  updateSupabaseTeacher,
  deleteSupabaseTeacher,
  insertSupabaseActivity,
} from "../lib/supabaseService";
import {
  showWarning,
  showError,
  showSuccess,
  confirmDialog,
  toastSuccess,
} from "../lib/alert";

const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "English",
  "Computer",
  "Chemistry",
  "Biology",
  "Urdu",
  "Islamiat",
  "Social Studies",
  "General Science",
];

export default function TeacherManagement() {
  const router = useRouter();
  const [currentUser] = useStore<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  const [localTeachers, setLocalTeachers] = useStore<Teacher[]>(STORAGE_KEYS.TEACHERS, []);
  const [teachers, setTeachers] = useState<Teacher[]>(localTeachers);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const remote = await getSupabaseTeachers();
      if (!isMounted) return;
      if (remote.length > 0) {
        setTeachers(remote);
        setLocalTeachers(remote);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [setLocalTeachers]);

  const [formData, setFormData] = useState<Teacher>({
    id: "",
    name: "",
    subject: "Mathematics",
    phone: "",
    salary: "",
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
    const nextId = getNextTeacherId();
    setFormData({
      id: nextId,
      name: "",
      subject: "Mathematics",
      phone: "",
      salary: "",
      photo: null,
    });
  };

  const handleSave = async () => {
    if (currentUser?.role !== "Admin") {
      showWarning("Admin Access Required", "Only Administrators have permission to add new teacher records.");
      return;
    }
    if (!formData.name.trim()) {
      showWarning("Required Field", "Please enter Teacher Name.");
      return;
    }
    const teacherId = formData.id.trim() || getNextTeacherId();

    if (teachers.some((t) => t.id.toLowerCase() === teacherId.toLowerCase())) {
      showError(
        "Duplicate Teacher ID",
        `Teacher ID "${teacherId}" already exists. Click Update if you want to modify it.`
      );
      return;
    }

    const newTeacher: Teacher = { ...formData, id: teacherId };
    const savedInSupabase = await insertSupabaseTeacher(newTeacher);

    if (savedInSupabase) {
      await insertSupabaseActivity(`Added teacher ${newTeacher.name} (${newTeacher.subject})`);
      const refreshed = await getSupabaseTeachers();
      setTeachers(refreshed);
      setLocalTeachers(refreshed);
      showSuccess("Teacher Added in Supabase!", `Teacher ${newTeacher.name} has been saved.`);
    } else {
      const updated = [...teachers, newTeacher];
      setTeachers(updated);
      setLocalTeachers(updated);
      saveTeachers(updated);
      logActivity(`Added teacher ${newTeacher.name} (${newTeacher.subject})`);
      showWarning(
        "Saved (Supabase Pending)",
        `Teacher ${newTeacher.name} saved! Run the SQL schema in Supabase to sync.`
      );
    }
    handleClear();
  };

  const handleUpdate = async () => {
    if (currentUser?.role !== "Admin") {
      showWarning("Admin Access Required", "Only Administrators have permission to update teacher records.");
      return;
    }
    if (!formData.id) {
      showWarning("No Selection", "Please select a teacher from the list to update.");
      return;
    }
    if (!formData.name.trim()) {
      showWarning("Required Field", "Teacher Name cannot be empty.");
      return;
    }

    const updatedInSupabase = await updateSupabaseTeacher(formData);
    const updated = teachers.map((t) => (t.id === formData.id ? formData : t));
    setTeachers(updated);
    setLocalTeachers(updated);
    saveTeachers(updated);

    if (updatedInSupabase) {
      await insertSupabaseActivity(`Updated teacher ${formData.name} (${formData.id})`);
      showSuccess("Teacher Updated in Supabase!", `Teacher ${formData.name} has been updated.`);
    } else {
      logActivity(`Updated teacher ${formData.name} (${formData.id})`);
      showSuccess("Teacher Updated!", `Teacher ${formData.name} has been updated.`);
    }
    handleClear();
  };

  const handleDelete = async () => {
    if (currentUser?.role !== "Admin") {
      showWarning("Admin Access Required", "Only Administrators have permission to delete teacher records.");
      return;
    }
    if (!formData.id) {
      showWarning("No Selection", "Please select a teacher to delete.");
      return;
    }
    const confirmed = await confirmDialog({
      title: "Delete Teacher?",
      text: `Are you sure you want to delete "${formData.name}" (${formData.id})?`,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#EF4444",
    });

    if (confirmed) {
      const deletedInSupabase = await deleteSupabaseTeacher(formData.id);
      const updated = teachers.filter((t) => t.id !== formData.id);
      setTeachers(updated);
      setLocalTeachers(updated);
      saveTeachers(updated);

      if (deletedInSupabase) {
        await insertSupabaseActivity(`Deleted teacher ${formData.name} (${formData.id})`);
      } else {
        logActivity(`Deleted teacher ${formData.name} (${formData.id})`);
      }
      toastSuccess(`Teacher "${formData.name}" deleted.`);
      handleClear();
    }
  };

  const handleClear = () => {
    setFormData({
      id: "",
      name: "",
      subject: "Mathematics",
      phone: "",
      salary: "",
      photo: null,
    });
  };

  const handleRowClick = (item: Teacher) => {
    setFormData(item);
  };

  const formatSalary = (val: string) => {
    if (currentUser?.role !== "Admin") return "Confidential";
    if (!val) return "0.00";
    const num = parseFloat(val.replace(/,/g, ""));
    if (isNaN(num)) return val;
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard allowedRoles={["Admin", "Teacher"]}>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-auto bg-[#F1F5F9]">
        <WindowHeader title="Teacher Management" onClose={() => router.push("/dashboard")} />

        <div className="p-6 max-w-5xl mx-auto w-full">
          {/* FORM CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-[13px] font-bold text-slate-700 mb-6 tracking-wide">
              Teacher Information
            </h2>

            <div className="flex items-start justify-between gap-8">
              {/* Form Inputs Grid */}
              <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Teacher ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="TCH-0001"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-16 shrink-0">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0300-1112222"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Teacher Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Mr. Usman Shah"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-16 shrink-0">
                    Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    disabled={currentUser?.role !== "Admin"}
                    value={currentUser?.role !== "Admin" ? "Confidential" : formData.salary}
                    onChange={handleInputChange}
                    placeholder="45,000.00"
                    className={`flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] outline-none ${
                      currentUser?.role !== "Admin"
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-white text-slate-700 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    {SUBJECT_OPTIONS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload / Avatar Box */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="w-28 h-28 bg-[#F8FAFC] border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                  {formData.photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={formData.photo}
                      alt="Teacher"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <TeacherAvatarIllustration />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex gap-1.5 w-28">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                  >
                    Browse
                  </button>
                  {formData.photo && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, photo: null }))}
                      className="flex-1 py-1 text-[11px] font-medium text-red-600 bg-white border border-slate-300 rounded hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
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
                Teacher List
              </h2>
              <input
                type="text"
                placeholder="Search Teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-xs w-60 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold">Teacher ID</th>
                    <th className="py-2.5 px-4 font-semibold">Teacher Name</th>
                    <th className="py-2.5 px-4 font-semibold">Subject</th>
                    <th className="py-2.5 px-4 font-semibold">Phone</th>
                    <th className="py-2.5 px-4 font-semibold">Salary</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 divide-y divide-slate-100">
                  {filteredTeachers.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                        formData.id === item.id ? "bg-blue-50 font-medium" : "bg-white"
                      }`}
                    >
                      <td className="py-2.5 px-4">{item.id}</td>
                      <td className="py-2.5 px-4">{item.name}</td>
                      <td className="py-2.5 px-4">{item.subject}</td>
                      <td className="py-2.5 px-4">{item.phone || "—"}</td>
                      <td className="py-2.5 px-4 font-mono">
                        {formatSalary(item.salary)}
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        {teachers.length === 0
                          ? "No teachers added yet. Click 'New' above to add your first teacher."
                          : "No teachers match your search."}
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


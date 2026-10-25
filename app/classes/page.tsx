"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import WindowHeader from "../components/WindowHeader";
import { SchoolIllustration } from "../components/Illustrations";
import {
  ClassItem,
  Teacher,
  STORAGE_KEYS,
  useStore,
  getNextClassId,
  logActivity,
} from "../lib/storage";
import {
  showWarning,
  showError,
  showSuccess,
  confirmDialog,
  toastSuccess,
} from "../lib/alert";

export default function ClassManagement() {
  const router = useRouter();
  const [classes, setClasses] = useStore<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
  const [teachers] = useStore<Teacher[]>(STORAGE_KEYS.TEACHERS, []);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<ClassItem>({
    id: "",
    name: "",
    section: "A",
    teacher: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNew = () => {
    const nextId = getNextClassId();
    setFormData({
      id: nextId,
      name: "",
      section: "A",
      teacher: teachers.length > 0 ? teachers[0].name : "",
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showWarning("Required Field", "Please enter Class Name.");
      return;
    }
    const classId = formData.id.trim() || getNextClassId();

    if (classes.some((c) => c.id.toLowerCase() === classId.toLowerCase())) {
      showError(
        "Duplicate Class ID",
        `Class ID "${classId}" already exists. Click Update if you want to modify it.`
      );
      return;
    }

    const newClass: ClassItem = { ...formData, id: classId };
    const updated = [...classes, newClass];
    setClasses(updated);
    logActivity(`Added class ${newClass.name} - Sec ${newClass.section}`);
    showSuccess("Class Added!", `Class ${newClass.name} (Sec ${newClass.section}) has been created.`);
    handleClear();
  };

  const handleUpdate = () => {
    if (!formData.id) {
      showWarning("No Selection", "Please select a class from the list to update.");
      return;
    }
    if (!formData.name.trim()) {
      showWarning("Required Field", "Class Name cannot be empty.");
      return;
    }

    const exists = classes.some((c) => c.id === formData.id);
    if (!exists) {
      showError("Not Found", "Selected class not found in database.");
      return;
    }

    const updated = classes.map((c) => (c.id === formData.id ? formData : c));
    setClasses(updated);
    logActivity(`Updated class ${formData.name} (${formData.id})`);
    showSuccess("Class Updated!", `Class ${formData.name} has been updated.`);
    handleClear();
  };

  const handleDelete = async () => {
    if (!formData.id) {
      showWarning("No Selection", "Please select a class to delete.");
      return;
    }
    const confirmed = await confirmDialog({
      title: "Delete Class?",
      text: `Are you sure you want to delete Class "${formData.name}" (${formData.id})?`,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#EF4444",
    });

    if (confirmed) {
      const updated = classes.filter((c) => c.id !== formData.id);
      setClasses(updated);
      logActivity(`Deleted class ${formData.name} (${formData.id})`);
      toastSuccess(`Class "${formData.name}" deleted.`);
      handleClear();
    }
  };

  const handleClear = () => {
    setFormData({
      id: "",
      name: "",
      section: "A",
      teacher: "",
    });
  };

  const handleRowClick = (item: ClassItem) => {
    setFormData(item);
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.teacher.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-auto bg-[#F1F5F9]">
        <WindowHeader title="Class Management" onClose={() => router.push("/dashboard")} />

        <div className="p-6 max-w-5xl mx-auto w-full">
          {/* FORM CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-[13px] font-bold text-slate-700 mb-6 tracking-wide">
              Class Information
            </h2>

            <div className="flex items-start justify-between gap-8">
              {/* Form Fields */}
              <div className="flex-1 max-w-md space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-[13px] text-slate-600 w-28 shrink-0">
                    Class ID
                  </label>
                  <input
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="CLS-0001"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-[13px] text-slate-600 w-28 shrink-0">
                    Class Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="10th"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-[13px] text-slate-600 w-28 shrink-0">
                    Section
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="text-[13px] text-slate-600 w-28 shrink-0">
                    Class Teacher
                  </label>
                  <select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.name}>
                        {t.name} ({t.subject || "General"})
                      </option>
                    ))}
                    {teachers.length === 0 && (
                      <option value="Not Assigned">No teachers added yet</option>
                    )}
                  </select>
                </div>
              </div>

              {/* School Building Illustration */}
              <div className="pr-4 hidden sm:flex items-center justify-center">
                <SchoolIllustration />
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
                Class List
              </h2>
              <input
                type="text"
                placeholder="Search Class..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-xs w-60 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold">Class ID</th>
                    <th className="py-2.5 px-4 font-semibold">Class Name</th>
                    <th className="py-2.5 px-4 font-semibold">Section</th>
                    <th className="py-2.5 px-4 font-semibold">Class Teacher</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 divide-y divide-slate-100">
                  {filteredClasses.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                        formData.id === item.id ? "bg-blue-50 font-medium" : "bg-white"
                      }`}
                    >
                      <td className="py-2.5 px-4">{item.id}</td>
                      <td className="py-2.5 px-4">{item.name}</td>
                      <td className="py-2.5 px-4">{item.section}</td>
                      <td className="py-2.5 px-4">{item.teacher || "—"}</td>
                    </tr>
                  ))}
                  {filteredClasses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-400">
                        {classes.length === 0
                          ? "No classes added yet. Click 'New' above to add your first class."
                          : "No classes match your search."}
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
  );
}


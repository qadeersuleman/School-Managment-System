"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import WindowHeader from "../components/WindowHeader";
import AuthGuard from "../components/AuthGuard";
import { AttendanceIllustration } from "../components/Illustrations";
import {
  AttendanceRecord,
  Student,
  STORAGE_KEYS,
  useStore,
  getNextAttendanceId,
  logActivity,
} from "../lib/storage";
import {
  showWarning,
  showSuccess,
  confirmDialog,
  toastSuccess,
} from "../lib/alert";

export default function AttendanceManagement() {
  const router = useRouter();
  const [records, setRecords] = useStore<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
  const [students] = useStore<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    studentId: string;
    studentName: string;
    date: string;
    status: "Present" | "Absent" | "Leave";
    remarks: string;
  }>({
    studentId: "",
    studentName: "",
    date: "",
    status: "Present",
    remarks: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "student") {
      const selected = students.find((s) => s.id === value);
      setFormData((prev) => ({
        ...prev,
        studentId: value,
        studentName: selected ? selected.name : "",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!formData.studentName.trim()) {
      showWarning("Required Field", "Please select a student from the dropdown.");
      return;
    }

    const recordDate = formData.date || new Date().toISOString().split("T")[0];

    if (selectedId) {
      // Update existing record
      const updated = records.map((r) =>
        r.id === selectedId
          ? {
              ...r,
              studentId: formData.studentId,
              studentName: formData.studentName,
              date: recordDate,
              status: formData.status,
              remarks: formData.remarks,
            }
          : r
      );
      setRecords(updated);
      logActivity(`Updated attendance for ${formData.studentName}: ${formData.status}`);
      showSuccess("Attendance Updated!", `Attendance updated for ${formData.studentName}.`);
      handleClear();
      return;
    }

    // Save new record
    const newId = getNextAttendanceId();
    const newRecord: AttendanceRecord = {
      id: newId,
      studentId: formData.studentId,
      studentName: formData.studentName,
      date: recordDate,
      status: formData.status,
      remarks: formData.remarks,
    };

    const updated = [...records, newRecord];
    setRecords(updated);
    logActivity(`Marked attendance for ${newRecord.studentName} as ${newRecord.status}`);
    showSuccess("Attendance Saved!", `Marked ${newRecord.studentName} as ${newRecord.status}.`);
    handleClear();
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    const confirmed = await confirmDialog({
      title: "Delete Attendance Record?",
      text: "Are you sure you want to delete this attendance record?",
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#EF4444",
    });

    if (confirmed) {
      const updated = records.filter((r) => r.id !== selectedId);
      setRecords(updated);
      logActivity(`Deleted attendance record #${selectedId}`);
      toastSuccess("Attendance record deleted.");
      handleClear();
    }
  };

  const handleClear = () => {
    setSelectedId(null);
    setFormData({
      studentId: "",
      studentName: "",
      date: "",
      status: "Present",
      remarks: "",
    });
  };

  const handleRowClick = (item: AttendanceRecord) => {
    setSelectedId(item.id);
    setFormData({
      studentId: item.studentId,
      studentName: item.studentName,
      date: item.date,
      status: item.status,
      remarks: item.remarks,
    });
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "—";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const filteredRecords = records.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-auto bg-[#F1F5F9]">
        <WindowHeader title="Attendance Management" onClose={() => router.push("/dashboard")} />

        <div className="p-6 max-w-5xl mx-auto w-full">
          {/* FORM CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-[13px] font-bold text-slate-700 mb-6 tracking-wide">
              Attendance Information
            </h2>

            <div className="flex items-start justify-between gap-8">
              {/* Form Fields */}
              <div className="flex-1 max-w-md space-y-4">
                {/* Student Dropdown */}
                <div className="flex items-center gap-4">
                  <label className="text-[13px] text-slate-600 w-32 shrink-0">
                    Student
                  </label>
                  <select
                    name="student"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                    {students.length === 0 && (
                      <option value="" disabled>
                        No students added yet
                      </option>
                    )}
                  </select>
                </div>

                {/* Attendance Date */}
                <div className="flex items-center gap-4">
                  <label className="text-[13px] text-slate-600 w-32 shrink-0">
                    Attendance Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  />
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-4">
                  <label className="text-[13px] text-slate-600 w-32 shrink-0">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer font-medium"
                  >
                    <option value="Present" className="text-green-600">
                      Present
                    </option>
                    <option value="Absent" className="text-red-500">
                      Absent
                    </option>
                    <option value="Leave" className="text-amber-500">
                      Leave
                    </option>
                  </select>
                </div>

                {/* Remarks */}
                <div className="flex items-start gap-4">
                  <label className="text-[13px] text-slate-600 w-32 shrink-0 pt-1.5">
                    Remarks
                  </label>
                  <textarea
                    name="remarks"
                    rows={2}
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="On time and active in class..."
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white resize-none"
                  />
                </div>
              </div>

              {/* Attendance Illustration */}
              <div className="pr-4 hidden sm:flex items-center justify-center">
                <AttendanceIllustration />
              </div>
            </div>

            {/* Action Buttons as in Image 4 */}
            <div className="flex flex-wrap gap-2.5 mt-8">
              <button
                type="button"
                onClick={handleSave}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-[13px] font-medium py-1.5 px-8 rounded transition-colors shadow-sm"
              >
                {selectedId ? "Update" : "Save"}
              </button>
              {selectedId && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-medium py-1.5 px-6 rounded transition-colors shadow-sm"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="bg-[#F59E0B] hover:bg-[#D97706] text-white text-[13px] font-medium py-1.5 px-8 rounded transition-colors shadow-sm"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="bg-[#64748B] hover:bg-[#475569] text-white text-[13px] font-medium py-1.5 px-8 rounded transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>

          {/* LIST CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-bold text-slate-700 tracking-wide">
                Attendance Records
              </h2>
              <input
                type="text"
                placeholder="Search Attendance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-xs w-60 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold w-16">ID</th>
                    <th className="py-2.5 px-4 font-semibold">Student Name</th>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 divide-y divide-slate-100">
                  {filteredRecords.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                        selectedId === item.id ? "bg-blue-50 font-medium" : "bg-white"
                      }`}
                    >
                      <td className="py-2.5 px-4">{item.id}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">
                        {item.studentName}
                      </td>
                      <td className="py-2.5 px-4">{formatDateDisplay(item.date)}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-semibold ${
                            item.status === "Present"
                              ? "text-emerald-600"
                              : item.status === "Absent"
                              ? "text-red-500"
                              : "text-amber-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">{item.remarks || "—"}</td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400">
                        {records.length === 0
                          ? "No attendance records found. Select a student and click 'Save' above."
                          : "No records match your search."}
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


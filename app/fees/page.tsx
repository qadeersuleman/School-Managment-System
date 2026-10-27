"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import WindowHeader from "../components/WindowHeader";
import AuthGuard from "../components/AuthGuard";
import { FeeIllustration } from "../components/Illustrations";
import {
  FeeRecord,
  Student,
  STORAGE_KEYS,
  useStore,
  saveFees,
  getNextFeeId,
  logActivity,
  User,
} from "../lib/storage";
import {
  getSupabaseFees,
  insertSupabaseFee,
  updateSupabaseFee,
  deleteSupabaseFee,
  getSupabaseStudents,
  insertSupabaseActivity,
} from "../lib/supabaseService";
import {
  showWarning,
  showError,
  showSuccess,
  confirmDialog,
  toastSuccess,
} from "../lib/alert";

const MONTH_OPTIONS = [
  "January 2025",
  "February 2025",
  "March 2025",
  "April 2025",
  "May 2025",
  "June 2025",
  "July 2025",
  "August 2025",
  "September 2025",
  "October 2025",
  "November 2025",
  "December 2025",
  "January 2024",
  "February 2024",
  "March 2024",
  "April 2024",
  "May 2024",
  "June 2024",
  "July 2024",
  "August 2024",
  "September 2024",
  "October 2024",
  "November 2024",
  "December 2024",
];

export default function FeeManagement() {
  const router = useRouter();
  const [currentUser] = useStore<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  const [localFees, setLocalFees] = useStore<FeeRecord[]>(STORAGE_KEYS.FEES, []);
  const [localStudents] = useStore<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const [fees, setFees] = useState<FeeRecord[]>(localFees);
  const [students, setStudents] = useState<Student[]>(localStudents);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [remoteFees, remoteStudents] = await Promise.all([
        getSupabaseFees(),
        getSupabaseStudents(),
      ]);
      if (!isMounted) return;
      if (remoteFees.length > 0) {
        setFees(remoteFees);
        setLocalFees(remoteFees);
      }
      if (remoteStudents.length > 0) {
        setStudents(remoteStudents);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [setLocalFees]);

  const [formData, setFormData] = useState<FeeRecord>({
    id: "",
    studentId: "",
    studentName: "",
    feeMonth: "May 2024",
    amount: "5000",
    paymentDate: "",
    status: "Paid",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

  const handleNew = () => {
    const nextId = getNextFeeId();
    const firstStudent = students[0];
    setFormData({
      id: nextId,
      studentId: firstStudent ? firstStudent.id : "",
      studentName: firstStudent ? firstStudent.name : "",
      feeMonth: "May 2024",
      amount: "5000",
      paymentDate: new Date().toISOString().split("T")[0],
      status: "Paid",
    });
  };

  const handleSave = async () => {
    if (currentUser?.role === "Student") {
      showWarning("Read-Only Mode", "Students can view fee status, but only Administrators can create fee records.");
      return;
    }
    if (!formData.studentName.trim()) {
      showWarning("Required Field", "Please select a student first.");
      return;
    }
    const feeId = formData.id.trim() || getNextFeeId();

    if (fees.some((f) => f.id.toLowerCase() === feeId.toLowerCase())) {
      showError(
        "Duplicate Fee ID",
        `Fee ID "${feeId}" already exists. Click Update if you want to modify it.`
      );
      return;
    }

    const paymentDate = formData.paymentDate || new Date().toISOString().split("T")[0];
    const newRecord: FeeRecord = { ...formData, id: feeId, paymentDate };
    const savedInSupabase = await insertSupabaseFee(newRecord);

    if (savedInSupabase) {
      await insertSupabaseActivity(`Recorded fee payment of Rs. ${newRecord.amount} for ${newRecord.studentName}`);
      const refreshed = await getSupabaseFees();
      setFees(refreshed);
      setLocalFees(refreshed);
      showSuccess("Fee Recorded in Supabase!", `Fee receipt ${newRecord.id} saved for ${newRecord.studentName}.`);
    } else {
      const updated = [...fees, newRecord];
      setFees(updated);
      setLocalFees(updated);
      saveFees(updated);
      logActivity(`Recorded fee payment of Rs. ${newRecord.amount} for ${newRecord.studentName}`);
      showWarning(
        "Saved (Supabase Pending)",
        `Fee receipt ${newRecord.id} saved! Run the SQL schema in Supabase to sync.`
      );
    }
    handleClear();
  };

  const handleUpdate = async () => {
    if (currentUser?.role === "Student") {
      showWarning("Read-Only Mode", "Students cannot edit fee records.");
      return;
    }
    if (!formData.id) {
      showWarning("No Selection", "Please select a fee record from the list to update.");
      return;
    }

    const updatedInSupabase = await updateSupabaseFee(formData);
    const updated = fees.map((f) => (f.id === formData.id ? formData : f));
    setFees(updated);
    setLocalFees(updated);
    saveFees(updated);

    if (updatedInSupabase) {
      await insertSupabaseActivity(`Updated fee record (${formData.id}) for ${formData.studentName}`);
      showSuccess("Record Updated in Supabase!", `Fee record ${formData.id} has been updated.`);
    } else {
      logActivity(`Updated fee record (${formData.id}) for ${formData.studentName}`);
      showSuccess("Record Updated!", `Fee record ${formData.id} has been updated.`);
    }
    handleClear();
  };

  const handleDelete = async () => {
    if (currentUser?.role === "Student") {
      showWarning("Read-Only Mode", "Students cannot delete fee records.");
      return;
    }
    if (!formData.id) {
      showWarning("No Selection", "Please select a fee record to delete.");
      return;
    }
    const confirmed = await confirmDialog({
      title: "Delete Fee Record?",
      text: `Are you sure you want to delete Fee Record "${formData.id}" for ${formData.studentName}?`,
      confirmButtonText: "Yes, Delete",
      confirmButtonColor: "#EF4444",
    });

    if (confirmed) {
      const deletedInSupabase = await deleteSupabaseFee(formData.id);
      const updated = fees.filter((f) => f.id !== formData.id);
      setFees(updated);
      setLocalFees(updated);
      saveFees(updated);

      if (deletedInSupabase) {
        await insertSupabaseActivity(`Deleted fee record (${formData.id})`);
      } else {
        logActivity(`Deleted fee record (${formData.id})`);
      }
      toastSuccess(`Fee record "${formData.id}" deleted.`);
      handleClear();
    }
  };

  const handleClear = () => {
    setFormData({
      id: "",
      studentId: "",
      studentName: "",
      feeMonth: "May 2024",
      amount: "5000",
      paymentDate: "",
      status: "Paid",
    });
  };

  const handleRowClick = (item: FeeRecord) => {
    setFormData(item);
  };

  const formatAmount = (val: string | number) => {
    const num = typeof val === "number" ? val : parseFloat(String(val).replace(/,/g, ""));
    if (isNaN(num)) return String(val);
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "—";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const isStudent = currentUser?.role === "Student";

  // For students, filter to their records only
  const visibleFees = isStudent
    ? fees.filter((f) => {
        const studentName = (currentUser?.name || "").toLowerCase().trim();
        const emailUser = (currentUser?.email || "").split("@")[0].toLowerCase().trim();
        const feeName = f.studentName.toLowerCase().trim();
        return (
          (studentName && feeName.includes(studentName)) ||
          (studentName && studentName.includes(feeName)) ||
          (emailUser && feeName.includes(emailUser))
        );
      })
    : fees;

  const filteredFees = visibleFees.filter(
    (f) =>
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.feeMonth.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AuthGuard allowedRoles={["Admin", "Student"]}>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-auto bg-[#F1F5F9]">
        <WindowHeader
          title={isStudent ? "My Fee Records" : "Fee Management"}
          onClose={() => router.push("/dashboard")}
        />

        <div className="p-6 max-w-5xl mx-auto w-full">
          {/* STUDENT HERO PORTAL BANNER (If Student) */}
          {isStudent ? (
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 mb-6 text-white shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-semibold text-blue-200 uppercase tracking-wider block">
                    Student Fee Portal
                  </span>
                  <h2 className="text-xl font-bold">{currentUser?.name}</h2>
                  <span className="text-xs text-blue-100">{currentUser?.email}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-blue-200 block">Access Mode</span>
                  <span className="text-[11px] px-2.5 py-0.5 bg-white/20 rounded-full font-semibold border border-white/30 inline-block mt-0.5">
                    Personal Records Only
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-500/40">
                <div>
                  <span className="text-[11px] text-blue-200 block">Total Invoices</span>
                  <span className="text-lg font-bold">{visibleFees.length}</span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-200 block">Paid Amount</span>
                  <span className="text-lg font-bold text-emerald-300">
                    Rs. {visibleFees
                      .filter((f) => f.status === "Paid")
                      .reduce((sum, f) => sum + (parseFloat(f.amount.replace(/,/g, "")) || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-blue-200 block">Pending Balance</span>
                  <span className="text-lg font-bold text-amber-300">
                    Rs. {visibleFees
                      .filter((f) => f.status === "Pending")
                      .reduce((sum, f) => sum + (parseFloat(f.amount.replace(/,/g, "")) || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* ADMIN FULL FEE FORM CARD */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-[13px] font-bold text-slate-700 mb-6 tracking-wide">
                Fee Information
              </h2>

              <div className="flex items-start justify-between gap-8">
                {/* Form Grid */}
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
                {/* Student Dropdown */}
                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
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

                {/* Payment Date */}
                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  />
                </div>

                {/* Fee Month */}
                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Fee Month
                  </label>
                  <select
                    name="feeMonth"
                    value={formData.feeMonth}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
                  >
                    {MONTH_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white cursor-pointer font-medium"
                  >
                    <option value="Paid" className="text-green-600">
                      Paid
                    </option>
                    <option value="Pending" className="text-red-500">
                      Pending
                    </option>
                  </select>
                </div>

                {/* Amount */}
                <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                  <label className="text-[13px] text-slate-600 w-24 shrink-0">
                    Amount
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="5,000.00"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded text-[13px] text-slate-700 outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Fee Receipt Illustration */}
              <div className="pr-4 hidden sm:flex items-center justify-center">
                <FeeIllustration />
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
          )}

          {/* LIST CARD */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[13px] font-bold text-slate-700 tracking-wide">
                {isStudent ? `My Fee Invoices (${filteredFees.length})` : "Fee Records"}
              </h2>
              <input
                type="text"
                placeholder="Search Fee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-slate-300 rounded px-3 py-1.5 text-xs w-60 focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[13px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-4 font-semibold">Fee ID</th>
                    <th className="py-2.5 px-4 font-semibold">Student Name</th>
                    <th className="py-2.5 px-4 font-semibold">Fee Month</th>
                    <th className="py-2.5 px-4 font-semibold">Amount</th>
                    <th className="py-2.5 px-4 font-semibold">Payment Date</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 divide-y divide-slate-100">
                  {filteredFees.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => !isStudent && handleRowClick(item)}
                      className={`transition-colors ${
                        isStudent
                          ? "hover:bg-slate-50 cursor-default"
                          : "hover:bg-blue-50 cursor-pointer"
                      } ${formData.id === item.id ? "bg-blue-50 font-medium" : "bg-white"}`}
                    >
                      <td className="py-2.5 px-4 font-mono text-xs">{item.id}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-700">
                        {item.studentName}
                      </td>
                      <td className="py-2.5 px-4">{item.feeMonth}</td>
                      <td className="py-2.5 px-4 font-mono">{formatAmount(item.amount)}</td>
                      <td className="py-2.5 px-4">
                        {item.status === "Paid" ? formatDateDisplay(item.paymentDate) : "—"}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-semibold ${
                            item.status === "Paid"
                              ? "text-emerald-600"
                              : "text-red-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredFees.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        {isStudent
                          ? `No fee invoices found under name "${currentUser?.name}". Please contact school administration.`
                          : fees.length === 0
                          ? "No fee records found. Click 'New' above to record student fee."
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


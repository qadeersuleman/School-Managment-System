"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import WindowHeader from "../components/WindowHeader";
import AuthGuard from "../components/AuthGuard";
import {
  Student,
  FeeRecord,
  STORAGE_KEYS,
  useStore,
} from "../lib/storage";
import {
  getSupabaseStudents,
  getSupabaseFees,
} from "../lib/supabaseService";
import { Printer } from "lucide-react";

export default function ReportsPage() {
  const [localStudents] = useStore<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const [localFees] = useStore<FeeRecord[]>(STORAGE_KEYS.FEES, []);
  const [students, setStudents] = useState<Student[]>(localStudents);
  const [fees, setFees] = useState<FeeRecord[]>(localFees);
  const [activeTab, setActiveTab] = useState<"students" | "fees">("students");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const [rStudents, rFees] = await Promise.all([
        getSupabaseStudents(),
        getSupabaseFees(),
      ]);
      if (!isMounted) return;
      if (rStudents.length > 0) setStudents(rStudents);
      if (rFees.length > 0) setFees(rFees);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalFeeCollected = fees
    .filter((f) => f.status === "Paid")
    .reduce((sum, f) => {
      const val = parseFloat(String(f.amount).replace(/,/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

  const totalFeePending = fees
    .filter((f) => f.status === "Pending")
    .reduce((sum, f) => {
      const val = parseFloat(String(f.amount).replace(/,/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

  return (
    <AuthGuard allowedRoles={["Admin", "Teacher"]}>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-auto bg-[#F1F5F9]">
        <WindowHeader title="School Reports & Analytics" />

        <div className="p-6 max-w-5xl mx-auto w-full">
          {/* TABS & PRINT */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2 bg-slate-200/70 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab("students")}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "students"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Student Enrollment
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("fees")}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === "fees"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Fee Summary
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Printer size={15} /> Print Report
            </button>
          </div>

          {/* REPORT CONTENT */}
          {activeTab === "students" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-[13px] font-bold text-slate-700 mb-4 tracking-wide">
                Total Enrolled Students: {students.length}
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <th className="py-2.5 px-4 font-semibold">Student ID</th>
                      <th className="py-2.5 px-4 font-semibold">Name</th>
                      <th className="py-2.5 px-4 font-semibold">Father Name</th>
                      <th className="py-2.5 px-4 font-semibold">Class</th>
                      <th className="py-2.5 px-4 font-semibold">Gender</th>
                      <th className="py-2.5 px-4 font-semibold">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {students.map((s) => (
                      <tr key={s.id}>
                        <td className="py-2 px-4 font-mono">{s.id}</td>
                        <td className="py-2 px-4 font-medium text-slate-800">{s.name}</td>
                        <td className="py-2 px-4">{s.fatherName}</td>
                        <td className="py-2 px-4">{s.class}</td>
                        <td className="py-2 px-4">{s.gender}</td>
                        <td className="py-2 px-4">{s.phone}</td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">
                          No student records found. Add students from the Students page.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "fees" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 block mb-1">Total Fee Collected</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    Rs. {totalFeeCollected.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-xs text-slate-500 block mb-1">Total Fee Pending</span>
                  <span className="text-2xl font-bold text-red-500">
                    Rs. {totalFeePending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-[13px] font-bold text-slate-700 mb-4 tracking-wide">
                  Fee Transactions Breakdown
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <th className="py-2.5 px-4 font-semibold">Fee ID</th>
                        <th className="py-2.5 px-4 font-semibold">Student Name</th>
                        <th className="py-2.5 px-4 font-semibold">Month</th>
                        <th className="py-2.5 px-4 font-semibold">Amount</th>
                        <th className="py-2.5 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {fees.map((f) => (
                        <tr key={f.id}>
                          <td className="py-2 px-4 font-mono">{f.id}</td>
                          <td className="py-2 px-4 font-medium text-slate-800">
                            {f.studentName}
                          </td>
                          <td className="py-2 px-4">{f.feeMonth}</td>
                          <td className="py-2 px-4 font-mono">Rs. {f.amount}</td>
                          <td className="py-2 px-4">
                            <span
                              className={`font-semibold ${
                                f.status === "Paid" ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {f.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {fees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400">
                            No fee records recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  </AuthGuard>
);
}


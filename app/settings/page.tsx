"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import WindowHeader from "../components/WindowHeader";
import { clearAllData } from "../lib/storage";
import { showSuccess, confirmDialog } from "../lib/alert";
import { Trash2, CheckCircle2, Database } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [resetSuccess, setResetSuccess] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState({
    schoolName: "The Smart School",
    campus: "Main Campus",
    phone: "0300-1234567",
    email: "admin@smartschool.edu.pk",
    academicYear: "2024-2025",
  });

  const handleResetData = async () => {
    const confirmed = await confirmDialog({
      title: "Reset All Data to 0?",
      text: "This will wipe all Local Storage records (Students, Teachers, Classes, Fees, Attendance, Activities) so you can start completely fresh. Are you sure?",
      confirmButtonText: "Yes, Reset Everything",
      confirmButtonColor: "#EF4444",
      icon: "warning",
    });

    if (confirmed) {
      clearAllData();
      setResetSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-auto bg-[#F1F5F9]">
        <WindowHeader title="System Settings" onClose={() => router.push("/dashboard")} />

        <div className="p-6 max-w-4xl mx-auto w-full">
          {/* SCHOOL INFORMATION */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-[13px] font-bold text-slate-700 mb-4 tracking-wide">
              School Profile
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">School Name</label>
                <input
                  type="text"
                  value={schoolInfo.schoolName}
                  onChange={(e) =>
                    setSchoolInfo({ ...schoolInfo, schoolName: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Campus</label>
                <input
                  type="text"
                  value={schoolInfo.campus}
                  onChange={(e) =>
                    setSchoolInfo({ ...schoolInfo, campus: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Phone</label>
                <input
                  type="text"
                  value={schoolInfo.phone}
                  onChange={(e) =>
                    setSchoolInfo({ ...schoolInfo, phone: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={schoolInfo.academicYear}
                  onChange={(e) =>
                    setSchoolInfo({ ...schoolInfo, academicYear: e.target.value })
                  }
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  showSuccess("Settings Saved", "School profile settings have been updated.")
                }
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-5 rounded shadow-sm transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* SUPABASE READINESS & LOCAL STORAGE RESET */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="text-blue-600" size={20} />
              <h2 className="text-[13px] font-bold text-slate-700 tracking-wide">
                Database & Testing Storage
              </h2>
            </div>

            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Currently, all data is safely managed in your browser&apos;s <strong>Local Storage</strong>.
              All models and tables (Students, Classes, Teachers, Fees, Attendance) are designed with clean normalized schemas ready to hook directly into <strong>Supabase</strong> PostgreSQL tables whenever you are ready.
            </p>

            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold text-red-700">Wipe Data & Reset to 0</h3>
                <p className="text-[11px] text-red-600">
                  Resets all student, teacher, class, fee, and attendance records back to 0.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-sm shrink-0"
              >
                <Trash2 size={14} /> Reset All to 0
              </button>
            </div>

            {resetSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-xs font-medium">
                <CheckCircle2 size={16} /> All data has been successfully reset to 0! Redirecting to Dashboard...
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


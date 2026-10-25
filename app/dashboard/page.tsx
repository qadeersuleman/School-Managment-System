"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";
import {
  Menu,
  ChevronDown,
  User,
  DollarSign,
  FileText,
  GraduationCap,
  PlusCircle,
} from "lucide-react";
import {
  Student,
  Teacher,
  ClassItem,
  FeeRecord,
  AttendanceRecord,
  Activity,
  STORAGE_KEYS,
  useStore,
} from "../lib/storage";

export default function Dashboard() {
  const [students] = useStore<Student[]>(STORAGE_KEYS.STUDENTS, []);
  const [teachers] = useStore<Teacher[]>(STORAGE_KEYS.TEACHERS, []);
  const [classes] = useStore<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
  const [fees] = useStore<FeeRecord[]>(STORAGE_KEYS.FEES, []);
  const [attendance] = useStore<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
  const [activities] = useStore<Activity[]>(STORAGE_KEYS.ACTIVITIES, []);

  // Compute pending fees
  const pendingTotal = fees
    .filter((f) => f.status === "Pending")
    .reduce((sum, f) => {
      const val = parseFloat(String(f.amount).replace(/,/g, ""));
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

  // Compute attendance stats
  const totalAtt = attendance.length;
  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const absentCount = attendance.filter((a) => a.status === "Absent").length;
  const leaveCount = attendance.filter((a) => a.status === "Leave").length;

  const attendanceStats =
    totalAtt > 0
      ? {
          present: Math.round((presentCount / totalAtt) * 100),
          absent: Math.round((absentCount / totalAtt) * 100),
          leave: Math.round((leaveCount / totalAtt) * 100),
          total: totalAtt,
        }
      : { present: 0, absent: 0, leave: 0, total: 0 };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#F1F5F9]">
        {/* TOP BAR */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <Menu className="text-slate-500 cursor-pointer" size={18} />
            <h1 className="font-semibold text-base text-slate-800 tracking-wide">
              Dashboard Overview
            </h1>
          </div>
          <div className="flex items-center gap-3 cursor-pointer select-none">
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-xs font-semibold text-slate-700">Admin</span>
              <span className="text-[10px] text-slate-400">School Admin</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto p-6 max-w-6xl w-full mx-auto">
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            <StatCard
              title="Total Students"
              value={students.length.toString()}
              icon={<User size={22} className="text-blue-600" />}
              iconBg="bg-blue-50"
              href="/students"
            />
            <StatCard
              title="Total Teachers"
              value={teachers.length.toString()}
              icon={<GraduationCap size={22} className="text-teal-600" />}
              iconBg="bg-teal-50"
              href="/teachers"
            />
            <StatCard
              title="Total Classes"
              value={classes.length.toString()}
              icon={<FileText size={22} className="text-indigo-600" />}
              iconBg="bg-indigo-50"
              href="/classes"
            />
            <StatCard
              title="Pending Fees"
              value={pendingTotal.toLocaleString("en-US", { minimumFractionDigits: 0 })}
              icon={<DollarSign size={22} className="text-orange-500" />}
              iconBg="bg-orange-50"
              prefix="Rs. "
              href="/fees"
            />
          </div>

          {/* QUICK LINKS BANNER */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 text-white shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold">Quick Actions</h2>
              <p className="text-xs text-blue-100">
                All records currently start at 0. Start adding your school records below:
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/students"
                className="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Add Student
              </Link>
              <Link
                href="/classes"
                className="px-3 py-1.5 bg-blue-500/50 hover:bg-blue-500/80 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Add Class
              </Link>
              <Link
                href="/teachers"
                className="px-3 py-1.5 bg-blue-500/50 hover:bg-blue-500/80 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Add Teacher
              </Link>
              <Link
                href="/fees"
                className="px-3 py-1.5 bg-blue-500/50 hover:bg-blue-500/80 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Add Fee
              </Link>
              <Link
                href="/attendance"
                className="px-3 py-1.5 bg-blue-500/50 hover:bg-blue-500/80 text-white rounded-lg text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5"
              >
                <PlusCircle size={14} /> Mark Attendance
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ATTENDANCE CHART CARD */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 text-sm">Attendance Overview</h2>
                <span className="text-[11px] text-slate-400">
                  {attendanceStats.total} Records
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-2">
                <div className="relative w-40 h-40 mb-6">
                  {attendanceStats.total > 0 ? (
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#F1F5F9"
                        strokeWidth="14"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#22C55E"
                        strokeWidth="14"
                        strokeDasharray={`${(attendanceStats.present / 100) * 238.76} 238.76`}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#EF4444"
                        strokeWidth="14"
                        strokeDasharray={`${(attendanceStats.absent / 100) * 238.76} 238.76`}
                        strokeDashoffset={`-${(attendanceStats.present / 100) * 238.76}`}
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#F59E0B"
                        strokeWidth="14"
                        strokeDasharray={`${(attendanceStats.leave / 100) * 238.76} 238.76`}
                        strokeDashoffset={`-${
                          ((attendanceStats.present + attendanceStats.absent) / 100) * 238.76
                        }`}
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke="#E2E8F0"
                        strokeWidth="14"
                      />
                    </svg>
                  )}

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold text-slate-800">
                      {attendanceStats.present}%
                    </span>
                    <span className="text-[10px] text-slate-400">Present</span>
                  </div>
                </div>

                <div className="flex gap-4 w-full justify-center text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="text-slate-600">Present ({attendanceStats.present}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-slate-600">Absent ({attendanceStats.absent}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600">Leave ({attendanceStats.leave}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITIES CARD */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 text-sm">Recent Activities</h2>
                <span className="text-[11px] text-slate-400">Auto-logged</span>
              </div>

              <div className="flex-1 overflow-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="py-2 font-medium w-24">Date</th>
                      <th className="py-2 font-medium">Activity</th>
                      <th className="py-2 font-medium text-right w-20">User</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-600">
                    {activities.map((act) => (
                      <tr key={act.id}>
                        <td className="py-2.5 text-slate-400 font-mono">{act.date}</td>
                        <td className="py-2.5 font-medium text-slate-700">{act.activity}</td>
                        <td className="py-2.5 text-right text-slate-500">{act.user}</td>
                      </tr>
                    ))}
                    {activities.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center py-10 text-slate-400">
                          No activities logged yet. Activities will appear here as you add
                          students, teachers, classes, and fees.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconBg,
  prefix = "",
  href,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  prefix?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col hover:border-blue-400 transition-colors cursor-pointer group"
    >
      <span className="text-xs font-medium text-slate-500 mb-3 group-hover:text-blue-600 transition-colors">
        {title}
      </span>
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <span className="text-2xl font-bold text-slate-800">
          {prefix}
          {value}
        </span>
      </div>
    </Link>
  );
}

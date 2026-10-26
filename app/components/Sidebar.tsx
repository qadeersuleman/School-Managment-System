"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  CreditCard,
  CalendarCheck,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { confirmDialog, toastSuccess } from "../lib/alert";
import { logoutUser, useStore, STORAGE_KEYS, User } from "../lib/storage";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser] = useStore<User | null>(STORAGE_KEYS.CURRENT_USER, null);

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Students", href: "/students", icon: Users },
    { label: "Classes", href: "/classes", icon: BookOpen },
    { label: "Teachers", href: "/teachers", icon: GraduationCap },
    { label: "Fees", href: "/fees", icon: CreditCard },
    { label: "Attendance", href: "/attendance", icon: CalendarCheck },
    { label: "Reports", href: "/reports", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    const confirmed = await confirmDialog({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out of the SMS portal?",
      confirmButtonText: "Yes, Logout",
      confirmButtonColor: "#EF4444",
      icon: "question",
    });
    if (confirmed) {
      logoutUser();
      toastSuccess("Logged out successfully");
      router.push("/login");
    }
  };

  return (
    <aside className="w-[230px] bg-[#1E293B] text-slate-300 flex flex-col shrink-0 select-none">
      {/* Brand Logo */}
      <div className="h-20 flex items-center px-5 gap-3 border-b border-slate-700/50">
        <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
          <GraduationCap size={22} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-bold text-base tracking-wide">SMS</span>
          <span className="text-[10px] text-slate-400 leading-3">
            Student Management<br />System
          </span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="py-3 px-3 border-t border-slate-700/50 space-y-1">
        {currentUser && (
          <div className="px-3 py-2 mb-1 bg-slate-800/50 rounded-lg flex items-center gap-2.5 border border-slate-700/40">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] shrink-0">
              {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="text-white text-xs font-semibold truncate">
                {currentUser.name || "Admin"}
              </span>
              <span className="text-[10px] text-slate-400">
                {currentUser.role || "Administrator"}
              </span>
            </div>
          </div>
        )}
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
            pathname === "/settings"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          <Settings size={18} />
          <span>Settings</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium text-slate-300 hover:bg-slate-800/60 hover:text-white transition-colors text-left"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}


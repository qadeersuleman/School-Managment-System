"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import WindowHeader from "../components/WindowHeader";
import AuthGuard from "../components/AuthGuard";
import {
  User,
  STORAGE_KEYS,
  useStore,
  saveUsers,
  updateUserRole,
  deleteUser,
} from "../lib/storage";
import {
  getSupabaseProfiles,
  updateSupabaseProfileRole,
  deleteSupabaseProfile,
} from "../lib/supabaseService";
import {
  showSuccess,
  showError,
  confirmDialog,
  toastSuccess,
} from "../lib/alert";
import {
  ShieldAlert,
  UserCheck,
  GraduationCap,
  Users as UsersIcon,
  Trash2,
  Search,
  Filter,
} from "lucide-react";

export default function UsersManagementPage() {
  const router = useRouter();
  const [currentUser] = useStore<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  const [localUsers, setLocalUsers] = useStore<User[]>(STORAGE_KEYS.USERS, []);
  const [users, setUsers] = useState<User[]>(localUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const remote = await getSupabaseProfiles();
      if (!isMounted) return;
      if (remote.length > 0) {
        setUsers(remote);
        setLocalUsers(remote);
        saveUsers(remote);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [setLocalUsers]);

  const adminCount = users.filter((u) => u.role === "Admin").length;
  const teacherCount = users.filter((u) => u.role === "Teacher").length;
  const studentCount = users.filter((u) => u.role === "Student").length;

  const handleRoleChange = async (targetUser: User, newRole: "Admin" | "Teacher" | "Student") => {
    if (targetUser.role === newRole) return;

    if (currentUser?.id === targetUser.id && newRole !== "Admin") {
      showError("Action Prohibited", "You cannot demote your own active Admin account.");
      return;
    }

    const confirmed = await confirmDialog({
      title: "Change User Role?",
      text: `Change ${targetUser.name}'s role from "${targetUser.role}" to "${newRole}"?`,
      confirmButtonText: `Yes, Set as ${newRole}`,
      confirmButtonColor: newRole === "Admin" ? "#8B5CF6" : newRole === "Teacher" ? "#0D9488" : "#F59E0B",
    });

    if (confirmed) {
      await updateSupabaseProfileRole(targetUser.id, newRole);
      updateUserRole(targetUser.id, newRole);

      const updated = users.map((u) =>
        u.id === targetUser.id ? { ...u, role: newRole } : u
      );
      setUsers(updated);
      setLocalUsers(updated);
      showSuccess("Role Updated!", `${targetUser.name} is now assigned as "${newRole}".`);
    }
  };

  const handleDeleteUser = async (targetUser: User) => {
    if (currentUser?.id === targetUser.id) {
      showError("Action Prohibited", "You cannot delete your own active Admin account.");
      return;
    }

    const confirmed = await confirmDialog({
      title: "Delete User Account?",
      text: `Are you sure you want to delete user "${targetUser.name}" (${targetUser.email})? This action cannot be undone.`,
      confirmButtonText: "Yes, Delete User",
      confirmButtonColor: "#EF4444",
      icon: "warning",
    });

    if (confirmed) {
      await deleteSupabaseProfile(targetUser.id);
      deleteUser(targetUser.id);

      const updated = users.filter((u) => u.id !== targetUser.id);
      setUsers(updated);
      setLocalUsers(updated);
      toastSuccess(`User "${targetUser.name}" has been deleted.`);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AuthGuard allowedRoles={["Admin"]}>
      <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col h-full overflow-auto bg-[#F1F5F9]">
          <WindowHeader
            title="User & Role Management"
            onClose={() => router.push("/dashboard")}
          />

          <div className="p-6 max-w-6xl mx-auto w-full">
            {/* STATS OVERVIEW */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <UsersIcon size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Total Registered</span>
                  <span className="text-xl font-bold text-slate-800">{users.length}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Administrators</span>
                  <span className="text-xl font-bold text-purple-700">{adminCount}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Teachers</span>
                  <span className="text-xl font-bold text-teal-700">{teacherCount}</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Students</span>
                  <span className="text-xl font-bold text-amber-700">{studentCount}</span>
                </div>
              </div>
            </div>

            {/* USERS TABLE CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Header with Search and Role Filter */}
              <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-800">
                    System Accounts ({filteredUsers.length})
                  </h2>
                  <span className="text-[11px] text-slate-400">
                    Only Admin can assign roles and delete accounts
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Search */}
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search users..."
                      className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:border-blue-500 bg-slate-50 w-44"
                    />
                  </div>

                  {/* Filter by Role */}
                  <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 text-xs">
                    <Filter size={13} className="text-slate-400" />
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="bg-transparent text-xs text-slate-700 outline-none cursor-pointer"
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Student">Student</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">User ID</th>
                      <th className="py-3 px-4">Current Role</th>
                      <th className="py-3 px-4">Change Role</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredUsers.map((u) => {
                      const isSelf = currentUser?.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                  u.role === "Admin"
                                    ? "bg-purple-100 text-purple-700"
                                    : u.role === "Teacher"
                                    ? "bg-teal-100 text-teal-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {u.name ? u.name.slice(0, 2).toUpperCase() : "US"}
                              </div>
                              <div className="flex flex-col leading-tight">
                                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  {u.name}
                                  {isSelf && (
                                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-600 rounded border border-blue-200 font-normal">
                                      You
                                    </span>
                                  )}
                                </span>
                                <span className="text-[11px] text-slate-400">{u.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            {u.id}
                          </td>

                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                                u.role === "Admin"
                                  ? "bg-purple-50 text-purple-700 border-purple-200"
                                  : u.role === "Teacher"
                                  ? "bg-teal-50 text-teal-700 border-teal-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {u.role === "Admin" ? "👑 Admin" : u.role === "Teacher" ? "👨‍🏫 Teacher" : "🎓 Student"}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={(e) =>
                                handleRoleChange(
                                  u,
                                  e.target.value as "Admin" | "Teacher" | "Student"
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg border text-xs outline-none cursor-pointer bg-white ${
                                isSelf
                                  ? "opacity-60 cursor-not-allowed border-slate-200 text-slate-400"
                                  : "border-slate-300 text-slate-700 hover:border-blue-400 focus:border-blue-600"
                              }`}
                            >
                              <option value="Admin">Assign: Admin</option>
                              <option value="Teacher">Assign: Teacher</option>
                              <option value="Student">Assign: Student</option>
                            </select>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              disabled={isSelf}
                              title={isSelf ? "Cannot delete own account" : "Delete user"}
                              className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                                isSelf
                                  ? "text-slate-300 cursor-not-allowed"
                                  : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                              }`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-slate-400">
                          No users found matching your criteria.
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

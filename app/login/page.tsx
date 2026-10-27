"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, User as UserIcon, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { getCurrentUser, loginUser, registerUser } from "../lib/storage";
import { insertSupabaseProfile } from "../lib/supabaseService";
import { showSuccess, showError, showWarning } from "../lib/alert";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");

  // If already logged in, redirect to dashboard
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      showWarning("Required Fields", "Please enter both your email address and password.");
      return;
    }

    const result = loginUser(loginEmail, loginPassword);
    if (result.success) {
      showSuccess("Welcome Back!", result.message);
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } else {
      showError("Login Failed", result.message);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      showWarning("Required Fields", "Please fill in all required fields.");
      return;
    }

    if (signupPassword !== signupConfirm) {
      showError("Password Mismatch", "Passwords do not match. Please re-enter.");
      return;
    }

    if (signupPassword.length < 4) {
      showWarning("Weak Password", "Password must be at least 4 characters long.");
      return;
    }

    const result = registerUser({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
    });

    if (result.success && result.user) {
      // Async sync to Supabase profiles
      insertSupabaseProfile(result.user).catch((err) =>
        console.error("Supabase profile sync error:", err)
      );
      showSuccess("Account Created!", "Your account has been created. Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } else {
      showError("Registration Failed", result.message);
    }
  };

  const fillDemo = (role: "Admin" | "Teacher" | "Student") => {
    if (role === "Admin") {
      setLoginEmail("admin@sms.com");
      setLoginPassword("admin123");
    } else if (role === "Teacher") {
      setLoginEmail("teacher@sms.com");
      setLoginPassword("teacher123");
    } else {
      setLoginEmail("student@sms.com");
      setLoginPassword("student123");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 z-10 select-none">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
          <GraduationCap size={28} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-bold text-2xl tracking-wide flex items-center gap-2">
            SMS
            <span className="text-[10px] bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
              v2.0
            </span>
          </span>
          <span className="text-xs text-slate-400">Student Management System</span>
        </div>
      </div>

      {/* Main Auth Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Card Header with Mode Tabs */}
        <div className="p-6 pb-4 border-b border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Create Account
            </button>
          </div>

          <h2 className="text-lg font-bold text-slate-800">
            {mode === "login" ? "Sign In to Your Account" : "Register New Account"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {mode === "login"
              ? "Access school records, student database, and reports"
              : "Create an administrator, teacher, or student account"}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-5">
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin@sms.com"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Quick 1-Click Demo Logins */}
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-blue-600" /> Quick Testing Logins:
                  </span>
                  <span className="text-[10px] text-slate-400">1-click fill</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo("Admin")}
                    className="px-2 py-1.5 text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>👑</span>
                    <span>Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("Teacher")}
                    className="px-2 py-1.5 text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>👨‍🏫</span>
                    <span>Teacher</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("Student")}
                    className="px-2 py-1.5 text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>🎓</span>
                    <span>Student</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Muhammad Qadeer"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="qadeer@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-blue-50/70 border border-blue-200/50 rounded-xl text-[11px] text-blue-800 leading-relaxed">
                <span className="font-semibold block">ℹ️ Default Role: Student</span>
                <span>All newly registered accounts start with Student access. School Admin can grant Teacher or Admin privileges from the Users panel.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm
                  </label>
                  <input
                    type="password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>Create Account</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <p className="mt-8 text-xs text-slate-500 z-10 text-center">
        Protected with LocalStorage Authentication &bull; Supabase Ready
      </p>
    </div>
  );
}


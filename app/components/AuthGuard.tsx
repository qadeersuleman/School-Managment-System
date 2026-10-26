"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS, useStore, User } from "../lib/storage";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [currentUser] = useStore<User | null>(STORAGE_KEYS.CURRENT_USER, null);

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-slate-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

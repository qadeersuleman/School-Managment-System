"use client";

import React from "react";
import Link from "next/link";
import { Minus, X } from "lucide-react";

interface WindowHeaderProps {
  title: string;
  onMinimize?: () => void;
  onClose?: () => void;
}

export default function WindowHeader({ title, onMinimize, onClose }: WindowHeaderProps) {
  return (
    <header className="h-10 bg-[#1E3A8A] flex items-center justify-between px-4 text-white shrink-0 select-none shadow-sm">
      <h1 className="text-[13px] font-medium tracking-wide">{title}</h1>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMinimize}
          className="text-white/80 hover:text-white transition-opacity p-0.5 rounded hover:bg-white/10"
          title="Minimize"
        >
          <Minus size={15} />
        </button>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white transition-opacity p-0.5 rounded hover:bg-white/10"
            title="Close"
          >
            <X size={15} />
          </button>
        ) : (
          <Link
            href="/dashboard"
            className="text-white/80 hover:text-white transition-opacity p-0.5 rounded hover:bg-white/10"
            title="Close"
          >
            <X size={15} />
          </Link>
        )}
      </div>
    </header>
  );
}


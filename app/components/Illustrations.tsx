import React from "react";

// School building illustration for Class Management
export function SchoolIllustration() {
  return (
    <div className="w-56 h-44 flex items-center justify-center select-none">
      <svg viewBox="0 0 240 180" className="w-full h-full">
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFF6FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Soft background clouds */}
        <path
          d="M 25,60 Q 35,45 50,52 Q 65,42 80,55 Q 92,50 100,62 L 20,62 Z"
          fill="#DBEAFE"
          opacity="0.8"
        />
        <path
          d="M 165,65 Q 175,50 190,56 Q 205,48 218,60 Q 228,55 235,68 L 160,68 Z"
          fill="#DBEAFE"
          opacity="0.8"
        />

        {/* Green lawn / ground */}
        <path d="M 10,145 Q 120,138 230,145 L 230,155 L 10,155 Z" fill="#86EFAC" opacity="0.6" />

        {/* Bushes Left */}
        <ellipse cx="45" cy="132" rx="18" ry="14" fill="#22C55E" />
        <ellipse cx="32" cy="136" rx="14" ry="11" fill="#16A34A" />

        {/* Bushes Right */}
        <ellipse cx="195" cy="132" rx="18" ry="14" fill="#22C55E" />
        <ellipse cx="208" cy="136" rx="14" ry="11" fill="#16A34A" />

        {/* Main School Building Base */}
        <rect x="55" y="65" width="130" height="75" rx="3" fill="#60A5FA" />

        {/* Center Wing (slightly taller & darker blue) */}
        <rect x="85" y="55" width="70" height="85" rx="2" fill="#3B82F6" />

        {/* Triangular Pediment / Roof */}
        <polygon points="85,55 120,30 155,55" fill="#2563EB" />

        {/* Center Clock / Emblem */}
        <circle cx="120" cy="46" r="5" fill="#FFFFFF" />
        <line x1="120" y1="46" x2="120" y2="43" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="120" y1="46" x2="123" y2="46" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" />

        {/* Flag Pole and Red Flag */}
        <line x1="120" y1="30" x2="120" y2="12" stroke="#475569" strokeWidth="1.5" />
        <polygon points="120,12 138,17 120,23" fill="#EF4444" />

        {/* Windows - Upper Floor */}
        {/* Left Wing */}
        <rect x="63" y="75" width="14" height="18" rx="1" fill="#FFFFFF" />
        <line x1="70" y1="75" x2="70" y2="93" stroke="#60A5FA" strokeWidth="1" />
        <line x1="63" y1="84" x2="77" y2="84" stroke="#60A5FA" strokeWidth="1" />

        {/* Center Wing Upper */}
        <rect x="94" y="66" width="14" height="18" rx="1" fill="#FFFFFF" />
        <line x1="101" y1="66" x2="101" y2="84" stroke="#3B82F6" strokeWidth="1" />
        <line x1="94" y1="75" x2="108" y2="75" stroke="#3B82F6" strokeWidth="1" />

        <rect x="132" y="66" width="14" height="18" rx="1" fill="#FFFFFF" />
        <line x1="139" y1="66" x2="139" y2="84" stroke="#3B82F6" strokeWidth="1" />
        <line x1="132" y1="75" x2="146" y2="75" stroke="#3B82F6" strokeWidth="1" />

        {/* Right Wing Upper */}
        <rect x="163" y="75" width="14" height="18" rx="1" fill="#FFFFFF" />
        <line x1="170" y1="75" x2="170" y2="93" stroke="#60A5FA" strokeWidth="1" />
        <line x1="163" y1="84" x2="177" y2="84" stroke="#60A5FA" strokeWidth="1" />

        {/* Windows - Lower Floor */}
        <rect x="63" y="105" width="14" height="18" rx="1" fill="#FFFFFF" />
        <line x1="70" y1="105" x2="70" y2="123" stroke="#60A5FA" strokeWidth="1" />
        <line x1="63" y1="114" x2="77" y2="114" stroke="#60A5FA" strokeWidth="1" />

        <rect x="163" y="105" width="14" height="18" rx="1" fill="#FFFFFF" />
        <line x1="170" y1="105" x2="170" y2="123" stroke="#60A5FA" strokeWidth="1" />
        <line x1="163" y1="114" x2="177" y2="114" stroke="#60A5FA" strokeWidth="1" />

        {/* Center Double Entrance Doors */}
        <path d="M 108,140 L 108,102 Q 120,95 132,102 L 132,140 Z" fill="#1E3A8A" />
        <line x1="120" y1="98" x2="120" y2="140" stroke="#FFFFFF" strokeWidth="1" />
        <circle cx="117" cy="122" r="1.5" fill="#FCD34D" />
        <circle cx="123" cy="122" r="1.5" fill="#FCD34D" />

        {/* Steps */}
        <rect x="102" y="140" width="36" height="3" fill="#CBD5E1" />
        <rect x="98" y="143" width="44" height="3" fill="#94A3B8" />
      </svg>
    </div>
  );
}

// Teacher Avatar Illustration for Teacher Management
export function TeacherAvatarIllustration() {
  return (
    <div className="w-28 h-28 bg-[#F8FAFC] border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Background */}
        <rect width="100" height="100" fill="#E2E8F0" />

        {/* Shoulders / Suit */}
        <path d="M 15,100 L 15,84 Q 50,70 85,84 L 85,100 Z" fill="#1E3A8A" />

        {/* White Shirt collar */}
        <polygon points="50,94 40,77 60,77" fill="#FFFFFF" />

        {/* Blue Tie */}
        <polygon points="48,78 52,78 54,98 50,102 46,98" fill="#3B82F6" />

        {/* Neck */}
        <rect x="44" y="66" width="12" height="14" fill="#FBCFE8" />

        {/* Head */}
        <ellipse cx="50" cy="52" rx="17" ry="20" fill="#FBCFE8" />

        {/* Hair */}
        <path
          d="M 33,48 Q 32,32 50,30 Q 68,32 67,48 Q 63,35 50,36 Q 37,35 33,48 Z"
          fill="#1E293B"
        />

        {/* Glasses */}
        <rect x="39" y="46" width="9" height="7" rx="2" fill="none" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="52" y="46" width="9" height="7" rx="2" fill="none" stroke="#0F172A" strokeWidth="1.5" />
        <line x1="48" y1="49" x2="52" y2="49" stroke="#0F172A" strokeWidth="1.5" />

        {/* Eyes behind glasses */}
        <circle cx="43.5" cy="49.5" r="1.5" fill="#0F172A" />
        <circle cx="56.5" cy="49.5" r="1.5" fill="#0F172A" />

        {/* Nose */}
        <path d="M 50,51 L 49,56 L 51,56" fill="none" stroke="#E29578" strokeWidth="1" />

        {/* Beard & Mustache */}
        <path
          d="M 38,56 Q 50,58 62,56 Q 66,68 50,72 Q 34,68 38,56 Z"
          fill="#1E293B"
        />
        {/* Mouth */}
        <line x1="47" y1="62" x2="53" y2="62" stroke="#EF4444" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// Fee Receipt / Invoice Illustration for Fee Management
export function FeeIllustration() {
  return (
    <div className="w-48 h-44 flex items-center justify-center select-none">
      <svg viewBox="0 0 180 160" className="w-full h-full">
        {/* Soft mint circular backdrop */}
        <circle cx="90" cy="80" r="62" fill="#D1FAE5" opacity="0.6" />

        {/* Invoice document sheet */}
        <g transform="translate(48, 25)">
          {/* Shadow */}
          <rect x="3" y="3" width="70" height="96" rx="5" fill="#000000" opacity="0.05" />

          {/* White sheet */}
          <rect x="0" y="0" width="70" height="96" rx="5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

          {/* Green top tab */}
          <path d="M 0,5 Q 0,0 5,0 L 65,0 Q 70,0 70,5 L 70,16 L 0,16 Z" fill="#34D399" />

          {/* Green icon / seal on document */}
          <circle cx="22" cy="42" r="11" fill="#10B981" />
          <path d="M 18,42 L 21,45 L 27,39" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Document lines */}
          <rect x="38" y="36" width="24" height="4" rx="2" fill="#CBD5E1" />
          <rect x="38" y="44" width="18" height="3" rx="1.5" fill="#E2E8F0" />

          <rect x="12" y="60" width="46" height="3" rx="1.5" fill="#E2E8F0" />
          <rect x="12" y="68" width="46" height="3" rx="1.5" fill="#E2E8F0" />
          <rect x="12" y="76" width="30" height="3" rx="1.5" fill="#E2E8F0" />

          {/* Bottom dashed line */}
          <line x1="8" y1="86" x2="62" y2="86" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 2" />
        </g>

        {/* Golden Coin badge at bottom right */}
        <g transform="translate(108, 92)">
          {/* Glow */}
          <circle cx="20" cy="20" r="19" fill="#F59E0B" opacity="0.2" />

          {/* Coin Body */}
          <circle cx="20" cy="20" r="16" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          <circle cx="20" cy="20" r="13" fill="#F59E0B" />

          {/* Star symbol inside coin */}
          <path
            d="M 20,11 L 22.5,16.5 L 28.5,17.2 L 24,21.2 L 25.3,27 L 20,24 L 14.7,27 L 16,21.2 L 11.5,17.2 L 17.5,16.5 Z"
            fill="#FEF08A"
          />
        </g>
      </svg>
    </div>
  );
}

// Attendance Clipboard & Clock Illustration for Attendance Management
export function AttendanceIllustration() {
  return (
    <div className="w-48 h-44 flex items-center justify-center select-none">
      <svg viewBox="0 0 190 160" className="w-full h-full">
        {/* Soft green plant leaf behind clipboard */}
        <path
          d="M 125,50 Q 155,30 160,65 Q 162,95 135,115 C 150,85 140,65 125,50 Z"
          fill="#4ADE80"
          opacity="0.75"
        />
        <path
          d="M 132,60 Q 152,45 156,70"
          fill="none"
          stroke="#22C55E"
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Clipboard Body */}
        <rect x="40" y="24" width="76" height="106" rx="7" fill="#1E3A8A" />

        {/* Clipboard Top Clip */}
        <rect x="62" y="18" width="32" height="12" rx="3" fill="#64748B" />
        <rect x="68" y="14" width="20" height="7" rx="3.5" fill="none" stroke="#64748B" strokeWidth="2" />

        {/* Paper Sheet on Clipboard */}
        <rect x="46" y="32" width="64" height="92" rx="3" fill="#FFFFFF" />

        {/* Checkmark 1 */}
        <path d="M 52,48 L 56,52 L 64,44" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="68" y="47" width="34" height="3" rx="1.5" fill="#CBD5E1" />

        {/* Checkmark 2 */}
        <path d="M 52,66 L 56,70 L 64,62" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="68" y="65" width="34" height="3" rx="1.5" fill="#CBD5E1" />

        {/* Checkmark 3 */}
        <path d="M 52,84 L 56,88 L 64,80" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="68" y="83" width="28" height="3" rx="1.5" fill="#CBD5E1" />

        {/* Round Clock at bottom right */}
        <g transform="translate(100, 78)">
          {/* Shadow */}
          <circle cx="28" cy="28" r="25" fill="#000000" opacity="0.08" />

          {/* Clock Outer Rim */}
          <circle cx="26" cy="26" r="24" fill="#38BDF8" />
          <circle cx="26" cy="26" r="20" fill="#FFFFFF" />

          {/* Center Pin */}
          <circle cx="26" cy="26" r="2.5" fill="#0284C7" />

          {/* Clock Hands pointing to 3:00 */}
          {/* Hour Hand */}
          <line x1="26" y1="26" x2="38" y2="26" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
          {/* Minute Hand */}
          <line x1="26" y1="26" x2="26" y2="13" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />

          {/* Clock hour marks */}
          <circle cx="26" cy="9" r="1" fill="#94A3B8" />
          <circle cx="43" cy="26" r="1" fill="#94A3B8" />
          <circle cx="26" cy="43" r="1" fill="#94A3B8" />
          <circle cx="9" cy="26" r="1" fill="#94A3B8" />
        </g>
      </svg>
    </div>
  );
}


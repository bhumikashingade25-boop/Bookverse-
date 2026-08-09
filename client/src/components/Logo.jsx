import React from 'react';

const Logo = ({ className = "w-10 h-10", showText = false, textClassName = "font-serif text-2xl font-bold tracking-tight gold-gradient-text" }) => {
  return (
    <div className="flex items-center gap-3 group select-none">
      {/* Custom BookVerse Slide Emblem */}
      <svg
        viewBox="0 0 200 200"
        className={`${className} transition-transform duration-300 group-hover:scale-105 drop-shadow-md`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6B0A" />
          </linearGradient>
          <linearGradient id="leatherCover" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3E2723" />
            <stop offset="100%" stopColor="#1B1311" />
          </linearGradient>
          <linearGradient id="pageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EDE1C4" />
            <stop offset="50%" stopColor="#FFF9E6" />
            <stop offset="100%" stopColor="#DFD1AF" />
          </linearGradient>
          <radialGradient id="glowBack" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="100" r="95" fill="url(#glowBack)" />

        {/* Outer Circular Ring */}
        <circle
          cx="100"
          cy="75"
          r="52"
          stroke="url(#goldRing)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="280 40"
          className="opacity-90"
        />

        {/* Reader Profile Silhouette inside top circle */}
        <circle cx="100" cy="62" r="14" fill="#E8C868" />
        <path
          d="M78 94 C78 78, 122 78, 122 94 Z"
          fill="#E8C868"
        />
        
        {/* Horizontal Accent Sound/Book Waves on Right */}
        <path d="M128 56 H146" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
        <path d="M128 66 H140" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />
        <path d="M128 76 H144" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" />

        {/* Open Book Wings / Leather Base */}
        <path
          d="M32 105 C55 102, 85 106, 100 118 C115 106, 145 102, 168 105 L170 148 C145 142, 115 148, 100 162 C85 148, 55 142, 30 148 Z"
          fill="url(#leatherCover)"
          stroke="#D4AF37"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Left Book Pages Layer */}
        <path
          d="M36 102 C58 98, 86 102, 100 114 L100 152 C86 140, 58 136, 36 140 Z"
          fill="url(#pageGrad)"
          stroke="#5C4033"
          strokeWidth="1.5"
        />

        {/* Right Book Pages Layer */}
        <path
          d="M164 102 C142 98, 114 102, 100 114 L100 152 C114 140, 142 136, 164 140 Z"
          fill="url(#pageGrad)"
          stroke="#5C4033"
          strokeWidth="1.5"
        />

        {/* Golden Leaf / Botanical Sprout Motif on Left Page */}
        <g transform="translate(56, 118) scale(0.65)">
          <path d="M10 28 C10 10, 22 2, 28 0 C24 12, 16 22, 10 28 Z" fill="#D4AF37" />
          <path d="M10 28 C4 18, 0 12, 0 6 C8 8, 10 18, 10 28 Z" fill="#E5C158" />
          <path d="M10 28 C14 20, 20 18, 22 14 C16 16, 12 22, 10 28 Z" fill="#AA820A" />
          <path d="M10 28 L10 36" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Ribbon Bookmark on Right Page */}
        <path
          d="M148 108 L158 106 L158 134 L153 129 L148 134 Z"
          fill="#D4AF37"
          stroke="#8A6B0A"
          strokeWidth="1"
        />

        {/* Central Circular Exchange Arrows (Book Swapping) */}
        <circle cx="100" cy="136" r="16" fill="#15171E" stroke="#D4AF37" strokeWidth="2.5" />
        
        {/* Upper Exchange Arrow */}
        <path
          d="M93 131 A8 8 0 0 1 107 131"
          stroke="#E5C158"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <polygon points="107,128 111,131 107,135" fill="#E5C158" />

        {/* Lower Exchange Arrow */}
        <path
          d="M107 141 A8 8 0 0 1 93 141"
          stroke="#E5C158"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <polygon points="93,138 89,141 93,144" fill="#E5C158" />

        {/* Bottom Heart / Shield Emblem */}
        <path
          d="M100 178 C95 173, 89 166, 89 160 C89 156, 92 153, 96 153 C98 153, 99 154, 100 156 C101 154, 102 153, 104 153 C108 153, 111 156, 111 160 C111 166, 105 173, 100 178 Z"
          fill="#D4AF37"
          stroke="#5C4033"
          strokeWidth="1.5"
        />
      </svg>

      {/* Optional Brand Name */}
      {showText && (
        <div>
          <span className={textClassName}>BookVerse</span>
          <span className="block text-[10px] tracking-widest text-gold-400/80 uppercase font-sans font-medium">Read. Exchange. Repeat.</span>
        </div>
      )}
    </div>
  );
};

export default Logo;

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-12 h-12',
  }[size];

  const textStyles = {
    sm: 'text-base sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl sm:text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Molten Lava Icon Mark */}
      <div
        className={`relative ${iconDimensions} rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, #180d07 0%, #2b1104 50%, #0a0806 100%)',
          borderColor: 'rgba(249, 115, 22, 0.45)',
          boxShadow: '0 0 14px rgba(249, 115, 22, 0.3), inset 0 1px 2px rgba(254, 240, 138, 0.25)',
        }}
      >
        {/* Subtle inner heat glow */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 80%, rgba(249, 115, 22, 0.8) 0%, transparent 70%)',
          }}
        />

        {/* Custom SVG Molten Flame & Seat/Crown Mark */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 sm:w-5.5 sm:h-5.5 relative z-10 transition-transform duration-300 group-hover:rotate-3"
        >
          <defs>
            <linearGradient id="hotseatLava" x1="16" y1="28" x2="16" y2="4" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="35%" stopColor="#ea580c" />
              <stop offset="70%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id="innerCore" x1="16" y1="26" x2="16" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="60%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <filter id="lavaGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f97316" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Outer Stylized Flame Body */}
          <path
            d="M16 4C14.2 8.5 10 10.8 10 16C10 21.5 13.5 26 18 26C22.4 26 25 21.8 25 17C25 11.2 20.5 8 18.5 4.5C18.2 4 17.5 4.2 17.2 4.7C16.8 5.6 16.5 7.2 16.5 8.2C15.2 6.5 15.6 5 16 4Z"
            fill="url(#hotseatLava)"
            filter="url(#lavaGlow)"
          />

          {/* Inner Molten Core */}
          <path
            d="M16.5 13.5C15.5 16 13 17.2 13 20C13 22.8 14.8 24.5 17 24.5C19.2 24.5 20.5 22.2 20.5 19.5C20.5 16.8 18.5 15.2 17.5 13.5C17.2 13 16.8 13 16.5 13.5Z"
            fill="url(#innerCore)"
            opacity="0.95"
          />

          {/* HotSeat Crosshair / Crown Sparks */}
          <circle cx="16" cy="20" r="1.2" fill="#ffffff" />
          <path
            d="M7 27C12 29 20 29 25 27"
            stroke="#fb923c"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>

        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-80" />
      </div>

      {/* Brand Wordmark & Witty Pill */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className={`font-black tracking-tight leading-none whitespace-nowrap ${textStyles}`}>
          <span className="text-white font-['Outfit',sans-serif]">Hot</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200 font-['Outfit',sans-serif]">
            Seat
          </span>
        </div>

        {showBadge && (
          <span className="hidden xs:inline-flex items-center px-1.5 py-0.5 rounded-md font-mono text-[9px] sm:text-[10px] font-black uppercase tracking-wider border border-orange-500/35 bg-orange-500/10 text-orange-400 select-none shadow-xs">
            DENZEL
          </span>
        )}
      </div>
    </div>
  );
};

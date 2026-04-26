'use client';

export default function CardBack({ small = false }: { small?: boolean }) {
  const size = small ? 'w-14 h-20' : 'w-full h-full';
  return (
    <div className={`${size} rounded-md overflow-hidden relative bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-950 border border-blue-700/50`}>
      {/* Diamond pattern */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 60 88"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="diamonds" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <polygon points="6,0 12,6 6,12 0,6" fill="none" stroke="#4f83cc" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diamonds)" />
      </svg>
      {/* Center emblem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-400/60 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-400/40 rounded-full" />
        </div>
      </div>
    </div>
  );
}

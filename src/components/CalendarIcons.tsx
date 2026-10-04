import type React from 'react';

// Kaaba Icon matching the icon shown in the screenshot on Day 9 (يوم عرفة)
export const KaabaIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Black cube base */}
    <rect x="2" y="5" width="20" height="17" rx="1.5" fill="#1e1e1e" />
    {/* Golden Kiswa band */}
    <rect x="2" y="8.5" width="20" height="3" fill="#D4AF37" />
    <line x1="2" y1="10" x2="22" y2="10" stroke="#FFF8DC" strokeWidth="0.5" strokeDasharray="1 1" />
    {/* Kaaba door */}
    <rect x="15" y="13" width="4.5" height="9" rx="0.5" fill="#C5A028" stroke="#F5D061" strokeWidth="0.5" />
    <circle cx="16.5" cy="17" r="0.5" fill="#4A3B00" />
    {/* Roof trim */}
    <rect x="2" y="4" width="20" height="1.5" fill="#3A3A3A" rx="0.5" />
  </svg>
);

// Pink Balloon Icon matching the icon shown in the screenshot on Day 10 (عيد الأضحى)
export const BalloonIcon: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 20,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    {/* Balloon body */}
    <ellipse cx="12" cy="9.5" rx="7" ry="8.5" fill="#ec4899" />
    {/* Balloon highlight */}
    <ellipse cx="9.5" cy="6.5" rx="2.5" ry="3.5" fill="#fbcfe8" opacity="0.6" transform="rotate(-25 9.5 6.5)" />
    {/* Balloon knot */}
    <polygon points="12,17.5 10,20 14,20" fill="#db2777" />
    {/* String */}
    <path
      d="M12 20C11.5 21.5 12.5 22.5 12 24"
      stroke="#db2777"
      strokeWidth="1.2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

// Bottom bar icons matching the 4 icons in the screenshot:
// 1. Crescent Moon (brown/gold shaded crescent)
export const CrescentTabIcon: React.FC<{ className?: string; active?: boolean }> = ({
  className = '',
  active = false,
}) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke={active ? '#8c6d46' : '#9ca3af'}
    strokeWidth="1.5"
  >
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill={active ? '#8c6d46' : 'none'}
    />
  </svg>
);

// 2. Globe Tab Icon
export const GlobeTabIcon: React.FC<{ className?: string; active?: boolean }> = ({
  className = '',
  active = false,
}) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke={active ? '#8c6d46' : '#9ca3af'}
    strokeWidth="1.6"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// 3. Ruled Notepad / Document Icon
export const NotepadTabIcon: React.FC<{ className?: string; active?: boolean }> = ({
  className = '',
  active = false,
}) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke={active ? '#8c6d46' : '#9ca3af'}
    strokeWidth="1.6"
  >
    <rect x="4" y="3" width="16" height="18" rx="1.5" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="16" y2="11" />
    <line x1="8" y1="15" x2="16" y2="15" />
  </svg>
);

// 4. Three dots Icon
export const MoreTabIcon: React.FC<{ className?: string; active?: boolean }> = ({
  className = '',
  active = false,
}) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke={active ? '#8c6d46' : '#9ca3af'}
    strokeWidth="2"
  >
    <circle cx="6" cy="12" r="1.5" fill={active ? '#8c6d46' : '#9ca3af'} />
    <circle cx="12" cy="12" r="1.5" fill={active ? '#8c6d46' : '#9ca3af'} />
    <circle cx="18" cy="12" r="1.5" fill={active ? '#8c6d46' : '#9ca3af'} />
  </svg>
);

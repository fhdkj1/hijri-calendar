import React from 'react';

interface MihrabLogoProps {
  className?: string;
  size?: number;
}

export const MihrabLogo: React.FC<MihrabLogoProps> = ({ className = '', size = 36 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
    >
      {/* Outer Arch */}
      <path
        d="M20 98 V 48 C 20 28, 38 12, 50 4 C 62 12, 80 28, 80 48 V 98"
        stroke="#7a1616"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Middle Arch */}
      <path
        d="M32 98 V 52 C 32 38, 43 26, 50 20 C 57 26, 68 38, 68 52 V 98"
        stroke="#7a1616"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Inner Pointed Mihrab */}
      <path
        d="M42 98 V 58 C 42 50, 47 42, 50 38 C 53 42, 58 50, 58 58 V 98"
        stroke="#841c1c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Center 8-point Star / Diamond Motif */}
      <g transform="translate(50, 62)">
        <path
          d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2 Z"
          fill="#7a1616"
        />
        <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
      </g>
      {/* Base line */}
      <line x1="14" y1="98" x2="86" y2="98" stroke="#7a1616" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
};

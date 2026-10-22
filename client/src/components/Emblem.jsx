import React from 'react';

const VARIANTS = {
  officer: { fill: '#14345B', stroke: '#1F6FEB', check: '#FBBF24' },
  college: { fill: '#0a3622', stroke: '#22c55e', check: '#86efac' },
  admin: { fill: '#2e1065', stroke: '#a855f7', check: '#d8b4fe' },
};

export default function Emblem({ variant = 'officer', className = 'w-9 h-9' }) {
  const colors = VARIANTS[variant] || VARIANTS.officer;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={`${className} shrink-0 rounded-lg shadow-sm`}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill={colors.fill} stroke={colors.stroke} strokeWidth="1" />
      <path
        d="M16 4L6 9V17C6 23.08 10.27 28.74 16 30C21.73 28.74 26 23.08 26 17V9L16 4Z"
        fill={colors.stroke}
        fillOpacity="0.35"
        stroke={colors.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M11 16L14.5 19.5L21 13"
        stroke={colors.check}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

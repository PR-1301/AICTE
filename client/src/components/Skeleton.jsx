import React from 'react';

/**
 * Reusable animated Skeleton loader with accessible loading role.
 */
export default function Skeleton({
  className = '',
  count = 1,
  height = 'h-6',
  width = 'w-full',
}) {
  if (count === 1) {
    return (
      <div
        aria-hidden="true"
        className={`bg-slate-200/80 rounded-md animate-pulse ${height} ${width} ${className}`}
      />
    );
  }

  return (
    <div aria-hidden="true" className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200/80 rounded-md animate-pulse ${height} ${width}`}
        />
      ))}
    </div>
  );
}

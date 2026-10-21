import React from 'react';

/**
 * Shared ConfidenceBar component.
 * Visualizes model advisory confidence (0.0 to 1.0) with an accessible progress bar and text label.
 */
export default function ConfidenceBar({
  confidence = 0,
  showLabel = true,
  showValue = true,
  size = 'md',
  className = '',
}) {
  // Normalize confidence to 0-1 range
  const normalized = Math.min(1, Math.max(0, Number(confidence) || 0));
  const percent = Math.round(normalized * 100);

  // Confidence qualitative tier
  let tierLabel = 'Low Confidence';
  let barColor = 'bg-slate-500';
  let textColor = 'text-slate-700';

  if (normalized >= 0.9) {
    tierLabel = 'High Confidence';
    barColor = 'bg-[#1F6FEB]';
    textColor = 'text-blue-900';
  } else if (normalized >= 0.75) {
    tierLabel = 'Moderate Confidence';
    barColor = 'bg-amber-500';
    textColor = 'text-amber-900';
  } else {
    tierLabel = 'Low Confidence';
    barColor = 'bg-rose-500';
    textColor = 'text-rose-900';
  }

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size] || 'h-2.5';

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || showValue) && (
        <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5 font-medium">
          {showLabel && (
            <span className="text-slate-600 flex items-center space-x-1.5">
              <span>Confidence</span>
              <span className={`text-[11px] font-normal px-1.5 py-0.2 rounded bg-slate-100 ${textColor}`}>
                {tierLabel}
              </span>
            </span>
          )}
          {showValue && (
            <span className="font-semibold text-slate-800 tabular-nums">
              {percent}%
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div
        className={`w-full bg-slate-200/80 rounded-full overflow-hidden border border-slate-300/40 shadow-inner ${heightClasses}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`Confidence score: ${percent}%`}
      >
        <div
          className={`${heightClasses} ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

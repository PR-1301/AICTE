import React from 'react';
import { DEMO_RIBBON_TEXT } from '../constants';

export default function DemoRibbon() {
  return (
    <aside
      aria-label="Demo notice"
      className="bg-amber-500 text-amber-950 font-medium text-xs md:text-sm py-1 px-4 text-center tracking-wide border-b border-amber-600/30 flex items-center justify-center space-x-2 select-none z-50 sticky top-0"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-amber-900 animate-pulse" />
      <span className="uppercase font-semibold tracking-wider">{DEMO_RIBBON_TEXT}</span>
      <span className="hidden sm:inline text-amber-900/80">|</span>
      <span className="hidden sm:inline text-amber-900/80">AICTE EoA Scrutiny Advisory Layer (SIH26261)</span>
    </aside>
  );
}

import React from 'react';
import { DEMO_RIBBON_TEXT } from '../constants';

export default function DemoRibbon() {
  return (
    <aside
      aria-label="Demo notice"
      className="bg-amber-400 text-amber-950 font-medium text-xs md:text-sm py-1.5 px-4 text-center tracking-wide border-b border-amber-500/40 flex items-center justify-center gap-2 select-none"
    >
      <span className="inline-block w-2 h-2 rounded-full bg-amber-950 motion-safe:animate-pulse" />
      <span className="uppercase font-bold tracking-wider">{DEMO_RIBBON_TEXT}</span>
      <span className="hidden sm:inline text-amber-900/80" aria-hidden="true">
        |
      </span>
      <span className="hidden sm:inline text-amber-950/80">
        AICTE EoA Scrutiny Advisory Layer (SIH26261)
      </span>
    </aside>
  );
}

"use client";

import React from 'react';

export default function SignalStrip() {
  return (
    <div className="signal-strip" aria-label="Aartha operating signals">
      <div className="signal-item">
        <span className="signal-dot coral"></span>
        <b className="font-extrabold text-[#0a1020] dark:text-white">RFQ INTAKE</b>
        <span className="text-[#5a6480] dark:text-slate-400">drawings + specs</span>
      </div>
      <div className="signal-item">
        <span className="signal-dot blue"></span>
        <b className="font-extrabold text-[#0a1020] dark:text-white">SUPPLY</b>
        <span className="text-[#5a6480] dark:text-slate-400">Gujarat industrial cluster</span>
      </div>
      <div className="signal-item">
        <span className="signal-dot violet"></span>
        <b className="font-extrabold text-[#0a1020] dark:text-white">QUALITY</b>
        <span className="text-[#5a6480] dark:text-slate-400">documented inspection</span>
      </div>
      <div className="signal-item">
        <span className="signal-dot green"></span>
        <b className="font-extrabold text-[#0a1020] dark:text-white">MODEL</b>
        <span className="text-[#5a6480] dark:text-slate-400">order-first • inventory-free</span>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";

export default function Brand() {
  return (
    <div
      className="fixed z-50"
      style={{
        left: "max(1rem, env(safe-area-inset-left))",
        top: "max(1rem, env(safe-area-inset-top))"
      }}
    >
      <Link
        href="/"
        aria-label="回到 WonderQ 首頁"
        className="group inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2.5 shadow ring-1 ring-pink-200/60 backdrop-blur-md transition hover:bg-white"
      >
        <span
          aria-hidden
          className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-pink-400 via-pink-500 to-pink-400 text-white shadow-md ring-1 ring-white/50"
        >
          <span className="text-lg font-extrabold leading-none">W</span>
        </span>
        <span className="brand-wordmark text-lg tracking-wide text-gray-800 group-hover:text-gray-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]">
          WonderQ
        </span>
      </Link>
    </div>
  );
}



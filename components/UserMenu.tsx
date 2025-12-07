"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listenUser, signInWithGoogle, signOutGoogle, type SimpleUser } from "@/lib/auth";
import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = listenUser((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      window.addEventListener("click", onClickOutside, { capture: true });
      return () => window.removeEventListener("click", onClickOutside, { capture: true } as any);
    }
  }, [open]);

  return (
    <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
      {user && (
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-pink-300 bg-white/80 text-gray-800 hover:bg-pink-50"
          onClick={() => router.push("/me")}
          aria-label="我的頁面"
        >
          <Avatar name={user.name} src={user.photoUrl} size="sm" />
          <span className="ml-2">{user.name}</span>
        </Button>
      )}
      <div ref={menuRef} className="relative">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-pink-300 bg-white/80 text-gray-800 hover:bg-pink-50"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          title="選項"
        >
          {/* gear icon (inline svg) */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.89 3.31.877 2.422 2.42a1.724 1.724 0 001.065 2.574c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.889 1.543-.878 3.31-2.421 2.422a1.724 1.724 0 00-2.574 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.889-3.31-.878-2.422-2.421a1.724 1.724 0 00-1.065-2.574c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.889-1.543.878-3.31 2.421-2.422.98.565 2.223.02 2.574-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Button>
        {open && (
          <div
            role="menu"
            aria-label="使用者選單"
            className="absolute right-0 mt-2 w-48 rounded-2xl border border-pink-200 bg-white/95 p-2 shadow-lg backdrop-blur"
          >
            {!user ? (
              <button
                className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-gray-800 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                onClick={() => {
                  setOpen(false);
                  signInWithGoogle();
                }}
              >
                Google 登入
              </button>
            ) : (
              <button
                className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-800 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
                onClick={async () => {
                  setOpen(false);
                  await signOutGoogle();
                }}
              >
                登出
              </button>
            )}
            <button
              className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-gray-800 hover:bg-pink-50 focus:outline-none focus:ring-2 focus:ring-pink-300"
              onClick={() => {
                setOpen(false);
                router.push("/about");
              }}
            >
              關於開發者
            </button>
          </div>
        )}
      </div>
    </div>
  );
}



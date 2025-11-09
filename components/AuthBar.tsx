"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  listenUser,
  signInWithGoogle,
  signOutGoogle,
  type SimpleUser
} from "@/lib/auth";
import Avatar from "@/components/Avatar";

type AuthBarProps = {
  className?: string;
};

export default function AuthBar({ className }: AuthBarProps) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenUser((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={`flex items-center justify-end gap-3 ${className ?? ""}`}>
      {loading ? (
        <span className="text-sm text-gray-500">登入狀態載入中…</span>
      ) : user ? (
        <>
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 shadow">
            <Avatar name={user.name} src={user.photoUrl} size="sm" />
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => signOutGoogle()}>
            登出
          </Button>
        </>
      ) : (
        <Button size="sm" className="btn-cute btn-blue" onClick={() => signInWithGoogle()}>
          Google 登入
        </Button>
      )}
    </div>
  );
}



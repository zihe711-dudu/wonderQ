"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base"
};

export default function Avatar({ name, src, size = "sm", className }: AvatarProps) {
  const [broken, setBroken] = useState(false);
  const showImg = !!src && !broken;
  const base = sizeMap[size];
  if (showImg) {
    return (
      <img
        src={src as string}
        alt={name}
        className={cn("rounded-full object-cover", base, className)}
        referrerPolicy="no-referrer"
        decoding="async"
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-pink-200 font-bold text-pink-600",
        base,
        className
      )}
    >
      {name?.slice(0, 1) || "?"}
    </div>
  );
}



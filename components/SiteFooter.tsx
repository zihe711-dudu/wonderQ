import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-pink-200/60">
      <div className="container mx-auto max-w-3xl px-4 py-6 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
        <Button asChild variant="outline" className="rounded-full border-pink-300 bg-white/80 text-gray-800 hover:bg-pink-50">
          <Link href="/">回到首頁</Link>
        </Button>
        <nav className="flex items-center gap-4">
          <Link href="/privacy" className="text-pink-700 hover:underline focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-md px-1">
            隱私權條款
          </Link>
          <span className="text-pink-300">|</span>
          <Link href="/terms" className="text-pink-700 hover:underline focus:outline-none focus:ring-2 focus:ring-pink-300 rounded-md px-1">
            使用者條款
          </Link>
        </nav>
      </div>
    </footer>
  );
}



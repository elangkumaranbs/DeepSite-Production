"use client";

import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/user-menu";

export function Navigation() {
  return (
    <nav className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2">
      <div className="flex items-center justify-start gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.svg"
            alt="DeepSite"
            width={100}
            height={100}
            className="size-8 grayscale invert-100 brightness-0"
          />
          <p className="text-lg font-bold text-primary">DeepSite</p>
        </Link>
      </div>
      <div className="flex items-center justify-end gap-4">
        <UserMenu />
      </div>
    </nav>
  );
}

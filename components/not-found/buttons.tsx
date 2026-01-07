"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NotFoundButtons() {
  return (
    <div className="flex items-center justify-center gap-3">
      <Link href="/">
        <Button size="lg">Return Home</Button>
      </Link>
      <Button size="lg" variant="outline" onClick={() => window.history.back()}>
        Back to previous page
      </Button>
    </div>
  );
}

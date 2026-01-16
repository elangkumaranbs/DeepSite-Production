"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import HFLogo from "@/assets/hf-logo.svg";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { callbackUrl: string };
}) {
  const { callbackUrl } = searchParams;
  return (
    <section className="min-h-screen font-sans">
      <div className="px-6 py-16 max-w-5xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-5">You shall not pass 🧙</h1>
        <p className="text-lg text-muted-foreground mb-8">
          You can&apos;t access this resource without being signed in.
        </p>
        <Button
          onClick={() =>
            signIn("huggingface", { callbackUrl: callbackUrl ?? "/deepsite" })
          }
        >
          <Image src={HFLogo} alt="Hugging Face" width={20} height={20} />
          Sign in with Hugging Face
        </Button>
      </div>
    </section>
  );
}

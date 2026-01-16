"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import HFLogo from "@/assets/hf-logo.svg";

export const LoginButtons = ({ callbackUrl }: { callbackUrl: string }) => {
  return (
    <Button onClick={() => signIn("huggingface", { callbackUrl })}>
      <Image src={HFLogo} alt="Hugging Face" width={20} height={20} />
      Sign in with Hugging Face
    </Button>
  );
};

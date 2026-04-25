"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const LoginButtons = ({ callbackUrl }: { callbackUrl: string }) => {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsLoading(true);
    await signIn("credentials", { token, callbackUrl });
    // NextAuth will handle the redirect, or we stop loading if it failed
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col items-center gap-4 max-w-sm mx-auto">
      <div className="w-full relative">
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          type="password" 
          placeholder="hf_..." 
          className="pl-10 h-12 bg-background border-zinc-800"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-12 font-medium" 
        disabled={isLoading || !token.trim()}
      >
        {isLoading ? "Signing in..." : "Sign in with Token"}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-2">
        We only use your token locally to interact with Hugging Face's Inference API securely.
      </p>
    </form>
  );
};

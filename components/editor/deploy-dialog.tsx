"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Rocket,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Globe,
  ChevronRight,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Provider = "netlify" | "vercel";

interface DeployDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROVIDERS: { id: Provider; label: string; color: string; bg: string; logo: string }[] = [
  {
    id: "netlify",
    label: "Netlify",
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/30 hover:border-teal-500/60",
    logo: "🌿",
  },
  {
    id: "vercel",
    label: "Vercel",
    color: "text-white",
    bg: "bg-zinc-800 border-zinc-600 hover:border-zinc-400",
    logo: "▲",
  },
];

export function DeployDialog({ open, onOpenChange }: DeployDialogProps) {
  const { repoId } = useParams<{ repoId: string }>();

  const [provider, setProvider] = useState<Provider>("netlify");
  const [token, setToken] = useState("");
  const [hasToken, setHasToken] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch token status when dialog opens
  useEffect(() => {
    if (!open) return;
    setDeployedUrl(null);
    setToken("");

    fetch("/api/settings/tokens")
      .then((r) => r.json())
      .then((data) => {
        setHasToken(
          provider === "netlify" ? !!data.hasNetlifyToken : !!data.hasVercelToken
        );
      })
      .catch(() => {});
  }, [open, provider]);

  const handleSaveToken = async () => {
    if (!token.trim()) return;
    setIsSavingToken(true);
    try {
      const res = await fetch("/api/settings/tokens", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          provider === "netlify"
            ? { netlifyToken: token.trim() }
            : { vercelToken: token.trim() }
        ),
      });
      if (!res.ok) throw new Error("Failed to save token");
      setHasToken(true);
      setToken("");
      toast.success(`${provider === "netlify" ? "Netlify" : "Vercel"} token saved!`);
    } catch {
      toast.error("Failed to save token");
    }
    setIsSavingToken(false);
  };

  const handleRemoveToken = async () => {
    try {
      await fetch(`/api/settings/tokens?provider=${provider}`, { method: "DELETE" });
      setHasToken(false);
      toast.info("Token removed");
    } catch {
      toast.error("Failed to remove token");
    }
  };

  const handleDeploy = async () => {
    if (!repoId) {
      toast.error("No project loaded. Save your project first.");
      return;
    }
    setIsDeploying(true);
    setDeployedUrl(null);
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, repoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deployment failed");
      setDeployedUrl(data.url);
      toast.success(`Deployed to ${provider === "netlify" ? "Netlify" : "Vercel"}! 🚀`);
    } catch (err: any) {
      toast.error(err.message || "Deployment failed");
    }
    setIsDeploying(false);
  };

  const handleCopy = () => {
    if (!deployedUrl) return;
    navigator.clipboard.writeText(deployedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] rounded-3xl!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="size-5 text-indigo-400" />
            Deploy Project
          </DialogTitle>
          <DialogDescription>
            Ship your DeepSite project to a real public URL in seconds.
          </DialogDescription>
        </DialogHeader>

        {/* Provider Selector */}
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setProvider(p.id);
                setDeployedUrl(null);
              }}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${p.bg} ${
                provider === p.id
                  ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-background"
                  : ""
              }`}
            >
              <span className="text-base">{p.logo}</span>
              <span className={p.color}>{p.label}</span>
              {provider === p.id && (
                <ChevronRight className="size-3.5 ml-auto text-muted-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* Token Section */}
        <div className="rounded-xl border bg-accent/30 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <KeyRound className="size-3.5" />
            {provider === "netlify" ? "Netlify" : "Vercel"} Personal Access Token
          </div>

          {hasToken ? (
            <div className="flex items-center gap-2">
              <div className="flex-1 text-sm text-emerald-400 flex items-center gap-1.5">
                <Check className="size-3.5" />
                Token saved
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleRemoveToken}
              >
                <Trash2 className="size-3" />
                Remove
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder={`Paste your ${provider === "netlify" ? "Netlify" : "Vercel"} token...`}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveToken()}
                className="h-8 text-xs"
              />
              <Button
                size="xs"
                onClick={handleSaveToken}
                disabled={!token.trim() || isSavingToken}
              >
                {isSavingToken ? (
                  <RefreshCw className="size-3 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            {provider === "netlify" ? (
              <>
                Generate at{" "}
                <a
                  href="https://app.netlify.com/user/applications#personal-access-tokens"
                  target="_blank"
                  className="underline"
                >
                  netlify.com → User Settings → Applications
                </a>
              </>
            ) : (
              <>
                Generate at{" "}
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  className="underline"
                >
                  vercel.com → Account Settings → Tokens
                </a>
              </>
            )}
          </p>
        </div>

        {/* Deployed URL */}
        {deployedUrl && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-2">
            <p className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
              <Globe className="size-3.5" />
              Live URL
            </p>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-xs font-mono text-primary truncate">{deployedUrl}</p>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleCopy}
                title="Copy URL"
              >
                {copied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
              <a href={deployedUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon-xs" title="Open in browser">
                  <ExternalLink className="size-3.5" />
                </Button>
              </a>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={!hasToken || isDeploying}
            className="gap-1.5"
          >
            {isDeploying ? (
              <>
                <RefreshCw className="size-3.5 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Rocket className="size-3.5" />
                Deploy to {provider === "netlify" ? "Netlify" : "Vercel"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

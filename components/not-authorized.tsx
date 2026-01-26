"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { useMount } from "react-use";

import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

export const NotAuthorizedDomain = () => {
  const [open, setOpen] = useState(false);

  useMount(() => {
    const isAllowedDomain = (hostname: string) => {
      const host = hostname.toLowerCase();
      return (
        host.endsWith(".huggingface.co") ||
        host.endsWith(".hf.co") ||
        host === "huggingface.co" ||
        host === "hf.co" ||
        host === "enzostvs-deepsite.hf.space" ||
        host === "deepsite.hf.co"
      );
    };

    const isInIframe = () => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    };

    const isEmbedded = () => {
      try {
        return window.location !== window.parent.location;
      } catch {
        return true;
      }
    };

    const addCanonicalUrl = () => {
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.remove();
      }

      const canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = window.location.href;
      document.head.appendChild(canonical);

      if (isInIframe() || isEmbedded()) {
        try {
          const parentHostname = document.referrer
            ? new URL(document.referrer).hostname
            : null;
          if (parentHostname && !isAllowedDomain(parentHostname)) {
            const noIndexMeta = document.createElement("meta");
            noIndexMeta.name = "robots";
            noIndexMeta.content = "noindex, nofollow";
            document.head.appendChild(noIndexMeta);
          }
        } catch (error) {
          console.debug(
            "SEO: Could not determine parent domain for iframe indexing rules"
          );
        }
      }
    };

    const shouldShowWarning = () => {
      if (!isInIframe() && !isEmbedded()) {
        return false; // Not in an iframe
      }

      try {
        const parentHostname = window.parent.location.hostname;
        return !isAllowedDomain(parentHostname);
      } catch {
        try {
          if (document.referrer) {
            const referrerUrl = new URL(document.referrer);
            return !isAllowedDomain(referrerUrl.hostname);
          }
        } catch {}
        return true;
      }
    };

    addCanonicalUrl();

    if (shouldShowWarning()) {
      setOpen(true);
    }
  });

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="lg:min-w-4xl w-full rounded-3xl! p-0! overflow-hidden"
      >
        <DialogTitle className="hidden" />
        <div className="max-w-md mx-auto text-center px-6 py-12">
          <Image
            src="/logo.svg"
            alt="DeepSite"
            width={48}
            height={48}
            className="mb-6 mx-auto"
          />
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Unfortunately, you don&apos;t have access to DeepSite from this
            domain:{" "}
            {open && (
              <span className="font-mono font-semibold bg-indigo-500/10 border-2 border-indigo-500/10 text-indigo-500 text-base px-2 py-1 rounded-md">
                {window?.location?.hostname ?? "unknown domain"}
              </span>
            )}
            .
          </p>

          <Link href="https://deepsite.hf.co" target="_blank">
            <Button size="lg" className="text-base!">
              Go to DeepSite
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

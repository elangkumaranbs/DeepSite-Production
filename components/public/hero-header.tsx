"use client";
import { motion } from "framer-motion";

const TITLE = ["Your", "next", "web-based", "application", "starts", "here"];

export function HeroHeader() {
  return (
    <header className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center px-6 py-12 z-1">
      <div
        data-slot="badge"
        className="rounded-full border border-indigo-500/10 px-2 py-0.5 text-xs font-medium w-fit bg-linear-to-br from-indigo-500/10 to-purple-300/20 text-indigo-500"
      >
        DeepSite: new release 🎉
      </div>
      <h1 className="mb-3 text-balance text-4xl font-bold tracking-tight lg:text-5xl lg:text-7xl">
        {TITLE.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: (index + 1) * 0.17 }}
          >
            {word}&nbsp;
          </motion.span>
        ))}
      </h1>
      <p className="text-muted-foreground mx-auto max-w-2xl md:text-lg lg:text-xl">
        Build your next web-based application with ease and speed by using AI
        Vibe Coding.
      </p>
    </header>
  );
}

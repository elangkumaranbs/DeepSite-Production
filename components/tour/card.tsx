"use client";

import React from "react";
import { Step } from "nextstepjs";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CustomCardProps {
  step: Step;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  skipTour?: () => void;
  arrow: React.ReactNode;
}

export const TourCustomCard = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  skipTour,
  arrow,
}: CustomCardProps) => {
  return (
    <div className="rounded-2xl p-0 bg-accent border-border-muted min-w-xs max-w-xs text-center overflow-hidden">
      <header className="bg-linear-to-b from-indigo-500/25 dark:from-indigo-500/40 to-accent px-6 pb-6 pt-3">
        <div className="w-full flex items-center justify-between mb-2">
          <p className="text-xs font-mono bg-primary/10 border border-primary/10 px-2.5 py-1 rounded-full text-primary translate-y-1">
            {currentStep + 1}/{totalSteps}
          </p>
          <button
            onClick={skipTour}
            className="text-sm text-white cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="flex items-center justify-center -space-x-4 mb-3">
          <div className="size-9 rounded-full bg-pink-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
            🔥
          </div>
          <div className="size-11 rounded-full bg-amber-200 shadow-2xl flex items-center justify-center text-2xl z-2">
            {step.icon}
          </div>
          <div className="size-9 rounded-full bg-sky-200 shadow-2xs flex items-center justify-center text-xl opacity-50">
            💎
          </div>
        </div>
        <p className="text-xl font-semibold text-black dark:text-white">
          {step.title}
        </p>
        {typeof step.content === "string" ? (
          <p className="text-base opacity-70 mt-1.5">{step.content}</p>
        ) : (
          step.content
        )}
      </header>
      <footer className="px-6 pb-6 flex items-center justify-between gap-6">
        {currentStep > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 bg-primary/5! hover:bg-primary/10!"
            onClick={prevStep}
          >
            Previous
          </Button>
        )}
        <Button
          size="sm"
          variant="default"
          className="flex-1"
          onClick={nextStep}
        >
          {currentStep === totalSteps - 1 ? "Finish" : "Next"}
        </Button>
      </footer>
      <div
        className="
          [&_path#triangle]:fill-accent"
      >
        {arrow}
      </div>
    </div>
  );
};

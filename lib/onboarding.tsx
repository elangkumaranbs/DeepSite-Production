import { Button } from "@/components/ui/button";
import type { Tour } from "nextstepjs";
import { FaDiscord } from "react-icons/fa6";
import { DISCORD_URL } from "./utils";

export const steps: Tour[] = [
  {
    tour: "onboarding",
    steps: [
      {
        icon: "👋",
        title: "Welcome to DeepSite!",
        content: (
          <>
            <p className="text-sm opacity-80 mt-1.5">
              Let&apos;s take a quick tour to get you familiar with
              DeepSite&apos;s features.
            </p>
            <p className="text-sm opacity-80 mt-1.5">
              You can always revisit this tour later from the Help menu.
            </p>
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-0"
            >
              <Button
                className="bg-indigo-500! w-full text-white! border-indigo-500! hover:brightness-90 translate-y-4"
                size="sm"
              >
                <FaDiscord />
                Join our Discord
              </Button>
            </a>
          </>
        ),
        showControls: true,
        showSkip: true,
      },
      {
        icon: "🐳",
        title: "Build websites with AI",
        content: (
          <>
            <p className="text-sm opacity-80 mt-1.5">
              DeepSite leverages AI to help you create stunning websites
              effortlessly.
            </p>
            <p className="text-sm opacity-80 mt-1.5">
              Ask questions, get design suggestions, and more!
            </p>
          </>
        ),
        selector: "#tour-ask-ai-section",
        side: "top",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 20,
      },
      {
        icon: "🧠",
        title: "The Brains Behind It",
        content: (
          <>
            <p className="text-sm opacity-80 mt-1.5">
              You can choose from a variety of AI models to power
              DeepSite&apos;s capabilities.
            </p>
            <p className="text-sm opacity-80 mt-1.5">
              Experiment with different models to see which one fits your needs
              best!
            </p>
          </>
        ),
        selector: "#tour-model-section",
        side: "top-left",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 20,
      },
      {
        icon: "🎨",
        title: "Redesign with a Click",
        content: (
          <>
            <p className="text-sm opacity-80 mt-1.5">
              Instantly revamp your website&apos;s look and feel with our
              Redesign feature.
            </p>
            <p className="text-sm opacity-80 mt-1.5">
              Just provide your website URL, and let DeepSite handle the rest!
            </p>
          </>
        ),
        selector: "#tour-redesign-section",
        side: "top-left",
        showControls: true,
        showSkip: true,
        pointerPadding: 8,
        pointerRadius: 20,
      },
    ],
  },
];

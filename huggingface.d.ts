import { SpaceEntry } from "@huggingface/hub";

declare module "@huggingface/hub" {
  interface SpaceEntry {
    cardData?: {
      emoji?: string;
      title?: string;
      colorFrom?: string;
      colorTo?: string;
    };
  }
}
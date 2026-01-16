import { buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";

export type DeviceType = "desktop" | "mobile";
export type ActivityType = "chat" | "code";
export type MobileTabType = "left-sidebar" | "right-sidebar";
export type ProviderType = "auto" | "cheapest" | "fastest" | string;
export enum MessageActionType {
  PUBLISH_PROJECT = "PUBLISH_PROJECT",
  SEE_LIVE_PREVIEW = "SEE_LIVE_PREVIEW",
  UPGRADE_TO_PRO = "UPGRADE_TO_PRO",
  ADD_CREDITS = "ADD_CREDITS",
}
export type MessageAction = {
  label: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  type?: MessageActionType;
  projectTitle?: string;
  prompt?: string;
  messageReferrer?: number;
};
export type Message = {
  id: string;
  role: MessageRole;
  model?: string;
  content?: string;
  createdAt: Date;
  isThinking?: boolean;
  files?: string[];
  isAborted?: boolean;
  isAutomated?: boolean;
  actions?: MessageAction[];
};
export type File = {
  path: string;
  content?: string;
};
export interface Commit {
  title: string;
  oid: string;
  date: Date;
}
export type MessageRole = "user" | "assistant";

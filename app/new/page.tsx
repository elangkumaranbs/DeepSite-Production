import { AppEditor } from "@/components/editor";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt: string }>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/new");
  }

  const { prompt } = await searchParams;
  return <AppEditor isNew={true} initialPrompt={prompt} />;
}

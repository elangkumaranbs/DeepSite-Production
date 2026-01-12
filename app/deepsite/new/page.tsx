import { AppEditor } from "@/components/editor";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt: string }>;
}) {
  const { prompt } = await searchParams;
  return <AppEditor isNew={true} initialPrompt={prompt} />;
}

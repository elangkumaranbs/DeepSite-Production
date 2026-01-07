import { getProject } from "@/actions/projects";
import { AppEditor } from "@/components/editor";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ owner: string; repoId: string }>;
  searchParams: Promise<{ commit?: string }>;
}) {
  const { owner, repoId } = await params;
  const { commit } = await searchParams;
  const datas = await getProject(`${owner}/${repoId}`, commit);
  if (!datas?.project) {
    return notFound();
  }
  return (
    <AppEditor
      project={datas.project}
      files={datas.files ?? []}
      isHistoryView={!!commit}
    />
  );
}

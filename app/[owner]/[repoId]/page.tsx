import { getProject } from "@/actions/projects";
import { AppEditor } from "@/components/editor";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ owner: string; repoId: string }>;
  searchParams: Promise<{ commit?: string }>;
}) {
  const session = await auth();

  const { owner, repoId } = await params;
  const { commit } = await searchParams;
  if (!session) {
    redirect(
      `/api/auth/signin?callbackUrl=/${owner}/${repoId}${
        commit ? `?commit=${commit}` : ""
      }`
    );
  }
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

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getProject, ProjectWithCommits } from "@/actions/projects";
import { File } from "@/lib/type";

export const useProject = (
  initialProject?: ProjectWithCommits | null,
  initialFiles?: File[] | null,
  isNew?: boolean
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isNew) {
      queryClient.setQueryData(["project"], null);
      queryClient.setQueryData(["files"], []);
    } else if (initialProject) {
      queryClient.setQueryData(["project"], initialProject);
      if (initialFiles) {
        queryClient.setQueryData(["files"], initialFiles);
      }
    }
  }, [initialProject, initialFiles, isNew, queryClient]);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project"],
    initialData: initialProject,
    queryFn: async () => {
      if (isNew) return null;
      const datas = await getProject(initialProject?.name as string);
      if (datas?.files) {
        setFiles(datas.files);
      }
      return datas?.project ?? null;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  const { data: files } = useQuery({
    queryKey: ["files"],
    initialData: initialFiles,
    queryFn: () => {
      return [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });

  const setFiles = (newFiles: File[]) => {
    queryClient.setQueryData<File[]>(["files"], (oldFiles: File[] = []) => {
      const currentFiles = oldFiles.filter(
        (file) => !newFiles.some((f) => f.path === file.path)
      );
      return [...currentFiles, ...newFiles];
    });
  };

  return {
    project,
    isLoading,
    error,
    files,
  };
};

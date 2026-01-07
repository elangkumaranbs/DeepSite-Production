import { File } from "@/lib/type";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export const useManualUpdates = () => {
  const queryClient = useQueryClient();

  const { data: manuallyUpdatedFiles } = useQuery<File[]>({
    queryKey: ["manuallyUpdatedFiles"],
    queryFn: () => {
      return [];
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
  });
  const files = useMemo(() => {
    return queryClient.getQueryData<File[]>(["files"]) ?? [];
  }, [queryClient]);

  const isManuallyUpdatedSameAsFiles = useMemo(() => {
    return manuallyUpdatedFiles?.every((file) =>
      files?.some((f) => f.path === file.path && f.content === file.content)
    );
  }, [manuallyUpdatedFiles, files]);

  return { manuallyUpdatedFiles, isManuallyUpdatedSameAsFiles };
};

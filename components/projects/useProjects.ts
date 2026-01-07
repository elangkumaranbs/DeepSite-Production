import { getProjects } from "@/actions/projects";
import { useQuery } from "@tanstack/react-query";

export const useProjects = () => {
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  return { projects, isLoading, error, refetch };
}
import { useQuery } from "@tanstack/react-query";

export function useAdmin() {
  const { data, isLoading } = useQuery<{ isAdmin: boolean; role: string | null }>({
    queryKey: ["/api/applykit/admin/me"],
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    isAdmin: data?.isAdmin || false,
    role: data?.role || null,
    isLoading,
  };
}

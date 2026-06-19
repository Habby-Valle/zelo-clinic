import { useQuery } from "@tanstack/react-query";

import { fetchSystemConfigPublic } from "@/features/system-config/services";

export function useSystemConfig() {
  return useQuery({
    queryKey: ["system-config", "public"],
    queryFn: fetchSystemConfigPublic,
    staleTime: 5 * 60 * 1000,
  });
}

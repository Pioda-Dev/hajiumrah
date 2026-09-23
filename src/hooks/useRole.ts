import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const db = supabase as any;

export function useRole() {
  const { user, loading } = useAuth();
  const q = useQuery({
    queryKey: ["my-roles", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await db.from("user_roles").select("role").eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r: { role: string }) => r.role);
    },
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
  const roles = q.data ?? [];
  return {
    roles,
    isAdmin: roles.includes("admin"),
    isStaff: roles.includes("admin") || roles.includes("staff"),
    loading: loading || q.isLoading,
  };
}

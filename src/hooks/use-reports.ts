import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/use-toast";

export function useReports(filters?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: async () => {
      let query = supabase.from('reports').select('*, profiles(username)');
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.category) query = query.eq('category', filters.category);
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Get current user ID
  // const { data: { user } } = supabase.auth.getUser(); // Removed unused and incorrect line

  return useMutation({
    mutationFn: async (data: any) => {
      // Get current user ID specifically
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not logged in");

      const { data: report, error } = await supabase.from('reports').insert({
        ...data,
        reporter_id: sessionData.session.user.id
      }).select().single();

      if (error) throw error;
      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast({ title: "Report Submitted" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
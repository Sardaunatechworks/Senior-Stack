import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export function useUsers() {
  const { toast } = useToast();

  // 1. Fetch Users (Profiles) from Supabase
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("role", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // 2. Create User Stub
  // Note: Creating *other* users (like an Admin creating a Reporter) is restricted 
  // in Supabase client-side for security. Usually, users must sign up themselves.
  // We will keep this function to prevent your "CreateUserDialog" from crashing.
  const createUser = async (userData: any, options?: any) => {
    toast({
      title: "Feature Restricted",
      description: "For security, users must register themselves on the Sign Up page.",
      variant: "destructive"
    });
    
    // If you strictly need this, you would need a Supabase Edge Function.
    // For now, we return safely so the app doesn't break.
  };

  return {
    users,
    isLoading,
    createUser,
    isCreating: false,
  };
}
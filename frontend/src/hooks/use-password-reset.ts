import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

export function useRequestPasswordReset() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (username: string) => {
      const res = await fetch(api.auth.requestReset.path, {
        method: api.auth.requestReset.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to request password reset");
      }

      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reset Token Generated",
        description: data.token ? `Token: ${data.token}` : "Check your email for reset instructions",
      });
    },
    onError: (error) => {
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Could not process reset request",
        variant: "destructive",
      });
    },
  });
}

export function useResetPassword() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const res = await fetch(api.auth.resetPassword.path, {
        method: api.auth.resetPassword.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid or expired reset token");
        }
        if (res.status === 400) {
          throw new Error("Password must be at least 6 characters");
        }
        throw new Error("Failed to reset password");
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password Reset Successful",
        description: "Your password has been changed. You can now login with your new password.",
      });
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Could not reset password",
        variant: "destructive",
      });
    },
  });
}

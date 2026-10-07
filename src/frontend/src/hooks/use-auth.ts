import { useBackend } from "@/hooks/use-backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Authentication + admin-role state for the panchayat portal.
 *
 * `isAuthenticated` covers both a fresh login and a restored session on reload.
 * `isAdmin` is only meaningful once the caller is authenticated; the backend
 * promotes the first authenticated user to admin automatically.
 */
export function useAuth() {
  const {
    login,
    clear,
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
  } = useInternetIdentity();
  const { actor, isReady } = useBackend();
  const queryClient = useQueryClient();

  const adminQuery = useQuery<boolean>({
    queryKey: ["callerIsAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: isReady && isAuthenticated,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  return {
    identity,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    isLoginError,
    loginError,
    isAdmin: adminQuery.data ?? false,
    isAdminLoading: isAuthenticated && adminQuery.isLoading,
    login: handleLogin,
    logout: handleLogout,
  };
}

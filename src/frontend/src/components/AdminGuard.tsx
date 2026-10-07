import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { t } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { Loader2, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Gate for every admin route. Renders its children only when the caller is
 * signed in with Internet Identity AND holds the admin role. Unauthenticated
 * visitors get a sign-in prompt; authenticated non-admins get a clear refusal.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const {
    isAuthenticated,
    isAdmin,
    isAdminLoading,
    isInitializing,
    isLoggingIn,
    login,
  } = useAuth();

  if (isInitializing) {
    return (
      <div
        data-ocid="admin.guard.loading_state"
        className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8"
      >
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card
          data-ocid="admin.guard.login_required"
          className="mx-auto max-w-lg rounded-lg border-border shadow-subtle"
        >
          <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
              <Lock className="size-6" aria-hidden="true" />
            </span>
            <h1 className="font-display text-2xl font-bold text-foreground">
              प्रशासक लॉगिन आवश्यक
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Admin login required
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              पंचायत प्रबंधन पृष्ठों तक पहुँचने के लिए कृपया Internet Identity से साइन इन
              करें।
            </p>
            <Button
              type="button"
              data-ocid="admin.guard.login_button"
              onClick={login}
              disabled={isLoggingIn}
              className="mt-2"
            >
              {isLoggingIn ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <ShieldCheck className="size-4" aria-hidden="true" />
              )}
              {isLoggingIn ? t.common.loading : t.actions.login}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdminLoading) {
    return (
      <div
        data-ocid="admin.guard.verifying_state"
        className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8"
      >
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full rounded-lg" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Card
          data-ocid="admin.guard.forbidden_state"
          className="mx-auto max-w-lg rounded-lg border-border shadow-subtle"
        >
          <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
              <ShieldAlert className="size-6" aria-hidden="true" />
            </span>
            <h1 className="font-display text-2xl font-bold text-foreground">
              पहुँच अस्वीकृत
            </h1>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Access denied
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              यह खाता प्रशासक नहीं है। कृपया पंचायत अधिकारी से संपर्क करें।
            </p>
            <Button asChild type="button" variant="secondary" className="mt-2">
              <Link to="/" data-ocid="admin.guard.go_home_button">
                {t.common.goHome}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

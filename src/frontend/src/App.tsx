import type { ProblemCategory, ProblemStatus } from "@/backend";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import AdminDevelopmentPage from "@/pages/AdminDevelopmentPage";
import AdminPage from "@/pages/AdminPage";
import AdminProblemsPage from "@/pages/AdminProblemsPage";
import AdminProfilePage from "@/pages/AdminProfilePage";
import AdminSettingsPage from "@/pages/AdminSettingsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DevelopmentDetailPage } from "@/pages/DevelopmentDetailPage";
import { DevelopmentPage } from "@/pages/DevelopmentPage";
import { ProblemDetailPage } from "@/pages/ProblemDetailPage";
import { ProblemsPage } from "@/pages/ProblemsPage";
import { ReportProblemPage } from "@/pages/ReportProblemPage";
import {
  Link,
  RouterProvider,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

/**
 * Route tree for the ग्राम पंचायत portal.
 *
 * Page bodies are owned by separate tasks; each route renders a lightweight
 * placeholder that the page task replaces. The shell (Layout/Header/Footer)
 * and every route path are registered here so navigation works end to end.
 */

function PagePlaceholder({
  titleHi,
  titleEn,
}: {
  titleHi: string;
  titleEn: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        data-ocid="page.placeholder"
        className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center shadow-subtle"
      >
        <h1 className="font-display text-3xl font-bold text-foreground">
          {titleHi}
        </h1>
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          {titleEn}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          यह पृष्ठ अभी बन रहा है। कृपया डैशबोर्ड पर लौटें।
        </p>
        <Button asChild type="button" data-ocid="page.go_home_button">
          <Link to="/">{t.common.goHome}</Link>
        </Button>
      </div>
    </div>
  );
}

const rootRoute = createRootRouteWithContext<Record<string, never>>()({
  component: Layout,
  notFoundComponent: () => (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold text-foreground">
        {t.common.notFound}
      </h1>
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        {t.common.notFoundEn}
      </p>
      <Button asChild type="button" data-ocid="not_found.go_home_button">
        <Link to="/">{t.common.goHome}</Link>
      </Button>
    </div>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const problemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/problems",
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    category?: ProblemCategory;
    status?: ProblemStatus;
    q?: string;
  } => ({
    category: search.category as ProblemCategory | undefined,
    status: search.status as ProblemStatus | undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  component: ProblemsPage,
});

const problemDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/problems/$problemId",
  component: ProblemDetailPage,
});

const reportProblemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/problems/new",
  component: ReportProblemPage,
});

const developmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/development",
  component: DevelopmentPage,
});

const developmentDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/development/$updateId",
  component: DevelopmentDetailPage,
});

const directoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directory",
  component: () => (
    <PagePlaceholder titleHi={t.nav.directory} titleEn={t.nav.directoryEn} />
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const adminProblemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/problems",
  component: AdminProblemsPage,
});

const adminDevelopmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/development",
  component: AdminDevelopmentPage,
});

const adminProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/profile",
  component: AdminProfilePage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/settings",
  component: AdminSettingsPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  problemsRoute,
  reportProblemRoute,
  problemDetailRoute,
  developmentRoute,
  developmentDetailRoute,
  directoryRoute,
  adminRoute,
  adminProblemsRoute,
  adminDevelopmentRoute,
  adminProfileRoute,
  adminSettingsRoute,
]);

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}

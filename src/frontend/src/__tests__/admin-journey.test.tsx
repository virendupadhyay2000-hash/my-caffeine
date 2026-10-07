import {
  createMockActor,
  makeDevelopment,
  makeProblem,
  makeStats,
  renderWithProviders,
  setUrl,
} from "@/__tests__/test-utils";
import { DevelopmentStatus, ProblemCategory, ProblemStatus } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actor = createMockActor();

/**
 * Mutable auth state so each test can choose the caller's session. The
 * `vi.mock` factory is hoisted above this object, so it reads the live value
 * at render time rather than a snapshot.
 */
const authState = {
  isAuthenticated: false,
  isAdmin: false,
  isAdminLoading: false,
  isInitializing: false,
  isLoggingIn: false,
  login: vi.fn(),
  logout: vi.fn(),
};

vi.mock("@/hooks/use-backend", () => ({
  useBackend: () => ({ actor, isFetching: false, isReady: true }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    identity: undefined,
    isAuthenticated: authState.isAuthenticated,
    isInitializing: authState.isInitializing,
    isLoggingIn: authState.isLoggingIn,
    isLoginError: false,
    loginError: undefined,
    isAdmin: authState.isAdmin,
    isAdminLoading: authState.isAdminLoading,
    login: authState.login,
    logout: authState.logout,
  }),
}));

async function renderAppAt(path: string) {
  setUrl(path);
  vi.resetModules();
  const { default: App } = await import("@/App");
  return renderWithProviders(<App />);
}

describe("admin journey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.isAuthenticated = false;
    authState.isAdmin = false;
    authState.isAdminLoading = false;
    authState.isInitializing = false;
    authState.isLoggingIn = false;
    actor.listProblems.mockResolvedValue([]);
    actor.listDevelopmentUpdates.mockResolvedValue([]);
    actor.getProblemStats.mockResolvedValue(makeStats());
    actor.getVillageProfile.mockResolvedValue(null);
    actor.getVillageDashboard.mockResolvedValue({
      developmentCount: 0n,
      ongoingCount: 0n,
      completedCount: 0n,
      profile: undefined,
    });
  });

  it("blocks admin pages for a signed-out visitor", async () => {
    await renderAppAt("/admin/problems");

    expect(
      await screen.findByTestId("admin.guard.login_required"),
    ).toBeInTheDocument();
    expect(screen.getByText("प्रशासक लॉगिन आवश्यक")).toBeInTheDocument();
    // The guarded content must not render.
    expect(screen.queryByTestId("admin.problems.page")).not.toBeInTheDocument();
  });

  it("blocks admin pages for a signed-in non-admin", async () => {
    authState.isAuthenticated = true;
    authState.isAdmin = false;

    await renderAppAt("/admin/problems");

    expect(
      await screen.findByTestId("admin.guard.forbidden_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("पहुँच अस्वीकृत")).toBeInTheDocument();
    expect(screen.queryByTestId("admin.problems.page")).not.toBeInTheDocument();
  });

  it("lets a signed-in admin change a problem's status", async () => {
    const user = userEvent.setup();
    authState.isAuthenticated = true;
    authState.isAdmin = true;
    actor.listProblems.mockResolvedValue([
      makeProblem({
        id: 4n,
        title: "सड़क पर गड्ढा",
        category: ProblemCategory.road,
        status: ProblemStatus.new,
      }),
    ]);
    actor.updateProblemStatus.mockResolvedValue(
      makeProblem({ id: 4n, status: ProblemStatus.inProgress }),
    );

    await renderAppAt("/admin/problems");

    expect(
      await screen.findByTestId("admin.problems.page"),
    ).toBeInTheDocument();
    await user.click(
      await screen.findByTestId("admin.problem.status_select.1"),
    );
    await user.click(await screen.findByRole("option", { name: /प्रगति में/ }));

    await waitFor(() => {
      expect(actor.updateProblemStatus).toHaveBeenCalledWith(
        4n,
        ProblemStatus.inProgress,
      );
    });
  });

  it("lets a signed-in admin publish a development update", async () => {
    const user = userEvent.setup();
    authState.isAuthenticated = true;
    authState.isAdmin = true;
    actor.listDevelopmentUpdates.mockResolvedValue([]);
    actor.createDevelopmentUpdate.mockResolvedValue(
      makeDevelopment({ id: 9n, title: "नया तालाब" }),
    );

    await renderAppAt("/admin/development");

    expect(
      await screen.findByTestId("admin.development.page"),
    ).toBeInTheDocument();
    await user.click(
      await screen.findByTestId("admin.development.create_button"),
    );

    await user.type(
      await screen.findByTestId("development.title_input"),
      "नया तालाब",
    );
    await user.type(
      screen.getByTestId("development.description_input"),
      "गाँव में वर्षा जल संचयन के लिए तालाब बनाया जाएगा।",
    );
    await user.click(screen.getByTestId("development.submit_button"));

    await waitFor(() => {
      expect(actor.createDevelopmentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "नया तालाब",
          description: "गाँव में वर्षा जल संचयन के लिए तालाब बनाया जाएगा।",
          status: DevelopmentStatus.planned,
        }),
      );
    });
  });
});

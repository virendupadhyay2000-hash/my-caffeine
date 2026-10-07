import {
  createMockActor,
  makeDashboard,
  makeProblem,
  makeProblemDetail,
  makeProfile,
  makeStats,
  renderWithProviders,
  setUrl,
} from "@/__tests__/test-utils";
import { ProblemCategory, ProblemStatus } from "@/backend";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Characterization baseline for behavior the contact-settings request must
 * leave intact.
 *
 * The request intentionally changes the footer contact *values*, the admin
 * dashboard/problem/development layouts, and adds `/admin/settings`. This file
 * therefore does NOT freeze those. It protects the adjacent working behavior
 * the acceptance criteria call out as "existing features continue to work":
 * the admin dashboard KPI tiles and recent activity, admin village-profile
 * editing, problem upvoting, and the footer's contact-link structure (a
 * `mailto:` link and a `tel:` link, whatever their values become).
 */

const actor = createMockActor();

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

describe("characterization: protected existing behavior", () => {
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
    actor.getVillageDashboard.mockResolvedValue(makeDashboard());
  });

  it("renders the footer contact block as a mailto link and a tel link", async () => {
    await renderAppAt("/");

    // The contact block is part of the shell on every route. The request
    // changes the values, so assert only the link structure, not the address.
    const mailto = await screen.findByRole("link", { name: /@/ });
    expect(mailto).toHaveAttribute("href", expect.stringMatching(/^mailto:/));

    const tel = screen.getByRole("link", { name: /^\+/ });
    expect(tel).toHaveAttribute("href", expect.stringMatching(/^tel:/));
  });

  it("keeps the admin dashboard KPI tiles and recent activity", async () => {
    authState.isAuthenticated = true;
    authState.isAdmin = true;
    actor.getProblemStats.mockResolvedValue(
      makeStats({ total: 12n, open: 5n, resolved: 7n }),
    );
    actor.listProblems.mockResolvedValue([
      makeProblem({ id: 1n, title: "मुख्य मार्ग पर पानी भरा है" }),
    ]);
    actor.listDevelopmentUpdates.mockResolvedValue([]);

    await renderAppAt("/admin");

    expect(await screen.findByTestId("admin.page")).toBeInTheDocument();
    // KPI tiles survive the layout change.
    expect(await screen.findByTestId("admin.stat.total")).toHaveTextContent(
      "12",
    );
    expect(screen.getByTestId("admin.stat.open")).toHaveTextContent("5");
    expect(screen.getByTestId("admin.stat.resolved")).toHaveTextContent("7");
    // Recent activity still lists the newest problems.
    expect(
      await screen.findByTestId("admin.recent_activity.card"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("मुख्य मार्ग पर पानी भरा है"),
    ).toBeInTheDocument();
  });

  it("keeps the admin dashboard quick links to the existing admin areas", async () => {
    authState.isAuthenticated = true;
    authState.isAdmin = true;

    await renderAppAt("/admin");

    expect(await screen.findByTestId("admin.page")).toBeInTheDocument();
    // The request adds a contact-settings link to this card; the existing
    // destinations must survive the layout change.
    expect(
      await screen.findByTestId("admin.quick_links.card"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("admin.quick_link.manage_problems"),
    ).toHaveAttribute("href", "/admin/problems");
    expect(
      screen.getByTestId("admin.quick_link.manage_development"),
    ).toHaveAttribute("href", "/admin/development");
    expect(
      screen.getByTestId("admin.quick_link.village_profile"),
    ).toHaveAttribute("href", "/admin/profile");
  });

  it("lets a signed-in admin edit and save the village profile", async () => {
    const user = userEvent.setup();
    authState.isAuthenticated = true;
    authState.isAdmin = true;
    actor.getVillageProfile.mockResolvedValue(
      makeProfile({ name: "रामपुर", population: 4200n, households: 780n }),
    );
    actor.setVillageProfile.mockResolvedValue(
      makeProfile({ name: "रामपुर", population: 5000n, households: 900n }),
    );

    await renderAppAt("/admin/profile");

    expect(await screen.findByTestId("admin.profile.page")).toBeInTheDocument();
    const population = await screen.findByTestId(
      "village_profile.population_input",
    );
    await user.clear(population);
    await user.type(population, "5000");
    await user.click(screen.getByTestId("village_profile.save_button"));

    await waitFor(() => {
      expect(actor.setVillageProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: "रामपुर", population: 5000n }),
      );
    });
    expect(
      await screen.findByTestId("admin.profile.success_state"),
    ).toBeInTheDocument();
  });

  it("records an upvote from the problem detail page", async () => {
    const user = userEvent.setup();
    actor.getProblemDetail.mockResolvedValue(
      makeProblemDetail({
        problem: makeProblem({
          id: 3n,
          title: "सड़क पर गड्ढा",
          category: ProblemCategory.road,
          status: ProblemStatus.new,
          upvotes: 2n,
        }),
      }),
    );
    actor.upvoteProblem.mockResolvedValue(3n);

    await renderAppAt("/problems/3");

    expect(
      await screen.findByTestId("problem_detail.page"),
    ).toBeInTheDocument();
    await user.click(screen.getByTestId("problem_detail.upvote_button"));

    await waitFor(() => {
      expect(actor.upvoteProblem).toHaveBeenCalledWith(3n);
    });
  });
});

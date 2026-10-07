import {
  createMockActor,
  makeDashboard,
  makeDevelopment,
  makeProblem,
  makeProfile,
  makeStats,
  renderWithProviders,
  setUrl,
} from "@/__tests__/test-utils";
import { DevelopmentStatus, ProblemCategory } from "@/backend";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actor = createMockActor();

vi.mock("@/hooks/use-backend", () => ({
  useBackend: () => ({ actor, isFetching: false, isReady: true }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    identity: undefined,
    isAuthenticated: false,
    isInitializing: false,
    isLoggingIn: false,
    isLoginError: false,
    loginError: undefined,
    isAdmin: false,
    isAdminLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

async function renderAppAt(path: string) {
  setUrl(path);
  vi.resetModules();
  const { default: App } = await import("@/App");
  return renderWithProviders(<App />);
}

describe("dashboard and development journey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actor.listProblems.mockResolvedValue([]);
    actor.listDevelopmentUpdates.mockResolvedValue([]);
    actor.getProblemStats.mockResolvedValue(makeStats());
    actor.getVillageProfile.mockResolvedValue(null);
    actor.getVillageDashboard.mockResolvedValue(makeDashboard());
  });

  it("shows village facts and a problem chart on the dashboard", async () => {
    actor.getVillageProfile.mockResolvedValue(
      makeProfile({ name: "रामपुर", population: 4200n, households: 780n }),
    );
    actor.getProblemStats.mockResolvedValue(
      makeStats({
        total: 12n,
        open: 5n,
        resolved: 7n,
        byCategory: [
          [ProblemCategory.water, 6n],
          [ProblemCategory.road, 6n],
        ],
      }),
    );

    await renderAppAt("/");

    // Wait for the profile-backed hero, which only renders once the village
    // profile query resolves.
    expect(await screen.findByText("रामपुर")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard.stat.population")).toHaveTextContent(
      "4,200",
    );
    expect(screen.getByTestId("dashboard.stat.households")).toHaveTextContent(
      "780",
    );
    // At least one chart of problem data is rendered.
    expect(
      await screen.findByTestId("dashboard.category_chart"),
    ).toBeInTheDocument();
  });

  it("lists development updates and opens one to its detail view", async () => {
    const update = makeDevelopment({
      id: 5n,
      title: "मुख्य सड़क का निर्माण",
      status: DevelopmentStatus.ongoing,
    });
    actor.listDevelopmentUpdates.mockResolvedValue([update]);
    actor.getDevelopmentUpdate.mockResolvedValue(update);

    await renderAppAt("/development");

    expect(await screen.findByTestId("development.page")).toBeInTheDocument();
    const link = await screen.findByTestId("development.link.1");
    expect(link).toHaveTextContent("मुख्य सड़क का निर्माण");

    // The card links to the detail route; assert the detail page renders the
    // same update when that route is loaded directly.
    await renderAppAt("/development/5");
    expect(
      await screen.findByTestId("development_detail.page"),
    ).toBeInTheDocument();
    expect(screen.getByText("मुख्य सड़क का निर्माण")).toBeInTheDocument();
    expect(
      screen.getByText("गाँव की मुख्य सड़क को पक्का किया जा रहा है।"),
    ).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown development id", async () => {
    actor.getDevelopmentUpdate.mockResolvedValue(null);

    await renderAppAt("/development/999");

    expect(
      await screen.findByTestId("development_detail.not_found_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("विकास कार्य नहीं मिला")).toBeInTheDocument();
  });

  it("shows recent problems on the dashboard", async () => {
    actor.listProblems.mockResolvedValue([
      makeProblem({ id: 1n, title: "मुख्य मार्ग पर पानी भरा है" }),
    ]);

    await renderAppAt("/");

    expect(
      await screen.findByText("मुख्य मार्ग पर पानी भरा है"),
    ).toBeInTheDocument();
  });
});

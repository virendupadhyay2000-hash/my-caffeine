import {
  createMockActor,
  makeProblem,
  makeProblemDetail,
  makeStats,
  renderWithProviders,
  setUrl,
} from "@/__tests__/test-utils";
import { ProblemCategory, ProblemStatus } from "@/backend";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

/**
 * Render the app at `path`.
 *
 * `App` builds its TanStack Router once at module load, so a router created in
 * an earlier test keeps its original location. Resetting the module registry
 * and importing `App` fresh after `setUrl` guarantees the router reads the URL
 * for the current test.
 */
async function renderAppAt(path: string) {
  setUrl(path);
  vi.resetModules();
  const { default: App } = await import("@/App");
  return renderWithProviders(<App />);
}

describe("problem feed and reporting journey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actor.listProblems.mockResolvedValue([]);
    actor.getProblemStats.mockResolvedValue(makeStats());
    actor.listDevelopmentUpdates.mockResolvedValue([]);
    actor.getVillageProfile.mockResolvedValue(null);
    actor.getVillageDashboard.mockResolvedValue({
      developmentCount: 0n,
      ongoingCount: 0n,
      completedCount: 0n,
      profile: undefined,
    });
  });

  it("shows the empty feed state when there are no problems", async () => {
    await renderAppAt("/problems");

    expect(await screen.findByText("अभी कोई शिकायत नहीं है")).toBeInTheDocument();
    expect(screen.getByText("No problems yet")).toBeInTheDocument();
  });

  it("lists reported problems newest-first as returned by the backend", async () => {
    actor.listProblems.mockResolvedValue([
      makeProblem({
        id: 2n,
        title: "स्ट्रीट लाइट खराब है",
        category: ProblemCategory.electricity,
      }),
      makeProblem({
        id: 1n,
        title: "मुख्य मार्ग पर पानी भरा है",
        category: ProblemCategory.water,
      }),
    ]);
    await renderAppAt("/problems");

    // Wait for the loaded cards, not the skeleton placeholders that share the
    // same container.
    await screen.findByText("स्ट्रीट लाइट खराब है");
    const list = screen.getByTestId("problems.list");
    const titles = within(list)
      .getAllByRole("link")
      .map((node) => node.textContent);
    expect(titles[0]).toContain("स्ट्रीट लाइट खराब है");
    expect(titles[1]).toContain("मुख्य मार्ग पर पानी भरा है");
  });

  it("reflects a category filter in the URL and passes it to the backend", async () => {
    const user = userEvent.setup();
    await renderAppAt("/problems");

    await screen.findByTestId("problems.list");
    await user.click(screen.getByTestId("problems.category_select"));
    await user.click(await screen.findByRole("option", { name: /पेयजल/ }));

    await waitFor(() => {
      expect(window.location.search).toContain("category=water");
    });
    await waitFor(() => {
      expect(actor.listProblems).toHaveBeenCalledWith(
        expect.objectContaining({ category: ProblemCategory.water }),
      );
    });
  });

  it("reflects a status filter in the URL and passes it to the backend", async () => {
    const user = userEvent.setup();
    await renderAppAt("/problems");

    await screen.findByTestId("problems.list");
    await user.click(screen.getByTestId("problems.status_select"));
    await user.click(await screen.findByRole("option", { name: /हल हो गया/ }));

    await waitFor(() => {
      expect(window.location.search).toContain("status=resolved");
    });
    await waitFor(() => {
      expect(actor.listProblems).toHaveBeenCalledWith(
        expect.objectContaining({ status: ProblemStatus.resolved }),
      );
    });
  });

  it("submits a problem report and navigates to its detail view", async () => {
    const user = userEvent.setup();
    const created = makeProblem({ id: 7n, title: "नया बोरवेल चाहिए" });
    actor.createProblem.mockResolvedValue(created);
    actor.getProblemDetail.mockResolvedValue(
      makeProblemDetail({ problem: created }),
    );

    await renderAppAt("/problems/new");

    await user.type(
      await screen.findByTestId("report_problem.title_input"),
      "नया बोरवेल चाहिए",
    );
    await user.type(
      screen.getByTestId("report_problem.description_textarea"),
      "गाँव के पूर्वी हिस्से में पीने के पानी की समस्या है।",
    );
    await user.click(screen.getByTestId("report_problem.category_select"));
    await user.click(await screen.findByRole("option", { name: /पेयजल/ }));
    await user.click(screen.getByTestId("report_problem.submit_button"));

    await waitFor(() => {
      expect(actor.createProblem).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "नया बोरवेल चाहिए",
          category: ProblemCategory.water,
        }),
      );
    });
    // The detail route renders the created problem.
    expect(
      await screen.findByTestId("problem_detail.page"),
    ).toBeInTheDocument();
    expect(await screen.findByText("नया बोरवेल चाहिए")).toBeInTheDocument();
  });

  it("validates the report form before calling the backend", async () => {
    const user = userEvent.setup();
    await renderAppAt("/problems/new");

    // The description is a native `required` field, so fill it to let the
    // form submit and reach the app's own title-length validation.
    await user.type(
      await screen.findByTestId("report_problem.title_input"),
      "ab",
    );
    await user.type(
      screen.getByTestId("report_problem.description_textarea"),
      "गाँव के पूर्वी हिस्से में पीने के पानी की समस्या है।",
    );
    await user.click(screen.getByTestId("report_problem.submit_button"));

    expect(
      await screen.findByTestId("report_problem.form_error"),
    ).toHaveTextContent("कृपया कम से कम 4 अक्षरों का शीर्षक लिखें।");
    expect(actor.createProblem).not.toHaveBeenCalled();
  });

  it("opens a problem detail with status history and official responses", async () => {
    actor.getProblemDetail.mockResolvedValue(
      makeProblemDetail({
        problem: makeProblem({
          id: 3n,
          title: "सड़क पर गड्ढा",
          status: ProblemStatus.inProgress,
        }),
        statusHistory: [
          {
            fromStatus: ProblemStatus.new,
            toStatus: ProblemStatus.inProgress,
            changedAt: 1_700_000_000_000_000_000n,
          },
        ],
        responses: [
          {
            id: 1n,
            problemId: 3n,
            message: "मरम्मत का कार्य शुरू हो गया है।",
            createdAt: 1_700_000_000_000_000_000n,
          },
        ],
      }),
    );

    await renderAppAt("/problems/3");

    expect(
      await screen.findByTestId("problem_detail.page"),
    ).toBeInTheDocument();
    expect(screen.getByText("सड़क पर गड्ढा")).toBeInTheDocument();
    expect(
      screen.getByTestId("problem_detail.status_history_list"),
    ).toBeInTheDocument();
    expect(screen.getByText("मरम्मत का कार्य शुरू हो गया है।")).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown problem id", async () => {
    actor.getProblemDetail.mockResolvedValue(null);
    await renderAppAt("/problems/999");

    expect(
      await screen.findByTestId("problem_detail.not_found_state"),
    ).toBeInTheDocument();
    expect(screen.getByText("शिकायत नहीं मिली")).toBeInTheDocument();
  });
});

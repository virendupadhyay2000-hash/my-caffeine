import { createMockActor, renderWithProviders } from "@/__tests__/test-utils";
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

import App from "@/App";

describe("App shell", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders the header, footer, and dashboard without a blank screen", async () => {
    renderWithProviders(<App />);

    // Header brand (Hindi-first app name) and footer are part of the shell.
    expect((await screen.findAllByText("ग्राम पंचायत")).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText("Village Panchayat Portal").length,
    ).toBeGreaterThan(0);

    // The dashboard route renders its hero and KPI section.
    expect(await screen.findByText("डैशबोर्ड")).toBeInTheDocument();
    expect(await screen.findByText("कुल जनसंख्या")).toBeInTheDocument();
  });
});

import {
  createMockActor,
  makeContactSettings,
  makeDashboard,
  makeStats,
  renderWithProviders,
  setUrl,
} from "@/__tests__/test-utils";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Cover for the admin-editable contact settings feature.
 *
 * The frontend suite mocks the backend actor, so these tests prove the
 * component/consumer contract: the footer reads the saved settings with a
 * default fallback, the admin editor validates and saves, and the admin gate
 * blocks non-admins. The real canister behavior is covered separately by the
 * PocketIC lane in `test/pocketic/backend.test.ts`.
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

describe("contact settings journey", () => {
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
    actor.getContactSettings.mockResolvedValue(makeContactSettings());
  });

  it("shows the default contact email and phone in the footer before any admin edit", async () => {
    await renderAppAt("/");

    const email = await screen.findByTestId("footer.email_link");
    expect(email).toHaveTextContent("Virendupadhyay.2000@gmail.com");
    expect(email).toHaveAttribute(
      "href",
      "mailto:Virendupadhyay.2000@gmail.com",
    );

    const phone = screen.getByTestId("footer.phone_link");
    expect(phone).toHaveTextContent("+91 94131 44022");
    // The tel: href strips spaces so it is dialable.
    expect(phone).toHaveAttribute("href", "tel:+919413144022");
  });

  it("shows the saved contact values in the footer once the backend returns them", async () => {
    actor.getContactSettings.mockResolvedValue(
      makeContactSettings({
        email: "sarpanch@rampur.in",
        phone: "+91 90000 12345",
      }),
    );

    await renderAppAt("/");

    const email = await screen.findByTestId("footer.email_link");
    await waitFor(() => {
      expect(email).toHaveTextContent("sarpanch@rampur.in");
    });
    expect(email).toHaveAttribute("href", "mailto:sarpanch@rampur.in");

    const phone = screen.getByTestId("footer.phone_link");
    expect(phone).toHaveTextContent("+91 90000 12345");
    expect(phone).toHaveAttribute("href", "tel:+919000012345");
  });

  it("lets an admin edit and save the contact settings with a success confirmation", async () => {
    const user = userEvent.setup();
    authState.isAuthenticated = true;
    authState.isAdmin = true;
    actor.getContactSettings.mockResolvedValue(makeContactSettings());
    actor.updateContactSettings.mockResolvedValue(
      makeContactSettings({
        email: "sarpanch@rampur.in",
        phone: "+91 90000 12345",
      }),
    );

    await renderAppAt("/admin/settings");

    expect(
      await screen.findByTestId("admin.settings.page"),
    ).toBeInTheDocument();

    const emailInput = await screen.findByTestId("admin.settings.email_input");
    const phoneInput = screen.getByTestId("admin.settings.phone_input");
    await user.clear(emailInput);
    await user.type(emailInput, "sarpanch@rampur.in");
    await user.clear(phoneInput);
    await user.type(phoneInput, "+91 90000 12345");
    await user.click(screen.getByTestId("admin.settings.save_button"));

    await waitFor(() => {
      expect(actor.updateContactSettings).toHaveBeenCalledWith(
        "sarpanch@rampur.in",
        "+91 90000 12345",
      );
    });
    expect(
      await screen.findByTestId("admin.settings.success_state"),
    ).toBeInTheDocument();
  });

  it("rejects an empty email with an inline validation error and does not save", async () => {
    const user = userEvent.setup();
    authState.isAuthenticated = true;
    authState.isAdmin = true;

    await renderAppAt("/admin/settings");

    const emailInput = await screen.findByTestId("admin.settings.email_input");
    await user.clear(emailInput);
    await user.click(screen.getByTestId("admin.settings.save_button"));

    expect(
      await screen.findByTestId("admin.settings.email_error"),
    ).toHaveTextContent("कृपया संपर्क ईमेल दर्ज करें");
    expect(actor.updateContactSettings).not.toHaveBeenCalled();
  });

  it("rejects an empty phone with an inline validation error and does not save", async () => {
    const user = userEvent.setup();
    authState.isAuthenticated = true;
    authState.isAdmin = true;

    await renderAppAt("/admin/settings");

    const phoneInput = await screen.findByTestId("admin.settings.phone_input");
    await user.clear(phoneInput);
    await user.click(screen.getByTestId("admin.settings.save_button"));

    expect(
      await screen.findByTestId("admin.settings.phone_error"),
    ).toHaveTextContent("कृपया संपर्क फ़ोन दर्ज करें");
    expect(actor.updateContactSettings).not.toHaveBeenCalled();
  });

  it("shows a save error state when the backend rejects the update", async () => {
    const user = userEvent.setup();
    authState.isAuthenticated = true;
    authState.isAdmin = true;
    actor.updateContactSettings.mockRejectedValue(
      new Error("Unauthorized: Only admins can update contact settings"),
    );

    await renderAppAt("/admin/settings");

    const emailInput = await screen.findByTestId("admin.settings.email_input");
    await user.clear(emailInput);
    await user.type(emailInput, "sarpanch@rampur.in");
    await user.click(screen.getByTestId("admin.settings.save_button"));

    expect(
      await screen.findByTestId("admin.settings.save_error_state"),
    ).toHaveTextContent("सहेजने में त्रुटि हुई");
  });

  it("blocks the contact settings editor for a signed-out visitor", async () => {
    await renderAppAt("/admin/settings");

    expect(
      await screen.findByTestId("admin.guard.login_required"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("admin.settings.page")).not.toBeInTheDocument();
  });

  it("blocks the contact settings editor for a signed-in non-admin", async () => {
    authState.isAuthenticated = true;
    authState.isAdmin = false;

    await renderAppAt("/admin/settings");

    expect(
      await screen.findByTestId("admin.guard.forbidden_state"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("admin.settings.page")).not.toBeInTheDocument();
  });

  it("links to the contact settings page from the admin dashboard", async () => {
    authState.isAuthenticated = true;
    authState.isAdmin = true;

    await renderAppAt("/admin");

    expect(await screen.findByTestId("admin.page")).toBeInTheDocument();
    expect(
      await screen.findByTestId("admin.quick_link.contact_settings"),
    ).toHaveAttribute("href", "/admin/settings");
  });
});

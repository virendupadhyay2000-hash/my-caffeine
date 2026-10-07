import type {
  ContactSettings,
  DevelopmentInput,
  DevelopmentUpdate,
  Problem,
  ProblemDetail,
  ProblemFilter,
  ProblemStats,
  VillageDashboard,
  VillageProfile,
} from "@/backend";
import { DevelopmentStatus, ProblemCategory, ProblemStatus } from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { vi } from "vitest";

/**
 * Typed local actor mock for the frontend suite.
 *
 * The frontend never talks to a real canister in this lane; every read and
 * write goes through `useBackend()`, which this suite replaces with a mock
 * actor. The mock is typed against the app's own `backendInterface` so a
 * signature drift in the generated bindings fails the type-check rather than
 * silently passing.
 */
export interface MockActor {
  listProblems: ReturnType<typeof vi.fn>;
  getProblem: ReturnType<typeof vi.fn>;
  getProblemDetail: ReturnType<typeof vi.fn>;
  createProblem: ReturnType<typeof vi.fn>;
  upvoteProblem: ReturnType<typeof vi.fn>;
  updateProblemStatus: ReturnType<typeof vi.fn>;
  addOfficialResponse: ReturnType<typeof vi.fn>;
  getProblemStats: ReturnType<typeof vi.fn>;
  listDevelopmentUpdates: ReturnType<typeof vi.fn>;
  getDevelopmentUpdate: ReturnType<typeof vi.fn>;
  createDevelopmentUpdate: ReturnType<typeof vi.fn>;
  updateDevelopmentUpdate: ReturnType<typeof vi.fn>;
  deleteDevelopmentUpdate: ReturnType<typeof vi.fn>;
  getVillageProfile: ReturnType<typeof vi.fn>;
  setVillageProfile: ReturnType<typeof vi.fn>;
  getVillageDashboard: ReturnType<typeof vi.fn>;
  getContactSettings: ReturnType<typeof vi.fn>;
  updateContactSettings: ReturnType<typeof vi.fn>;
  isCallerAdmin: ReturnType<typeof vi.fn>;
}

export function createMockActor(overrides: Partial<MockActor> = {}): MockActor {
  const actor: MockActor = {
    listProblems: vi.fn(async () => [] as Problem[]),
    getProblem: vi.fn(async () => null),
    getProblemDetail: vi.fn(async () => null),
    createProblem: vi.fn(async () => makeProblem()),
    upvoteProblem: vi.fn(async () => 1n),
    updateProblemStatus: vi.fn(async () => makeProblem()),
    addOfficialResponse: vi.fn(async () => null),
    getProblemStats: vi.fn(async () => makeStats()),
    listDevelopmentUpdates: vi.fn(async () => [] as DevelopmentUpdate[]),
    getDevelopmentUpdate: vi.fn(async () => null),
    createDevelopmentUpdate: vi.fn(async () => makeDevelopment()),
    updateDevelopmentUpdate: vi.fn(async () => makeDevelopment()),
    deleteDevelopmentUpdate: vi.fn(async () => true),
    getVillageProfile: vi.fn(async () => null),
    setVillageProfile: vi.fn(async (input: VillageProfile) => input),
    getVillageDashboard: vi.fn(async () => makeDashboard()),
    getContactSettings: vi.fn(async () => makeContactSettings()),
    updateContactSettings: vi.fn(async (email: string, phone: string) =>
      makeContactSettings({ email, phone }),
    ),
    isCallerAdmin: vi.fn(async () => false),
    ...overrides,
  };
  return actor;
}

export function makeProblem(overrides: Partial<Problem> = {}): Problem {
  return {
    id: 1n,
    upvotes: 0n,
    status: ProblemStatus.new,
    title: "मुख्य मार्ग पर पानी भरा है",
    reporterName: "आशा",
    reporterContact: undefined,
    createdAt: 1_700_000_000_000_000_000n,
    description: "बरसात के बाद सड़क पर पानी जमा हो जाता है।",
    updatedAt: 1_700_000_000_000_000_000n,
    category: ProblemCategory.water,
    photo: undefined,
    location: undefined,
    ...overrides,
  };
}

export function makeProblemDetail(
  overrides: Partial<ProblemDetail> = {},
): ProblemDetail {
  return {
    problem: makeProblem(),
    statusHistory: [],
    responses: [],
    ...overrides,
  };
}

export function makeStats(overrides: Partial<ProblemStats> = {}): ProblemStats {
  return {
    total: 0n,
    open: 0n,
    resolved: 0n,
    byCategory: [],
    ...overrides,
  };
}

export function makeDevelopment(
  overrides: Partial<DevelopmentUpdate> = {},
): DevelopmentUpdate {
  return {
    id: 1n,
    status: DevelopmentStatus.ongoing,
    title: "मुख्य सड़क का निर्माण",
    createdAt: 1_700_000_000_000_000_000n,
    description: "गाँव की मुख्य सड़क को पक्का किया जा रहा है।",
    updatedAt: 1_700_000_000_000_000_000n,
    photo: undefined,
    budget: 500000n,
    ...overrides,
  };
}

export function makeProfile(
  overrides: Partial<VillageProfile> = {},
): VillageProfile {
  return {
    name: "रामपुर",
    updatedAt: 1_700_000_000_000_000_000n,
    areaSqKm: 12.5,
    facilities: ["प्राथमिक विद्यालय", "स्वास्थ्य केंद्र"],
    population: 4200n,
    households: 780n,
    ...overrides,
  };
}

export function makeDashboard(
  overrides: Partial<VillageDashboard> = {},
): VillageDashboard {
  return {
    developmentCount: 0n,
    ongoingCount: 0n,
    completedCount: 0n,
    profile: undefined,
    ...overrides,
  };
}

export function makeContactSettings(
  overrides: Partial<ContactSettings> = {},
): ContactSettings {
  return {
    email: "Virendupadhyay.2000@gmail.com",
    phone: "+91 94131 44022",
    ...overrides,
  };
}

export function makeDevelopmentInput(
  overrides: Partial<DevelopmentInput> = {},
): DevelopmentInput {
  return {
    title: "मुख्य सड़क का निर्माण",
    description: "गाँव की मुख्य सड़क को पक्का किया जा रहा है।",
    status: DevelopmentStatus.ongoing,
    budget: 500000n,
    photo: undefined,
    ...overrides,
  };
}

/** A fresh QueryClient with retries disabled so failures surface immediately. */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  queryClient: QueryClient = makeQueryClient(),
): RenderResult & { queryClient: QueryClient } {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }
  // `Object.assign` preserves the render result's bound query methods in the
  // type; an object spread widens them away and fails the type-check.
  return Object.assign(render(ui, { wrapper: Wrapper }), { queryClient });
}

/**
 * Point the jsdom URL at `path` before rendering a router-backed component.
 *
 * The app builds its TanStack Router once at module load, so a bare
 * `pushState` would leave the already-created router on its original location.
 * TanStack's browser history subscribes to `popstate`, so we push the new URL
 * and then dispatch `popstate` to make the live router re-read it.
 */
export function setUrl(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

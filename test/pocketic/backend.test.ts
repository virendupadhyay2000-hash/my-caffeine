import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * Backend behavior lane for the ग्राम पंचायत portal.
 *
 * Installs the app's own compiled wasm into the platform's PocketIC replica and
 * calls the real public API. This is the only lane that can see a backend whose
 * public methods compile and build green but trap at runtime, so it exercises
 * every method the acceptance criteria touch: problem reporting and feed reads,
 * upvoting, admin status/response writes, development updates, and the village
 * profile. It is a fresh build (`isNewApp: true`), so there is no previous
 * revision to upgrade from and no upgrade test.
 *
 * Admin bootstrap follows the contract documented by `getApiDoc`: access control
 * is initialized by the authorization extension, and the first *signed-in*
 * (non-anonymous) caller to invoke `_initialize_access_control` becomes `#admin`.
 * The installing identity is anonymous, so it is never an admin on its own; the
 * admin tests below set a deterministic identity and initialize first.
 */

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

const admin = createIdentity("panchayat-admin");

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
  // Register the first signed-in caller as the canister's admin. Anonymous
  // callers (the install identity) are never promoted, so this must run as a
  // real identity before any role-guarded call.
  actor.setIdentity(admin);
  await actor._initialize_access_control();
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  await expect(actor.listProblems({ category: [], status: [], search: [] })).resolves.toEqual([]);
  await expect(actor.listDevelopmentUpdates()).resolves.toEqual([]);
  await expect(actor.getVillageProfile()).resolves.toEqual([]);
  await expect(actor.getProblemStats()).resolves.toMatchObject({
    total: 0n,
    open: 0n,
    resolved: 0n,
  });
  await expect(actor.getVillageDashboard()).resolves.toMatchObject({
    developmentCount: 0n,
    ongoingCount: 0n,
    completedCount: 0n,
  });
});

it("round-trips a problem report through the real canister", async () => {
  const created = await actor.createProblem({
    title: "मुख्य मार्ग पर पानी भरा है",
    description: "बरसात के बाद सड़क पर पानी जमा हो जाता है और आवागमन बंद हो जाता है।",
    category: { water: null },
    reporterName: ["आशा"],
    reporterContact: [],
    location: [],
    photo: [],
  });

  expect(created.id).toBe(0n);
  expect(created.status).toEqual({ new: null });
  expect(created.upvotes).toBe(0n);

  const feed = await actor.listProblems({ category: [], status: [], search: [] });
  expect(feed).toHaveLength(1);
  expect(feed[0]).toMatchObject({ id: 0n, title: "मुख्य मार्ग पर पानी भरा है" });

  const detail = await actor.getProblemDetail(0n);
  expect(detail).not.toEqual([]);
  if (detail.length === 0) throw new Error("expected a problem detail");
  expect(detail[0].problem.id).toBe(0n);
  expect(detail[0].statusHistory).toHaveLength(1);
  expect(detail[0].responses).toEqual([]);
});

it("filters the feed by category, status, and keyword", async () => {
  await actor.createProblem({
    title: "स्ट्रीट लाइट खराब है",
    description: "रात में गली में अंधेरा रहता है, स्ट्रीट लाइट जलती नहीं।",
    category: { electricity: null },
    reporterName: [],
    reporterContact: [],
    location: [],
    photo: [],
  });

  const byCategory = await actor.listProblems({ category: [{ electricity: null }], status: [], search: [] });
  expect(byCategory).toHaveLength(1);
  expect(byCategory[0].category).toEqual({ electricity: null });

  const byStatus = await actor.listProblems({ category: [], status: [{ new: null }], search: [] });
  expect(byStatus).toHaveLength(2);

  const byKeyword = await actor.listProblems({ category: [], status: [], search: ["स्ट्रीट"] });
  expect(byKeyword).toHaveLength(1);
  expect(byKeyword[0].title).toBe("स्ट्रीट लाइट खराब है");
});

it("records an upvote once per caller", async () => {
  const first = await actor.upvoteProblem(0n);
  expect(first).toEqual([1n]);
  const second = await actor.upvoteProblem(0n);
  expect(second).toEqual([1n]);
});

it("rejects admin writes from a non-admin caller", async () => {
  // A freshly created actor calls as the anonymous principal until an identity
  // is set, and the anonymous caller is never an admin.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(guest.updateProblemStatus(0n, { resolved: null })).resolves.toEqual([]);
  await expect(guest.addOfficialResponse(0n, "not allowed")).resolves.toEqual([]);
  await expect(guest.deleteDevelopmentUpdate(0n)).resolves.toBe(false);
  await expect(
    guest.createDevelopmentUpdate({
      title: "x",
      description: "y",
      status: { planned: null },
      budget: 0n,
      photo: [],
    }),
  ).rejects.toThrow();
});

it("lets an admin change status and post an official response", async () => {
  // `beforeAll` registered this identity as the first signed-in caller, which
  // the authorization extension promotes to `#admin`.
  await expect(actor.isCallerAdmin()).resolves.toBe(true);

  const updated = await actor.updateProblemStatus(0n, { inProgress: null });
  expect(updated).not.toEqual([]);
  if (updated.length === 0) throw new Error("expected an updated problem");
  expect(updated[0].status).toEqual({ inProgress: null });

  const response = await actor.addOfficialResponse(0n, "कल सफाई कराई जाएगी।");
  expect(response).not.toEqual([]);
  if (response.length === 0) throw new Error("expected an official response");
  expect(response[0].message).toBe("कल सफाई कराई जाएगी।");

  const detail = await actor.getProblemDetail(0n);
  if (detail.length === 0) throw new Error("expected a problem detail");
  expect(detail[0].statusHistory).toHaveLength(2);
  expect(detail[0].responses).toHaveLength(1);
});

it("round-trips a development update through create, read, update, and delete", async () => {
  const created = await actor.createDevelopmentUpdate({
    title: "मुख्य सड़क का निर्माण",
    description: "गाँव की मुख्य सड़क को पक्का किया जा रहा है।",
    status: { ongoing: null },
    budget: 500000n,
    photo: [],
  });
  expect(created.id).toBe(0n);
  expect(created.status).toEqual({ ongoing: null });

  const listed = await actor.listDevelopmentUpdates();
  expect(listed).toHaveLength(1);

  const fetched = await actor.getDevelopmentUpdate(0n);
  expect(fetched).not.toEqual([]);
  if (fetched.length === 0) throw new Error("expected a development update");
  expect(fetched[0].title).toBe("मुख्य सड़क का निर्माण");

  const updated = await actor.updateDevelopmentUpdate(0n, {
    title: "मुख्य सड़क का निर्माण",
    description: "सड़क पूरी हो गई है।",
    status: { completed: null },
    budget: 500000n,
    photo: [],
  });
  expect(updated).not.toEqual([]);
  if (updated.length === 0) throw new Error("expected an updated development update");
  expect(updated[0].status).toEqual({ completed: null });

  await expect(actor.deleteDevelopmentUpdate(0n)).resolves.toBe(true);
  await expect(actor.listDevelopmentUpdates()).resolves.toEqual([]);
});

it("returns the default contact settings before any admin edit", async () => {
  await expect(actor.getContactSettings()).resolves.toEqual({
    email: "Virendupadhyay.2000@gmail.com",
    phone: "+91 94131 44022",
  });
});

it("round-trips contact settings through the real canister as an admin", async () => {
  const saved = await actor.updateContactSettings(
    "sarpanch@rampur.in",
    "+91 90000 12345",
  );
  expect(saved).toEqual({
    email: "sarpanch@rampur.in",
    phone: "+91 90000 12345",
  });

  await expect(actor.getContactSettings()).resolves.toEqual({
    email: "sarpanch@rampur.in",
    phone: "+91 90000 12345",
  });
});

it("rejects contact settings writes from a non-admin caller", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(
    guest.updateContactSettings("attacker@example.in", "+91 00000 00000"),
  ).rejects.toThrow();
});

it("rejects empty contact settings even from an admin", async () => {
  await expect(actor.updateContactSettings("", "+91 90000 12345")).rejects.toThrow();
  await expect(actor.updateContactSettings("sarpanch@rampur.in", "")).rejects.toThrow();
});

it("round-trips the village profile and dashboard", async () => {
  const saved = await actor.setVillageProfile({
    name: "रामपुर",
    population: 4200n,
    households: 780n,
    areaSqKm: 12.5,
    facilities: ["प्राथमिक विद्यालय", "स्वास्थ्य केंद्र"],
    updatedAt: 0n,
  });
  expect(saved.name).toBe("रामपुर");

  const profile = await actor.getVillageProfile();
  expect(profile).not.toEqual([]);
  if (profile.length === 0) throw new Error("expected a village profile");
  expect(profile[0]).toMatchObject({ name: "रामपुर", population: 4200n, households: 780n });

  const dashboard = await actor.getVillageDashboard();
  expect(dashboard.profile).not.toEqual([]);
  expect(dashboard.developmentCount).toBe(0n);
});

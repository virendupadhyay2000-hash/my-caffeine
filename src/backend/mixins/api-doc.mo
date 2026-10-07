mixin () {
  public query func getApiDoc() : async Text {
    "# ग्राम पंचायत Backend API

This canister powers a Hindi-first village governance portal. Villagers report
local problems, everyone views the public problem feed and village facts,
figures, and development data, and panchayat officials manage problems and
development updates through an admin-gated panel.

## Authentication and authorization

- **Anonymous callers** may read every `query` endpoint and may call
  `createProblem` and `upvoteProblem`. Anonymous reporting is allowed.
- **Signed-in callers** are identified by their Internet Identity principal.
  The app's frontend pins an Internet Identity derivation origin, published at
  `/.well-known/ii-derivation-origin` when available. An agent already holding
  the user's Internet Identity authorization derives the correct per-app
  principal against that origin (for example
  `icp identity link web <name> --app <host>`). Such a delegation acts with the
  user's full authority in this app until it expires.
- **Registration prerequisite.** Access control is initialized by the
  authorization extension. A direct API caller must call
  `_initialize_access_control` once as a signed-in (non-anonymous) caller
  before any role-guarded call. The first signed-in caller to initialize
  becomes `#admin`; every subsequent signed-in caller becomes `#user`.
  Registration happens only when a caller signs in through the app's own
  frontend, so a principal that never did so is unregistered even when it
  belongs to the app's owner, and a signed-in caller derived against a
  different origin is a different principal than the one the frontend
  registered.
- **Admin-gated endpoints** check whether the caller is a registered admin. An
  unregistered or anonymous caller is treated as a non-admin (the check does
  not trap), so:
  - `updateProblemStatus` and `addOfficialResponse` return `null`.
  - `updateDevelopmentUpdate` returns `null` and `deleteDevelopmentUpdate`
    returns `false`.
  - `setVillageProfile`, `createDevelopmentUpdate`, and `updateContactSettings`
    trap with `Unauthorized: Only admins can ...`.
  - `getCallerUserRole` (provided by the authorization extension) still traps
    with `User is not registered` for a signed-in caller that never registered;
    it returns `#guest` for an anonymous caller.

## Problem reporting

- `createProblem(input : ProblemInput) : Problem` — any caller (including
  anonymous) submits a report. `title` and `description` are required;
  `category` is one of `water`, `road`, `electricity`, `sanitation`, `health`,
  `education`, `other`. `reporterName`, `reporterContact`, `location`, and
  `photo` are optional. The new problem starts in status `new`, gets the next
  sequential id, and appears immediately in the public feed.
- `listProblems(filter : ProblemFilter) : [Problem]` — public feed, newest
  first. `filter.category` and `filter.status` narrow by category/status;
  `filter.search` is a case-insensitive keyword match against title and
  description. Pass `null` fields to disable a filter.
- `getProblem(id) : ?Problem` — a single problem, or `null` if absent.
- `getProblemDetail(id) : ?ProblemDetail` — full description, photo, location,
  status history, and official responses, or `null` if absent.
- `upvoteProblem(id) : ?Nat` — records the caller's upvote and returns the new
  upvote count, or `null` if the problem does not exist. Idempotent per caller:
  a second call from the same principal does not increment the count and
  returns the current count.
- `getProblemStats() : ProblemStats` — totals plus per-category counts.

## Village data and development

- `getVillageProfile() : ?VillageProfile` — name, population, households, area
  in square kilometres, key facilities, and last-updated timestamp.
- `setVillageProfile(input : VillageProfile) : VillageProfile` — admin only;
  overwrites the profile and stamps `updatedAt`.
- `listDevelopmentUpdates() : [DevelopmentUpdate]` — all development works,
  newest first.
- `getDevelopmentUpdate(id) : ?DevelopmentUpdate` — a single update, or `null`.
- `createDevelopmentUpdate(input) : DevelopmentUpdate` — admin only.
- `updateDevelopmentUpdate(id, input) : ?DevelopmentUpdate` — admin only;
  returns `null` when unauthorized or when the id is unknown.
- `deleteDevelopmentUpdate(id) : Bool` — admin only; returns `true` when a
  record was removed, `false` when unauthorized or absent.
- `getVillageDashboard() : VillageDashboard` — profile plus development counts
  (total, ongoing, completed).

## Public contact settings

- `getContactSettings() : ContactSettings` — the public contact email and phone
  shown to villagers. When no admin has saved values, it returns the defaults
  `Virendupadhyay.2000@gmail.com` and `+91 94131 44022`.
- `updateContactSettings(email, phone) : ContactSettings` — admin only;
  overwrites both values and returns the saved record. It traps with
  `Unauthorized: Only admins can update contact settings` for anonymous or
  non-admin callers, and with `Email and phone must not be empty` when either
  argument is an empty string.

## Data Intelligence (OQL)

The canister exposes its persisted data to the Caffeine Data Intelligence agent
through the Object Query Layer:

- `schema() : Text` — a JSON schema document listing the queryable entities and
  their fields. Entities the caller may not read are omitted, together with any
  edges pointing at them.
- `execute(qJson : Text) : Result` — runs a JSON query against the schema and
  returns typed rows. An invalid query traps with `OQL: invalid query — ...`.

Entities and their read authorization:

- `problem` — public; all reported problems.
- `statusHistory` — public; one row per problem status change, with a
  `problemId` edge to `problem`.
- `response` — public; one row per official response, with a `problemId` edge
  to `problem`.
- `upvote` — controller-only; one row per (problem, voter). Individual voter
  principals are not world-readable; only the aggregate upvote count on
  `problem` is public.
- `villageProfile` — public; the single village profile row.
- `developmentUpdate` — public; all development works.
- `contactSettings` — public; the single contact settings row (defaults when
  unsaved).

## Units and encodings

- Timestamps are `Int` nanoseconds since the Unix epoch (`Time.now()`).
- `budget` is a `Nat` in whole rupees.
- `areaSqKm` is a `Float` in square kilometres.
- `location` is `{ latitude : Float; longitude : Float }` in decimal degrees.
- `photo` is an object-storage `ExternalBlob` (a `Blob`); upload it through the
  platform file storage before submitting.
- Ids are sequential `Nat` values assigned by the canister.

## Lifecycle and polling

- Problem status transitions are `new -> inProgress -> resolved`; every change
  appends a `StatusChange` entry to the problem's history.
- Development status is one of `planned`, `ongoing`, `completed`.
- All read endpoints are `query` calls and can be polled freely; there is no
  server-side push. Poll `listProblems` / `getProblemDetail` to observe status
  changes and new official responses.

## Mutation retry safety

- `createProblem`, `createDevelopmentUpdate`, and `addOfficialResponse` are not
  idempotent: retrying creates a duplicate record. Retry only after a confirmed
  failure.
- `upvoteProblem` is idempotent per caller and safe to retry.
- `updateProblemStatus`, `updateDevelopmentUpdate`, `setVillageProfile`, and
  `updateContactSettings` are idempotent overwrites.
- `deleteDevelopmentUpdate` is idempotent: a repeat call returns `false`.

## Errors, traps, and limits

- Admin-gated writes either return `null`/`false` or trap with an
  `Unauthorized: ...` message, as listed above.
- `getCallerUserRole` traps with `User is not registered` for an unregistered
  signed-in caller.
- There is no pagination; `listProblems` and `listDevelopmentUpdates` return
  the full matching set.
";
  };
};

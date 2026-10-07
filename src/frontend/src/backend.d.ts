import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export interface Cell {
    value: Value;
    name: string;
}
export interface ContactSettings {
    email: string;
    phone: string;
}
export type DevelopmentId = bigint;
export interface DevelopmentInput {
    status: DevelopmentStatus;
    title: string;
    description: string;
    photo?: ExternalBlob;
    budget: bigint;
}
export interface DevelopmentUpdate {
    id: DevelopmentId;
    status: DevelopmentStatus;
    title: string;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    photo?: ExternalBlob;
    budget: bigint;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface GeoLocation {
    latitude: number;
    longitude: number;
}
export interface OfficialResponse {
    id: ResponseId;
    createdAt: Timestamp;
    problemId: ProblemId;
    message: string;
}
export interface Problem {
    id: ProblemId;
    upvotes: bigint;
    status: ProblemStatus;
    title: string;
    reporterName?: string;
    reporterContact?: string;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    category: ProblemCategory;
    photo?: ExternalBlob;
    location?: GeoLocation;
}
export interface ProblemDetail {
    responses: Array<OfficialResponse>;
    statusHistory: Array<StatusChange>;
    problem: Problem;
}
export interface ProblemFilter {
    status?: ProblemStatus;
    search?: string;
    category?: ProblemCategory;
}
export type ProblemId = bigint;
export interface ProblemInput {
    title: string;
    reporterName?: string;
    reporterContact?: string;
    description: string;
    category: ProblemCategory;
    photo?: ExternalBlob;
    location?: GeoLocation;
}
export interface ProblemStats {
    resolved: bigint;
    total: bigint;
    open: bigint;
    byCategory: Array<[ProblemCategory, bigint]>;
}
export type ResponseId = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface StatusChange {
    changedAt: Timestamp;
    toStatus: ProblemStatus;
    fromStatus: ProblemStatus;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export interface VillageDashboard {
    developmentCount: bigint;
    ongoingCount: bigint;
    completedCount: bigint;
    profile?: VillageProfile;
}
export interface VillageProfile {
    name: string;
    updatedAt: Timestamp;
    areaSqKm: number;
    facilities: Array<string>;
    population: bigint;
    households: bigint;
}
export enum DevelopmentStatus {
    completed = "completed",
    planned = "planned",
    ongoing = "ongoing"
}
export enum ProblemCategory {
    other = "other",
    road = "road",
    education = "education",
    electricity = "electricity",
    sanitation = "sanitation",
    water = "water",
    health = "health"
}
export enum ProblemStatus {
    new = "new",
    resolved = "resolved",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOfficialResponse(id: ProblemId, message: string): Promise<OfficialResponse | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createDevelopmentUpdate(input: DevelopmentInput): Promise<DevelopmentUpdate>;
    createProblem(input: ProblemInput): Promise<Problem>;
    deleteDevelopmentUpdate(id: DevelopmentId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getContactSettings(): Promise<ContactSettings>;
    getDevelopmentUpdate(id: DevelopmentId): Promise<DevelopmentUpdate | null>;
    getProblem(id: ProblemId): Promise<Problem | null>;
    getProblemDetail(id: ProblemId): Promise<ProblemDetail | null>;
    getProblemStats(): Promise<ProblemStats>;
    getVillageDashboard(): Promise<VillageDashboard>;
    getVillageProfile(): Promise<VillageProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listDevelopmentUpdates(): Promise<Array<DevelopmentUpdate>>;
    listProblems(filter: ProblemFilter): Promise<Array<Problem>>;
    schema(): Promise<string>;
    setVillageProfile(input: VillageProfile): Promise<VillageProfile>;
    updateContactSettings(email: string, phone: string): Promise<ContactSettings>;
    updateDevelopmentUpdate(id: DevelopmentId, input: DevelopmentInput): Promise<DevelopmentUpdate | null>;
    updateProblemStatus(id: ProblemId, status: ProblemStatus): Promise<Problem | null>;
    upvoteProblem(id: ProblemId): Promise<bigint | null>;
}

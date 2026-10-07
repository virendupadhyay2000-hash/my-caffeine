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
import { useBackend } from "@/hooks/use-backend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Shared React Query hooks for the ग्राम पंचायत portal.
 *
 * Every backend read/write goes through this module so query keys stay
 * consistent and mutations invalidate the right caches. The actor is resolved
 * once per hook via `useBackend()` at the top level.
 */

export const queryKeys = {
  problemStats: ["problemStats"] as const,
  problems: (filter: ProblemFilter) => ["problems", filter] as const,
  problemDetail: (id: bigint) => ["problemDetail", id.toString()] as const,
  developmentUpdates: ["developmentUpdates"] as const,
  developmentUpdate: (id: bigint) =>
    ["developmentUpdate", id.toString()] as const,
  villageProfile: ["villageProfile"] as const,
  villageDashboard: ["villageDashboard"] as const,
  contactSettings: ["contactSettings"] as const,
};

/* ----------------------------- Reads ----------------------------- */

export function useProblemStats() {
  const { actor, isReady } = useBackend();
  return useQuery<ProblemStats>({
    queryKey: queryKeys.problemStats,
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getProblemStats();
    },
    enabled: isReady,
  });
}

export function useProblems(filter: ProblemFilter = {}) {
  const { actor, isReady } = useBackend();
  return useQuery<Problem[]>({
    queryKey: queryKeys.problems(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProblems(filter);
    },
    enabled: isReady,
  });
}

export function useProblemDetail(id: bigint) {
  const { actor, isReady } = useBackend();
  return useQuery<ProblemDetail | null>({
    queryKey: queryKeys.problemDetail(id),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProblemDetail(id);
    },
    enabled: isReady,
  });
}

export function useDevelopmentUpdates() {
  const { actor, isReady } = useBackend();
  return useQuery<DevelopmentUpdate[]>({
    queryKey: queryKeys.developmentUpdates,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDevelopmentUpdates();
    },
    enabled: isReady,
  });
}

export function useDevelopmentUpdate(id: bigint) {
  const { actor, isReady } = useBackend();
  return useQuery<DevelopmentUpdate | null>({
    queryKey: queryKeys.developmentUpdate(id),
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDevelopmentUpdate(id);
    },
    enabled: isReady,
  });
}

export function useVillageProfile() {
  const { actor, isReady } = useBackend();
  return useQuery<VillageProfile | null>({
    queryKey: queryKeys.villageProfile,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getVillageProfile();
    },
    enabled: isReady,
  });
}

export function useVillageDashboard() {
  const { actor, isReady } = useBackend();
  return useQuery<VillageDashboard>({
    queryKey: queryKeys.villageDashboard,
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getVillageDashboard();
    },
    enabled: isReady,
  });
}

export function useContactSettings() {
  const { actor, isReady } = useBackend();
  return useQuery<ContactSettings>({
    queryKey: queryKeys.contactSettings,
    queryFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.getContactSettings();
    },
    enabled: isReady,
  });
}

/* ---------------------------- Mutations ---------------------------- */

export function useUpdateProblemStatus() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: bigint;
      status: Problem["status"];
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateProblemStatus(id, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
      void queryClient.invalidateQueries({ queryKey: ["problemDetail"] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.problemStats });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.villageDashboard,
      });
    },
  });
}

export function useAddOfficialResponse() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      message,
    }: {
      id: bigint;
      message: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addOfficialResponse(id, message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["problemDetail"] });
      void queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
}

export function useCreateDevelopmentUpdate() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DevelopmentInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createDevelopmentUpdate(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.developmentUpdates,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.villageDashboard,
      });
    },
  });
}

export function useUpdateDevelopmentUpdate() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: bigint;
      input: DevelopmentInput;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateDevelopmentUpdate(id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.developmentUpdates,
      });
      void queryClient.invalidateQueries({ queryKey: ["developmentUpdate"] });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.villageDashboard,
      });
    },
  });
}

export function useDeleteDevelopmentUpdate() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteDevelopmentUpdate(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.developmentUpdates,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.villageDashboard,
      });
    },
  });
}

export function useUpdateContactSettings() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      email,
      phone,
    }: {
      email: string;
      phone: string;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateContactSettings(email, phone);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.contactSettings,
      });
    },
  });
}

export function useSetVillageProfile() {
  const { actor } = useBackend();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: VillageProfile) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setVillageProfile(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.villageProfile,
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.villageDashboard,
      });
    },
  });
}

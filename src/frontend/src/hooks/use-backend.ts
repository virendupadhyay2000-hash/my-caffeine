import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";

/**
 * Shared access to the backend actor. Every query and mutation hook calls this
 * at the top level so the actor instance is created once per component tree.
 */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching, isReady: !!actor && !isFetching };
}

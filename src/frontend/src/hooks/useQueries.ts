import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SearchEngine, SecurityLevel } from "../backend.d";
import { useActor } from "./useActor";

// ─── Search Engines ───────────────────────────────────────────────────────────

export function useGetAllSearchEngines() {
  const { actor, isFetching } = useActor();
  return useQuery<SearchEngine[]>({
    queryKey: ["searchEngines"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSearchEngines();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSearchEngine() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      url,
      description,
    }: {
      name: string;
      url: string;
      description: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSearchEngine(name, url, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchEngines"] });
    },
  });
}

export function useRemoveSearchEngine() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.removeSearchEngine(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchEngines"] });
    },
  });
}

// ─── Security Level ───────────────────────────────────────────────────────────

export function useGetSecurityLevel() {
  const { actor, isFetching } = useActor();
  return useQuery<SecurityLevel>({
    queryKey: ["securityLevel"],
    queryFn: async () => {
      if (!actor) return SecurityLevel.standard;
      return actor.getSecurityLevel();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetSecurityLevel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (level: SecurityLevel) => {
      if (!actor) throw new Error("No actor");
      return actor.setSecurityLevel(level);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["securityLevel"] });
    },
  });
}

// ─── Identity Checklist ───────────────────────────────────────────────────────

export function useGetAllIdentityItems() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, boolean]>>({
    queryKey: ["identityItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllIdentityItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetIdentityItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, state }: { key: string; state: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.setIdentityItem(key, state);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identityItems"] });
    },
  });
}

export function useResetIdentityChecklist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.resetIdentityChecklist();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identityItems"] });
    },
  });
}

// ─── Audit Checklist ──────────────────────────────────────────────────────────

export function useGetAllAuditItems() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, boolean]>>({
    queryKey: ["auditItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAuditItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAuditItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, state }: { key: string; state: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.setAuditItem(key, state);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditItems"] });
    },
  });
}

export function useResetAuditChecklist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.resetAuditChecklist();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auditItems"] });
    },
  });
}

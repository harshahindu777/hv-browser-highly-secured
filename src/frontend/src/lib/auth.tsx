/**
 * Auth wrapper — bridges useInternetIdentity into a simpler { isAuthenticated, login, logout, principal }
 * API that matches what components expect.
 */

import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { type ReactNode, createContext, useContext } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: () => void;
  logout: () => void;
  principal: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { identity, login, clear, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const principal = isAuthenticated
    ? identity!.getPrincipal().toString()
    : null;

  const value: AuthContextValue = {
    isAuthenticated,
    isInitializing,
    login,
    logout: clear,
    principal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}

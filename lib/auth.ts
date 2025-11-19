// lib/auth.ts
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import logger from "./logger";

/** Minimal types for session.user we expect */
export type AppUser = {
  id?: string;
  email?: string;
  role?: "admin" | "scorer" | "user" | string;
};

export function extractRoleFromSession(session?: Session | null | undefined | { user?: AppUser }) {
  // NextAuth typically stores role in session.user.role if you've set it in callbacks
  try {
    const user = (session as any)?.user as AppUser | undefined;
    return user?.role ?? null;
  } catch (err) {
    logger.warn({ err }, "failed extracting role from session");
    return null;
  }
}

/** Simple role check. Use in route handlers before sensitive operations. */
export function hasRole(session: Session | null | undefined, allowed: string[] = []) {
  const role = extractRoleFromSession(session);
  if (!role) return false;
  return allowed.includes(role);
}

/** Validator used in route handlers for "scorer" actions */
export function validateScorer(session: Session | null | undefined) {
  return hasRole(session, ["scorer", "admin"]);
}

/** Helper to read role from a JWT (for non-NextAuth custom tokens) */
export function roleFromJwtToken(token?: JWT | null) {
  return (token as any)?.role ?? null;
}

/** Small guard helper to throw a consistent error (for route handlers) */
export function ensureHasRole(session: Session | null | undefined, allowed: string[]) {
  if (!hasRole(session, allowed)) {
    const err = new Error("Forbidden: insufficient role");
    // attach a hint for handlers to return 403
    (err as any).status = 403;
    throw err;
  }
}

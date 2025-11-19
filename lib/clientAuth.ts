// lib/clientAuth.ts
export function hasAdminRole(session: any) {
  return session?.user?.role === "admin";
}
export function hasScorerRole(session: any) {
  const role = session?.user?.role;
  return role === "scorer" || role === "admin";
}
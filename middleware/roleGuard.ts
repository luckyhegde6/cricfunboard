// middleware/roleGuard.ts
import { getToken } from "next-auth/jwt";

export function requireRole(roles: string[]) {
  return async (req: Request) => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !roles.includes(token.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    }
    return null; // allowed
  };
}

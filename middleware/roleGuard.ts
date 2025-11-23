// middleware/roleGuard.ts

import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export function requireRole(roles: string[]) {
  return async (req: NextRequest) => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !roles.includes((token as any).role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }
    return null; // allowed
  };
}

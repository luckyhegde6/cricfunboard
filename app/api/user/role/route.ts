// app/api/user/role/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  await dbConnect();

  // Auth check - only admin can change roles
  const session = await getServerSession(authOptions);
  try {
    ensureHasRole(session, ["admin"]);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.status || 403 },
    );
  }

  const body = await req.json();
  const { userId, role } = body;

  // Validate role
  const validRoles = ["user", "captain", "vicecaptain", "scorer", "admin"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  // Update user role
  const user = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true },
  ).select("_id name email role");

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    user,
  });
}

// app/api/user/password/route.ts

import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import UserModel from "@/models/User";

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  const parsed = passwordSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const { currentPassword, newPassword } = parsed.data;
  const userId = (session as any).user.id;

  const user = await UserModel.findById(userId);
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Verify current password
  // Note: If user was created via seed without password hash or different method, this might fail if not handled.
  // Assuming standard bcrypt hash.
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match)
    return NextResponse.json(
      { error: "Incorrect current password" },
      { status: 400 },
    );

  const newHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = newHash;
  await user.save();

  return NextResponse.json({ ok: true });
}

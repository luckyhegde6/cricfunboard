// app/api/admin/users/route.ts

import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import UserModel from "@/models/User";

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z
    .enum(["user", "scorer", "captain", "vice-captain", "admin"])
    .optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

const updateSchema = z.object({
  id: z.string(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z
    .enum(["user", "scorer", "captain", "vice-captain", "admin"])
    .optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
});

export async function GET(_req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if ((session as any).user?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await UserModel.find({}, { passwordHash: 0 }).lean();
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if ((session as any).user?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const { email, password, role, name, phone, bio } = parsed.data;
  const existing = await UserModel.findOne({ email });
  if (existing)
    return NextResponse.json({ error: "User exists" }, { status: 409 });

  const hash = await bcrypt.hash(password, 10);
  const created = await UserModel.create({
    email,
    passwordHash: hash,
    role: role || "user",
    name,
    phone,
    bio,
  });
  return NextResponse.json({
    id: created._id,
    email: created.email,
    role: created.role,
    name: created.name,
    phone: created.phone,
    bio: created.bio,
  });
}

export async function PUT(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if ((session as any).user?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );

  const { id, email, password, role, name, phone, bio } = parsed.data;
  const update: any = {};
  if (email) update.email = email;
  if (role) update.role = role;
  if (name) update.name = name;
  if (phone) update.phone = phone;
  if (bio) update.bio = bio;
  if (password) update.passwordHash = await bcrypt.hash(password, 10);

  const updated = await UserModel.findByIdAndUpdate(id, update, {
    new: true,
  }).lean();
  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  delete (updated as any).passwordHash;
  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if ((session as any).user?.role !== "admin")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await UserModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}

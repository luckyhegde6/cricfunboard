// app/api/matches/[id]/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MatchModel from "@/models/Match";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ensureHasRole } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const id = params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const match = await MatchModel.findById(id).lean();
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(match);
}

const patchSchema = z.object({
  status: z.enum(["scheduled", "live", "completed", "abandoned"]).optional(),
  summary: z.object({
    runs: z.number().int().nonnegative(),
    wickets: z.number().int().nonnegative(),
    overs: z.number().nonnegative()
  }).optional()
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  // auth check
  const session = await getServerSession(authOptions);
  try {
    ensureHasRole(session, ["admin"]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status || 403 });
  }

  const id = params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await MatchModel.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

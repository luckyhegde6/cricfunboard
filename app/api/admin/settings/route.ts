// app/api/admin/settings/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import Config from "@/models/Config";

export async function GET() {
  await dbConnect();
  const ann = await Config.findOne({ key: "announcement" });
  const maint = await Config.findOne({ key: "maintenance" });
  return NextResponse.json({
    announcement: ann?.value || "",
    maintenance: maint?.value || false,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { announcement, maintenance } = await req.json();

  await Config.updateOne(
    { key: "announcement" },
    { $set: { value: announcement } },
    { upsert: true },
  );
  await Config.updateOne(
    { key: "maintenance" },
    { $set: { value: maintenance } },
    { upsert: true },
  );

  return NextResponse.json({ success: true });
}

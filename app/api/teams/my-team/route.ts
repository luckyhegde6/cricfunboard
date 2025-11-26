// app/api/teams/my-team/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import TeamModel from "@/models/Team";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userEmail = (session.user as any).email;

    // First, find the user to get their ObjectId
    const UserModel = (await import("@/models/User")).default;
    const user = await UserModel.findOne({ email: userEmail });

    if (!user) {
      return NextResponse.json({ team: null }, { status: 200 });
    }

    // Find team where user's ObjectId is captain or vice-captain
    const team = await TeamModel.findOne({
      $or: [
        { captainId: user._id },
        { viceCaptainId: user._id },
      ],
    })
      .populate("captainId", "name email")
      .populate("viceCaptainId", "name email")
      .lean();

    if (!team) {
      return NextResponse.json({ team: null }, { status: 200 });
    }

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error("Error fetching my team:", error);
    return NextResponse.json(
      { error: "Failed to fetch team" },
      { status: 500 }
    );
  }
}

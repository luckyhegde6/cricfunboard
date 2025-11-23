// app/team/submit/page.tsx

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import TeamForm from "@/components/TeamForm";

export default async function SubmitTeamPage() {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  if (!session || !["captain", "vicecaptain", "admin"].includes(userRole)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            Submit Your Team
          </h1>
          <p className="mt-2 text-slate-600">
            Manage your squad, assign roles, and update contact info.
          </p>
        </div>
        <TeamForm />
      </div>
    </div>
  );
}

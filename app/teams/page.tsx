// app/teams/page.tsx
import TeamCard from "@/components/TeamCard";

async function fetchTeams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/teams`, { cache: "no-store" });
    if (!res.ok) return [];
    const teams = await res.json();
    return teams.map((team: any) => ({
      id: team._id,
      name: team.name,
      players: team.players?.length || 0
    }));
  } catch (err) {
    console.error("Failed to fetch teams:", err);
    return [];
  }
}

export default async function TeamsPage() {
  const teams = await fetchTeams();
  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-4">Teams</h1>
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map(t => <TeamCard key={t.id} team={t} />)}
        </div>
      ) : (
        <div className="text-slate-500">No teams found. Please seed the database.</div>
      )}
    </div>
  );
}

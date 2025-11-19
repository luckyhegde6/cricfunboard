// app/teams/page.tsx
import TeamCard from "@/components/TeamCard";

async function fetchTeams() {
  // placeholder: replace with API call /db fetch
  return [
    { id: "1", name: "Team A", players: 11 },
    { id: "2", name: "Team B", players: 12 },
  ];
}

export default async function TeamsPage() {
  const teams = await fetchTeams();
  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-4">Teams</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teams.map(t => <TeamCard key={t.id} team={t} />)}
      </div>
    </div>
  );
}

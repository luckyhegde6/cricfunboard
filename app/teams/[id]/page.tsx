"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeamFixtures from "@/components/TeamFixtures";

type Player = {
  playerId: string;
  name: string;
  role: "batsman" | "bowler" | "allrounder" | "keeper";
  isCaptain: boolean;
  isViceCaptain: boolean;
  isExtra: boolean;
};

type Team = {
  _id: string;
  name: string;
  players: Player[];
  contactEmail?: string;
  contactPhone?: string;
  captainId?: { _id: string; email: string; name: string };
  viceCaptainId?: { _id: string; email: string; name: string };
};

export default function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [teamId, setTeamId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => setTeamId(id));
  }, [params]);

  useEffect(() => {
    if (!teamId) return;

    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/teams/${teamId}`);
        if (!res.ok) {
          setTeam(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setTeam(data);

        // Check access: admin, captain, or vice-captain
        if (status === "authenticated" && session?.user) {
          const userRole = (session.user as any).role;
          const userId = (session.user as any).id;

          const isAdmin = userRole === "admin";
          const isCaptain = data.captainId?._id === userId;
          const isViceCaptain = data.viceCaptainId?._id === userId;

          setHasAccess(isAdmin || isCaptain || isViceCaptain);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch team:", err);
        setTeam(null);
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, status, session]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!team) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Team Not Found</h1>
        <p className="mt-2 text-slate-600">
          The team you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "batsman":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "bowler":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "allrounder":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "keeper":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300";
    }
  };

  const playing11 = team.players.filter((p) => !p.isExtra);
  const extraPlayers = team.players.filter((p) => p.isExtra);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {team.name}
        </h1>

        {/* Captain and Vice-Captain Info - Only visible to admin/captain/vice-captain */}
        {hasAccess && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Team Leadership
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400">Captain</p>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {team.captainId?.name || team.captainId?.email || "Not assigned"}
                </p>
                {team.captainId?.email && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {team.captainId.email}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-blue-700 dark:text-blue-400">Vice Captain</p>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {team.viceCaptainId?.name || team.viceCaptainId?.email || "Not assigned"}
                </p>
                {team.viceCaptainId?.email && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {team.viceCaptainId.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {team.contactEmail && (
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Contact: {team.contactEmail}
          </p>
        )}
      </div>

      {/* Fixtures Section */}
      <TeamFixtures teamId={team._id} teamName={team.name} />

      {/* Playing 11 Section */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Playing 11
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {playing11.length} active players
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {playing11.map((player: Player) => (
              <div
                key={player.playerId}
                className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/30 dark:to-slate-800/30 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:shadow-lg hover:scale-[1.02] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {player.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      ID: {player.playerId}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(player.role)}`}
                  >
                    {player.role}
                  </span>

                  {player.isCaptain && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      ⭐ C
                    </span>
                  )}

                  {player.isViceCaptain && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      ⚡ VC
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extra Players Section */}
      {extraPlayers.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden opacity-60">
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Extra Players
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {extraPlayers.length} reserve{" "}
              {extraPlayers.length === 1 ? "player" : "players"}
            </p>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {extraPlayers.map((player: Player) => (
                <div
                  key={player.playerId}
                  className="bg-slate-100 dark:bg-slate-700/20 rounded-lg p-4 border border-slate-200 dark:border-slate-600 grayscale"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-700 dark:text-slate-400">
                        {player.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        ID: {player.playerId}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400 rounded">
                      Extra
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize opacity-70 ${getRoleBadgeColor(player.role)}`}
                    >
                      {player.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

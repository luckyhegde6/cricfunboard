"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import MatchDetails from "@/components/MatchDetails";
import TeamPlayers from "@/components/TeamPlayers";
import ScorerAssignment from "@/components/admin/ScorerAssignment";
import MatchStatus from "@/components/scorer/MatchStatus";
import Scorecard from "@/components/match/Scorecard";
import { getSocket } from "@/lib/socket-client";

type Player = {
  playerId: string;
  name: string;
  role: "batsman" | "bowler" | "allrounder" | "keeper";
  isCaptain: boolean;
  isViceCaptain: boolean;
  isExtra: boolean;
};

type Match = {
  _id: string;
  teamA: string;
  teamB: string;
  venue?: string;
  startTime?: Date | string;
  status: "scheduled" | "live" | "completed" | "abandoned";
  scorerId?: string;
  summary?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  teamAPlayers: Player[];
  teamBPlayers: Player[];
  matchState: string;
  currentInnings: number;
  battingTeam?: string;
  bowlingTeam?: string;
  toss?: {
    winner: string;
    decision: string;
  };
  innings1Summary?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  innings2Summary?: {
    runs: number;
    wickets: number;
    overs: number;
  };
  recentEvents?: any[];
  currentBatters?: any;
  currentBowler?: any;
};

export default function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const { data: session } = useSession();
  const router = useRouter();

  const fetchMatch = () => {
    fetch(`/api/matches/${id}?t=${Date.now()}`)
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`API Error ${r.status}: ${text.substring(0, 100)}`);
        }
        return r.json();
      })
      .then(data => {
        setMatch(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch match:", err);
        setLoading(false);
      });
  };

  // Socket Connection
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.emit("join", `match:${id}`);
    console.log(`[MatchPage] Joined socket room: match:${id}`);

    const handleUpdate = (payload: any) => {
      console.log("[MatchPage] Received match update via socket");
      fetchMatch();
    };

    socket.on("match:update", handleUpdate);

    return () => {
      socket.off("match:update", handleUpdate);
      socket.emit("leave", `match:${id}`);
    };
  }, [id]);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading match details...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-800 dark:text-red-300">Match Not Found</h2>
          <p className="mt-2 text-red-600 dark:text-red-400">The match you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isCompleted = match.status === "completed" || match.status === "abandoned";
  const isAssignedScorer = match.scorerId?.toString() === session?.user?.id;
  const canScore = session?.user?.role === "admin" || isAssignedScorer;
  const canAccessScorer = canScore && !isCompleted;

  const allPlayers = [...match.teamAPlayers, ...match.teamBPlayers];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center h-16 justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {match.teamA} vs {match.teamB}
              </h1>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {match.venue || "Unknown Location"}
              </div>
            </div>
            {canAccessScorer && (
              <button
                onClick={() => router.push(`/match/${id}/score`)}
                className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-medium transition-colors"
              >
                Scorer Panel
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 mt-2">
            <button
              onClick={() => setActiveTab("info")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "info" ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Info
            </button>
            <button
              onClick={() => setActiveTab("scorecard")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "scorecard" ? 'border-blue-600 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
            >
              Scorecard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {activeTab === "info" && (
          <>
            <MatchStatus
              matchState={match.matchState}
              currentInnings={match.currentInnings}
              battingTeam={match.battingTeam}
              bowlingTeam={match.bowlingTeam}
              toss={match.toss}
              innings1Summary={match.innings1Summary}
              innings2Summary={match.innings2Summary}
              recentEvents={(match as any).recentEvents}
              currentBatters={(match as any).currentBatters}
              currentBowler={(match as any).currentBowler}
              allPlayers={allPlayers}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TeamPlayers
                teamName={match.teamA}
                players={match.teamAPlayers}
                isCompleted={isCompleted}
              />
              <TeamPlayers
                teamName={match.teamB}
                players={match.teamBPlayers}
                isCompleted={isCompleted}
              />
            </div>
          </>
        )}

        {activeTab === "scorecard" && (
          <Scorecard match={match} players={allPlayers} />
        )}
      </div>
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";

export default function MatchCard({ match: initialMatch }: { match: any }) {
  const [match, setMatch] = useState(initialMatch);

  useEffect(() => {
    setMatch(initialMatch);
  }, [initialMatch]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Join specific match room
    socket.emit("join", `match:${match._id}`);

    const handleUpdate = (payload: any) => {
      if (payload._id === match._id) {
        setMatch(payload);
      }
    };

    socket.on("match:update", handleUpdate);

    return () => {
      socket.off("match:update", handleUpdate);
      socket.emit("leave", `match:${match._id}`);
    };
  }, [match._id]);

  const {
    teamA,
    teamB,
    venue,
    startTime,
    status,
    currentInnings,
    battingTeam,
    innings1Summary,
    innings2Summary,
    currentBatters,
    currentBowler,
    teamAPlayers,
    teamBPlayers,
    recentEvents,
  } = match;

  // Get current innings summary
  const currentSummary =
    currentInnings === 1 ? innings1Summary : innings2Summary;
  const score = currentSummary
    ? `${currentSummary.runs}/${currentSummary.wickets}`
    : "-/-";
  const overs = currentSummary?.overs || 0;

  // Format date safely to avoid hydration errors
  const formattedDate = startTime
    ? new Date(startTime).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Date TBD";

  // Get player names
  const allPlayers = [...(teamAPlayers || []), ...(teamBPlayers || [])];
  const getPlayerName = (id: string) => {
    const player = allPlayers.find((p: any) => p.playerId === id);
    return player?.name || id;
  };

  const strikerName = currentBatters?.striker
    ? getPlayerName(currentBatters.striker)
    : null;
  const nonStrikerName = currentBatters?.nonStriker
    ? getPlayerName(currentBatters.nonStriker)
    : null;
  const bowlerName = currentBowler ? getPlayerName(currentBowler) : null;

  // Get recent over (last 6 balls)
  const lastOver = (recentEvents || [])
    .filter((e: any) => e.type !== "announcement")
    .slice(-6)
    .map((e: any) => {
      if (e.type === "wicket") return "W";
      if (e.type === "wd" || e.type === "nb")
        return `${e.runs}${e.type.toUpperCase()}`;
      return e.runs?.toString() || "0";
    });

  return (
    <Link
      href={`/match/${match._id}`}
      className="block bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-lg transition p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {venue ?? "Unknown venue"}
          </div>
          <div className="mt-1 font-semibold text-lg dark:text-white">
            {teamA} <span className="text-slate-400">vs</span> {teamB}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {formattedDate}
          </div>

          {/* Live match details */}
          {status === "live" && (
            <div className="mt-3 space-y-1">
              {battingTeam && (
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-medium">{battingTeam}</span> batting
                </div>
              )}
              {strikerName && bowlerName && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {strikerName}* {nonStrikerName && `& ${nonStrikerName}`} •{" "}
                  {bowlerName}
                </div>
              )}
              {lastOver.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
                    This over:
                  </span>
                  {lastOver.map((ball: string, idx: number) => (
                    <span
                      key={idx}
                      className={`text-xs font-mono w-6 h-6 flex items-center justify-center rounded ${
                        ball === "W"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-bold"
                          : ball === "0"
                            ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            : ball.includes("WD") || ball.includes("NB")
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      }`}
                    >
                      {ball}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end">
          <div
            className={`rounded-md px-3 py-2 text-center font-medium transition-colors duration-300 ${status === "live" ? "bg-rose-600 text-white" : "bg-slate-800 dark:bg-slate-700 text-white"}`}
          >
            <div className="text-lg">{score}</div>
            <div className="text-xs opacity-80">{overs} ov</div>
          </div>
          <div
            className={`mt-2 text-xs font-medium flex items-center gap-1 ${status === "live" ? "text-rose-600" : "text-slate-500 dark:text-slate-400"}`}
          >
            {status === "live" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
            {status?.toUpperCase() ?? "SCHEDULED"}
          </div>
        </div>
      </div>
    </Link>
  );
}

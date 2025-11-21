"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
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

  const { teamA, teamB, summary, venue, startTime, status } = match;
  const score = summary ? `${summary.runs}/${summary.wickets}` : "-/-";

  // Format date safely to avoid hydration errors
  const formattedDate = startTime
    ? new Date(startTime).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
    : "Date TBD";

  return (
    <Link href={`/match/${match._id}`} className="block bg-white rounded-lg border hover:shadow-lg transition p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{venue ?? "Unknown venue"}</div>
          <div className="mt-1 font-semibold text-lg">{teamA} <span className="text-slate-400">vs</span> {teamB}</div>
          <div className="text-sm text-slate-500 mt-1">{formattedDate}</div>
        </div>

        <div className="flex flex-col items-end">
          <div className={`rounded-md px-3 py-2 text-center font-medium transition-colors duration-300 ${status === 'live' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'}`}>
            <div className="text-lg">{score}</div>
            <div className="text-xs opacity-80">{(summary?.overs ?? 0)} overs</div>
          </div>
          <div className={`mt-2 text-xs font-medium flex items-center gap-1 ${status === "live" ? "text-rose-600" : "text-slate-500"}`}>
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

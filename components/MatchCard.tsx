// components/MatchCard.tsx
import Link from "next/link";
import React from "react";

export default function MatchCard({ match }: { match: any }) {
  const { teamA, teamB, summary, venue, startTime, status } = match;
  const score = summary ? `${summary.runs}/${summary.wickets}` : "-/-";
  return (
    <Link href={`/match/${match._id}`} className="block bg-white rounded-lg border hover:shadow-lg transition p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-slate-500">{venue ?? "Unknown venue"}</div>
          <div className="mt-1 font-semibold text-lg">{teamA} <span className="text-slate-400">vs</span> {teamB}</div>
          <div className="text-sm text-slate-500 mt-1">{new Date(startTime || Date.now()).toLocaleString()}</div>
        </div>

        <div className="flex flex-col items-end">
          <div className="bg-slate-800 text-white rounded-md px-3 py-2 text-center font-medium">
            <div className="text-lg">{score}</div>
            <div className="text-xs text-slate-200">{(summary?.overs ?? 0)} overs</div>
          </div>
          <div className={`mt-2 text-xs font-medium ${status === "live" ? "text-rose-600" : "text-slate-500"}`}>
            {status?.toUpperCase() ?? "SCHEDULED"}
          </div>
        </div>
      </div>
    </Link>
  );
}

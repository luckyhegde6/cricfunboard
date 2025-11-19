// components/MatchTopStats.tsx
"use client";
import React from "react";

export default function MatchTopStats({ match }: { match: any }) {
    if (!match) return null;
    const { teamA, teamB, summary } = match;
    return (
        <div className="bg-white rounded-md border p-4 flex items-center justify-between">
            <div>
                <div className="text-sm text-slate-500">Live match</div>
                <div className="text-lg font-semibold">{teamA} vs {teamB}</div>
                <div className="text-sm text-slate-500">{match.venue}</div>
            </div>

            <div className="text-center">
                <div className="text-3xl font-bold">{summary?.runs ?? 0}/{summary?.wickets ?? 0}</div>
                <div className="text-sm text-slate-500">{summary?.overs ?? 0} overs</div>
            </div>

            <div className="text-right">
                <div className="text-sm text-slate-500">Overs left</div>
                <div className="text-lg font-medium">{Math.max(0, (match.maxOvers ?? 50) - (summary?.overs ?? 0))}</div>
            </div>
        </div>
    );
}

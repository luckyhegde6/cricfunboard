// components/LiveScoreBanner.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type MatchSummary = {
    _id: string;
    teamA: string;
    teamB: string;
    summary: {
        runs: number;
        wickets: number;
        overs: number;
    };
};

export default function LiveScoreBanner() {
    const [match, setMatch] = useState<MatchSummary | null>(null);

    useEffect(() => {
        const fetchLive = async () => {
            try {
                const res = await fetch("/api/matches/live");
                if (res.ok) {
                    const data = await res.json();
                    setMatch(data.match);
                }
            } catch (e) {
                console.error("Failed to fetch live score");
            }
        };

        fetchLive();
        const interval = setInterval(fetchLive, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    if (!match) return null;

    return (
        <div className="bg-indigo-600 text-white text-sm py-2 px-4 text-center">
            <Link href={`/matches/${match._id}`} className="hover:underline font-medium">
                🔴 LIVE: {match.teamA} vs {match.teamB} — {match.summary.runs}/{match.summary.wickets} ({match.summary.overs} ov)
            </Link>
        </div>
    );
}

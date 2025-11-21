"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket-client";

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
        // Initial fetch
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

        // Socket Connection
        const socket = getSocket();
        if (!socket) return;

        socket.emit("join", "dashboard");
        console.log("[Banner] Joined dashboard room");

        const handleUpdate = (payload: any) => {
            console.log("[Banner] Received update:", payload);
            // If the update is for the currently displayed match, update it
            // OR if we don't have a match and this one is live, show it
            // OR if this is a new live match replacing the old one?
            // For now, let's just update if it matches our ID or if we have nothing.
            // Ideally, we should re-fetch "live" to get the *best* live match if there are multiple.
            // But for simple single-match scenarios:

            if (payload.status === "live") {
                setMatch(payload);
            } else if (payload._id === match?._id && payload.status !== "live") {
                // Match ended?
                setMatch(null);
                fetchLive(); // Try to find another live match
            }
        };

        socket.on("match:update", handleUpdate);

        return () => {
            socket.off("match:update", handleUpdate);
            socket.emit("leave", "dashboard");
        };
    }, [match?._id]);

    if (!match) return null;

    return (
        <div className="bg-indigo-600 text-white text-sm py-2 px-4 text-center transition-all duration-500">
            <Link href={`/match/${match._id}`} className="hover:underline font-medium flex items-center justify-center gap-2">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                LIVE: {match.teamA} vs {match.teamB} — {match.summary?.runs || 0}/{match.summary?.wickets || 0} ({match.summary?.overs || 0} ov)
            </Link>
        </div>
    );
}

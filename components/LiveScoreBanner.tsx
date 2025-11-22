"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSocket } from "@/lib/socket-client";

type MatchSummary = {
    _id: string;
    teamA: string;
    teamB: string;
    currentInnings: number;
    battingTeam: string;
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
    currentBatters?: {
        striker: string;
        nonStriker: string;
    };
    currentBowler?: string;
    teamAPlayers?: any[];
    teamBPlayers?: any[];
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

    // Get current innings summary
    const currentSummary = match.currentInnings === 1 ? match.innings1Summary : match.innings2Summary;
    const score = `${currentSummary?.runs || 0}/${currentSummary?.wickets || 0}`;
    const overs = currentSummary?.overs || 0;

    // Get player names
    const allPlayers = [...(match.teamAPlayers || []), ...(match.teamBPlayers || [])];
    const getPlayerName = (id: string) => {
        const player = allPlayers.find((p: any) => p.playerId === id);
        return player?.name || id;
    };

    const strikerName = match.currentBatters?.striker ? getPlayerName(match.currentBatters.striker) : null;
    const nonStrikerName = match.currentBatters?.nonStriker ? getPlayerName(match.currentBatters.nonStriker) : null;
    const bowlerName = match.currentBowler ? getPlayerName(match.currentBowler) : null;

    return (
        <div className="bg-indigo-600 text-white text-sm py-2 px-4 text-center transition-all duration-500">
            <Link href={`/match/${match._id}`} className="hover:underline font-medium flex items-center justify-center gap-3 flex-wrap">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span className="font-bold">LIVE:</span>
                <span>{match.teamA} vs {match.teamB}</span>
                <span className="text-white/80">—</span>
                <span className="font-semibold">{match.battingTeam}: {score} ({overs} ov)</span>
                {strikerName && bowlerName && (
                    <>
                        <span className="text-white/80">•</span>
                        <span className="text-xs opacity-90">
                            {strikerName}* {nonStrikerName && `& ${nonStrikerName}`} | {bowlerName} bowling
                        </span>
                    </>
                )}
            </Link>
        </div>
    );
}

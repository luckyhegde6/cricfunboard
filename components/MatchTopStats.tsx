"use client";
import React, { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";

export default function MatchTopStats({ match: initialMatch, teamAPlayers, teamBPlayers }: { match: any, teamAPlayers?: any[], teamBPlayers?: any[] }) {
    const [match, setMatch] = useState(initialMatch);

    useEffect(() => {
        setMatch(initialMatch);
    }, [initialMatch]);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.emit("join", `match:${match._id}`);

        const handleUpdate = (payload: any) => {
            if (payload._id === match._id) {
                setMatch((prev: any) => ({ ...prev, ...payload }));
            }
        };

        socket.on("match:update", handleUpdate);

        return () => {
            socket.off("match:update", handleUpdate);
            socket.emit("leave", `match:${match._id}`);
        };
    }, [match._id]);

    if (!match) return null;

    const { teamA, teamB, venue, currentInnings, battingTeam, innings1Summary, innings2Summary, currentBatters, currentBowler, recentEvents, maxOvers } = match;

    const currentSummary = currentInnings === 1 ? innings1Summary : innings2Summary;
    const score = currentSummary ? `${currentSummary.runs}/${currentSummary.wickets}` : "0/0";
    const overs = currentSummary?.overs || 0;

    // Calculate overs left roughly
    const oversLeft = Math.max(0, (maxOvers || 50) - overs).toFixed(1);

    // Player name resolution
    const allPlayers = [...(teamAPlayers || []), ...(teamBPlayers || [])];
    const getPlayerName = (id: string) => {
        const player = allPlayers.find((p: any) => p.playerId === id);
        return player?.name || id;
    };

    const strikerName = currentBatters?.striker ? getPlayerName(currentBatters.striker) : null;
    const nonStrikerName = currentBatters?.nonStriker ? getPlayerName(currentBatters.nonStriker) : null;
    const bowlerName = currentBowler ? getPlayerName(currentBowler) : null;

    // Get recent over (last 6 balls) - Filter out announcements
    const lastOver = (recentEvents || [])
        .filter((e: any) => e.type !== "announcement")
        .slice(-6)
        .map((e: any) => {
            if (e.type === "wicket") return "W";
            if (e.type === "wd" || e.type === "nb") return `${e.runs}${e.type.toUpperCase()}`;
            return e.runs?.toString() || "0";
        });

    // Get latest announcement
    const latestAnnouncement = (recentEvents || [])
        .filter((e: any) => e.type === "announcement")
        .pop();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm transition-all">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* Left: Match Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <span className="text-xs font-bold text-red-600 tracking-wider uppercase">Live Match</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white truncate">
                        {teamA} <span className="text-slate-400 text-xl font-normal mx-1">vs</span> {teamB}
                    </h2>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">{venue || "Local Ground"}</div>

                    {battingTeam && (
                        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-100 dark:border-indigo-800">
                            🏏 {battingTeam} Batting
                        </div>
                    )}
                </div>

                {/* Center: Score & Players */}
                <div className="flex-1 text-center border-l border-r border-slate-100 dark:border-slate-700 px-4 md:px-8 min-w-0">
                    <div className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{score}</div>
                    <div className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-1">{overs} overs</div>

                    {/* Active Players */}
                    {(strikerName || bowlerName) && (
                        <div className="mt-4 flex flex-col gap-1.5">
                            <div className="flex items-center justify-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                                <span className="font-semibold">{strikerName}*</span>
                                {nonStrikerName && (
                                    <>
                                        <span className="text-slate-300 dark:text-slate-600">|</span>
                                        <span>{nonStrikerName}</span>
                                    </>
                                )}
                            </div>
                            {bowlerName && (
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Bowler: <span className="font-medium text-slate-700 dark:text-slate-300">{bowlerName}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Stats & Recent */}
                <div className="flex-1 text-right min-w-0">
                    <div className="mb-6">
                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Overs Left</div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{oversLeft}</div>
                    </div>

                    {/* Recent Balls */}
                    {lastOver.length > 0 && (
                        <div className="flex flex-col items-end gap-2">
                            <span className="text-xs text-slate-400 font-medium">This Over</span>
                            <div className="flex justify-end gap-1.5 flex-wrap">
                                {lastOver.map((ball: string, idx: number) => (
                                    <span
                                        key={idx}
                                        className={`text-xs font-mono w-7 h-7 flex items-center justify-center rounded-md shadow-sm border ${ball === "W"
                                            ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 font-bold"
                                            : ball === "0"
                                                ? "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                                                : ball.includes("WD") || ball.includes("NB")
                                                    ? "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400"
                                                    : "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-600 dark:text-green-400 font-medium"
                                            }`}
                                    >
                                        {ball}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {latestAnnouncement && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <span className="text-xl">📢</span>
                        <div>
                            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-0.5">Announcement</div>
                            <div className="text-sm text-slate-700 dark:text-slate-300">{latestAnnouncement.meta?.text || "Update"}</div>
                            <div className="text-xs text-slate-400 mt-1">
                                {new Date(latestAnnouncement.createdAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

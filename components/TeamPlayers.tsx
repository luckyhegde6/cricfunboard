// components/TeamPlayers.tsx
import React from "react";

type Player = {
    playerId: string;
    name: string;
    role: "batsman" | "bowler" | "allrounder" | "keeper";
    isCaptain: boolean;
    isViceCaptain: boolean;
    isExtra: boolean;
};

type TeamPlayersProps = {
    teamName: string;
    players: Player[];
    isCompleted?: boolean;
};

export default function TeamPlayers({ teamName, players, isCompleted = false }: TeamPlayersProps) {
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

    // Filter out extra players for match view
    const activePlayers = players.filter(p => !p.isExtra);

    return (
        <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${isCompleted ? "opacity-60 grayscale" : ""}`}>
            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{teamName}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {activePlayers.length} {activePlayers.length === 1 ? 'player' : 'players'}
                </p>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activePlayers.map((player) => (
                        <div
                            key={player.playerId}
                            className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-700/30 dark:to-slate-800/30 rounded-lg p-3 border border-slate-200 dark:border-slate-600"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{player.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {player.playerId}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(player.role)}`}>
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
    );
}

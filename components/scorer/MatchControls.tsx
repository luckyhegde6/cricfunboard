// components/scorer/MatchControls.tsx
"use client";
import React, { useState } from "react";

type MatchControlsProps = {
    matchId: string;
    matchState: string;
    currentInnings: number;
    onAction: () => void;
};

export default function MatchControls({ matchId, matchState, currentInnings, onAction }: MatchControlsProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAction = async (endpoint: string, body?: any) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/matches/${matchId}/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: body ? JSON.stringify(body) : undefined
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || `Failed to ${endpoint}`);
            }

            onAction();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStartMatch = () => handleAction("start");
    const handleStartInnings2 = () => handleAction("start"); // Resume from innings break
    const handleEndInnings = () => handleAction("end-innings");
    const handleEndMatch = () => {
        const result = prompt("Enter match result (e.g., 'Team A won by 5 wickets'):");
        if (result) {
            handleAction("end-match", { result });
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Match Controls</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {/* Start Match */}
                {matchState === "toss-done" && (
                    <button
                        onClick={handleStartMatch}
                        disabled={loading}
                        className="col-span-2 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        {loading ? "Starting..." : "Start Match"}
                    </button>
                )}

                {/* Start Innings 2 */}
                {matchState === "innings-break" && (
                    <button
                        onClick={handleStartInnings2}
                        disabled={loading}
                        className="col-span-2 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        {loading ? "Starting..." : "Start Innings 2"}
                    </button>
                )}

                {/* End Innings */}
                {matchState === "live" && currentInnings === 1 && (
                    <button
                        onClick={handleEndInnings}
                        disabled={loading}
                        className="py-2 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                    >
                        End Innings 1
                    </button>
                )}

                {/* End Match */}
                {matchState === "live" && currentInnings === 2 && (
                    <button
                        onClick={handleEndMatch}
                        disabled={loading}
                        className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                    >
                        End Match
                    </button>
                )}

                {/* Rain Delay */}
                {matchState === "live" && (
                    <button
                        disabled={loading}
                        className="py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                        onClick={() => alert("Rain delay feature coming soon")}
                    >
                        Rain Delay
                    </button>
                )}

                {/* DRS/Review */}
                {matchState === "live" && (
                    <button
                        disabled={loading}
                        className="py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                        onClick={() => alert("DRS/Review feature coming soon")}
                    >
                        DRS/Review
                    </button>
                )}

                {/* Substitute */}
                {matchState === "live" && (
                    <button
                        disabled={loading}
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                        onClick={() => alert("Substitute feature coming soon")}
                    >
                        Substitute
                    </button>
                )}
            </div>
        </div>
    );
}

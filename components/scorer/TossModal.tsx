// components/scorer/TossModal.tsx
"use client";
import React, { useState } from "react";

type TossModalProps = {
    matchId: string;
    teamA: string;
    teamB: string;
    onTossComplete: () => void;
};

export default function TossModal({ matchId, teamA, teamB, onTossComplete }: TossModalProps) {
    const [winner, setWinner] = useState<string>("");
    const [decision, setDecision] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>("");

    const handleSubmit = async () => {
        if (!winner || !decision) {
            setError("Please select both toss winner and decision");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/matches/${matchId}/toss`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ winner, decision })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to record toss");
            }

            console.log("[TossModal] Toss completed successfully:", data);
            onTossComplete();
        } catch (err: any) {
            setError(err.message);
            console.error("[TossModal] Error recording toss:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Conduct Toss</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Toss Winner */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Toss Winner
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setWinner(teamA)}
                        className={`p-4 rounded-lg border-2 transition-all ${winner === teamA
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                            }`}
                    >
                        <div className="font-semibold">{teamA}</div>
                    </button>
                    <button
                        onClick={() => setWinner(teamB)}
                        className={`p-4 rounded-lg border-2 transition-all ${winner === teamB
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                            }`}
                    >
                        <div className="font-semibold">{teamB}</div>
                    </button>
                </div>
            </div>

            {/* Toss Decision */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setDecision("bat")}
                        className={`p-4 rounded-lg border-2 transition-all ${decision === "bat"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                            }`}
                    >
                        <div className="font-semibold">Bat First</div>
                    </button>
                    <button
                        onClick={() => setDecision("bowl")}
                        className={`p-4 rounded-lg border-2 transition-all ${decision === "bowl"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
                            }`}
                    >
                        <div className="font-semibold">Bowl First</div>
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={loading || !winner || !decision}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            >
                {loading ? "Recording Toss..." : "Confirm Toss"}
            </button>
        </div>
    );
}

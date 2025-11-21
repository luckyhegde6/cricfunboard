// components/admin/ScorerAssignment.tsx
"use client";
import React, { useState, useEffect } from "react";

type User = {
    _id: string;
    name: string;
    email: string;
    role: string;
};

type ScorerAssignmentProps = {
    matchId: string;
    currentScorerId?: string;
    onUpdate: () => void;
};

export default function ScorerAssignment({ matchId, currentScorerId, onUpdate }: ScorerAssignmentProps) {
    const [scorers, setScorers] = useState<User[]>([]);
    const [selectedScorerId, setSelectedScorerId] = useState<string>(currentScorerId || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Fetch users with scorer role
        fetch("/api/users?role=scorer")
            .then(r => r.json())
            .then(data => setScorers(data))
            .catch(err => console.error("Failed to fetch scorers:", err));
    }, []);

    const handleAssign = async () => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/matches/${matchId}/assign-scorer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ scorerId: selectedScorerId || null })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to assign scorer");
            }

            setIsOpen(false);
            onUpdate();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const currentScorer = scorers.find(s => s._id === currentScorerId);

    if (!isOpen) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Assigned Scorer</h3>
                        <p className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                            {currentScorer ? currentScorer.name : "No scorer assigned"}
                        </p>
                        {currentScorer && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{currentScorer.email}</p>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        {currentScorer ? "Change Scorer" : "Assign Scorer"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Assign Scorer</h3>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
            )}

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Select Scorer
                </label>
                <select
                    value={selectedScorerId}
                    onChange={(e) => setSelectedScorerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">No scorer (unassign)</option>
                    {scorers.map(scorer => (
                        <option key={scorer._id} value={scorer._id}>
                            {scorer.name} ({scorer.email})
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleAssign}
                    disabled={loading}
                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium rounded-lg transition-colors"
                >
                    {loading ? "Assigning..." : "Assign"}
                </button>
                <button
                    onClick={() => {
                        setIsOpen(false);
                        setSelectedScorerId(currentScorerId || "");
                        setError("");
                    }}
                    className="flex-1 py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

"use client";
import { useState, useEffect } from "react";

interface MatchEditModalProps {
    match?: any;
    onClose: () => void;
    onSave: () => void;
}

interface Team {
    _id: string;
    name: string;
}

export default function MatchEditModal({
    match,
    onClose,
    onSave,
}: MatchEditModalProps) {
    const [teamA, setTeamA] = useState(match?.teamA || "");
    const [teamB, setTeamB] = useState(match?.teamB || "");
    const [venue, setVenue] = useState(match?.venue || "");
    const [startTime, setStartTime] = useState(
        match?.startTime
            ? new Date(match.startTime).toISOString().slice(0, 16)
            : "",
    );
    const [teams, setTeams] = useState<Team[]>([]);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        // Fetch teams for dropdowns
        fetch("/api/teams")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setTeams(data);
                }
            })
            .catch((err) => console.error("Failed to fetch teams:", err));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);

        try {
            const url = match ? `/api/matches/${match._id}` : "/api/matches";
            const method = match ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamA,
                    teamB,
                    venue,
                    startTime: startTime ? new Date(startTime).toISOString() : undefined,
                }),
            });

            if (!res.ok) throw new Error("Failed to save match");
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to save match");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-4">
                    {match ? "Edit Match Details" : "Schedule New Match"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Team A
                        </label>
                        <select
                            value={teamA}
                            onChange={(e) => setTeamA(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                        >
                            <option value="">-- Select Team A --</option>
                            {teams.map((team) => (
                                <option key={team._id} value={team.name}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Team B
                        </label>
                        <select
                            value={teamB}
                            onChange={(e) => setTeamB(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            required
                        >
                            <option value="">-- Select Team B --</option>
                            {teams.map((team) => (
                                <option key={team._id} value={team.name}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Venue
                        </label>
                        <input
                            type="text"
                            value={venue}
                            onChange={(e) => setVenue(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            placeholder="Enter venue name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Start Time
                        </label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {busy ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

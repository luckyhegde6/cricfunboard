"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

interface Team {
    _id: string;
    name: string;
}

export default function AdminSchedulePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [formData, setFormData] = useState({
        teamA: "",
        teamB: "",
        venue: "",
        startTime: "",
        name: "", // Optional match name/number
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`/api/tournaments/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setTeams(data.teams);
            });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.teamA === formData.teamB) {
            alert("Teams must be different");
            return;
        }
        setLoading(true);

        try {
            const res = await fetch("/api/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    tournamentId: id,
                    // We need to pass team names for the current Match model, 
                    // but ideally we should pass IDs. The current Match model uses strings for teamA/teamB.
                    // Let's find the names from the IDs.
                    teamA: teams.find(t => t._id === formData.teamA)?.name,
                    teamB: teams.find(t => t._id === formData.teamB)?.name,
                }),
            });

            if (res.ok) {
                alert("Match scheduled successfully");
                setFormData({ ...formData, teamA: "", teamB: "", startTime: "", name: "" });
            } else {
                alert("Failed to schedule match");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Schedule Match</h1>
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Match Name (Optional)</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        placeholder="e.g. Match 1, Final"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team A</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            value={formData.teamA}
                            onChange={(e) => setFormData({ ...formData, teamA: e.target.value })}
                        >
                            <option value="">Select Team</option>
                            {teams.map((team) => (
                                <option key={team._id} value={team._id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Team B</label>
                        <select
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            value={formData.teamB}
                            onChange={(e) => setFormData({ ...formData, teamB: e.target.value })}
                        >
                            <option value="">Select Team</option>
                            {teams.map((team) => (
                                <option key={team._id} value={team._id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Venue</label>
                    <input
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                        type="datetime-local"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Scheduling..." : "Schedule Match"}
                    </button>
                </div>
            </form>
        </div>
    );
}

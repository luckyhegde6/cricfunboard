// components/admin/Settings.tsx
"use client";
import { useState, useEffect } from "react";

export default function Settings() {
    const [announcement, setAnnouncement] = useState("");
    const [maintenance, setMaintenance] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    useEffect(() => {
        fetch("/api/admin/settings")
            .then((res) => res.json())
            .then((data) => {
                if (data.announcement) setAnnouncement(data.announcement);
                if (data.maintenance) setMaintenance(data.maintenance);
            })
            .catch((err) => console.error(err));
    }, []);

    const handleSave = async () => {
        setLoading(true);
        setMsg("");
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ announcement, maintenance }),
            });
            if (res.ok) {
                setMsg("Settings saved successfully!");
            } else {
                setMsg("Failed to save settings.");
            }
        } catch (error) {
            setMsg("Error saving settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
            <h2 className="text-xl font-bold">Global Settings</h2>
            {msg && <div className={`p-2 rounded ${msg.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{msg}</div>}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Announcement Banner</label>
                <textarea
                    value={announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2"
                    rows={3}
                    placeholder="Enter a global announcement..."
                />
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="maintenance"
                    checked={maintenance}
                    onChange={(e) => setMaintenance(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="maintenance" className="text-sm font-medium text-gray-700">Enable Maintenance Mode</label>
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
                {loading ? "Saving..." : "Save Settings"}
            </button>
        </div>
    );
}

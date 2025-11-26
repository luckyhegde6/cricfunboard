"use client";
import { useState } from "react";

interface MatchStatusModalProps {
    match: any;
    action: "cancel" | "abandon";
    onClose: () => void;
    onSave: () => void;
}

export default function MatchStatusModal({
    match,
    action,
    onClose,
    onSave,
}: MatchStatusModalProps) {
    const [announcement, setAnnouncement] = useState("");
    const [busy, setBusy] = useState(false);

    const newStatus = action === "cancel" ? "cancelled" : "abandoned";
    const title = action === "cancel" ? "Cancel Match" : "Abandon Match";
    const warning =
        action === "cancel"
            ? "Are you sure you want to cancel this scheduled match?"
            : "Are you sure you want to abandon this live match?";

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setBusy(true);

        try {
            const res = await fetch(`/api/matches/${match._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: newStatus,
                    announcement: announcement || undefined,
                }),
            });

            if (!res.ok) throw new Error("Failed to update status");
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-bold mb-2 text-red-600">{title}</h2>
                <p className="text-gray-600 mb-4">{warning}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Announcement (Optional)
                        </label>
                        <textarea
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 border p-2"
                            placeholder={`Reason for ${action}...`}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Keep Match
                        </button>
                        <button
                            type="submit"
                            disabled={busy}
                            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            {busy ? "Processing..." : `Confirm ${action === "cancel" ? "Cancellation" : "Abandonment"}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

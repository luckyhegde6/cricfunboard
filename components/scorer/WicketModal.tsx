import React, { useState } from "react";

type Player = {
    playerId: string;
    name: string;
};

type WicketModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    fieldingTeamPlayers: Player[];
    striker: Player;
    nonStriker: Player;
};

export default function WicketModal({ isOpen, onClose, onSubmit, fieldingTeamPlayers, striker, nonStriker }: WicketModalProps) {
    const [type, setType] = useState("bowled");
    const [fielder, setFielder] = useState("");
    const [whoOut, setWhoOut] = useState(striker?.playerId || "");

    if (!isOpen) return null;

    const handleSubmit = () => {
        onSubmit({
            type,
            fielder,
            batsman: whoOut
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Wicket Details</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                        ✕
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Dismissal Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                        >
                            <option value="bowled">Bowled</option>
                            <option value="caught">Caught</option>
                            <option value="lbw">LBW</option>
                            <option value="run-out">Run Out</option>
                            <option value="stumped">Stumped</option>
                            <option value="hit-wicket">Hit Wicket</option>
                        </select>
                    </div>

                    {/* Who is Out (Mainly for Run Out) */}
                    {(type === "run-out") && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Who is Out?</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="whoOut"
                                        value={striker?.playerId}
                                        checked={whoOut === striker?.playerId}
                                        onChange={(e) => setWhoOut(e.target.value)}
                                    />
                                    <span className="text-sm">{striker?.name} (Striker)</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="whoOut"
                                        value={nonStriker?.playerId}
                                        checked={whoOut === nonStriker?.playerId}
                                        onChange={(e) => setWhoOut(e.target.value)}
                                    />
                                    <span className="text-sm">{nonStriker?.name} (Non-Striker)</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Fielder Selection (Caught, Run Out, Stumped) */}
                    {["caught", "run-out", "stumped"].includes(type) && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                {type === "stumped" ? "Wicket Keeper" : "Fielder"}
                            </label>
                            <select
                                value={fielder}
                                onChange={(e) => setFielder(e.target.value)}
                                className="w-full p-2 rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800"
                            >
                                <option value="">Select Player</option>
                                {fieldingTeamPlayers.map(p => (
                                    <option key={p.playerId} value={p.playerId}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                    >
                        Confirm Wicket
                    </button>
                </div>
            </div>
        </div>
    );
}

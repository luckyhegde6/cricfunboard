"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

type SelectDismissedBatterModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (playerId: string) => void;
    striker: { id: string; name: string } | null;
    nonStriker: { id: string; name: string } | null;
};

export default function SelectDismissedBatterModal({
    isOpen,
    onClose,
    onSubmit,
    striker,
    nonStriker,
}: SelectDismissedBatterModalProps) {
    const [selected, setSelected] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (selected) {
            onSubmit(selected);
            setSelected(null);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Select Dismissed Batter
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        For a run-out, which batsman was dismissed?
                    </p>

                    <div className="space-y-2">
                        {striker && (
                            <button
                                onClick={() => setSelected(striker.id)}
                                className={`w-full p-4 rounded-lg border-2 transition-all ${selected === striker.id
                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {striker.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Striker
                                        </div>
                                    </div>
                                    {selected === striker.id && (
                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>
                        )}

                        {nonStriker && (
                            <button
                                onClick={() => setSelected(nonStriker.id)}
                                className={`w-full p-4 rounded-lg border-2 transition-all ${selected === nonStriker.id
                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-left">
                                        <div className="font-semibold text-slate-900 dark:text-white">
                                            {nonStriker.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Non-Striker
                                        </div>
                                    </div>
                                    {selected === nonStriker.id && (
                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleSubmit}
                        disabled={!selected}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                    >
                        Confirm Dismissal
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";

type ScoreBuilderProps = {
    onScoreSubmit: (payload: any) => void;
    disabled?: boolean;
};

export default function ScoreBuilder({ onScoreSubmit, disabled = false }: ScoreBuilderProps) {
    const [runs, setRuns] = useState(0);
    const [extras, setExtras] = useState<{ type: "wd" | "nb" | "bye" | "lb" | null, runs: number }>({ type: null, runs: 0 });
    const [isWicket, setIsWicket] = useState(false);
    const [wicketType, setWicketType] = useState("caught"); // Default wicket type

    const handleRunClick = (r: number) => {
        setRuns(r);
    };

    const handleExtraClick = (type: "wd" | "nb" | "bye" | "lb") => {
        if (extras.type === type) {
            setExtras({ type: null, runs: 0 });
        } else {
            // Default extra runs: wd/nb = 1, bye/lb = 0 (runs come from running)
            setExtras({ type, runs: 1 });
        }
    };

    const handleSubmit = () => {
        const payload: any = {
            runs: runs,
            type: "runs"
        };

        if (extras.type) {
            payload.type = extras.type;
            // For wide/no-ball, the run count usually includes the extra run + runs ran
            // But typically in simple scoring:
            // WD = 1 run extra. If they ran, it's WD + runs.
            // Let's assume 'runs' state is runs off bat (or running for extras).

            // If Wide: runs are added to wide count.
            // If NB: runs are added to bat (if hit) or extras? 
            // Let's keep it simple:
            // payload.runs = runs (from buttons)
            // payload.extraRuns = extras.runs (fixed 1 for wd/nb usually)

            // Actually, the API expects:
            // type: "runs" | "wd" | "nb" | "bye" | "lb" | "wicket"
            // runs: number (total runs scored on this ball including extras?)

            // Let's look at API logic:
            // if type == 'wd' || 'nb', it adds runs.
            // So if I select WD and 1 run (ran), total is 2?
            // Usually UI separates "Runs Scored" vs "Extra Type".

            // Let's send:
            // type: extras.type || (isWicket ? "wicket" : "runs")
            // runs: runs (from buttons)
            // isWicket: isWicket

            // If it's a wicket, we might need more info, but let's start with simple trigger
            // The API handles "wicket" type.
        }

        if (isWicket) {
            payload.type = "wicket";
            payload.wicketType = wicketType;
        } else if (extras.type) {
            payload.type = extras.type;
        }

        // If it's a wide, the 'runs' button usually means 'overthrows' or 'ran runs'.
        // Standard wide is 1 run. If user clicks '1', does it mean 1 wide (total 1) or 1 wide + 1 run (total 2)?
        // Let's assume buttons are "Runs from Bat/Running".
        // So WD + 0 = 1 run total. WD + 1 = 2 runs total.
        // The API likely expects the *total* runs for the ball or specific fields.
        // Looking at API: "if (ev.type === 'wd') bowl.runs += ev.runs || 0;"
        // So we should send the TOTAL runs for that ball event.

        let totalRuns = runs;
        if (extras.type === "wd" || extras.type === "nb") {
            totalRuns += 1; // Add the penalty run
        }

        payload.runs = totalRuns;

        onScoreSubmit(payload);

        // Reset
        setRuns(0);
        setExtras({ type: null, runs: 0 });
        setIsWicket(false);
    };

    const handleClear = () => {
        setRuns(0);
        setExtras({ type: null, runs: 0 });
        setIsWicket(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">Score Builder</h3>
                <button onClick={handleClear} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 p-1">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Runs Row */}
            <div className="grid grid-cols-6 gap-2 mb-4">
                {[0, 1, 2, 3, 4, 6].map((r) => (
                    <button
                        key={r}
                        onClick={() => handleRunClick(r)}
                        disabled={disabled}
                        className={`
                            h-12 rounded-lg font-bold text-lg transition-all
                            ${runs === r
                                ? 'bg-blue-600 text-white shadow-md scale-105'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'}
                        `}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* Extras & Wicket Row */}
            <div className="grid grid-cols-5 gap-2 mb-6">
                {["wd", "nb", "bye", "lb"].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleExtraClick(type as any)}
                        disabled={disabled}
                        className={`
                            h-10 rounded-lg font-medium text-sm uppercase transition-all
                            ${extras.type === type
                                ? 'bg-orange-500 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}
                        `}
                    >
                        {type}
                    </button>
                ))}
                <button
                    onClick={() => setIsWicket(!isWicket)}
                    disabled={disabled}
                    className={`
                        h-10 rounded-lg font-medium text-sm uppercase transition-all
                        ${isWicket
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200'}
                    `}
                >
                    OUT
                </button>
            </div>

            {/* Wicket Type Selector (if Wicket is selected) */}
            {isWicket && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                    <label className="block text-xs font-medium text-red-800 dark:text-red-300 mb-2">Wicket Type</label>
                    <select
                        value={wicketType}
                        onChange={(e) => setWicketType(e.target.value)}
                        className="w-full p-2 rounded border border-red-200 dark:border-red-800 bg-white dark:bg-slate-800 text-sm"
                    >
                        <option value="caught">Caught</option>
                        <option value="bowled">Bowled</option>
                        <option value="lbw">LBW</option>
                        <option value="run-out">Run Out</option>
                        <option value="stumped">Stumped</option>
                    </select>
                </div>
            )}

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                disabled={disabled}
                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Check className="w-5 h-5" />
                Submit Ball
            </button>

            {/* Preview Text */}
            <div className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
                Preview: <span className="font-medium text-slate-900 dark:text-white">
                    {isWicket ? "WICKET" : ""}
                    {isWicket && (runs > 0 || extras.type) ? " + " : ""}
                    {extras.type ? extras.type.toUpperCase() : ""}
                    {extras.type && runs > 0 ? " + " : ""}
                    {runs > 0 ? `${runs} Runs` : (extras.type || isWicket ? "" : "Dot Ball")}
                </span>
            </div>
        </div>
    );
}

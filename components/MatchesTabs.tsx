// components/MatchesTabs.tsx
"use client";
import React, { useState, useMemo } from "react";
import MatchCard from "./MatchCard";

export type MatchType = {
    _id: string;
    teamA: string;
    teamB: string;
    venue?: string;
    startTime?: string;
    status?: "scheduled" | "live" | "completed" | "abandoned";
    summary?: { runs: number; wickets: number; overs: number };
};

export default function MatchesTabs({ matches }: { matches: MatchType[] }) {
    const [tab, setTab] = useState<"all" | "live" | "completed">("all");

    const live = useMemo(() => matches.filter(m => m.status === "live"), [matches]);
    const completed = useMemo(() => matches.filter(m => m.status === "completed" || m.status === "abandoned"), [matches]);
    const scheduled = useMemo(() => matches.filter(m => m.status === "scheduled"), [matches]);

    return (
        <div className="space-y-4">
            <div className="flex gap-2 items-center">
                <TabButton label="All" active={tab === "all"} onClick={() => setTab("all")} />
                <TabButton label={`Live (${live.length})`} active={tab === "live"} onClick={() => setTab("live")} />
                <TabButton label={`Scheduled (${scheduled.length})`} active={tab === "completed"} onClick={() => setTab("completed")} />
            </div>

            <div>
                {tab === "all" && <AllTab matches={matches} />}
                {tab === "live" && <LiveTab matches={live} />}
                {tab === "completed" && <CompletedTab matches={[...completed, ...scheduled]} />}
            </div>
        </div>
    );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} className={`px-3 py-1.5 rounded-md text-sm ${active ? "bg-slate-800 text-white" : "bg-white border text-slate-700"}`}>
            {label}
        </button>
    );
}

function AllTab({ matches }: { matches: MatchType[] }) {
    if (!matches.length) return <div className="text-sm text-slate-500">No matches yet.</div>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(m => <MatchCard key={m._id} match={m} />)}
        </div>
    );
}

function LiveTab({ matches }: { matches: MatchType[] }) {
    if (!matches.length) return <div className="text-sm text-rose-500">No live matches right now.</div>;
    return (
        <div className="space-y-4">
            {matches.map(m => (
                <div key={m._id} className="bg-white rounded shadow p-4 flex items-center justify-between">
                    <div>
                        <div className="font-semibold">{m.teamA} vs {m.teamB}</div>
                        <div className="text-sm text-slate-500">{m.venue ?? "Venue unknown"}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-bold">{m.summary?.runs ?? 0}/{m.summary?.wickets ?? 0}</div>
                        <div className="text-sm text-slate-500">{m.summary?.overs ?? 0} overs</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function CompletedTab({ matches }: { matches: MatchType[] }) {
    if (!matches.length) return <div className="text-sm text-slate-500">No completed matches.</div>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(m => (
                <div key={m._id} className="bg-white rounded border p-3">
                    <div className="flex justify-between">
                        <div><div className="font-medium">{m.teamA} vs {m.teamB}</div><div className="text-sm text-slate-500">{m.venue}</div></div>
                        <div className="text-right"><div className="font-semibold">{m.summary?.runs}/{m.summary?.wickets}</div><div className="text-xs text-slate-500">{m.status}</div></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

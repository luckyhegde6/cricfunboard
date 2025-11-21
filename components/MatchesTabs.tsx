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
    scorerId?: string;
    captainId?: string;
    viceCaptainId?: string;
};

export default function MatchesTabs({ matches, userId }: { matches: MatchType[], userId?: string }) {
    const [tab, setTab] = useState<"all" | "live" | "scheduled" | "assigned">("all");

    const live = useMemo(() => matches.filter(m => m.status === "live"), [matches]);
    const completed = useMemo(() => matches.filter(m => m.status === "completed" || m.status === "abandoned"), [matches]);
    const scheduled = useMemo(() => matches.filter(m => m.status === "scheduled"), [matches]);

    const assigned = useMemo(() => {
        if (!userId) return [];
        return matches.filter(m =>
            m.scorerId === userId ||
            m.captainId === userId ||
            m.viceCaptainId === userId
        );
    }, [matches, userId]);

    // Switch to assigned tab by default if user has assignments and is on "all" initially? 
    // Or just let them click. Let's just add the tab.

    return (
        <div className="space-y-4">
            <div className="flex gap-2 items-center flex-wrap">
                <TabButton label="All" active={tab === "all"} onClick={() => setTab("all")} />
                <TabButton label={`Live (${live.length})`} active={tab === "live"} onClick={() => setTab("live")} />
                <TabButton label={`Scheduled (${scheduled.length})`} active={tab === "scheduled"} onClick={() => setTab("scheduled")} />
                {userId && assigned.length > 0 && (
                    <TabButton label={`Assigned (${assigned.length})`} active={tab === "assigned"} onClick={() => setTab("assigned")} />
                )}
            </div>

            <div>
                {tab === "all" && <AllTab matches={matches} />}
                {tab === "live" && <LiveTab matches={live} />}
                {tab === "scheduled" && <ScheduledTab matches={scheduled} />}
                {tab === "assigned" && <AssignedTab matches={assigned} />}
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

function ScheduledTab({ matches }: { matches: MatchType[] }) {
    if (!matches.length) return <div className="text-sm text-slate-500">No scheduled matches.</div>;
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(m => <MatchCard key={m._id} match={m} />)}
        </div>
    );
}

function AssignedTab({ matches }: { matches: MatchType[] }) {
    if (!matches.length) return <div className="text-sm text-slate-500">No assigned matches.</div>;
    return (
        <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500">Your Assigned Matches</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map(m => <MatchCard key={m._id} match={m} />)}
            </div>
        </div>
    );
}

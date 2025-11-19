// components/ScorerPanel.tsx
"use client";
import React, { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket-client";

export default function ScorerPanel({ matchId, onUpdate }: { matchId: string; onUpdate?: (payload: any) => void }) {
    const [socketReady, setSocketReady] = useState(false);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        const s = getSocket();
        if (!s) return;
        s.emit("join", `match:${matchId}`);
        setSocketReady(true);
        s.on("connect", () => setSocketReady(true));
        s.on("match:update", (payload) => {
            // payload expected from server; pass to parent
            onUpdate?.(payload);
        });
        return () => {
            s.emit("leave", `match:${matchId}`);
            // optionally remove listeners
        };
    }, [matchId]);

    async function record(eventPayload: any) {
        setBusy(true);
        setMsg(null);

        // prefer socket
        const s = getSocket();
        if (s && s.connected) {
            try {
                // emit to socket server; server will broadcast to room and server route may persist
                s.emit("score:event", { matchId, event: eventPayload });
                // also call server route to persist to DB (so server authoritative)
                const res = await fetch(`/api/matches/${matchId}/score`, {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(eventPayload),
                });
                const data = await res.json();
                if (!res.ok) setMsg("Server save failed");
                else setMsg("Saved");
                onUpdate?.(data);
            } catch (err) {
                setMsg("Socket error");
            } finally {
                setBusy(false);
                setTimeout(() => setMsg(null), 1200);
            }
            return;
        }

        // fallback: direct POST
        try {
            const res = await fetch(`/api/matches/${matchId}/score`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(eventPayload),
            });
            const data = await res.json();
            if (!res.ok) setMsg("Save failed");
            else {
                setMsg("Saved");
                onUpdate?.(data);
            }
        } catch (err) {
            setMsg("Network error");
        } finally {
            setBusy(false);
            setTimeout(() => setMsg(null), 1200);
        }
    }

    return (
        <div className="bg-white rounded-md border p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="font-medium">Scoring Panel {socketReady ? <span className="text-xs text-green-600">online</span> : <span className="text-xs text-slate-400">offline</span>}</div>
                {busy ? <div className="text-sm text-slate-500">Saving…</div> : msg ? <div className="text-sm text-slate-500">{msg}</div> : null}
            </div>

            <div className="grid grid-cols-4 gap-2">
                <button className="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200" onClick={() => record({ type: "dot" })}>Dot</button>
                <button className="px-3 py-2 rounded bg-white border" onClick={() => record({ type: "runs", runs: 1 })}>1</button>
                <button className="px-3 py-2 rounded bg-white border" onClick={() => record({ type: "runs", runs: 2 })}>2</button>
                <button className="px-3 py-2 rounded bg-white border" onClick={() => record({ type: "runs", runs: 3 })}>3</button>

                <button className="col-span-2 px-3 py-2 rounded bg-white border" onClick={() => record({ type: "runs", runs: 4 })}>4</button>
                <button className="col-span-2 px-3 py-2 rounded bg-white border" onClick={() => record({ type: "runs", runs: 6 })}>6</button>

                <button className="px-3 py-2 rounded bg-rose-100 text-rose-700" onClick={() => record({ type: "wicket" })}>Wicket</button>
                <button className="px-3 py-2 rounded bg-yellow-100 text-yellow-700" onClick={() => record({ type: "nb" })}>No-ball</button>
                <button className="px-3 py-2 rounded bg-amber-100 text-amber-700" onClick={() => record({ type: "wd" })}>Wide</button>
                <button className="px-3 py-2 rounded bg-slate-50 border" onClick={() => record({ type: "undo" })}>Undo</button>
            </div>
        </div>
    );
}

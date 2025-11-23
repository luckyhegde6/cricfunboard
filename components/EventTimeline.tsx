// components/EventTimeline.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket-client";

export default function EventTimeline({ matchId }: { matchId: string }) {
  const [events, setEvents] = useState<any[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const res = await fetch(`/api/matches/${matchId}/events`); // we'll create a lightweight events route below
      if (!res.ok) return;
      const data = await res.json();
      if (!mounted) return;
      setEvents(data);
      // scroll to bottom optionally
      setTimeout(
        () =>
          listRef.current?.scrollTo({
            top: listRef.current.scrollHeight,
            behavior: "smooth",
          }),
        20,
      );
    }
    load();

    const s = getSocket();
    if (s) {
      s.emit("join", `match:${matchId}`);
      s.on("match:update", (payload) => {
        // payload.match may contain recentEvents; push those newest
        if (payload?.match?.recentEvents) {
          setEvents((prev) => {
            const merged = [...prev, ...payload.match.recentEvents];
            return merged.slice(-100); // keep last 100
          });
          setTimeout(
            () =>
              listRef.current?.scrollTo({ top: listRef.current.scrollHeight }),
            10,
          );
        }
      });
    }

    return () => {
      mounted = false;
      if (s) {
        s.emit("leave", `match:${matchId}`);
        s.off("match:update");
      }
    };
  }, [matchId]);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 h-80 flex flex-col shadow-sm">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 px-2">
        Match Commentary
      </h3>
      <div
        className="overflow-y-auto flex-1 pr-2"
        ref={listRef}
        aria-live="polite"
      >
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm">
            <svg
              className="w-8 h-8 mb-2 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            No events yet
          </div>
        ) : (
          <div className="relative space-y-6 pl-4 before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 my-2">
            {events.map((e, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Dot on timeline */}
                <div
                  className={`absolute left-[-5px] top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 
                                    ${
                                      e.type === "wicket"
                                        ? "bg-rose-500"
                                        : e.type === "boundary" ||
                                            (e.runs && e.runs >= 4)
                                          ? "bg-emerald-500"
                                          : "bg-slate-400"
                                    }`}
                ></div>

                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                      {e.type === "wicket"
                        ? "WICKET!"
                        : e.type === "boundary"
                          ? "BOUNDARY!"
                          : e.type.toUpperCase()}
                      {e.runs ? (
                        <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                          {e.runs} runs
                        </span>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {e.batsman && (
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {e.batsman}
                        </span>
                      )}
                      {e.batsman && e.bowler && (
                        <span className="mx-1 text-slate-300">•</span>
                      )}
                      {e.bowler && <span>{e.bowler}</span>}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-2">
                    {new Date(e.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

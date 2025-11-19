// components/TeamCard.tsx
"use client";
import Link from "next/link";

export default function TeamCard({ team }: { team: { id: string; name: string; players?: number } }) {
    return (
        <Link href={`/teams/${team.id}`} className="block bg-white rounded shadow p-4 hover:shadow-md transition">
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-semibold">{team.name}</div>
                    <div className="text-sm text-slate-500">{team.players ?? 0} players</div>
                </div>
                <div className="text-slate-400 text-sm">View</div>
            </div>
        </Link>
    );
}

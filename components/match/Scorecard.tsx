import React, { useState } from "react";

type PlayerStats = {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    dismissal: string;
};

type BowlingStats = {
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
};

type ScorecardProps = {
    match: any;
    players: any[];
};

export default function Scorecard({ match, players }: ScorecardProps) {
    const [activeTab, setActiveTab] = useState(1);
    const scorecard = match.scorecard || { innings1: { batting: {}, bowling: {} }, innings2: { batting: {}, bowling: {} } };

    const currentInningsData = activeTab === 1 ? scorecard.innings1 : scorecard.innings2;
    const teamName = activeTab === 1 ? match.teamA : match.teamB; // Assuming Team A bats first for now, logic needs check

    const getPlayerName = (id: string) => players.find(p => p.playerId === id)?.name || id;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab(1)}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 1 ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    Innings 1
                </button>
                <button
                    onClick={() => setActiveTab(2)}
                    className={`flex-1 py-3 text-sm font-medium ${activeTab === 2 ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    Innings 2
                </button>
            </div>

            <div className="p-4">
                {/* Batting Table */}
                <div className="mb-6">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Batting</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 uppercase">
                                <tr>
                                    <th className="px-3 py-2 rounded-l-lg">Batter</th>
                                    <th className="px-3 py-2">R</th>
                                    <th className="px-3 py-2">B</th>
                                    <th className="px-3 py-2">4s</th>
                                    <th className="px-3 py-2">6s</th>
                                    <th className="px-3 py-2 rounded-r-lg">SR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {Object.entries(currentInningsData.batting).map(([id, stats]: [string, any]) => (
                                    <tr key={id}>
                                        <td className="px-3 py-2">
                                            <div className="font-medium text-slate-900 dark:text-white">{getPlayerName(id)}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{stats.dismissal || "not out"}</div>
                                        </td>
                                        <td className="px-3 py-2 font-bold">{stats.runs}</td>
                                        <td className="px-3 py-2">{stats.balls}</td>
                                        <td className="px-3 py-2">{stats.fours}</td>
                                        <td className="px-3 py-2">{stats.sixes}</td>
                                        <td className="px-3 py-2">{stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(1) : "0.0"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bowling Table */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Bowling</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 uppercase">
                                <tr>
                                    <th className="px-3 py-2 rounded-l-lg">Bowler</th>
                                    <th className="px-3 py-2">O</th>
                                    <th className="px-3 py-2">M</th>
                                    <th className="px-3 py-2">R</th>
                                    <th className="px-3 py-2">W</th>
                                    <th className="px-3 py-2 rounded-r-lg">ECO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {Object.entries(currentInningsData.bowling).map(([id, stats]: [string, any]) => (
                                    <tr key={id}>
                                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{getPlayerName(id)}</td>
                                        <td className="px-3 py-2">{stats.overs}</td>
                                        <td className="px-3 py-2">{stats.maidens}</td>
                                        <td className="px-3 py-2">{stats.runs}</td>
                                        <td className="px-3 py-2 font-bold">{stats.wickets}</td>
                                        <td className="px-3 py-2">
                                            {/* Eco calculation: Runs / Overs. Need to convert overs (e.g. 1.3) to balls or decimal overs properly */}
                                            {/* Simplified: just using runs/overs for now, but 1.3 overs is 1.5 decimal overs. */}
                                            {/* Better: Runs / (Balls/6) */}
                                            {stats.balls > 0 ? (stats.runs / (stats.balls / 6)).toFixed(1) : "0.0"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

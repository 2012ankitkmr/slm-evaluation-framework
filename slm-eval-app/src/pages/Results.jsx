import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Table as TableIcon, Search, Calendar, BadgeCheck, FileText } from 'lucide-react';
import { clsx } from 'clsx';

export default function Results() {
    const [results, setResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('http://localhost:8000/results')
            .then(res => res.json())
            .then(data => setResults(data))
            .catch(console.error);
    }, []);

    const formatDate = (timestamp) => {
        return new Date(timestamp * 1000).toLocaleString();
    };

    const getScoreColor = (score) => {
        if (score >= 0.9) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (score >= 0.7) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        return 'text-red-400 bg-red-400/10 border-red-400/20';
    };

    const filteredResults = results.filter(r =>
        r.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.use_case_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Results</h1>
                    <p className="text-slate-400">Analysis of completed evaluation runs.</p>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Filter results..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#161b22] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 w-64"
                    />
                </div>
            </div>

            <div className="flex-1 bg-[#161b22]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                <th className="px-6 py-4">Status & Score</th>
                                <th className="px-6 py-4">Model</th>
                                <th className="px-6 py-4">Use Case</th>
                                <th className="px-6 py-4">Prompt Config</th>
                                <th className="px-6 py-4 text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredResults.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500">
                                        No results found.
                                    </td>
                                </tr>
                            ) : (
                                filteredResults.map((result) => (
                                    <tr key={result.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx(
                                                    "px-2 py-1 rounded-md text-xs font-bold border",
                                                    getScoreColor(result.score)
                                                )}>
                                                    {(result.score * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-200">{result.model_name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <BadgeCheck size={14} className="text-blue-400" />
                                                {result.use_case_id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                <FileText size={14} />
                                                <span className="font-mono">{result.prompt_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-500 text-xs font-mono">
                                            {formatDate(result.timestamp)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

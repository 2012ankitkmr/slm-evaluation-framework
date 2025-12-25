import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Database, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export default function DatasetExplorer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [samples, setSamples] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetch(`http://localhost:8000/use-cases/${id}/samples`)
            .then(res => res.json())
            .then(data => {
                setSamples(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const filteredSamples = samples.filter(s =>
        JSON.stringify(s).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredSamples.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSamples = filteredSamples.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 group text-sm"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        Back to Use Cases
                    </button>
                    <h1 className="text-3xl font-bold text-white mb-2">Dataset Explorer</h1>
                    <p className="text-slate-400 text-sm">Reviewing raw samples for Use Case: <span className="text-blue-400 font-mono">{id}</span></p>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search samples..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#161b22] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 w-64"
                    />
                </div>
            </div>

            <div className="flex-1 bg-[#161b22]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <p>Loading dataset samples...</p>
                        </div>
                    ) : filteredSamples.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                            <Database size={48} className="opacity-20" />
                            <p>No samples found.</p>
                        </div>
                    ) : (
                        paginatedSamples.map((sample, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-[#0d1117] border border-white/10 rounded-xl p-5 space-y-4 group hover:border-blue-500/30 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                                        Sample {startIndex + idx + 1}
                                    </span>
                                    <FileText size={14} className="text-slate-600 group-hover:text-blue-400" />
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(sample).map(([key, value]) => (
                                        <div key={key} className="space-y-1">
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{key}</div>
                                            <div className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5 font-mono whitespace-pre-wrap">
                                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                        <div className="text-xs text-slate-500 font-medium">
                            Showing <span className="text-slate-300">{startIndex + 1}</span> to <span className="text-slate-300">{Math.min(startIndex + itemsPerPage, filteredSamples.length)}</span> of <span className="text-slate-300">{filteredSamples.length}</span> entries
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs text-slate-300 font-bold px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-md">
                                {currentPage} / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

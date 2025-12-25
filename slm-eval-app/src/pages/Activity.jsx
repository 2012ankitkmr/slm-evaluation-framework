import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity as ActivityIcon, CheckCircle2, XCircle, Loader2, Clock } from 'lucide-react';
import { clsx } from 'clsx';

export default function Activity() {
    const [jobs, setJobs] = useState([]);

    // Poll for jobs every 2 seconds
    useEffect(() => {
        const fetchJobs = () => {
            fetch('http://localhost:8000/jobs')
                .then(res => res.json())
                .then(data => setJobs(data))
                .catch(console.error);
        };

        fetchJobs();
        const interval = setInterval(fetchJobs, 2000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'failed': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'running': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle2 size={16} />;
            case 'failed': return <XCircle size={16} />;
            case 'running': return <Loader2 size={16} className="animate-spin" />;
            default: return <Clock size={16} />;
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Activity</h1>
                <p className="text-slate-400">Monitor running and past evaluation jobs.</p>
            </div>

            <div className="flex-1 bg-[#161b22]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                <div className="overflow-y-auto p-6 space-y-4">
                    {jobs.length === 0 ? (
                        <div className="text-center text-slate-500 py-20">
                            No activity recorded yet.
                        </div>
                    ) : (
                        <AnimatePresence>
                            {jobs.map((job) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    layout
                                    className="bg-[#0d1117] border border-white/10 rounded-xl p-4 flex items-center gap-6"
                                >
                                    {/* Status Icon */}
                                    <div className={clsx(
                                        "w-10 h-10 rounded-full flex items-center justify-center border",
                                        getStatusColor(job.status)
                                    )}>
                                        {getStatusIcon(job.status)}
                                    </div>

                                    {/* Job Details */}
                                    <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-4">
                                            <h3 className="text-sm font-bold text-white truncate">{job.use_case_id}</h3>
                                            <p className="text-xs text-slate-400 truncate">Prompt: {job.prompt_id}</p>
                                        </div>
                                        <div className="col-span-3">
                                            <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 px-2 py-1 rounded-md w-fit">
                                                <ActivityIcon size={12} />
                                                {job.model_name}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="col-span-3 flex flex-col gap-1">
                                            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                                                <span>Progress</span>
                                                <span>{job.progress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={clsx(
                                                        "h-full rounded-full transition-all duration-500",
                                                        job.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                                                    )}
                                                    style={{ width: `${job.progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-2 text-right">
                                            <span className={clsx(
                                                "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                                                getStatusColor(job.status)
                                            )}>
                                                {job.status}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}

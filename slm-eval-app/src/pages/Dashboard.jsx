import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle2, Clock, AlertCircle, Database } from 'lucide-react';

const StatsCard = ({ title, value, label, icon: Icon, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161b22]/60 backdrop-blur-md border border-white/5 p-6 rounded-2xl relative overflow-hidden group"
    >
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 ${color}`}>
            <Icon size={80} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
            <p className="text-slate-400 font-medium">{title}</p>
            <p className="text-xs text-slate-500 mt-2">{label}</p>
        </div>
    </motion.div>
);

const ActiveUseCaseRow = ({ name, description, dataset_count }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
    >
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                <Database size={20} />
            </div>
            <div>
                <h4 className="font-medium text-white">{name}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{description}</p>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="text-sm font-bold text-white">{dataset_count}</p>
                <p className="text-xs text-slate-500">Items</p>
            </div>
        </div>
    </motion.div>
)

export default function Dashboard() {
    const [useCases, setUseCases] = useState([]);

    useEffect(() => {
        fetch('http://localhost:8000/use-cases')
            .then(res => res.json())
            .then(data => setUseCases(data))
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Overview</h1>
                <p className="text-slate-400">System performance and active evaluation scenarios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total Evals" value="128" label="+12% from last week" icon={Activity} color="text-blue-500" />
                <StatsCard title="Active Use Cases" value={useCases.length} label="Configured scenarios" icon={Database} color="text-purple-500" />
                <StatsCard title="Avg Latency" value="245ms" label="-30ms improvement" icon={Clock} color="text-emerald-500" />
                <StatsCard title="Flagged" value="3" label="Requires attention" icon={AlertCircle} color="text-rose-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#161b22]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Active Use Cases</h2>
                    <div className="space-y-3">
                        {useCases.slice(0, 3).map((uc) => (
                            <ActiveUseCaseRow key={uc.id} {...uc} />
                        ))}
                    </div>
                </div>

                <div className="bg-[#161b22]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
                    {/* ... existing recent activity code or placeholder ... */}
                    <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-slate-500 text-sm">
                        No recent evaluations running.
                    </div>
                </div>
            </div>
        </div>
    );
}

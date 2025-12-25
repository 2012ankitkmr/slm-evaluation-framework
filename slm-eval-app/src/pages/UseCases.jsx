import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Plus, FileText, BarChart3, Play } from 'lucide-react';

// Mock data to be replaced by API call (Fallback)
const MOCK_USE_CASES = [
    {
        id: 'GKH',
        name: "(GKH) General Knowledge Helper",
        description: "Evaluates ability to answer common sense questions using Chain of Thought.",
        dataset_count: 570,
        prompts: [{ name: "Evaluation Prompt" }]
    },
];

const UseCaseCard = ({ useCase, index, onRunEval, onExplore }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="group bg-[#161b22]/60 backdrop-blur-md border border-white/5 hover:border-purple-500/50 p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] relative overflow-hidden flex flex-col"
    >
        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
                <BarChart3 size={18} />
            </button>
        </div>

        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform duration-300">
            <Database size={24} />
        </div>

        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">{useCase.name}</h3>
        <p className="text-sm text-slate-400 mb-6 line-clamp-2 flex-1">{useCase.description}</p>

        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <FileText size={14} />
                    <span>{useCase.dataset_count} items</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onRunEval(useCase)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-600/20 active:scale-95 text-xs"
                >
                    <Play size={14} fill="currentColor" />
                    <span>Start Eval</span>
                </button>
                <button
                    onClick={() => onExplore(useCase.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium transition-all border border-white/10 text-xs"
                >
                    <Database size={14} />
                    <span>Explore</span>
                </button>
            </div>
        </div>
    </motion.div>
);

import { useOutletContext, useNavigate } from 'react-router-dom';

export default function UseCases() {
    const { openEvalModal } = useOutletContext();
    const navigate = useNavigate();
    const [useCases, setUseCases] = useState([]);

    const handleExplore = (id) => {
        navigate(`/use-cases/${id}/explorer`);
    };

    useEffect(() => {
        fetch('http://localhost:8000/use-cases')
            .then(res => res.json())
            .then(data => setUseCases(data))
            .catch(err => {
                console.error("Failed to fetch use cases:", err);
                setUseCases(MOCK_USE_CASES); // Fallback to mock
            });
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Use Cases</h1>
                    <p className="text-slate-400">Manage evaluation scenarios, datasets, and prompts.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/20">
                    <Plus size={18} />
                    <span>New Use Case</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {useCases.map((uc, i) => (
                    <UseCaseCard
                        key={uc.id}
                        useCase={uc}
                        index={i}
                        onRunEval={openEvalModal}
                        onExplore={handleExplore}
                    />
                ))}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group min-h-[240px]"
                >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus size={32} className="text-slate-400 group-hover:text-purple-400" />
                    </div>
                    <span className="text-slate-400 font-medium group-hover:text-white">Create New Use Case</span>
                </motion.button>
            </div>
        </div>
    );
}

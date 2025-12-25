import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Loader2 } from 'lucide-react';

export default function RunEvalModal({ isOpen, onClose, initialUseCase }) {
    const [loading, setLoading] = useState(false);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    // If we have initialUseCase, we use it. If not, we might need to select one (not implemented for simplicity, assumed triggered from Use Case context)

    // State for form values
    const [selectedPromptId, setSelectedPromptId] = useState('');

    // Fetch models on mount
    useEffect(() => {
        if (isOpen) {
            fetch('http://localhost:8000/models')
                .then(res => res.json())
                .then(data => {
                    setModels(data);
                    if (data.length > 0) {
                        setSelectedModel(data[0]);
                    }
                })
                .catch(console.error);
        }
    }, [isOpen]);

    // Effect to select first prompt if available when use case changes
    useEffect(() => {
        if (initialUseCase?.prompts?.length > 0) {
            setSelectedPromptId(initialUseCase.prompts[0].id);
        }
    }, [initialUseCase]);

    const handleRun = () => {
        setLoading(true);

        // Construct payload
        const payload = {
            model_name: selectedModel,
            use_case_id: initialUseCase?.id,
            prompt_id: selectedPromptId
        };

        fetch('http://localhost:8000/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                console.log("Evaluation started:", data);
                setTimeout(() => {
                    setLoading(false);
                    onClose();
                }, 1000);
            })
            .catch(err => {
                console.error("Eval failed:", err);
                setLoading(false);
            });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white">Run Evaluation</h2>
                                <p className="text-xs text-slate-400 mt-1">Use Case: <span className="text-purple-400 font-bold">{initialUseCase?.name}</span></p>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Model Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Select Model</label>
                                <select
                                    value={selectedModel}
                                    onChange={(e) => setSelectedModel(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                                >
                                    {models.map(model => (
                                        <option key={model} value={model}>{model}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Prompt Selection (from Use Case) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Select Prompt</label>
                                <select
                                    value={selectedPromptId}
                                    onChange={(e) => setSelectedPromptId(e.target.value)}
                                    className="w-full bg-[#0d1117] border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                                >
                                    {initialUseCase?.prompts?.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Dataset Info (Read only) */}
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Dataset Target</label>
                                <div className="w-full bg-[#0d1117]/50 border border-white/5 rounded-xl px-4 py-3 text-slate-500 text-sm">
                                    Full Dataset ({initialUseCase?.dataset_count} items)
                                </div>
                            </div>
                        </div>

                        <div className="p-6 pt-0 flex gap-3">
                            <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-400 hover:bg-white/5 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleRun}
                                disabled={loading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                                {loading ? 'Starting...' : 'Start Evaluation'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

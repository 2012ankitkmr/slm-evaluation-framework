import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TerminalSquare, Code2, Save, Play, Database, Split, Plus, Lock, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function Prompts() {
    const [useCases, setUseCases] = useState([]);
    const [selectedUseCase, setSelectedUseCase] = useState(null);
    const [selectedPrompt, setSelectedPrompt] = useState(null);

    // Editor State
    const [cotContent, setCotContent] = useState('');
    const [fewShotContent, setFewShotContent] = useState('');

    useEffect(() => {
        fetchUseCases();
    }, []);

    const fetchUseCases = () => {
        fetch('http://localhost:8000/use-cases')
            .then(res => res.json())
            .then(data => {
                setUseCases(data);
                // Preserve selection if possible
                if (selectedUseCase) {
                    const updatedUC = data.find(uc => uc.id === selectedUseCase.id);
                    if (updatedUC) {
                        setSelectedUseCase(updatedUC);
                        if (selectedPrompt) {
                            const updatedPrompt = updatedUC.prompts.find(p => p.id === selectedPrompt.id);
                            if (updatedPrompt) {
                                setSelectedPrompt(updatedPrompt);
                                return; // Keep current selection
                            } else {
                                // If deleted prompt was selected, select default or first
                                if (updatedUC.prompts.length > 0) {
                                    handlePromptSelect(updatedUC.prompts[0]);
                                } else {
                                    setSelectedPrompt(null);
                                }
                            }
                        }
                    }
                }
                // Fallback selection logic
                if (data.length > 0 && !selectedUseCase) {
                    const firstUC = data[0];
                    setSelectedUseCase(firstUC);
                    if (firstUC.prompts?.length > 0) {
                        handlePromptSelect(firstUC.prompts[0]);
                    }
                }
            })
            .catch(console.error);
    };

    const handleUseCaseSelect = (uc) => {
        setSelectedUseCase(uc);
        if (uc.prompts?.length > 0) {
            handlePromptSelect(uc.prompts[0]);
        } else {
            setSelectedPrompt(null);
            setCotContent('');
            setFewShotContent('');
        }
    };

    const handlePromptSelect = (prompt) => {
        setSelectedPrompt(prompt);
        setCotContent(prompt.cot_content || '');
        setFewShotContent(prompt.few_shot_content || '');
    };

    const handleAddPrompt = () => {
        if (!selectedUseCase) return;

        const newPrompt = {
            name: "New Custom Prompt",
            cot_content: "",
            few_shot_content: "",
            is_default: false
        };

        fetch(`http://localhost:8000/use-cases/${selectedUseCase.id}/prompts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPrompt)
        })
            .then(res => res.json())
            .then(savedPrompt => {
                fetchUseCases(); // Refresh list to get new state properly
            })
            .catch(console.error);
    };

    const handleDeletePrompt = (e, promptId) => {
        e.stopPropagation(); // Prevent selection
        if (!confirm("Are you sure you want to delete this prompt?")) return;

        fetch(`http://localhost:8000/use-cases/${selectedUseCase.id}/prompts/${promptId}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (res.ok) {
                    fetchUseCases();
                } else {
                    console.error("Failed to delete prompt");
                }
            })
            .catch(console.error);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Prompts</h1>
                <p className="text-slate-400">Configure evaluation prompts (CoT and Few Shot) for Use Cases.</p>
            </div>

            <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
                {/* Sidebar List - Use Cases & Prompts */}
                <div className="col-span-3 bg-[#161b22]/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Use Cases</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-4">
                        {useCases.map((uc) => (
                            <div key={uc.id} className="space-y-1">
                                <button
                                    onClick={() => handleUseCaseSelect(uc)}
                                    className={clsx(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                                        selectedUseCase?.id === uc.id
                                            ? "bg-purple-500/20 text-purple-300"
                                            : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    <Database size={14} />
                                    {uc.name}
                                </button>

                                {selectedUseCase?.id === uc.id && (
                                    <div className="pl-4 space-y-1 border-l border-white/10 ml-2">
                                        {uc.prompts?.map(prompt => (
                                            <button
                                                key={prompt.id}
                                                onClick={() => handlePromptSelect(prompt)}
                                                className={clsx(
                                                    "w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 justify-between group/item",
                                                    selectedPrompt?.id === prompt.id
                                                        ? "bg-blue-500/10 text-blue-400"
                                                        : "text-slate-500 hover:text-slate-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                    <TerminalSquare size={12} className="flex-shrink-0" />
                                                    <span className="truncate">{prompt.name}</span>
                                                </div>
                                                {prompt.is_default ? (
                                                    <Lock size={10} className="flex-shrink-0 opacity-50" />
                                                ) : (
                                                    <div
                                                        role="button"
                                                        onClick={(e) => handleDeletePrompt(e, prompt.id)}
                                                        className="opacity-0 group-hover/item:opacity-100 hover:text-red-400 transition-opacity p-1"
                                                    >
                                                        <Trash2 size={12} />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                        <button
                                            onClick={handleAddPrompt}
                                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-blue-400 hover:bg-blue-500/5 transition-all flex items-center gap-2"
                                        >
                                            <Plus size={12} />
                                            New Prompt
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div className="col-span-9 flex flex-col gap-6">
                    {selectedPrompt ? (
                        <motion.div
                            key={selectedPrompt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161b22]">
                                <div className="flex items-center gap-3">
                                    <Code2 size={18} className="text-blue-400" />
                                    <span className="font-mono text-sm text-slate-400">{selectedUseCase?.name} / <span className="text-slate-200">{selectedPrompt.name}</span></span>
                                    {selectedPrompt.is_default && (
                                        <span className="px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Lock size={10} /> Read Only
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {!selectedPrompt.is_default && (
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors">
                                            <Save size={14} />
                                            Save Config
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Dual Editor View */}
                            <div className="flex-1 flex divide-x divide-white/5 relative">
                                {selectedPrompt.is_default && (
                                    <div className="absolute inset-0 bg-slate-900/5 pointer-events-none z-10" />
                                )}
                                <div className="flex-1 flex flex-col">
                                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Chain of Thought Instructions
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            readOnly={selectedPrompt.is_default}
                                            value={cotContent}
                                            onChange={(e) => setCotContent(e.target.value)}
                                            className={clsx(
                                                "absolute inset-0 w-full h-full bg-transparent p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed selection:bg-blue-500/30",
                                                selectedPrompt.is_default ? "cursor-not-allowed opacity-75" : ""
                                            )}
                                            spellCheck="false"
                                            placeholder="Enter CoT instructions..."
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        Few Shot Examples
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            readOnly={selectedPrompt.is_default}
                                            value={fewShotContent}
                                            onChange={(e) => setFewShotContent(e.target.value)}
                                            className={clsx(
                                                "absolute inset-0 w-full h-full bg-[#0d1117] p-4 text-slate-300 font-mono text-sm resize-none focus:outline-none leading-relaxed selection:bg-blue-500/30",
                                                selectedPrompt.is_default ? "cursor-not-allowed opacity-75" : ""
                                            )}
                                            spellCheck="false"
                                            placeholder="Enter few-shot examples..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-500">
                            Select a prompt configuration to edit
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

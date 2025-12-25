import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';

export default function Visualizer() {
    const [results, setResults] = useState([]);
    const [useCases, setUseCases] = useState([]);
    const [selectedUseCaseId, setSelectedUseCaseId] = useState('');
    const [chartData, setChartData] = useState([]);
    const [availableModels, setAvailableModels] = useState([]);

    useEffect(() => {
        // Fetch use cases and results in parallel
        Promise.all([
            fetch('http://localhost:8000/use-cases').then(res => res.json()),
            fetch('http://localhost:8000/results').then(res => res.json())
        ]).then(([ucs, res]) => {
            setUseCases(ucs);
            setResults(res);
            if (ucs.length > 0) {
                setSelectedUseCaseId(ucs[0].id);
            }
        }).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedUseCaseId || results.length === 0) {
            setChartData([]);
            setAvailableModels([]);
            return;
        }

        // Filter results for selected use case
        const filteredResults = results.filter(r => r.use_case_id === selectedUseCaseId);

        // Group by model to get latest score
        const modelsMap = {};
        const uniqueModels = new Set();

        filteredResults.forEach(r => {
            uniqueModels.add(r.model_name);
            // If multiple results for same model, for now just show latest (by timestamp if available)
            if (!modelsMap[r.model_name] || r.timestamp > modelsMap[r.model_name].timestamp) {
                modelsMap[r.model_name] = r;
            }
        });

        const data = [{
            name: useCases.find(uc => uc.id === selectedUseCaseId)?.name || selectedUseCaseId,
            ...Object.keys(modelsMap).reduce((acc, m) => {
                acc[m] = (modelsMap[m].score * 100).toFixed(1);
                return acc;
            }, {})
        }];

        setChartData(data);
        setAvailableModels(Array.from(uniqueModels));
    }, [selectedUseCaseId, results, useCases]);

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28'];

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Visualizer</h1>
                    <p className="text-slate-400">Compare model performance for each use case.</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 font-medium">Use Case:</span>
                    <select
                        value={selectedUseCaseId}
                        onChange={(e) => setSelectedUseCaseId(e.target.value)}
                        className="bg-[#161b22] border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500/50 min-w-[200px]"
                    >
                        {useCases.map(uc => (
                            <option key={uc.id} value={uc.id}>{uc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 bg-[#161b22]/60 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col min-h-0">
                {chartData.length === 0 || availableModels.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
                        <BarChart3 size={48} className="opacity-20" />
                        <p>No evaluation data available for this use case.</p>
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                                barSize={60}
                                barGap={20}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    unit="%"
                                    domain={[0, 100]}
                                    tick={{ fill: '#94a3b8' }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        backdropFilter: 'blur(8px)',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    height={36}
                                    wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px' }}
                                />
                                {availableModels.map((model, idx) => (
                                    <Bar
                                        key={model}
                                        dataKey={model}
                                        fill={colors[idx % colors.length]}
                                        radius={[6, 6, 0, 0]}
                                        animationDuration={1500}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Database, TerminalSquare, Box, Activity, Table, BarChart3 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
                isActive
                    ? "bg-blue-600/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-blue-500/30"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 dark:hover:bg-white/5"
            )
        }
    >
        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span className="font-medium">{children}</span>
    </NavLink>
);

const Layout = ({ children, Outlet }) => {
    // React Router passes outlet via context usually, but here we use Outlet component from props or import
    // Wait, in App.jsx I used <Layout> wrapping Routes? No, I used <Route element={<Layout />}>
    // So I need to import Outlet here.
    return (
        <div className="flex min-h-screen bg-[#0f1117] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-72 fixed h-full bg-[#161b22]/80 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Box className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            SLM Eval
                        </h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">FRAMEWORK</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                    <NavItem to="/datasets" icon={Database}>Datasets</NavItem>
                    <NavItem to="/prompts" icon={TerminalSquare}>Prompts</NavItem>
                </nav>

                <div className="mt-auto pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/10">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-emerald-400">System Operational</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* We need to render the child route here */}
                    {/* In App.jsx, I didn't pass Outlet prop. I need to import it. */}
                    <import_Outlet_Placeholder />
                </div>
            </main>
        </div>
    );
};

// Fixing the import for the file write
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Play } from 'lucide-react';
import RunEvalModal from './RunEvalModal';

export default function LayoutWrapper() {
    return (
        <LayoutWrapperInternal />
    )
}

function LayoutWrapperInternal() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUseCase, setSelectedUseCase] = useState(null);

    const openEvalModal = (useCase = null) => {
        setSelectedUseCase(useCase);
        setIsModalOpen(true);
    };

    return (
        <div className="flex min-h-screen bg-[#0f1117] text-slate-200 font-sans selection:bg-blue-500/30">
            <aside className="w-72 fixed h-full bg-[#161b22]/80 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 z-50">
                <div className="flex items-center gap-3 px-2 mb-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Box className="text-white w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            SLM Eval
                        </h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">FRAMEWORK</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                    <NavItem to="/use-cases" icon={Database}>Use Cases</NavItem>
                    <NavItem to="/prompts" icon={TerminalSquare}>Prompts</NavItem>
                    <div className="pt-4 pb-2">
                        <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Analysis</div>
                        <NavItem to="/activity" icon={Activity}>Activity</NavItem>
                        <NavItem to="/results" icon={Table}>Results</NavItem>
                        <NavItem to="/visualizer" icon={BarChart3}>Visualizer</NavItem>
                    </div>
                </nav>

                <div className="mt-auto space-y-4">
                    <button
                        onClick={() => openEvalModal(null)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95"
                    >
                        <Play size={18} fill="currentColor" />
                        <span>Run Evaluation</span>
                    </button>

                    <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/10">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-medium text-emerald-400">System Operational</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 ml-72 p-8 min-h-screen">
                <Outlet context={{ openEvalModal }} />
            </main>

            <RunEvalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialUseCase={selectedUseCase}
            />
        </div>
    )
}

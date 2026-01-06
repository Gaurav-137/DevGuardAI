import React, { useState } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  Users, BarChart3, PlusCircle, Lightbulb, ShieldCheck,
  Settings, LineChart as TrendIcon, HelpCircle, LayoutGrid
} from 'lucide-react';
import GlobalDashboard from './pages/GlobalDashboard';
import Dashboard from './pages/Dashboard';
import Developers from './pages/Developers';
import ActivityLog from './pages/ActivityLog';
import Insights from './pages/Insights';
import Trends from './pages/Trends';

const App: React.FC = () => {
  const [selectedDevId, setSelectedDevId] = useState<number | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col md:flex-row min-h-screen bg-bg text-primary selection:bg-secondary/30 font-sans">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-72 bg-primary border-r border-primary/50 flex flex-col sticky top-0 h-screen z-30 shadow-2xl">
          <div className="p-8 flex items-center gap-4 border-b border-primary/50">
            <div className="p-2 bg-secondary rounded-xl shadow-lg transform transition-transform hover:rotate-6">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-light">DEVGUARD<span className="text-secondary">AI</span></span>
          </div>

          <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest ml-2 mb-4">Operations</p>
            <SidebarLink to="/dashboard" icon={<LayoutGrid className="w-5 h-5" />} label="Dashboard" />
            <SidebarLink to="/developers" icon={<Users className="w-5 h-5" />} label="Developers Directory" />
            <SidebarLink to="/trends" icon={<TrendIcon className="w-5 h-5" />} label="Team Insights" />
            <SidebarLink to="/activity" icon={<PlusCircle className="w-5 h-5" />} label="Developers Activity" />
            <SidebarLink to="/insights" icon={<Lightbulb className="w-5 h-5" />} label="AI Insights" />
          </nav>

          {/* Profile & Settings at Bottom-Left */}
          <div className="p-6 border-t border-primary/50 space-y-2">
            <button
              onClick={() => setShowAdminModal(true)}
              className="w-full flex items-center gap-3 p-3 hover:bg-secondary/20 rounded-xl transition-all text-sm font-bold text-secondary hover:text-light group"
            >
              <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
              Admin Control
            </button>
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center gap-3 p-3 bg-secondary/10 hover:bg-secondary rounded-xl transition-all text-left group hover:scale-[1.02] duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary font-black text-xs shadow-lg">AR</div>
              <div className="flex-1">
                <p className="text-xs font-black text-light">Alex Rivera</p>
                <p className="text-[9px] font-bold text-secondary uppercase group-hover:text-light">Sr. Administrator</p>
              </div>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden relative bg-bg">
          <header className="bg-bg/80 backdrop-blur-xl h-20 border-b border-primary/20 flex items-center justify-between px-10 sticky top-0 z-20">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] text-primary brightness-125 drop-shadow-[0_0_12px_rgba(80,75,56,0.4)]">
              Enterprise Operations Center
            </h1>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-secondary/30 text-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-secondary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(185,178,138,0.5)]" />
                Live Feed Active
              </div>
              <button className="text-secondary hover:text-primary transition-colors p-2 hover:bg-light rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </header>

          <div className="p-8 md:p-12 max-w-[1600px] mx-auto min-h-[calc(100vh-80px)]">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<GlobalDashboard />} />
              <Route path="/dashboard/:devId" element={<Dashboard />} />
              <Route path="/trends" element={<Trends />} />
              <Route path="/developers" element={<Developers onSelect={setSelectedDevId} />} />
              <Route path="/activity" element={<ActivityLog />} />
              <Route path="/insights" element={<Insights selectedDevId={selectedDevId} />} />
            </Routes>
          </div>
        </main>

        {/* Modals */}
        {showAdminModal && <SimpleModal title="Admin Settings" onClose={() => setShowAdminModal(false)} />}
        {showProfileModal && <SimpleModal title="User Profile" onClose={() => setShowProfileModal(false)} />}
      </div>
    </HashRouter>
  );
};

const SidebarLink = ({ to, icon, label }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) => `flex items-center gap-3 p-4 rounded-xl transition-all duration-300 font-bold group hover:scale-[1.02] ${isActive ? 'bg-secondary text-primary shadow-xl ring-2 ring-primary/5' : 'text-secondary hover:bg-secondary/20 hover:text-light'}`}
  >
    <span className="group-hover:scale-110 transition-transform duration-300">{icon}</span>
    <span className="tracking-tight">{label}</span>
  </NavLink>
);

const SimpleModal = ({ title, onClose }: any) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-primary/60 animate-in fade-in duration-300">
    <div className="bg-bg border border-primary w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary"></div>
      <h3 className="text-2xl font-black mb-4 text-primary uppercase tracking-tight">{title}</h3>
      <p className="text-secondary text-sm mb-8 font-bold">Access restricted to Tier-1 Operational personnel. Management console initializing...</p>
      <div className="space-y-4">
        <div className="h-10 bg-light rounded-xl animate-pulse w-full border border-primary/5"></div>
        <div className="h-10 bg-light rounded-xl animate-pulse w-3/4 border border-primary/5"></div>
      </div>
      <button
        onClick={onClose}
        className="mt-10 w-full bg-primary hover:bg-secondary text-light hover:text-primary font-black py-4 rounded-xl shadow-lg transition-all active:scale-95"
      >
        Close Terminal
      </button>
    </div>
  </div>
);

export default App;

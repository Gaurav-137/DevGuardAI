
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertTriangle, Clock, GitCommit, CheckSquare, Sparkles, RefreshCw, Lightbulb, GitPullRequest, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import { generateDeveloperInsight } from '../services/gemini';
import { DashboardData } from '../types';

const Dashboard: React.FC = () => {
  const { devId } = useParams<{ devId: string }>();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (devId) loadData(parseInt(devId));
  }, [devId]);

  const loadData = async (id: number) => {
    setLoading(true);
    try {
      const result = await apiService.getDashboardData(id);
      setData(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsight = async () => {
    if (!data || !devId) return;
    setGenerating(true);
    try {
      const insightRes = await generateDeveloperInsight(data.developer.name, data.latestMetric, data.activities);
      const saved = await apiService.saveInsight({
        developer_id: parseInt(devId),
        insight_text: insightRes.text,
        severity: insightRes.severity
      });
      setData(prev => prev ? { ...prev, insights: [saved, ...prev.insights] } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <RefreshCw className="w-12 h-12 text-secondary animate-spin" />
      <p className="text-primary/60 font-black tracking-widest text-[10px] uppercase">Retrieving Subject Signal...</p>
    </div>
  );

  if (!data) return <div className="text-primary p-10 font-bold">Subject registry entry 404.</div>;

  const risk = data.latestMetric;
  const scorePercent = Math.round(risk.burnout_score * 100);
  const riskStyles = {
    High: 'text-red-900 bg-[#EBE5C2] border-[#504B38] shadow-[#504B38]/10',
    Medium: 'text-[#504B38] bg-[#B9B28A]/30 border-[#B9B28A] shadow-[#B9B28A]/10',
    Low: 'text-[#504B38] bg-[#F8F3D9] border-[#504B38]/30 shadow-[#504B38]/5'
  }[risk.risk_level];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Profile */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-3xl font-black text-bg shadow-2xl transition-transform hover:rotate-3 duration-500 ring-4 ring-bg">
            {data.developer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-5xl font-black text-primary tracking-tighter">{data.developer.name}</h2>
            <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mt-2 flex items-center gap-2">
              <span className="bg-primary/10 px-2 py-0.5 rounded text-primary">{data.developer.role}</span>
              <span className="text-primary/30">|</span>
              {data.developer.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerateInsight}
          disabled={generating}
          className="group flex items-center gap-3 bg-primary text-bg px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-secondary hover:text-primary transition-all active:scale-95 disabled:opacity-50 ring-2 ring-primary/10 hover:ring-primary/50"
        >
          <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : 'group-hover:rotate-12 transition-transform duration-500'}`} />
          {generating ? 'Processing Tier-1 Analysis...' : 'Initiate Deep Analysis'}
        </button>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className={`xl:col-span-2 p-10 rounded-[2.5rem] border-2 shadow-2xl transition-all hover:scale-[1.01] duration-500 group relative overflow-hidden ${riskStyles}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="w-48 h-48" />
          </div>

          <div className="flex justify-between items-center mb-10 relative z-10">
            <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
              Burnout Probability Matrix
            </span>
            <AlertTriangle className="w-8 h-8 opacity-60 group-hover:animate-bounce" />
          </div>
          <div className="flex items-baseline gap-6 mb-12 relative z-10">
            <span className="text-9xl font-black tracking-tighter">{scorePercent}%</span>
            <div>
              <p className="text-3xl font-black uppercase tracking-tight">{risk.risk_level} Risk Level</p>
              <p className="text-[10px] font-bold opacity-60 uppercase tracking-[0.2em] mt-1 border-t border-current/20 pt-2 inline-block">Heuristic Threshold Verification</p>
            </div>
          </div>
          <div className="h-6 bg-primary/10 rounded-full overflow-hidden border border-primary/5 relative z-10">
            <div
              className="h-full bg-current transition-all duration-[2000ms] ease-out shadow-[0_0_15px_rgba(0,0,0,0.1)] relative"
              style={{ width: `${scorePercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        </div>

        <div className="bg-light border border-primary/20 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:scale-[1.01] transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <Lightbulb className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black text-primary mb-6 flex items-center gap-3 uppercase tracking-tighter">
              <Sparkles className="w-5 h-5 text-secondary" /> AI Diagnostic
            </h3>
            <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
              {data.insights.map(i => (
                <div key={i.id} className="bg-bg/50 border border-primary/10 p-6 rounded-2xl backdrop-blur-sm hover:border-primary/40 transition-colors shadow-sm">
                  <p className="text-[10px] font-black text-secondary mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    {new Date(i.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-primary leading-relaxed font-bold border-l-2 border-secondary pl-4">
                    "{i.insight_text}"
                  </p>
                </div>
              ))}
              {data.insights.length === 0 && (
                <p className="text-primary/60 font-bold italic text-center py-20 flex flex-col items-center gap-4">
                  <Sparkles className="w-8 h-8 opacity-20" />
                  No diagnostic signals available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon={<Clock />} label="Engagement" value={data.activities.reduce((s, a) => s + a.work_hours, 0).toFixed(0)} unit="HR" />
        <StatCard icon={<GitCommit />} label="Git Velocity" value={data.activities.reduce((s, a) => s + a.commits, 0)} unit="PUSH" />
        <StatCard icon={<GitPullRequest />} label="Peer Review" value={data.activities.reduce((s, a) => s + a.pull_requests, 0)} unit="PR" />
        <StatCard icon={<CheckSquare />} label="Efficiency" value={data.activities.reduce((s, a) => s + a.tasks_completed, 0)} unit="TASK" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20">
        <div className="bg-primary border border-primary/30 p-10 rounded-[2.5rem] shadow-2xl transition-all hover:scale-[1.01] hover:border-primary duration-500">
          <h3 className="text-lg font-black text-bg uppercase tracking-widest mb-10 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-secondary" /> Productivity Flow
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...data.activities].reverse()}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--c-secondary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--c-secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--c-secondary)" strokeOpacity={0.2} />
                <XAxis dataKey="activity_date" axisLine={false} tickLine={false} tick={{ fill: 'var(--c-light)', fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--c-light)', fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--c-light)', border: '1px solid var(--c-secondary)', borderRadius: '16px', color: 'var(--c-primary)' }}
                />
                <Area type="monotone" dataKey="commits" stroke="var(--c-secondary)" strokeWidth={5} fill="url(#chartGrad)" animationDuration={2000} />
                <Area type="monotone" dataKey="tasks_completed" stroke="var(--c-bg)" strokeWidth={5} fillOpacity={0} animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-primary border border-primary/30 p-10 rounded-[2.5rem] shadow-2xl transition-all hover:scale-[1.01] hover:border-primary duration-500">
          <h3 className="text-lg font-black text-bg uppercase tracking-widest mb-10 flex items-center gap-3">
            <CheckSquare className="w-5 h-5 text-secondary" /> Operational Accuracy
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...data.activities].reverse()}>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="var(--c-secondary)" strokeOpacity={0.2} />
                <XAxis dataKey="activity_date" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--c-light)', border: 'none', borderRadius: '16px', color: 'var(--c-primary)' }}
                  cursor={{ fill: 'var(--c-secondary)', fillOpacity: 0.1 }}
                />
                <Bar dataKey="tasks_completed" fill="var(--c-secondary)" radius={[8, 8, 0, 0]} animationDuration={2000} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, unit }: any) => (
  <div className="bg-light border border-primary/50 p-8 rounded-[2rem] shadow-xl transition-all group hover:scale-[1.03] duration-300">
    <div className="flex justify-between items-start mb-6">
      <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest">{label}</span>
      <div className="p-2.5 bg-primary rounded-xl group-hover:scale-110 group-hover:bg-secondary transition-all duration-300">
        <div className="w-5 h-5 text-bg">{icon}</div>
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-4xl font-black text-primary">{value}</span>
      <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);

export default Dashboard;


import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, AlertTriangle, TrendingUp, Zap, Target, LayoutGrid } from 'lucide-react';
import { apiService } from '../services/api';
import { ActivityRecord, Developer } from '../types';
import { formatChartDate } from '../utils/dateUtils';

const GlobalDashboard: React.FC = () => {
    const [activities, setActivities] = useState<ActivityRecord[]>([]);
    const [devs, setDevs] = useState<Developer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [acts, developers] = await Promise.all([
                apiService.getAllActivities(),
                apiService.getDevelopers()
            ]);
            setActivities(acts);
            setDevs(developers);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Users className="w-12 h-12 text-primary animate-bounce" />
            <p className="text-secondary font-black tracking-widest text-[10px] uppercase">Synthesizing Command Data...</p>
        </div>
    );

    // Aggregations
    const totalCommits = activities.reduce((acc, curr) => acc + (Number(curr.commits) || 0), 0);
    const totalTasks = activities.reduce((acc, curr) => acc + (Number(curr.tasks_completed) || 0), 0);
    const totalHours = activities.reduce((acc, curr) => acc + (Number(curr.work_hours) || 0), 0);

    // Chart Data preparation
    const dailyActivity = activities.reduce((acc: any, curr) => {
        if (!acc[curr.activity_date]) acc[curr.activity_date] = { date: curr.activity_date, output: 0 };
        acc[curr.activity_date].output += (curr.commits + curr.tasks_completed);
        return acc;
    }, {});
    const chartData = Object.values(dailyActivity)
        .sort((a: any, b: any) => a.date.localeCompare(b.date))
        .slice(-14)
        .map((item: any) => ({
            ...item,
            displayDate: formatChartDate(item.date)
        }));

    // Status Distribution
    const roleDistribution = devs.reduce((acc: Record<string, number>, curr) => {
        acc[curr.role] = (acc[curr.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const pieData = Object.entries(roleDistribution).map(([name, value]) => ({ name, value }));
    const COLORS = ['#504B38', '#B9B28A', '#EBE5C2', '#D4CFA5'];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="border-b border-primary/20 pb-8">
                <h2 className="text-5xl font-black text-primary tracking-tighter uppercase flex items-center gap-4">
                    <LayoutGrid className="w-12 h-12 text-secondary" />
                    Dashboard
                </h2>
                <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mt-3 pl-1">
                    Operations Overview & Developers Status
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard icon={<Users />} label="Active Agents" value={devs.length} sub="Developers Strength" />
                <KPICard icon={<Zap />} label="Total Velocity" value={totalCommits} sub="Global Commits" />
                <KPICard icon={<Target />} label="Task Execution" value={totalTasks} sub="Completed Directives" />
                <KPICard icon={<Activity />} label="Operational Hours" value={Math.round(totalHours)} sub="Total Uptime" />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Velocity Chart */}
                <div className="lg:col-span-2 bg-light border border-primary/20 p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-48 h-48 text-primary" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-end mb-8">
                            <h3 className="text-2xl font-black text-primary uppercase tracking-tight">System Output Velocity</h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest bg-bg px-3 py-1 rounded-lg">
                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                Live Telemetry
                            </div>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--c-primary)" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="var(--c-primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--c-primary)" strokeOpacity={0.1} />
                                    <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: 'var(--c-primary)', fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip
                                        contentStyle={{ background: 'var(--c-bg)', border: '1px solid var(--c-primary)', borderRadius: '12px', color: 'var(--c-primary)' }}
                                        labelStyle={{ color: 'var(--c-secondary)', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                                    />
                                    <Area type="monotone" dataKey="output" stroke="var(--c-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorOutput)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-primary text-bg p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <h3 className="text-xl font-black uppercase tracking-widest mb-8 relative z-10">Fleet Composition</h3>
                    <div className="h-[300px] relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--c-bg)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'var(--c-bg)', border: 'none', borderRadius: '12px', color: 'var(--c-primary)' }}
                                    itemStyle={{ color: 'var(--c-primary)', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-3 relative z-10">
                        {pieData.map((entry, index) => (
                            <div key={entry.name} className="flex items-center justify-between text-xs font-bold uppercase tracking-wider border-b border-bg/10 pb-2 last:border-0 hover:bg-white/5 p-2 rounded transition-colors cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    {entry.name}
                                </div>
                                <span className="opacity-60">{entry.value} Units</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ icon, label, value, sub }: any) => (
    <div className="bg-bg border border-primary/10 p-6 rounded-[2rem] shadow-lg hover:border-primary/50 transition-all group">
        <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-light rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300 shadow-inner">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">{sub}</span>
        </div>
        <div className="space-y-1">
            <div className="text-4xl font-black text-primary tracking-tighter">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="text-xs font-bold text-primary/60 uppercase tracking-wide">{label}</div>
        </div>
    </div>
);

export default GlobalDashboard;

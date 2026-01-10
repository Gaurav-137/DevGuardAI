
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ComposedChart, PieChart, Pie, Cell } from 'recharts';
import { Calendar, BarChart2, Activity, Users, Download, TrendingUp, Award, Clock, GitCommit, Target } from 'lucide-react';
import { apiService } from '../services/api';
import { ActivityRecord, Developer } from '../types';
import { formatChartDate } from '../utils/dateUtils';

const Trends: React.FC = () => {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [devs, setDevs] = useState<Developer[]>([]);
  const [devFilter, setDevFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedDevId, setSelectedDevId] = useState<string>('all');
  const [filterRange, setFilterRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [acts, developers] = await Promise.all([
      apiService.getAllActivities(),
      apiService.getDevelopers()
    ]);
    setActivities(acts);
    setDevs(developers);
    setLoading(false);
  };

  const getFilteredData = () => {
    let filtered = activities;
    if (selectedDevId !== 'all') {
      filtered = activities.filter(a => a.developer_id === parseInt(selectedDevId));
    }

    const grouped = filtered.reduce((acc: any, curr) => {
      const date = curr.activity_date;
      if (!acc[date]) {
        acc[date] = { date, commits: 0, pull_requests: 0, tasks_completed: 0, meetings: 0, work_hours: 0, pending_tasks: 0 };
      }
      acc[date].commits += Number(curr.commits) || 0;
      acc[date].pull_requests += Number(curr.pull_requests) || 0;
      acc[date].tasks_completed += Number(curr.tasks_completed) || 0;
      acc[date].meetings += Number(curr.meetings) || 0;
      acc[date].work_hours += Number(curr.work_hours) || 0;
      acc[date].pending_tasks += Number(curr.pending_tasks) || 0;
      return acc;
    }, {});

    const sorted = Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
    const result = filterRange === 'day' ? sorted.slice(-1) : filterRange === 'week' ? sorted.slice(-7) : sorted.slice(-30);
    // Format dates for display
    return result.map((item: any) => ({
      ...item,
      displayDate: formatChartDate(item.date),
      date: item.date // Keep original for sorting
    }));
  };

  const getTeamMetrics = () => {
    const data = getFilteredData();
    const totalCommits = data.reduce((sum: number, d: any) => sum + (Number(d.commits) || 0), 0);
    const totalTasks = data.reduce((sum: number, d: any) => sum + (Number(d.tasks_completed) || 0), 0);
    const totalHours = data.reduce((sum: number, d: any) => sum + (Number(d.work_hours) || 0), 0);
    const totalPRs = data.reduce((sum: number, d: any) => sum + (Number(d.pull_requests) || 0), 0);
    const avgHoursPerDay = data.length > 0 ? (totalHours / data.length).toFixed(1) : '0';

    return { totalCommits, totalTasks, totalHours, totalPRs, avgHoursPerDay };
  };

  const getTopPerformers = () => {
    const performanceMap = activities.reduce((acc: any, curr) => {
      const devId = curr.developer_id;
      if (!acc[devId]) {
        acc[devId] = { commits: 0, tasks: 0, prs: 0 };
      }
      acc[devId].commits += curr.commits;
      acc[devId].tasks += curr.tasks_completed;
      acc[devId].prs += curr.pull_requests;
      return acc;
    }, {});

    return Object.entries(performanceMap)
      .map(([id, stats]: [string, any]) => ({
        id: parseInt(id),
        name: devs.find(d => d.id === parseInt(id))?.name || 'Unknown',
        score: stats.commits + stats.tasks + stats.prs
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const downloadCSV = () => {
    const data = getFilteredData();
    const headers = "Date,Commits,PRs,Tasks,Meetings,WorkHours,Pending\n";
    const rows = data.map((d: any) => `${d.date},${d.commits},${d.pull_requests},${d.tasks_completed},${d.meetings},${d.work_hours},${d.pending_tasks}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DevGuard_Intelligence_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const chartData = getFilteredData();
  const metrics = getTeamMetrics();
  const topPerformers = getTopPerformers();

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Activity className="w-12 h-12 text-secondary animate-pulse" />
      <p className="text-secondary font-black tracking-widest text-[10px] uppercase">Aggregating Signal Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <div>
          <h2 className="text-5xl font-black text-primary tracking-tighter flex items-center gap-4">
            <TrendingUp className="w-12 h-12 text-secondary" />
            TEAM INSIGHTS
          </h2>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mt-2 pl-1">Operational Telemetry Across Developers Registry</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-bg/60 p-2.5 rounded-2xl border border-primary/30 shadow-2xl">
          <div className="flex items-center gap-3 px-4 border-r border-primary/30">
            <Users className="w-5 h-5 text-secondary" />
            <div className="flex flex-col">
              <div className="relative">
                <select
                  id="developer_filter"
                  name="developer_filter"
                  value={selectedDevId}
                  onChange={(e) => setSelectedDevId(e.target.value)}
                  className="w-80 bg-white border border-primary/20 text-primary text-sm font-black outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer py-2 px-3 rounded-2xl appearance-none shadow-sm transition-all hover:border-primary/50"
                >
                  <option value="all" className="bg-white text-primary font-bold">Entire Developers</option>
                  {devs.filter(d => d.name.toLowerCase().includes(devFilter.toLowerCase())).map(d => (
                    <option key={d.id} value={d.id.toString()} className="bg-white text-primary font-bold">{d.name} — {d.role}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-bg/20 p-1 rounded-xl">
            {(['day', 'week', 'month'] as const).map(range => (
              <button
                key={range}
                onClick={() => setFilterRange(range)}
                className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterRange === range ? 'bg-secondary text-primary shadow-lg' : 'text-secondary hover:text-primary'}`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={downloadCSV}
            className="p-3 bg-primary/10 text-primary hover:bg-primary hover:text-light rounded-xl transition-all shadow-lg active:scale-95 group"
            title="Export CSV"
          >
            <Download className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        </div>
      </div>

      {/* Team Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={<GitCommit className="w-6 h-6" />} label="Total Commits" value={metrics.totalCommits} color="primary" />
        <MetricCard icon={<Target className="w-6 h-6" />} label="Tasks Completed" value={metrics.totalTasks} color="secondary" />
        <MetricCard icon={<Clock className="w-6 h-6" />} label="Total Hours" value={`${metrics.totalHours}h`} color="primary" />
        <MetricCard icon={<Award className="w-6 h-6" />} label="Avg Hours/Day" value={`${metrics.avgHoursPerDay}h`} color="secondary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-light border border-primary p-12 rounded-[3rem] shadow-2xl transition-all hover:scale-[1.002] duration-500">
          <div className="flex justify-between items-center mb-16">
            <h3 className="text-xl font-black text-primary uppercase tracking-widest flex items-center gap-4">
              <Activity className="w-6 h-6 text-secondary" /> Matrix Correlation
            </h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="text-[10px] font-black text-secondary uppercase">Commits</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary"></div><span className="text-[10px] font-black text-secondary uppercase">Tasks</span></div>
            </div>
          </div>

          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="var(--c-primary)" opacity={0.1} />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fill: 'var(--c-primary)', fontSize: 11, fontWeight: 'black' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--c-primary)', fontSize: 11, fontWeight: 'black' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', background: 'var(--c-primary)', color: 'var(--c-light)' }}
                />
                <Bar dataKey="tasks_completed" fill="var(--c-secondary)" radius={[8, 8, 0, 0]} barSize={28} animationDuration={2500} />
                <Line type="monotone" dataKey="commits" stroke="var(--c-primary)" strokeWidth={6} dot={{ r: 8, fill: 'var(--c-light)', strokeWidth: 4, stroke: 'var(--c-primary)' }} animationDuration={2000} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-primary text-bg p-10 rounded-[3rem] shadow-2xl">
          <h3 className="text-xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
            <Award className="w-6 h-6 text-secondary" />
            Top Performers
          </h3>
          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <div key={performer.id} className="flex items-center justify-between bg-light/10 p-4 rounded-2xl hover:bg-light/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-secondary text-primary' : 'bg-bg/20 text-bg'}`}>
                    #{index + 1}
                  </div>
                  <span className="font-bold text-sm">{performer.name}</span>
                </div>
                <span className="text-xs font-black bg-bg/20 px-3 py-1 rounded-lg">{performer.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="bg-light/30 border border-primary/20 p-10 rounded-[3rem] shadow-xl">
        <h3 className="text-xl font-black text-primary uppercase tracking-widest mb-8">Activity Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-bg p-6 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-black text-secondary uppercase tracking-wider mb-2">Pull Requests</p>
            <p className="text-3xl font-black text-primary">{metrics.totalPRs}</p>
          </div>
          <div className="bg-bg p-6 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-black text-secondary uppercase tracking-wider mb-2">Active Days</p>
            <p className="text-3xl font-black text-primary">{chartData.length}</p>
          </div>
          <div className="bg-bg p-6 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-black text-secondary uppercase tracking-wider mb-2">Team Size</p>
            <p className="text-3xl font-black text-primary">{devs.length}</p>
          </div>
          <div className="bg-bg p-6 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-black text-secondary uppercase tracking-wider mb-2">Total Output</p>
            <p className="text-3xl font-black text-primary">{metrics.totalCommits + metrics.totalTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color }: any) => (
  <div className={`bg-bg border border-${color}/10 p-8 rounded-[2rem] shadow-xl hover:scale-105 transition-all duration-300 group hover:border-${color}/30`}>
    <div className="flex items-center gap-5">
      <div className={`p-4 bg-light rounded-2xl group-hover:bg-${color === 'primary' ? 'secondary' : 'primary'} transition-colors text-${color}`}>{icon}</div>
      <div>
        <div className="text-3xl font-black text-primary leading-none">{value}</div>
        <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mt-2">{label}</div>
      </div>
    </div>
  </div>
);

export default Trends;


import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, ComposedChart } from 'recharts';
import { Calendar, BarChart2, Activity, Users, Download, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import { ActivityRecord, Developer } from '../types';

const Trends: React.FC = () => {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [devs, setDevs] = useState<Developer[]>([]);
  const [devFilter, setDevFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedDevId, setSelectedDevId] = useState<string>('all');
  const [filterRange, setFilterRange] = useState<'week' | 'month'>('week');

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
        acc[date] = { date, commits: 0, pull_requests: 0, tasks_completed: 0, meetings: 0, work_hours: 0 };
      }
      acc[date].commits += curr.commits;
      acc[date].pull_requests += curr.pull_requests;
      acc[date].tasks_completed += curr.tasks_completed;
      acc[date].meetings += curr.meetings;
      acc[date].work_hours += curr.work_hours;
      return acc;
    }, {});

    const sorted = Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
    return filterRange === 'week' ? sorted.slice(-7) : sorted.slice(-30);
  };

  const downloadCSV = () => {
    const data = getFilteredData();
    const headers = "Date,Commits,PRs,Tasks,Meetings,WorkHours\n";
    const rows = data.map((d: any) => `${d.date},${d.commits},${d.pull_requests},${d.tasks_completed},${d.meetings},${d.work_hours}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DevGuard_Intelligence_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const chartData = getFilteredData();

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Activity className="w-12 h-12 text-secondary animate-pulse" />
      <p className="text-secondary font-black tracking-widest text-[10px] uppercase">Aggregating Signal Analytics...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
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
            {(['week', 'month'] as const).map(range => (
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

      <div className="grid grid-cols-1 gap-12">
        <div className="bg-light border border-primary p-12 rounded-[3rem] shadow-2xl transition-all hover:scale-[1.002] duration-500">
          <div className="flex justify-between items-center mb-16">
            <h3 className="text-xl font-black text-primary uppercase tracking-widest flex items-center gap-4">
              <Activity className="w-6 h-6 text-secondary" /> Matrix Correlation
            </h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div><span className="text-[10px] font-black text-secondary uppercase">Commits</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary"></div><span className="text-[10px] font-black text-secondary uppercase">Tasks</span></div>
            </div>
          </div>

          <div className="h-[550px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="var(--c-primary)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--c-primary)', fontSize: 11, fontWeight: 'black' }} />
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
      </div>
    </div>
  );
};

export default Trends;

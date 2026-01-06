
import React, { useState, useEffect } from 'react';
import {
  Save,
  ClipboardList,
  CheckCircle2,
  History,
  Edit3,
  Trash2,
  Calendar as CalendarIcon,
  Users,
  Clock,
  TrendingUp,
  CheckSquare
} from 'lucide-react';
import { apiService } from '../services/api';
import { Developer, ActivityRecord } from '../types';


const ActivityLog: React.FC = () => {
  const [devs, setDevs] = useState<Developer[]>([]);
  const [history, setHistory] = useState<ActivityRecord[]>([]);
  const [formData, setFormData] = useState({
    developer_id: 0,
    work_hours: 8,
    commits: 0,
    pull_requests: 0,
    meetings: 2,
    tasks_completed: 0,
    pending_tasks: 0,
    activity_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const [d, h] = await Promise.all([
      apiService.getDevelopers(),
      apiService.getAllActivities()
    ]);
    setDevs(d);
    setHistory(h.slice(0, 10));
    if (d.length > 0 && !formData.developer_id) setFormData(prev => ({ ...prev, developer_id: d[0].id }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Mock update
        const idx = history.findIndex(h => h.id === editingId);
        if (idx !== -1) {
          history[idx] = { ...history[idx], ...formData };
        }
      } else {
        await apiService.logActivity(formData);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setEditingId(null);
      setFormData(prev => ({ ...prev, commits: 0, pull_requests: 0, tasks_completed: 0 }));
      fetchInitialData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (act: ActivityRecord) => {
    setEditingId(act.id);
    setFormData({
      developer_id: act.developer_id,
      work_hours: act.work_hours,
      commits: act.commits,
      pull_requests: act.pull_requests,
      meetings: act.meetings,
      tasks_completed: act.tasks_completed,
      pending_tasks: act.pending_tasks,
      activity_date: act.activity_date
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (confirm("Confirm deletion of telemetry record?")) {
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-top-6 duration-700 pb-20">
      <div className="flex items-center gap-6 border-b border-primary/20 pb-8">
        <div className="p-4 bg-primary text-bg rounded-3xl shadow-2xl shadow-primary/20 transform transition-transform hover:scale-105">
          <ClipboardList className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-5xl font-black text-primary tracking-tighter uppercase">Developers Activity</h2>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mt-2">Operational Data Synchronization Terminal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Form Column */}
        <div className="xl:col-span-2 bg-light/30 border border-primary/20 rounded-[3rem] p-12 shadow-2xl transition-all duration-500 hover:border-primary/50 relative overflow-hidden backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label htmlFor="developer_id" className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Assigned Personnel</label>
                <div className="relative group">
                  <Users className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-focus-within:text-primary transition-colors" />
                  <select
                    id="developer_id"
                    name="developer_id"
                    className="w-full pl-14 pr-5 py-5 bg-bg border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-primary font-bold appearance-none cursor-pointer transition-all"
                    value={formData.developer_id}
                    onChange={e => setFormData({ ...formData, developer_id: parseInt(e.target.value) })}
                  >
                    {devs.map(d => <option key={d.id} value={d.id} className="bg-bg text-primary">{d.name} — {d.role}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label htmlFor="activity_date" className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">Operational Date</label>
                <div className="relative group">
                  <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-focus-within:text-primary transition-colors" />
                  <input
                    id="activity_date"
                    name="activity_date"
                    type="date"
                    className="w-full pl-14 pr-5 py-5 bg-bg border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-primary font-bold transition-all"
                    value={formData.activity_date}
                    onChange={e => setFormData({ ...formData, activity_date: e.target.value })}
                  />
                </div>
              </div>

              <InputBox id="work_hours" label="Active Hours" value={formData.work_hours} onChange={(v: string) => setFormData({ ...formData, work_hours: parseFloat(v) })} type="number" step="0.5" icon={<Clock className="w-5 h-5" />} />
              <InputBox id="meetings" label="Meeting Load" value={formData.meetings} onChange={(v: string) => setFormData({ ...formData, meetings: parseFloat(v) })} type="number" step="0.5" icon={<Users className="w-5 h-5" />} />
              <InputBox id="commits" label="Git Commits" value={formData.commits} onChange={(v: string) => setFormData({ ...formData, commits: parseInt(v) })} icon={<TrendingUp className="w-5 h-5" />} />
              <InputBox id="pull_requests" label="Pull Requests" value={formData.pull_requests} onChange={(v: string) => setFormData({ ...formData, pull_requests: parseInt(v) })} icon={<GitPullRequest className="w-5 h-5" />} />
              <InputBox id="tasks_completed" label="Tasks Executed" value={formData.tasks_completed} onChange={(v: string) => setFormData({ ...formData, tasks_completed: parseInt(v) })} icon={<CheckSquare className="w-5 h-5" />} />
              <InputBox id="pending_tasks" label="Backlog Items" value={formData.pending_tasks} onChange={(v: string) => setFormData({ ...formData, pending_tasks: parseInt(v) })} icon={<ClipboardList className="w-5 h-5" />} />
            </div>

            <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-primary/10">
              <p className="text-[10px] text-secondary font-bold uppercase tracking-widest max-w-xs leading-relaxed">
                {editingId ? "MODIFICATION MODE: Updating existing telemetry record. Changes will take effect immediately upon verification." : "VERIFICATION REQUIRED: Submission affects subject risk profile and neural calibration protocols."}
              </p>

              <div className="flex gap-4 w-full md:w-auto">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => { setEditingId(null); setFormData(prev => ({ ...prev, commits: 0, tasks_completed: 0 })); }}
                    className="flex-1 md:flex-none px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-secondary hover:text-primary transition-all bg-bg hover:bg-light border border-primary/10"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-4 px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-2xl ${success ? 'bg-secondary text-primary' : 'bg-primary text-light hover:bg-secondary hover:text-primary'
                    } disabled:opacity-50 active:scale-95`}
                >
                  {success ? (
                    <><CheckCircle2 className="w-5 h-5 animate-in zoom-in" /> Verified</>
                  ) : (
                    <><Save className="w-5 h-5" /> {editingId ? 'Save Edits' : 'Transmit Data'}</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* History Sidebar */}
        <div className="bg-primary/5 border border-primary/10 rounded-[3rem] p-10 shadow-xl overflow-hidden flex flex-col hover:border-primary/30 transition-all backdrop-blur-md">
          <div className="flex items-center gap-3 mb-10">
            <History className="w-5 h-5 text-secondary" />
            <h3 className="text-xl font-black text-primary uppercase tracking-tighter">Transmission Log</h3>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {history.map(act => {
              const devName = devs.find(d => d.id === act.developer_id)?.name || "Anon Subject";
              return (
                <div key={act.id} className="bg-bg/50 border border-primary/10 p-5 rounded-2xl hover:border-primary/40 transition-all group animate-in slide-in-from-right-4 hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {act.activity_date}
                    </span>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(act)} className="text-primary/50 hover:text-primary transition-colors" title="Edit Record"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(act.id)} className="text-primary/50 hover:text-primary transition-all hover:scale-125" title="Delete Record"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className="text-sm font-black text-primary">{devName}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[9px] font-bold text-primary/70 uppercase px-2 py-1 bg-light rounded-lg border border-primary/10" title="Commits">{act.commits} Cmts</span>
                    <span className="text-[9px] font-bold text-primary/70 uppercase px-2 py-1 bg-light rounded-lg border border-primary/10" title="Pull Requests">{act.pull_requests} PRs</span>
                    <span className="text-[9px] font-bold text-primary/70 uppercase px-2 py-1 bg-light rounded-lg border border-primary/10" title="Tasks Completed">{act.tasks_completed} Tasks</span>
                    <span className="text-[9px] font-bold text-primary/70 uppercase px-2 py-1 bg-light rounded-lg border border-primary/10" title="Pending Tasks">{act.pending_tasks} Pend</span>
                    <span className="text-[9px] font-bold text-primary/70 uppercase px-2 py-1 bg-light rounded-lg border border-primary/10" title="Meetings">{act.meetings} Mtgs</span>
                    <span className="text-[9px] font-bold text-primary/70 uppercase px-2 py-1 bg-light rounded-lg border border-primary/10" title="Work Hours">{act.work_hours}h</span>
                  </div>
                </div>
              )
            })}
            {history.length === 0 && (
              <p className="text-primary/40 font-bold italic text-center py-20">No telemetry in recent buffer.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InputBox = ({ label, value, onChange, icon, type = "number", id, ...props }: any) => (
  <div className="space-y-3">
    <label htmlFor={id} className="text-[10px] font-black text-secondary uppercase tracking-widest ml-1">{label}</label>
    <div className="relative group">
      {icon && <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary group-focus-within:text-primary transition-colors">{icon}</div>}
      <input
        id={id}
        name={id}
        type={type}
        className={`w-full ${icon ? 'pl-14' : 'px-5'} pr-5 py-5 bg-bg border border-primary/20 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-primary font-bold transition-all placeholder:text-primary/30`}
        value={value}
        onChange={e => onChange(e.target.value)}
        {...props}
      />
    </div>
  </div>
);

const GitPullRequest = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);

export default ActivityLog;



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
  CheckSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { Developer, ActivityRecord } from '../types';
import { formatDate } from '../utils/dateUtils';


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
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const [d, h] = await Promise.all([
      apiService.getDevelopers(),
      apiService.getAllActivities()
    ]);
    setDevs(d);
    setHistory(h); // Use all records, not sliced
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
        const newActivity = await apiService.logActivity(formData);
        // Immediately add the new activity to history
        setHistory(prev => [newActivity, ...prev].slice(0, 10));
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setEditingId(null);
      setFormData(prev => ({ ...prev, commits: 0, pull_requests: 0, tasks_completed: 0 }));
      // Still fetch to ensure sync, but we already updated optimistically
      setTimeout(() => fetchInitialData(), 500);
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

  const handleDelete = async (id: number | string) => {
    if (confirm("Confirm deletion of telemetry record?")) {
      try {
        // Delete from database via API
        await apiService.deleteActivity(id);
        // Update local state to reflect the deletion
        setHistory(prev => prev.filter(h => Number(h.id) !== Number(id)));
        // Reset to page 1 if current page becomes empty
        if (paginatedHistory.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error: any) {
        alert(`Failed to delete activity: ${error.message}`);
      }
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(history.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const paginatedHistory = history.slice(indexOfFirstRecord, indexOfLastRecord);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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

      {/* Form Section - Full Width */}
      <div className="bg-light/30 border border-primary/20 rounded-[3rem] p-12 shadow-2xl transition-all duration-500 hover:border-primary/50 relative overflow-hidden backdrop-blur-sm">
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

            <InputBox id="work_hours" label="Active Hours" value={formData.work_hours} onChange={(v: string) => setFormData({ ...formData, work_hours: v === '' ? 0 : parseFloat(v) || 0 })} type="number" step="0.5" icon={<Clock className="w-5 h-5" />} />
            <InputBox id="meetings" label="Meeting Load" value={formData.meetings} onChange={(v: string) => setFormData({ ...formData, meetings: v === '' ? 0 : parseFloat(v) || 0 })} type="number" step="0.5" icon={<Users className="w-5 h-5" />} />
            <InputBox id="commits" label="Git Commits" value={formData.commits} onChange={(v: string) => setFormData({ ...formData, commits: v === '' ? 0 : parseInt(v) || 0 })} icon={<TrendingUp className="w-5 h-5" />} />
            <InputBox id="pull_requests" label="Pull Requests" value={formData.pull_requests} onChange={(v: string) => setFormData({ ...formData, pull_requests: v === '' ? 0 : parseInt(v) || 0 })} icon={<GitPullRequest className="w-5 h-5" />} />
            <InputBox id="tasks_completed" label="Tasks Executed" value={formData.tasks_completed} onChange={(v: string) => setFormData({ ...formData, tasks_completed: v === '' ? 0 : parseInt(v) || 0 })} icon={<CheckSquare className="w-5 h-5" />} />
            <InputBox id="pending_tasks" label="Backlog Items" value={formData.pending_tasks} onChange={(v: string) => setFormData({ ...formData, pending_tasks: v === '' ? 0 : parseInt(v) || 0 })} icon={<ClipboardList className="w-5 h-5" />} />
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

      {/* Recent Activity History - Table List Format */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-secondary" />
            <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">Complete Activity History</h3>
          </div>
          <div className="text-xs font-black text-secondary uppercase tracking-widest">
            {history.length} Total Records
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-light/20 rounded-[2rem] border-2 border-dashed border-primary/20">
            <History className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <p className="text-primary/60 font-bold italic">No telemetry in recent buffer.</p>
          </div>
        ) : (
          <div className="bg-light/30 border border-primary/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary text-bg">
                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest">Developer</th>
                    <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-widest">Date</th>
                    <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-widest">Hours</th>
                    <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-widest">Commits</th>
                    <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-widest">PRs</th>
                    <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-widest">Tasks</th>
                    <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-widest">Meetings</th>
                    <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-widest">Pending</th>
                    <th className="text-center px-6 py-4 text-xs font-black uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((act, index) => {
                    const devName = devs.find(d => d.id === act.developer_id)?.name || "Unknown";
                    return (
                      <tr
                        key={act.id}
                        className={`${index % 2 === 0 ? 'bg-bg/40' : 'bg-light/20'} hover:bg-secondary/20 transition-colors group`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm group-hover:bg-primary group-hover:text-bg transition-colors">
                              {devName.charAt(0)}
                            </div>
                            <span className="font-black text-primary text-sm">{devName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            {formatDate(act.activity_date)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-black">
                            {act.work_hours}h
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-secondary/10 text-primary rounded-lg text-sm font-black">
                            {act.commits}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-secondary/10 text-primary rounded-lg text-sm font-black">
                            {act.pull_requests}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 bg-secondary/10 text-primary rounded-lg text-sm font-black">
                            {act.tasks_completed}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-primary/70">{act.meetings}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-bold text-primary/70">{act.pending_tasks}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(act)}
                              className="p-2 bg-primary/10 hover:bg-primary hover:text-bg text-primary rounded-lg transition-all shadow-sm active:scale-95"
                              title="Edit Record"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(act.id)}
                              className="p-2 bg-primary/10 hover:bg-red-900 hover:text-light text-primary rounded-lg transition-all shadow-sm active:scale-95"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {history.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-primary/20 bg-bg/40">
                <div className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Page {currentPage} of {totalPages} • Showing {indexOfFirstRecord + 1}-{Math.min(indexOfLastRecord, history.length)} of {history.length} records
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="p-2 bg-primary/10 hover:bg-primary hover:text-bg text-primary rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 font-black text-xs uppercase tracking-widest px-4"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="flex items-center gap-2 px-4">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${currentPage === page
                            ? 'bg-primary text-bg shadow-lg'
                            : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 bg-primary/10 hover:bg-primary hover:text-bg text-primary rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 font-black text-xs uppercase tracking-widest px-4"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
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


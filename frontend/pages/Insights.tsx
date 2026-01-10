
import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, AlertCircle, History, ShieldAlert, Zap, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { apiService } from '../services/api';
import { AIInsight, Developer } from '../types';

interface Props {
  selectedDevId: number | null;
}

const Insights: React.FC<Props> = ({ selectedDevId }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [devs, setDevs] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    Promise.all([
      apiService.getInsightsHistory(),
      apiService.getDevelopers()
    ]).then(([history, developers]) => {
      setInsights(history);
      setDevs(developers);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: number | string) => {
    if (confirm('Permanently delete this AI diagnostic record?')) {
      try {
        await apiService.deleteInsight(id);
        setInsights(prev => prev.filter(i => i.id !== id));
      } catch (error: any) {
        alert(`Failed to delete insight: ${error.message}`);
      }
    }
  };

  const getDevName = (id: number) => devs.find(d => d.id === id)?.name || "Unknown Asset";

  const filteredInsights = insights.filter(i => {
    if (filter === 'all') return true;
    return i.severity === filter;
  });

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'High':
        return {
          color: 'text-red-900',
          icon: <ShieldAlert className="w-4 h-4" />,
          bgIcon: <AlertTriangle className="w-32 h-32" />,
          border: 'border-l-[#504B38]',
          glow: 'shadow-[#504B38]/20',
          pill: 'bg-[#EBE5C2] text-[#504B38] border-[#504B38]/20'
        };
      case 'Medium':
        return {
          color: 'text-[#504B38]',
          icon: <AlertCircle className="w-4 h-4" />,
          bgIcon: <AlertCircle className="w-32 h-32" />,
          border: 'border-l-[#B9B28A]',
          glow: 'shadow-[#B9B28A]/20',
          pill: 'bg-[#B9B28A]/20 text-[#504B38] border-[#B9B28A]/30'
        };
      case 'Low':
      default:
        return {
          color: 'text-[#504B38]',
          icon: <CheckCircle2 className="w-4 h-4" />,
          bgIcon: <TrendingUp className="w-32 h-32" />,
          border: 'border-l-[#F8F3D9]',
          glow: 'shadow-[#F8F3D9]/20',
          pill: 'bg-[#F8F3D9] text-[#504B38] border-[#504B38]/10'
        };
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <Zap className="w-12 h-12 text-secondary animate-pulse" />
      <p className="text-primary font-black tracking-widest text-[10px] uppercase">Decrypting Intelligence Archive...</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-primary/20 pb-8">
        <div>
          <h2 className="text-5xl font-black text-primary tracking-tighter uppercase">AI Insights</h2>
          <p className="text-secondary font-bold uppercase tracking-[0.2em] text-xs mt-2">Historical Cognitive Risk Diagnostics</p>
        </div>

        <div className="flex items-center gap-2 bg-light p-2 rounded-2xl border border-primary/20 shadow-xl">
          {(['all', 'High', 'Medium', 'Low'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f
                ? 'bg-primary text-bg shadow-lg'
                : 'text-primary/60 hover:text-primary hover:bg-primary/10'
                }`}
            >
              {f === 'all' ? 'Universal' : f === 'High' ? 'Critical' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard icon={<TrendingUp className="w-6 h-6 text-primary" />} label="Total Briefs" value={insights.length} />
        <MetricCard icon={<ShieldAlert className="w-6 h-6 text-primary" />} label="Critical Alerts" value={insights.filter(i => i.severity === 'High').length} />
        <MetricCard icon={<History className="w-6 h-6 text-primary" />} label="Uptime Monitoring" value="100%" />
      </div>

      <div className="space-y-6">
        {filteredInsights.length > 0 ? (
          filteredInsights.map(insight => {
            const config = getSeverityConfig(insight.severity);
            return (
              <div
                key={insight.id}
                className={`group relative bg-light/30 p-10 rounded-[3rem] border-l-[12px] border-y border-r border-primary/5 shadow-xl transition-all hover:scale-[1.01] duration-500 overflow-hidden ${config.border} ${config.glow}`}
              >
                {/* Background Watermark Icon */}
                <div className={`absolute -right-8 -bottom-8 opacity-5 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 text-primary`}>
                  {config.bgIcon}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-bg border border-primary/10 rounded-2xl flex items-center justify-center font-black text-secondary text-xl group-hover:bg-primary group-hover:text-bg transition-all duration-500 shadow-lg">
                      {getDevName(insight.developer_id).charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-primary tracking-tighter">{getDevName(insight.developer_id)}</h4>
                      <span className="text-[10px] text-secondary font-black uppercase tracking-widest flex items-center gap-2">
                        <History className="w-3.5 h-3.5" />
                        Diagnostic Ref: #{insight.id.toString().slice(-6)} | {new Date(insight.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${config.pill}`}>
                      {config.icon}
                      {insight.severity} Priority Signal
                    </div>
                    <button
                      onClick={() => handleDelete(insight.id)}
                      className="p-2.5 bg-bg border border-primary/10 hover:border-red-900 hover:text-light rounded-xl text-primary/60 transition-all shadow-sm active:scale-95 opacity-0 group-hover:opacity-100"
                      title="Delete Insight"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="relative pl-8 border-l-2 border-primary/20 py-2 z-10">
                  <p className="text-primary text-lg leading-relaxed font-bold italic whitespace-pre-line opacity-80">
                    {insight.insight_text}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-32 bg-light/20 rounded-[3rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center text-primary/60 text-center space-y-4">
            <Lightbulb className="w-20 h-20 opacity-20 animate-pulse" />
            <p className="text-2xl font-black uppercase tracking-tighter">No encrypted insights detected.</p>
            <p className="text-sm font-bold opacity-50 max-w-sm">Adjust filter parameters or generate new telemetry analytics via the subject dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: any) => (
  <div className="bg-bg border border-primary/10 p-8 rounded-[2rem] shadow-xl hover:scale-105 transition-all duration-300 group hover:border-primary/30">
    <div className="flex items-center gap-5">
      <div className="p-4 bg-light rounded-2xl group-hover:bg-secondary transition-colors text-primary">{icon}</div>
      <div>
        <div className="text-3xl font-black text-primary leading-none">{value}</div>
        <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mt-2">{label}</div>
      </div>
    </div>
  </div>
);

export default Insights;

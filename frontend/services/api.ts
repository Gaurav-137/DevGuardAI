
import { Developer, ActivityRecord, AIInsight, DashboardData } from '../types';

export const calculateBurnout = (activities: ActivityRecord[]) => {
  const last7 = activities.slice(0, 7);
  if (last7.length === 0) return { score: 0, level: 'Low' as const };

  const totalHours = last7.reduce((s, a) => s + a.work_hours, 0);
  const totalCommits = last7.reduce((s, a) => s + a.commits, 0);
  const totalTasks = last7.reduce((s, a) => s + a.tasks_completed, 0);
  const totalMeetings = last7.reduce((s, a) => s + a.meetings, 0);
  const totalPending = last7.reduce((s, a) => s + a.pending_tasks, 0);

  const hourFactor = Math.min(totalHours / 50, 1) * 0.35;
  const meetingFactor = Math.min(totalMeetings / 20, 1) * 0.25;
  const backlogFactor = Math.min(totalPending / 30, 1) * 0.25;
  const productivityFactor = Math.max(0, 1 - ((totalCommits + totalTasks) / 40)) * 0.15;

  const score = Math.min(hourFactor + meetingFactor + backlogFactor + productivityFactor, 1);
  let level: 'Low' | 'Medium' | 'High' = 'Low';
  if (score > 0.75) level = 'High';
  else if (score > 0.45) level = 'Medium';

  return { score, level };
};

let devs: Developer[] = [
  { id: 1, name: "Alex Rivera", email: "alex@devguard.ai", role: "Sr. Frontend Engineer", created_at: "2024-01-12" },
  { id: 2, name: "Jordan Smith", email: "jordan@devguard.ai", role: "DevOps Lead", created_at: "2023-11-05" },
  { id: 3, name: "Sarah Chen", email: "sarah@devguard.ai", role: "AI Researcher", created_at: "2024-03-20" },
  { id: 4, name: "Marcus Thorne", email: "marcus@devguard.ai", role: "Backend Architect", created_at: "2023-05-15" },
];

const generateHistory = (devId: number, days: number) => {
  const history: ActivityRecord[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      id: Math.random() * 100000,
      developer_id: devId,
      work_hours: 6 + Math.random() * 6,
      commits: Math.floor(Math.random() * 15),
      pull_requests: Math.floor(Math.random() * 5),
      meetings: Math.floor(Math.random() * 6),
      tasks_completed: Math.floor(Math.random() * 10),
      pending_tasks: Math.floor(Math.random() * 15),
      activity_date: date.toISOString().split('T')[0]
    });
  }
  return history;
};

let activityStore: ActivityRecord[] = [
  ...generateHistory(1, 30),
  ...generateHistory(2, 30),
  ...generateHistory(3, 30),
  ...generateHistory(4, 30),
];

let insightStore: AIInsight[] = [];

const API_BASE = 'http://localhost:3002/api';

export const apiService = {
  getDevelopers: async (): Promise<Developer[]> => {
    const response = await fetch(`${API_BASE}/developers`);
    return response.json();
  },

  addDeveloper: async (dev: Omit<Developer, 'id' | 'created_at'>): Promise<Developer> => {
    const response = await fetch(`${API_BASE}/developers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dev)
    });
    return response.json();
  },

  logActivity: async (activity: Omit<ActivityRecord, 'id'>): Promise<ActivityRecord> => {
    const response = await fetch(`${API_BASE}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    return response.json();
  },

  getDashboardData: async (devId: number): Promise<DashboardData> => {
    const [devResponse, metricsResponse, insightsResponse] = await Promise.all([
      fetch(`${API_BASE}/developers`),
      fetch(`${API_BASE}/metrics/${devId}`),
      fetch(`${API_BASE}/insights/${devId}`)
    ]);
    
    const developers = await devResponse.json();
    const metrics = await metricsResponse.json();
    const insights = await insightsResponse.json();
    
    const developer = developers.find((d: Developer) => d.id === devId);
    if (!developer) throw new Error("Subject ID not found.");
    
    return {
      developer,
      latestMetric: {
        id: Date.now(),
        developer_id: devId,
        burnout_score: metrics.burnout_score,
        risk_level: metrics.risk_level,
        measured_at: new Date().toISOString()
      },
      activities: metrics.activities || [],
      insights: insights || []
    };
  },

  getAllActivities: async (): Promise<ActivityRecord[]> => {
    // For demo, we'll use the mock data since we don't have a specific endpoint
    return new Promise((r) => setTimeout(() => r([...activityStore]), 400));
  },

  saveInsight: async (insight: Omit<AIInsight, 'id' | 'created_at'>): Promise<AIInsight> => {
    const response = await fetch(`${API_BASE}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insight)
    });
    return response.json();
  },
  
  getInsightsHistory: async (devId?: number): Promise<AIInsight[]> => {
    if (devId) {
      const response = await fetch(`${API_BASE}/insights/${devId}`);
      return response.json();
    }
    // Fetch all insights from backend
    const response = await fetch(`${API_BASE}/insights`);
    return response.json();
  }
};

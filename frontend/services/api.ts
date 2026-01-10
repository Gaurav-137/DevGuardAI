
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

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;

    if (contentType?.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 200));
    }

    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  return response.json();
};

export const apiService = {
  getDevelopers: async (): Promise<Developer[]> => {
    try {
      const response = await fetch(`${API_BASE}/developers`);
      return handleResponse<Developer[]>(response);
    } catch (error) {
      console.error('Failed to fetch developers:', error);
      throw error;
    }
  },

  addDeveloper: async (dev: Omit<Developer, 'id' | 'created_at'>): Promise<Developer> => {
    try {
      const response = await fetch(`${API_BASE}/developers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dev)
      });
      return handleResponse<Developer>(response);
    } catch (error) {
      console.error('Failed to add developer:', error);
      throw error;
    }
  },

  logActivity: async (activity: Omit<ActivityRecord, 'id'>): Promise<ActivityRecord> => {
    try {
      const response = await fetch(`${API_BASE}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      });
      return handleResponse<ActivityRecord>(response);
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  },

  getDashboardData: async (devId: number): Promise<DashboardData> => {
    try {
      const response = await fetch(`${API_BASE}/metrics/${devId}`);
      const data = await handleResponse<any>(response);

      return {
        developer: data.developer,
        latestMetric: data.latestMetric,
        activities: data.activities || [],
        insights: data.insights || []
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  },

  getAllActivities: async (): Promise<ActivityRecord[]> => {
    try {
      const response = await fetch(`${API_BASE}/activities`);
      return handleResponse<ActivityRecord[]>(response);
    } catch (error) {
      console.error('Failed to fetch activities, using fallback:', error);
      // Fallback to mock data if API fails
      return [...activityStore];
    }
  },

  saveInsight: async (insight: Omit<AIInsight, 'id' | 'created_at'>): Promise<AIInsight> => {
    try {
      const response = await fetch(`${API_BASE}/insights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insight)
      });
      return handleResponse<AIInsight>(response);
    } catch (error) {
      console.error('Failed to save insight:', error);
      throw error;
    }
  },

  deleteActivity: async (id: number | string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/activity/${id}`, {
        method: 'DELETE'
      });
      await handleResponse<any>(response);
    } catch (error) {
      console.error('Failed to delete activity:', error);
      throw error;
    }
  },

  deleteDeveloper: async (id: number | string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/developers/${id}`, {
        method: 'DELETE'
      });
      await handleResponse<any>(response);
    } catch (error) {
      console.error('Failed to delete developer:', error);
      throw error;
    }
  },

  getInsightsHistory: async (devId?: number): Promise<AIInsight[]> => {
    try {
      const url = devId ? `${API_BASE}/insights/${devId}` : `${API_BASE}/insights`;
      const response = await fetch(url);
      return handleResponse<AIInsight[]>(response);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      return [];
    }
  },

  deleteInsight: async (id: number | string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE}/insights/${id}`, {
        method: 'DELETE'
      });
      await handleResponse<any>(response);
    } catch (error) {
      console.error('Failed to delete insight:', error);
      throw error;
    }
  }
};

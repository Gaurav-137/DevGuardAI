
import { ActivityRecord, ProductivityMetric } from "../types";

export async function generateDeveloperInsight(
  devName: string,
  metrics: ProductivityMetric,
  activities: ActivityRecord[]
) {
  // Simplified mock implementation for now
  // In production, this would integrate with Google Generative AI

  const recent = activities.slice(0, 7);
  const totalHours = recent.reduce((s, a) => s + (Number(a.work_hours) || 0), 0);
  const totalMeetings = recent.reduce((s, a) => s + (Number(a.meetings) || 0), 0);
  const totalPRs = recent.reduce((s, a) => s + (Number(a.pull_requests) || 0), 0);
  const currentBacklog = Number(recent[0]?.pending_tasks) || 0;

  // Mock AI analysis based on metrics
  let primaryDriver = "Workload Balance";
  let actions = [
    "Monitor daily work hour distribution",
    "Schedule regular check-ins with team lead",
    "Implement task prioritization framework"
  ];

  if (totalMeetings > 20) {
    primaryDriver = "Meeting Fatigue";
    actions = [
      "Reduce non-essential meetings by 30%",
      "Implement no-meeting blocks for deep work",
      "Delegate meeting attendance where possible"
    ];
  } else if (currentBacklog > 15) {
    primaryDriver = "Backlog Overload";
    actions = [
      "Prioritize top 5 critical tasks",
      "Reassign lower-priority items to team",
      "Implement daily standup for progress tracking"
    ];
  } else if (totalHours > 45) {
    primaryDriver = "Work Hour Intensity";
    actions = [
      "Enforce work-life balance boundaries",
      "Review task complexity and scope",
      "Consider additional team resources"
    ];
  }

  const mockInsight = `
PRIMARY DRIVER: ${primaryDriver}
RISK LEVEL: ${metrics.risk_level} (${(metrics.burnout_score * 100).toFixed(0)}%)

ANALYSIS: Based on 7-day telemetry for ${devName}:
- Work Hours: ${totalHours.toFixed(1)}h
- Meeting Load: ${totalMeetings}h  
- Code Reviews: ${totalPRs}
- Pending Tasks: ${currentBacklog}

STRATEGIC ACTIONS:
1. ${actions[0]}
2. ${actions[1]}
3. ${actions[2]}
  `.trim();

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    text: mockInsight,
    severity: metrics.risk_level
  };
}

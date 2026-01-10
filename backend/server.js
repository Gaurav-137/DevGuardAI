
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Production Database Connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'devguard',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

app.use(cors());
app.use(express.json());

// Routes

// 1. Get all developers
app.get('/api/developers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM developers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Create developer
app.post('/api/developers', async (req, res) => {
  const { name, email, role } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO developers (name, email, role) VALUES ($1, $2, $3) RETURNING *',
      [name, email, role]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// 2b. Delete developer
app.delete('/api/developers/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM developers WHERE id = $1 RETURNING *',
      [parseInt(id)]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Developer not found' });
    } else {
      res.status(200).json({ message: 'Developer deleted successfully', deleted: result.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Log daily activity
app.post('/api/activity', async (req, res) => {
  const { developer_id, work_hours, commits, tasks_completed, activity_date, pull_requests, meetings, pending_tasks } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO developer_activity (developer_id, work_hours, commits, tasks_completed, activity_date, pull_requests, meetings, pending_tasks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [
        parseInt(developer_id),
        parseFloat(work_hours || 0),
        parseInt(commits || 0),
        parseInt(tasks_completed || 0),
        activity_date,
        parseInt(pull_requests || 0),
        parseInt(meetings || 0),
        parseInt(pending_tasks || 0)
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// 3b. Delete activity record
app.delete('/api/activity/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM developer_activity WHERE id = $1 RETURNING *',
      [parseInt(id)]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Activity record not found' });
    } else {
      res.status(200).json({ message: 'Activity deleted successfully', deleted: result.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Metrics for a developer
app.get('/api/metrics/:developerId', async (req, res) => {
  const { developerId } = req.params;
  try {
    const activityResult = await pool.query(
      'SELECT * FROM developer_activity WHERE developer_id = $1 ORDER BY activity_date DESC LIMIT 14',
      [parseInt(developerId)]
    );

    // Calculate burnout metrics
    const activities = activityResult.rows;
    const recent = activities.slice(0, 7);
    const totalHours = recent.reduce((s, a) => s + parseFloat(a.work_hours || 0), 0);
    const totalMeetings = recent.reduce((s, a) => s + (a.meetings || 0), 0);
    const totalPending = recent.reduce((s, a) => s + (a.pending_tasks || 0), 0);
    const totalCommits = recent.reduce((s, a) => s + (a.commits || 0), 0);
    const totalTasks = recent.reduce((s, a) => s + (a.tasks_completed || 0), 0);

    const hourFactor = Math.min(totalHours / 50, 1) * 0.35;
    const meetingFactor = Math.min(totalMeetings / 20, 1) * 0.25;
    const backlogFactor = Math.min(totalPending / 30, 1) * 0.25;
    const productivityFactor = Math.max(0, 1 - ((totalCommits + totalTasks) / 40)) * 0.15;

    const score = Math.min(hourFactor + meetingFactor + backlogFactor + productivityFactor, 1);
    let level = 'Low';
    if (score > 0.75) level = 'High';
    else if (score > 0.45) level = 'Medium';

    res.json({
      developer: (await pool.query('SELECT * FROM developers WHERE id = $1', [parseInt(developerId)])).rows[0],
      activities: activityResult.rows,
      latestMetric: { burnout_score: score, risk_level: level },
      insights: (await pool.query('SELECT * FROM ai_insights WHERE developer_id = $1 ORDER BY created_at DESC', [parseInt(developerId)])).rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Get data for Dashboard (Combines metrics and dev info)
app.get('/api/dashboard/:developerId', async (req, res) => {
  // Reusing the logic from metrics for consistency, or just redirect
  // The previous implementation had getDashboardData separate service calls, but here the server was handling it.
  // The previous code had `api/metrics/:developerId` returning what `getDashboardData` expected.
  // Let's ensure the route matches what the frontend expects.
  // Frontend calls `getDashboardData` which calls `/api/metrics/${id}`.
  // So logic in route #4 is correct.
  res.redirect(`/api/metrics/${req.params.developerId}`);
});


// 6. Get all activities (for Trends/Global Dashboard)
app.get('/api/activities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM developer_activity ORDER BY activity_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 7. Get combined dashboard data (for GlobalDashboard.tsx if needed, but it fetches activities + devs separately)

// 8. Get all insights (Global)
app.get('/api/insights', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_insights ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 8b. Get insights for specific developer
app.get('/api/insights/:developerId', async (req, res) => {
  const { developerId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM ai_insights WHERE developer_id = $1 ORDER BY created_at DESC',
      [parseInt(developerId)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 8c. Delete insight
app.delete('/api/insights/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM ai_insights WHERE id = $1 RETURNING *',
      [parseInt(id)]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Insight not found' });
    } else {
      res.status(200).json({ message: 'Insight deleted successfully', deleted: result.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 9. Save AI Insight
app.post('/api/insights', async (req, res) => {
  const { developer_id, insight_text, severity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO ai_insights (developer_id, insight_text, severity) VALUES ($1, $2, $3) RETURNING *',
      [parseInt(developer_id), insight_text, severity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});


app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

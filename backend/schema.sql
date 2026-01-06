-- Create Developers Table
CREATE TABLE IF NOT EXISTS developers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Activity Log Table
CREATE TABLE IF NOT EXISTS developer_activity (
    id SERIAL PRIMARY KEY,
    developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
    work_hours DECIMAL(5, 2) DEFAULT 0,
    commits INTEGER DEFAULT 0,
    pull_requests INTEGER DEFAULT 0,
    meetings INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    pending_tasks INTEGER DEFAULT 0,
    activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
    id SERIAL PRIMARY KEY,
    developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
    insight_text TEXT NOT NULL,
    severity VARCHAR(50) CHECK (severity IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Seed initial data if table is empty (You can run this manually)
-- INSERT INTO developers (name, email, role) VALUES ('Alex Rivera', 'alex@devguard.ai', 'Sr. Frontend Engineer');

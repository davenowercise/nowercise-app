-- Nowercise Planner: planned_sessions and session_events
CREATE TABLE IF NOT EXISTS planned_sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id),
  week_start_date DATE NOT NULL,
  planned_date DATE NOT NULL,
  session_type VARCHAR(20) NOT NULL CHECK (session_type IN ('STRENGTH', 'CALM', 'REST')),
  session_template TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PLANNED' CHECK (status IN ('PLANNED', 'COMPLETED', 'SKIPPED', 'ADJUSTED')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planned_sessions_user_planned_date ON planned_sessions(user_id, planned_date);

CREATE TABLE IF NOT EXISTS session_events (
  id VARCHAR(36) PRIMARY KEY,
  planned_session_id VARCHAR(36) NOT NULL REFERENCES planned_sessions(id),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('MOVED', 'COMPLETED', 'SKIPPED')),
  from_date DATE,
  to_date DATE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

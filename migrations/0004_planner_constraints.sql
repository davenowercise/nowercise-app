-- Nowercise Planner: constraints and indexes
-- Prevents duplicate sessions per user/date/type and improves query performance

-- UNIQUE constraint: one session per (user_id, planned_date, session_type)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'planned_sessions_user_date_type_unique') THEN
    ALTER TABLE planned_sessions ADD CONSTRAINT planned_sessions_user_date_type_unique UNIQUE (user_id, planned_date, session_type);
  END IF;
END $$;

-- Indexes for planned_sessions (add if not exists)
CREATE INDEX IF NOT EXISTS idx_planned_sessions_user_week_start
  ON planned_sessions(user_id, week_start_date);

-- idx_planned_sessions_user_planned_date already exists from 0003
CREATE INDEX IF NOT EXISTS idx_planned_sessions_user_planned_date
  ON planned_sessions(user_id, planned_date);

CREATE INDEX IF NOT EXISTS idx_planned_sessions_user_week_type
  ON planned_sessions(user_id, week_start_date, session_type);

-- Index for session_events lookups by planned_session_id
CREATE INDEX IF NOT EXISTS idx_session_events_planned_session_id
  ON session_events(planned_session_id);

-- Planner readiness: simple daily check-in for adaptive recommendations
CREATE TABLE IF NOT EXISTS planner_readiness (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  readiness VARCHAR(30) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS planner_readiness_user_date_unique
  ON planner_readiness(user_id, date);

CREATE INDEX IF NOT EXISTS idx_planner_readiness_user_date
  ON planner_readiness(user_id, date);

-- Post-session check-out: lightweight feedback capture
CREATE TABLE IF NOT EXISTS post_session_checkouts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  completed_at TIMESTAMP NOT NULL,
  how_felt VARCHAR(20) NOT NULL,
  symptoms_now VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_session_checkouts_user_completed
  ON post_session_checkouts(user_id, completed_at);

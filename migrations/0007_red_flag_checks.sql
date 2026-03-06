-- Red-flag safety check: pre-session blocker responses
CREATE TABLE IF NOT EXISTS red_flag_checks (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(id),
  checked_at TIMESTAMP NOT NULL,
  chest_pain BOOLEAN NOT NULL,
  breathlessness BOOLEAN NOT NULL,
  fever_unwell BOOLEAN NOT NULL,
  dizziness BOOLEAN NOT NULL,
  severe_pain BOOLEAN NOT NULL,
  blocked BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_red_flag_checks_user_checked
  ON red_flag_checks(user_id, checked_at);

-- Persist modeDecision for history timeline (no logic changes)
ALTER TABLE generated_sessions ADD COLUMN IF NOT EXISTS mode_decision JSONB;
ALTER TABLE session_history ADD COLUMN IF NOT EXISTS mode_decision_json JSONB;

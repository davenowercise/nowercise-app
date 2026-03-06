# Nowercise System Context

This file describes the behaviour logic and system architecture of the Nowercise app.

AI agents working on this repository should read this file before making structural changes.

--------------------------------------------------

STACK
- React frontend
- Node / Express backend
- PostgreSQL database
- Drizzle ORM
- Neon serverless Postgres
- Developed in Cursor
- Also runs in Replit

--------------------------------------------------

CORE SYSTEM

Weekly Planner
- Week starts Monday
- Default sessions: Mon / Wed / Fri (Strength)
- Max 3 strength sessions per week
- No adjacent strength days
- Sessions can move within the week
- Weeks are independent

Planner actions
- Complete
- Skip
- Move
- Switch to Calm

Planner events stored in:
session_events

--------------------------------------------------

DATABASE TABLES

planned_sessions
session_events
planner_readiness
red_flag_checks
post_session_checkouts

--------------------------------------------------

READINESS CHECK

User options:

- good_to_go
- low_energy
- need_calm
- not_up_to_exercise

System generates:

- recommendation
- "Why today" explanation
- Today Status (traffic light)

GREEN
YELLOW
RED

--------------------------------------------------

SESSION LAUNCH LOGIC

Priority order:

1 REST
Triggered when:
- readiness = not_up_to_exercise
- or session skipped

2 CALM
Triggered when:
- readiness = need_calm
- readiness = low_energy
- user switched session to calm

3 STRENGTH
Triggered when:
- readiness = good_to_go
- planned strength session exists

Session routes:

/session/{template}

/session/EARLY_RESET_BREATHE
/session/rest

--------------------------------------------------

RED FLAG SAFETY CHECK

Runs before session execution.

Questions:

- chest pain
- unusual breathlessness
- fever or infection
- dizziness
- severe pain

Rule:

If ANY answer = YES
→ Block session

Blocked screen shows:

"Today is not a training day"

Options:

- 2 Minutes of Calm
- Back to Today
- Re-check Safety

--------------------------------------------------

SAME DAY RE-CHECK

Users can run the safety check again later in the day if symptoms change.

--------------------------------------------------

POST SESSION CHECKOUT

Questions:

howFelt
- too_much
- about_right
- too_easy

symptomsNow
- worse
- about_same
- better

notes
- optional free text

Stored in:

post_session_checkouts

--------------------------------------------------

ADAPTIVE PROGRESSION PROTECTION

Signals:

- caution
- steady_progress
- neutral

Rules

CAUTION if:

- most recent symptomsNow = worse
OR
- last 2 sessions both = too_much
OR
- 2 of last 3 sessions show too_much or symptoms worse

STEADY_PROGRESS if:

- 2 or more of last 3 sessions = about_right
AND symptoms = same or better

Planner banner may show:

"Recent sessions may have been a bit too much.
A calmer day may fit better today."

--------------------------------------------------

COACH / REVIEW PANEL

Routes:

/coach-review
/review

API endpoint:

GET /api/review

Displays:

- today readiness
- today status
- protection signal
- recent red flag checks
- recent planner events
- recent post session checkouts

--------------------------------------------------

DEMO MODE

Activated via:

?demo=true

or

localStorage.demoMode

Demo user id:

demo-user

--------------------------------------------------

CURRENT BEHAVIOUR LOOP

Plan
→ Readiness
→ Recommendation
→ Why Today
→ Today Status
→ Start Session
→ Safety Check
→ Execute Session
→ Post Session Checkout
→ Adaptive Protection

# Nowercise - Technical Overview

## Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS with Shadcn/ui component library
- **Routing:** Wouter (lightweight client-side routing)
- **Data Fetching:** TanStack Query (React Query v5)
- **Build Tool:** Vite

### Backend
- **Runtime:** Node.js with Express.js
- **Language:** TypeScript throughout
- **API Style:** RESTful HTTP endpoints

### Database
- **Database:** PostgreSQL (Neon-backed via Replit)
- **ORM:** Drizzle ORM for queries and schema management
- **Migrations:** `npm run db:push` for schema changes

### Auth / Demo Mode
- **Demo Flows:** Query param based (`?demo=true`)
- **Role Switching:** `?demo-role=specialist` for coach view
- **Production Auth:** Replit Auth (OpenID Connect)

### Video Content
- **Delivery:** YouTube embeds with channel restriction
- **Import:** CSV-driven video library for bulk imports
- **Safety:** Video matching system with category validation

### Deployment
- **Platform:** Replit-hosted
- **URL:** `*.worf.replit.dev`
- **Port:** 5000 (serves both frontend and API)

### Additional Integrations
- **AI:** OpenAI for exercise prescription generation
- **Email:** EmailJS for healthcare provider communication
- **Calendar:** FullCalendar for workout scheduling

---

## Strength Session Flow

1. **Dashboard** → Shows "Today's Session" card with template name (e.g., "BC_S1_GENTLE")
2. **Session Execution** → Opens `/session/:templateCode` page
3. **Exercise Loop** → For each exercise:
   - Shows exercise name + video (YouTube embed) OR supportive text if no video
   - Displays rep range (e.g., "2 sets × 6-10 reps")
   - Optional: Log reps/sets completed
   - RPE slider (1-10) after completing
   - Pain check if RPE is high
4. **Completion** → Summary saved to `pathway_session_logs` table

---

## Video Library Structure

### Database Schema (`template_exercises` table)

```sql
CREATE TABLE template_exercises (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES session_templates(id),
  exercise_id INTEGER REFERENCES exercises(id),
  exercise_name VARCHAR,
  instructions TEXT,
  video_url VARCHAR,
  video_match_type VARCHAR,  -- 'exact', 'category', or 'generic'
  sets INTEGER,
  reps VARCHAR,              -- "6-10" or "30-60s"
  duration INTEGER,
  rest_between_sets INTEGER,
  low_energy_sets INTEGER,
  low_energy_reps VARCHAR,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_optional BOOLEAN DEFAULT false,
  can_skip BOOLEAN DEFAULT true,
  has_easier_version BOOLEAN DEFAULT false
);
```

### CSV Format (for bulk import)

```csv
title, videoId, url, filename, tags, primaryMovementPattern
Nowercise Bands Frontal Raises, JKUy1Sd-SFs, https://youtube.com/watch?v=JKUy1Sd-SFs, ..., upper_body, push
Nowercise Bands Bicep Curl, zG012FFdTTM, https://youtube.com/watch?v=zG012FFdTTM, ..., upper_body, pull
90/90 Wall Balloon-Breathing, fwOUp7Jku0w, https://youtube.com/watch?v=fwOUp7Jku0w, ..., breathing, accessory
```

### Current Template Exercises Data

| exercise_name | video_url | video_match_type |
|--------------|-----------|------------------|
| Arm Raises (Front) | youtube.com/...JKUy1Sd-SFs | exact |
| Bicep Curls (Light/No Weight) | youtube.com/...zG012FFdTTM | exact |
| Breathing Recovery | youtube.com/...fwOUp7Jku0w | exact |
| Wall Push-Aways | youtube.com/...qOR_PSePvhU | exact |
| Gentle Core Breathing | youtube.com/...fwOUp7Jku0w | exact |
| Shoulder Shrugs | youtube.com/...lLlTDqZ2cy0 | fallback |
| Wrist Circles | NULL | generic |
| Standing Heel Raises | NULL | generic |
| Seated Knee Lifts | NULL | generic |

---

## Video Matching Logic

### Location
- `server/video-safety-check.ts` - Runtime safety validation
- `shared/exerciseVideoCatalog.ts` - Category definitions and rules

### Three-Tier Matching System

1. **Exact** – Video title matches exercise name
   - Example: "Frontal Raises" video → "Arm Raises (Front)" exercise
   
2. **Category** – Video is in the same movement family
   - Example: Any shrug video → "Shoulder Shrugs" exercise
   
3. **Generic** – No safe video match, show text instructions instead
   - Example: "Wrist Circles" has no matching video in library

### Movement Category Definitions

```typescript
const MOVEMENT_CATEGORIES = {
  heel_raise: ['heel raise', 'heel raises', 'calf raise', 'calf raises', 'toe raise'],
  knee_lift: ['knee lift', 'knee lifts', 'leg lift', 'leg raise', 'marching'],
  shoulder_shrug: ['shrug', 'shrugs', 'shoulder shrug', 'overhead shrug'],
  wrist_mobility: ['wrist circle', 'wrist circles', 'wrist rotation', 'wrist mobility'],
  breathing: ['breathing', 'breath', 'diaphragm', 'balloon', 'respiratory'],
  arm_raise: ['arm raise', 'frontal raise', 'lateral raise', 'shoulder raise'],
  bicep_curl: ['bicep curl', 'curl', 'arm curl', 'dumbbell curl'],
  push: ['push-up', 'pushup', 'push up', 'push-away', 'wall push', 'press'],
  squat: ['squat', 'squats', 'sit to stand', 'chair squat', 'box squat'],
  lunge: ['lunge', 'lunges', 'split squat', 'static lunge'],
  core: ['core', 'ab', 'abdominal', 'plank', 'dead bug', 'bird dog'],
  stretch: ['stretch', 'stretching', 'mobility', 'flexibility'],
  walk: ['walk', 'walking', 'march', 'step', 'gait']
};
```

---

## Video Mismatch Issue (Fixed)

### The Problem
Exercises were getting fallback videos from **different movement categories**:

| Exercise | Was Showing | Problem |
|----------|-------------|---------|
| Standing Heel Raises | Static Lunge video | Lunge ≠ heel raise |
| Seated Knee Lifts | Squat to Box video | Squat ≠ knee lifts |
| Wrist Circles | Breathing video | Breathing ≠ wrist |

### The Fix
1. Set `video_url = NULL` for exercises with no safe category match
2. Added `video_match_type = 'generic'` to track these
3. UI now shows supportive text instructions for exercises without videos
4. Server runs safety check on startup to prevent regression

### Safety Check (runs on server startup)
```typescript
// server/video-safety-check.ts
const UNSAFE_VIDEO_EXERCISE_NAMES = [
  'Wrist Circles',
  'Seated Knee Lifts', 
  'Standing Heel Raises'
];

// Automatically clears video_url for these if they have mismatched videos
```

---

## Key Files

| File | Purpose |
|------|---------|
| `server/breast-cancer-pathway.ts` | Pathway logic, session generation |
| `server/routes.ts` | API endpoints |
| `server/video-safety-check.ts` | Startup video validation |
| `shared/schema.ts` | Drizzle database schema |
| `shared/exerciseVideoCatalog.ts` | Video matching rules |
| `client/src/pages/session-execution.tsx` | Exercise session UI |
| `client/src/pages/patient-dashboard.tsx` | Main dashboard |
| `client/src/pages/dev-patient-log.tsx` | Coach/dev log view |

---

## Demo URLs

- **Patient Dashboard:** `https://workspace.davenowercise.worf.replit.dev/?demo=true`
- **Coach Log:** `https://workspace.davenowercise.worf.replit.dev/dev/patient-log?demo=true&demo-role=specialist`

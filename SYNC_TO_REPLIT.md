# Sync Local → Replit Checklist

Treat local `nowercise-app` as source of truth. Sync these files to Replit.

## Files to Sync

### Server
| File | Key changes |
|------|-------------|
| `server/index.ts` | PORT from `process.env.PORT` |
| `server/routes.ts` | History logging, log-completion mode_decision fallback, dev warning |
| `server/history.ts` | buildHistorySummaries, modeDecision persistence |
| `server/services/sessionGeneratorService.ts` | modeDecision in session generation |

### Client
| File | Key changes |
|------|-------------|
| `client/src/pages/history.tsx` | Debug panel, empty state, timeout, error handling |
| `client/src/pages/today.tsx` | "Why this plan?" UI |
| `client/src/pages/session-execute.tsx` | modeDecision in completion payload |
| `client/src/pages/session-overview.tsx` | modeDecision / explanation |
| `client/src/lib/modeExplanation.ts` | renderFriendlyExplanation |
| `client/src/App.tsx` | Route updates if any |

### Shared / DB
| File | Key changes |
|------|-------------|
| `shared/schema.ts` | mode_decision columns |
| `migrations/0002_add_mode_decision.sql` | Add mode_decision, mode_decision_json |
| `scripts/apply_migration_0002.js` | Migration runner |

### Tests
| File | Key changes |
|------|-------------|
| `server/__tests__/history.test.ts` | modeDecision tests |
| `server/__tests__/engine.scenarios.test.ts` | Engine scenarios |
| `server/__tests__/modeExplanation.test.ts` | modeExplanation tests |
| `server/__tests__/scenarioRunner.ts` | Scenario runner |
| `server/__tests__/scenarioFixtures.ts` | Fixtures |
| `server/decisionEngine/__tests__/markers.test.ts` | Markers tests |

---

## Sync Method (Git)

1. **On local Mac**, commit and push:
   ```bash
   cd /Users/superdeepee/Desktop/Nowercise/nowercise-app
   git add -A
   git status   # verify
   git commit -m "Sync: PORT fix, modeDecision, history debug, migration"
   git push origin main
   ```

2. **On Replit**, pull:
   ```bash
   git pull origin main
   ```

3. **On Replit**, run migration (if not done):
   ```bash
   node scripts/apply_migration_0002.js
   ```

---

## Verification (after sync)

1. **server/index.ts** – confirm:
   ```ts
   const PORT = Number(process.env.PORT) || 5000;
   ```

2. **No hardcoded port 5000** – only fallback in `PORT || 5000`

3. **/api/history** – returns `{ ok: true, days: [...] }`

4. **Server starts** on Replit-assigned port without EADDRINUSE

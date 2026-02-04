# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-09
**Commit:** 3349bf3
**Branch:** main

## OVERVIEW

React dashboard for GraphWiz-XR system administration and monitoring.

## STRUCTURE

```
admin-client/
├── src/
│   ├── App.tsx                # Main dashboard with tab navigation
│   ├── api-client.ts          # Admin API integration (all typed)
│   ├── UserManagement.tsx       # User list/ban/role UI
│   ├── RoomManagement.tsx      # Room list/edit/close/delete UI
│   ├── RoomPersistence.tsx     # Room state load/save UI
│   ├── HistoricalMetrics.tsx   # Metrics visualization
│   ├── LogsViewer.tsx         # Real-time log viewer
│   └── RestartModal.tsx        # Service restart modal
├── vitest.config.ts         # Vitest + jsdom setup
└── package.json             # Vite + React 18
```

## WHERE TO LOOK

| Task                  | Location                                       | Notes                              |
| --------------------- | ---------------------------------------------- | ---------------------------------- |
| Dashboard nav logic   | `src/App.tsx`                                  | 5 tabs, 10s polling interval       |
| API calls             | `src/api-client.ts`                            | All admin endpoints typed          |
| User management       | `src/UserManagement.tsx`                       | Pagination, search, ban/role       |
| Room management       | `src/RoomManagement.tsx`                       | Edit modal, delete confirm         |
| Service health checks | `src/App.tsx` (useEffect)                      | Polls each service port separately |
| Service restart       | `src/App.tsx` (handleRestart/handleRestartAll) | Polls until healthy (12 attempts)  |
| Unit testing          | `src/__tests__/` + `vitest.config.ts`          | jsdom environment, globals enabled |

## ANTI-PATTERNS

### Prohibited

- **No direct localhost hardcoding** - Use process.env.REACT_APP_API_URL for API base
- **No alert() for errors** - Use toasts/modals, alerts only for success confirmations
- **No blocking operations** - Service restart uses async polling with 5s intervals
- **No unhandled service failures** - All API calls return fallback values (empty arrays, zeros)
- **No missing confirmation dialogs** - Ban/delete/close actions require explicit user confirmation

### Admin-Specific Gotchas

- **Service ports differ** - Auth:8011, Hub:8012, Presence:8013, SFU:8014, Storage:8015
- **Restart polling** - After restart, polls every 5s for 12 attempts (1 min timeout)
- **Health status** - Returns 'error' on timeout, 'degraded' on slow response, 'healthy' normal
- **Log pagination** - All services queried in parallel, then client-side filtering applied
- **Room state** - Separate from room config; stored as JSON blob in Hub service

# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-09
**Scope:** packages/shared/types/ - Shared TypeScript utilities and types

## OVERVIEW

Central TypeScript utilities and type definitions shared across all frontend clients

## STRUCTURE

```
packages/shared/types/src/
├── logger.ts          # Environment-aware logging
├── api-client.ts      # HTTP client with retry logic
├── utils.ts           # Shared utility functions
├── types.ts           # Common type definitions
└── index.ts           # Main exports
```

## WHERE TO LOOK

| Feature                  | Location          | Notes                                    |
| ------------------------ | ----------------- | ---------------------------------------- |
| Logger                   | src/logger.ts     | Context-based, dev vs prod filtering     |
| API client with retry    | src/api-client.ts | Exponential backoff, 2 retries default   |
| Math utilities           | src/utils.ts      | lerp, slerp, distance, clamp, uuid       |
| Common types             | src/types.ts      | User, Room, Chat, Asset, AuthToken, etc. |
| Protocol type re-exports | src/types.ts      | Imports from @graphwiz/protocol          |

## ANTI-PATTERNS

### Prohibited

- **No console.log** - Always use `createLogger(context)` with debug/info/warn/error levels
- **No direct fetch** - Use `makeApiRequest()`, `get()`, `post()` wrappers for automatic retry
- **No duplicate protocol types** - Import Vector3, Quaternion, Message, etc. from `@graphwiz/protocol` via types.ts
- **No manual retry logic** - api-client handles exponential backoff (1s, 2s) with AbortController for timeouts
- **No missing error handling** - ApiResponse always has `{ success, data?, message?, error? }`

### Technical Debt

- None currently identified - utilities are lean and well-encapsulated

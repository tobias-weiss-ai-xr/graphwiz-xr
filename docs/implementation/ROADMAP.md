# GraphWiz-XR Development Roadmap

## Overview

This roadmap outlines the remaining development tasks for GraphWiz-XR, organized by priority and dependency.

**Last Updated**: 2026-01-01

**Recent Progress**:
- ✅ Fixed all TypeScript compilation errors in production files (181 → 0 errors)
- ✅ Added professional badges and screenshot to README
- ✅ Build system successfully compiling
- ✅ WebSocket integration complete with E2E tests

> **📋 Looking for immediate action items?** Check out [NEXT_STEPS.md](./NEXT_STEPS.md) for detailed task breakdowns and quick wins!

---

## Priority 1: Core Features Completion 🔴

### 1.1 Complete WebSocket Integration ✅
**Status**: COMPLETED (2025-12-31)

- [x] Fix infinite loop in React hooks
- [x] Fix port configuration
- [x] Fix WebSocket manager registration
- [x] Add E2E tests
- [x] Setup CI/CD pipeline

### 1.2 Storage Service 🔴
**Priority**: HIGH - Required for user-generated content

**Backend Tasks**:
```rust
// packages/services/reticulum/storage/
```
- [ ] Create storage service structure
  - [ ] Asset upload endpoints (images, models, audio)
  - [ ] CDN integration (S3, CloudFlare R2, or self-hosted)
  - [ ] Asset metadata database tables
  - [ ] File validation and virus scanning
  - [ ] Permission system (user/room/asset ownership)
- [ ] API Endpoints
  - [ ] `POST /storage/upload` - Upload asset
  - [ ] `GET /storage/assets/{id}` - Retrieve asset
  - [ ] `GET /storage/assets` - List user assets
  - [ ] `DELETE /storage/assets/{id}` - Delete asset
  - [ ] `GET /storage/presigned-url` - Get upload URL

**Frontend Tasks**:
```typescript
// packages/clients/hub-client/src/storage/
```
- [ ] Upload component with drag-and-drop
- [ ] Asset browser/manager UI
- [ ] Progress tracking for uploads
- [ ] Image preview and metadata editing

**Dependencies**: PostgreSQL, S3-compatible storage

**Estimated Time**: 3-5 days

---

### 1.3 Avatar System 🔴
**Priority**: HIGH - Core social feature

**Backend Tasks**:
- [ ] Avatar configuration schema
  - [ ] Body type selection
  - [ ] Color customization
  - [ ] Asset attachment points
  - [ ] Custom model upload
- [ ] Avatar API
  - [ ] `GET /avatars/default` - Get default avatar config
  - [ ] `GET /avatars/user/{user_id}` - Get user's avatar
  - [ ] `PUT /avatars/user/{user_id}` - Update avatar
  - [ ] `POST /avatars/custom` - Upload custom avatar

**Frontend Tasks**:
```typescript
// packages/clients/hub-client/src/avatar/
```
- [ ] Avatar creation component
- [ ] Real-time avatar preview
- [ ] Avatar spawn with configuration
- [ ] Avatar persistence to backend

**Components**:
- [ ] `AvatarConfigComponent` - Stores avatar configuration
- [ ] `AvatarSystem` - Handles avatar spawning and updates

**Estimated Time**: 4-6 days

---

## Priority 2: Advanced Features 🟡

### 2.1 Scene/Room Persistence 🟡
**Priority**: MEDIUM - Required for persistent rooms

**Tasks**:
- [ ] Room configuration storage
  - [ ] Scene layout (entity positions, types)
  - [ ] Environment settings (lighting, skybox)
  - [ ] Spawn points and teleportation zones
- [ ] Room template system
  - [ ] Predefined room templates
  - [ ] Custom room creation
  - [ ] Room cloning/forking
- [ ] Persistence API
  - [ ] `POST /rooms/{id}/save` - Save room state
  - [ ] `GET /rooms/{id}/load` - Load room state
  - [ ] `GET /rooms/templates` - List templates

**Estimated Time**: 3-4 days

---

### 2.2 Media Playing 🟡
**Priority**: MEDIUM - Social feature

**Tasks**:
- [ ] Video player component (3D screen)
- [ ] Audio player (spatial audio)
- [ ] Shared playback (all users see same video)
- [ ] YouTube/Vimeo integration
- [ ] Screen sharing from desktop

**Estimated Time**: 3-5 days

---

### 2.3 Drawing & Whiteboard 🟡
**Priority**: MEDIUM - Collaboration feature

**Tasks**:
- [ ] Drawing component (3D lines in space)
- [ ] Texture drawing on entities
- [ ] Whiteboard entity
- [ ] Drawing history/undo
- [ ] Multi-user drawing sync

**Estimated Time**: 4-5 days

---

### 2.4 Portal System 🟡
**Priority**: MEDIUM - Navigation feature

**Tasks**:
- [ ] Portal entity component
  - [ ] Target room/spec
  - [ ] Position and rotation
  - [ ] Visual appearance
- [ ] Portal interaction (walk through)
- [ ] Room linking
- [ ] Portal spawning system

**Estimated Time**: 2-3 days

---

### 2.5 Emoji Reactions 🟢
**Priority**: LOW - Nice-to-have social feature

**Tasks**:
- [ ] Emoji picker UI
- [ ] Floating emoji spawning
- [ ] Emoji lifecycle (appear, float, fade)
- [ ] Network sync for emoji
- [ ] Emoji sounds/visuals

**Estimated Time**: 2 days

---

## Priority 3: Admin & Moderation 🔵

### 3.1 Admin Dashboard 🔵
**Priority**: LOW - Management tool

**Frontend**:
- [ ] Admin client implementation
- [ ] User management table
  - [ ] View all users
  - [ ] Ban/unban users
  - [ ] Role management
- [ ] Room management
  - [ ] View active rooms
  - [ ] Close problematic rooms
  - [ ] Room configuration editor
- [ ] System metrics dashboard
  - [ ] Real-time stats
  - [ ] Historical data
  - [ ] Performance graphs

**Backend**:
- [ ] Admin authentication middleware
- [ ] Admin-only endpoints
- [ ] Metrics aggregation
- [ ] Audit logging

**Estimated Time**: 5-7 days

---

## Priority 4: Performance & Polish 🟣

### 4.1 Performance Optimization 🟣

**Backend**:
- [ ] Database query optimization
- [ ] Redis caching for frequent queries
- [ ] Connection pooling tuning
- [ ] WebSocket message batching
- [ ] Load testing and profiling

**Frontend**:
- [ ] Instancing for repeated objects
- [ ] Geometry merge for static scenes
- [ ] Texture compression
- [ ] Code splitting for faster initial load
- [ ] Asset lazy loading

**Estimated Time**: 4-6 days

---

### 4.2 Testing & Quality Assurance 🟣

**Unit Tests**:
- [ ] Increase coverage to 80%+
- [ ] Frontend component tests
- [ ] Backend service tests
- [ ] ECS system tests

**Integration Tests**:
- [ ] Full stack E2E tests
- [ ] Load testing (1000+ concurrent users)
- [ ] Chaos testing (connection failures)
- [ ] Security testing

**Estimated Time**: 3-4 days

---

## Development Timeline

### Sprint 1 (Week 1-2) - Core Features
- Storage service implementation
- Avatar system
- Basic room persistence

### Sprint 2 (Week 3-4) - Advanced Features
- Media playing
- Drawing tools
- Portal system
- Emoji reactions

### Sprint 3 (Week 5-6) - Polish
- Admin dashboard
- Performance optimization
- Testing and QA

---

## Quick Wins (Can be done in 1-2 days)

1. **Emoji Reactions** - Simple floating emoji system
2. **Better Error Handling** - User-friendly error messages
3. **Loading States** - Better UX during connection/setup
4. **Keyboard Shortcuts** - Common actions (mute, chat, etc.)
5. **User Settings** - Volume, graphics quality, etc.

---

## Technical Debt & Refactoring

### High Priority
- [ ] Fix all clippy warnings in Rust code
- [ ] Remove unused dependencies
- [ ] Standardize error handling patterns
- [ ] Improve TypeScript type safety

### Medium Priority
- [ ] Extract common patterns into shared utilities
- [ ] Add more integration tests
- [ ] Improve documentation coverage
- [ ] Performance profiling

---

## Next Immediate Steps (This Week)

1. **Storage Service** - Start with basic S3 integration
2. **Avatar System** - Begin with default avatar configuration
3. **Quick Wins** - Implement emoji reactions for immediate value

---

## Contributing

See `IMPLEMENTATION_STATUS.md` for what's already completed.

To pick up a task:
1. Create a branch from `develop`
2. Implement the feature
3. Add tests
4. Update documentation
5. Submit PR with `Ready for review` label

---

## Questions?

- See `IMPLEMENTATION_STATUS.md` for architecture details
- See individual package `README.md` files for specific documentation
- See `docs/arc42.md` for architecture decisions

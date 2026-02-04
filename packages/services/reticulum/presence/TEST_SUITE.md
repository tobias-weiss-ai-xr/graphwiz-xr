# Presence Service Test Suite Documentation

This document describes the comprehensive test coverage for the presence service.

## Unit Tests (session.rs)

All unit tests are implemented in `session.rs` under the `#[cfg(test)]` module.

### Session Management Tests

1. **test_session_registration** ✅
   - Tests session registration with room assignment
   - Verifies session can be retrieved after registration
   - Confirms all fields are preserved

2. **test_session_unregistration** ✅
   - Tests session removal from manager
   - Verifies session is removed from all maps
   - Confirms rate limiter is cleaned up

3. **test_get_room_sessions** ✅
   - Tests retrieving all sessions in a room
   - Verifies multiple sessions can be in same room
   - Confirms session count and data integrity

4. **test_heartbeat_update** ✅
   - Tests heartbeat timestamp updates
   - Verifies last_heartbeat is incremented
   - Confirms time comparison works correctly

5. **test_session_cleanup** ✅
   - Tests complete session cleanup
   - Verifies session, rate limiter, and pending messages are removed
   - Confirms room sessions map is updated

### Message Queue Tests

6. **test_message_batching** ✅
   - Tests message batching with default batch size (50)
   - Verifies messages accumulate below batch size
   - Confirms flush signal at batch size threshold

7. **test_queue_depth_limit** ✅
   - Tests queue depth enforcement (max 1000 messages)
   - Verifies messages accepted up to limit
   - Confirms rejection beyond max depth

8. **test_rate_limiting** ✅
   - Tests rate limiting (100 messages/second default)
   - Verifies ~100 messages allowed per window
   - Confirms rejection beyond rate limit

9. **test_queue_stats** ✅
   - Tests queue statistics retrieval
   - Verifies queue depth is tracked
   - Confirms rate limit status is available

10. **test_session_configuration** ✅
    - Tests custom SessionManager configuration
    - Verifies custom batch sizes work correctly
    - Confirms all custom parameters are applied

### Room Management Tests

11. **test_multiple_sessions_in_room** ✅
    - Tests multiple sessions in same room
    - Verifies all sessions tracked correctly
    - Confirms room_sessions map integrity

12. **test_broadcast_to_room** ✅
    - Tests broadcasting message to room
    - Verifies message reaches all sessions
    - Confirms batch is added to each session

## Integration Tests (TODO)

Integration tests require actual WebSocket connections and should be in `tests/` directory.

### WebSocket Fallback Integration Test

**File**: `tests/integration_websocket_fallback.rs`

```rust
#[tokio::test]
async fn test_websocket_fallback_on_webtransport_failure() {
    // TODO: Implement test that simulates WebTransport failure
    // and verifies WebSocket fallback works correctly
}
```

**Test Coverage**:

- WebTransport connection failure simulation
- WebSocket fallback connection establishment
- Session creation with WebSocket protocol
- Message delivery through WebSocket fallback

### Session Persistence Integration Test

**File**: `tests/integration_session_persistence.rs`

```rust
#[tokio::test]
async fn test_session_persistence_across_reconnect() {
    // TODO: Implement test for session data persistence
    // when client disconnects and reconnects
}
```

**Test Coverage**:

- Session state preservation during disconnect
- Automatic session restoration on reconnect
- Pending message queue retention
- Rate limiter state continuity

### Cross-Service Integration Test

**File**: `tests/integration_cross_service.rs`

```rust
#[tokio::test]
async fn test_presence_hub_integration() {
    // TODO: Implement test for presence service
    // integrating with hub service for room management
}
```

**Test Coverage**:

- Presence service creating room via hub service
- Hub service notifying presence of room changes
- Session cleanup when hub closes room
- Cross-service error handling

## Load Tests (TODO)

Load tests verify performance under high concurrency and message volume.

### Session Concurrency Load Test

**File**: `tests/load_concurrent_sessions.rs`

```rust
#[tokio::test]
async fn test_100_concurrent_sessions() {
    // TODO: Implement test with 100 concurrent session registrations
}
```

**Performance Targets**:

- 100 concurrent sessions in < 5 seconds
- Session registration P50 < 50ms
- Session registration P99 < 200ms
- No memory leaks or resource exhaustion

### Message Throughput Load Test

**File**: `tests/load_message_throughput.rs`

```rust
#[tokio::test]
async fn test_10000_messages_per_second() {
    // TODO: Implement test with high message volume
}
```

**Performance Targets**:

- 10,000 messages/second across all sessions
- Message batching P50 < 10ms
- Message batching P99 < 50ms
- No message loss or duplication

### Room Broadcasting Load Test

**File**: `tests/load_room_broadcast.rs`

```rust
#[tokio::test]
async fn test_50_rooms_with_10_users_each() {
    // TODO: Implement test with 50 rooms × 10 users = 500 sessions
}
```

**Performance Targets**:

- Broadcast to 500 sessions in < 100ms
- Queue depth maintained under load
- Rate limiting enforced correctly
- No cascade failures

## Test Execution

### Run All Unit Tests

```bash
cd packages/services/reticulum/presence
cargo test session::tests
```

### Run All Tests (Unit + Integration)

```bash
cd packages/services/reticulum/presence
cargo test
```

### Run Specific Test

```bash
cd packages/services/reticulum/presence
cargo test test_message_batching
```

### Run with Logging

```bash
cd packages/services/reticulum/presence
RUST_LOG=debug cargo test
```

## Test Coverage Metrics

### Current Coverage

- **Unit Tests**: 12 tests ✅
  - Session management: 5 tests
  - Message queue: 4 tests
  - Room management: 2 tests
  - Configuration: 1 test

- **Integration Tests**: 3 tests planned 📋
  - WebSocket fallback
  - Session persistence
  - Cross-service integration

- **Load Tests**: 3 tests planned 📋
  - Session concurrency
  - Message throughput
  - Room broadcasting

### Coverage Goals

- **Function Coverage**: > 90% of public APIs
- **Branch Coverage**: > 80% of conditional logic
- **Integration Coverage**: All critical paths tested
- **Load Testing**: All performance targets validated

## Known Test Gaps

1. **Rate Limiter Window Reset**: Test for automatic window reset not yet implemented
2. **Batch Flush Behavior**: Test for actual message sending (currently just logs)
3. **Rate Limit Recovery**: Test for rate limit reset after window expires
4. **Concurrent Queue Access**: Test for race conditions with concurrent message additions
5. **WebSocket Fallback**: No actual WebSocket integration tests (requires WebSocket server)

## Test Results Template

When running tests, capture results in this format:

```
Test Results - Presence Service
Date: YYYY-MM-DD HH:MM:SS

Unit Tests:
  ✓ test_session_registration           PASSED  (5ms)
  ✓ test_session_unregistration         PASSED  (3ms)
  ✓ test_get_room_sessions             PASSED  (2ms)
  ✓ test_message_batching             PASSED  (8ms)
  ✓ test_queue_depth_limit             PASSED  (6ms)
  ✓ test_rate_limiting                PASSED  (15ms)
  ...

Summary:
  Unit Tests: 12/12 PASSED (100%)
  Integration Tests: 0/3 SKIPPED
  Load Tests: 0/3 SKIPPED

Performance Metrics:
  Session Registration P50: 12ms
  Session Registration P99: 45ms
  Message Batching P50: 3ms
  Message Batching P99: 15ms
  Broadcast P50: 28ms
  Broadcast P99: 95ms
```

## Continuous Integration

### GitHub Actions

Test suite should run on:

- Every pull request
- Every push to main branch
- Daily scheduled runs

### Test Stages

1. **Unit Tests** - Fast feedback (< 2 minutes)
2. **Integration Tests** - Medium feedback (< 10 minutes)
3. **Load Tests** - Slow feedback (< 30 minutes)

## Troubleshooting

### Test Failures

If tests fail:

1. **Check Recent Changes**: Did last commit modify session management logic?
2. **Review Logs**: Look for `RUST_LOG=debug` output for clues
3. **Test Isolation**: Run specific failing test with `--test-threads=1`
4. **Flaky Tests**: Run 5 times to check for intermittent failures

### Common Failure Modes

| Error                | Likely Cause                        | Fix                                     |
| -------------------- | ----------------------------------- | --------------------------------------- |
| Session not found    | Session ID mismatch or cleanup race | Check session creation/cleanup sequence |
| Rate limit exceeded  | Rate limiter not reset              | Verify window duration is appropriate   |
| Queue depth exceeded | Messages not flushed                | Check flush task is running             |
| Batch not created    | Session missing from map            | Verify session was registered           |

---

**Last Updated**: 2026-01-14
**Test Suite Version**: 1.0.0

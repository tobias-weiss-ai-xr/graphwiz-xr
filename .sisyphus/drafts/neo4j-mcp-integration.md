# Draft: Neo4j MCP Integration Plan

## Initial Request

User shared: https://github.com/neo4j-contrib/mcp-neo4j/
Request: "formal plan"

## Research Completed ✓

### Current GraphWiz-XR Data Layer

- **Database**: SeaORM + PostgreSQL (users, rooms, entities, room_states, assets, sessions)
- **Caching**: Redis with TTL management (60s to 24h)
- **Frontend ECS**: 12 component types (Transform, Physics, Audio, Animation, Model, Light, Camera, NetworkSync, Interactable, Billboard, Particle, Grabbable)
- **Protocol**: gRPC/WebTransport for real-time sync
- **Gap**: NO graph/relationship system exists - only FK-based references

### Neo4j MCP Architecture

- **Language**: Python-based using `fastmcp>=2.10.5`
- **Transports**: STDIO (default), HTTP (Streamable), SSE (legacy)
- **Available Tools**:
  - `mcp-neo4j-cypher`: get_schema, read_cypher, write_cypher
  - `mcp-neo4j-memory`: 9 tools for knowledge graph CRUD
  - `mcp-neo4j-data-modeling`: 15+ tools for schema/validation
- **Client SDK**: `@modelcontextprotocol/sdk` (TypeScript native)

## Integration Opportunities (Identified)

| Priority   | Use Case                       | Value                                                          |
| ---------- | ------------------------------ | -------------------------------------------------------------- |
| **HIGH**   | Scene Graph & Entity Hierarchy | Parent-child relationships, containment, transform inheritance |
| **HIGH**   | Social Graph                   | Friends/follow/block, "friends of friends" queries             |
| **MEDIUM** | Room Discovery                 | "Rooms your friends are in", recommendations                   |
| **MEDIUM** | Asset Lineage                  | Dependency tracking, usage graphs                              |
| **LOW**    | Context Memory                 | NPC/AI interaction history                                     |

## Recommended Architecture

```
hub-client (TypeScript)
    ↓ @modelcontextprotocol/sdk (StreamableHTTPClientTransport)
mcp-neo4j-cypher (Docker, HTTP :8001)
    ↓ bolt://
Neo4j Database (Docker :7687)
```

## Key Files to Modify/Create

### New Files

- `packages/services/reticulum/graph/` - New Rust microservice for Neo4j integration
- `packages/clients/hub-client/src/network/mcpClient.ts` - MCP client
- `packages/deploy/docker-compose.neo4j.yml` - Neo4j + MCP container definitions

### Modified Files

- `packages/services/reticulum/hub/src/handlers/entity.rs` - Sync to Neo4j
- `packages/services/reticulum/core/src/models/` - Add relationship models
- `packages/clients/hub-client/src/ecs/components.ts` - Add Parent/Children components

## Questions to Clarify

1. **Primary use case**: Which of the 5 opportunities to prioritize?
2. **Scope**: Single feature (e.g., social graph) or comprehensive integration?
3. **Deployment**: Docker (local dev) or Neo4j Aura (cloud)?

## Decisions

_Awaiting user confirmation_

---

_Draft updated: 2026-02-15_

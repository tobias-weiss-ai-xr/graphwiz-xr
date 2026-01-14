# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-09
**Commit:** 3349bf3
**Branch:** main

## OVERVIEW

Protocol buffers definitions and generated code for cross-language communication between TypeScript clients and Rust services.

## STRUCTURE

```
packages/shared/protocol/
├── proto/         # 6 .proto files (agent, auth, core, media, networking, room)
├── src/           # builder.ts, parser.ts, types.ts, generated/ (TS)
├── rust/          # Generated Rust (prost/tonic gRPC)
├── python/         # Generated Python (grpcio)
└── scripts/        # generate-proto.sh
```

## WHERE TO LOOK

**Proto:** `proto/*.proto` (6 files)
**Builder:** `src/builder.ts` (MessageBuilder)
**Parser:** `src/parser.ts` (MessageParser)
**Types:** `src/types.ts`
**Regenerate:** `pnpm build:proto`
**TS:** `src/generated/` (proto.js, proto.d.ts)
**Rust:** `rust/*.rs` (prost/tonic)
**Python:** `python/*.py` (grpcio)

## CONVENTIONS

### Generation

Run `pnpm build:proto` after .proto changes (protobufjs for TS, protoc for Rust/Python). DO NOT EDIT generated files. types.ts currently manual (TODO: proto-gen sync).

### MessageBuilder/Parser

```typescript
import { MessageBuilder, MessageParser } from '@graphwiz/protocol';
const msg = MessageBuilder.createPositionUpdate({...});
const buffer = MessageParser.serialize(message);
const parsed = MessageParser.parse(buffer);
```

### Multi-language

**TS:** `import { Message, MessageBuilder, MessageParser } from '@graphwiz/protocol'`
**Rust:** `use graphwiz_protocol::{LogLevel, StartRequest};`
**Python:** `from agent_pb2 import LogLevel, StartRequest`

## ANTI-PATTERNS

**Prohibited:** Editing generated files (modify .proto, run `pnpm build:proto`), skipping regeneration, manual type changes, JSON for high-frequency (TODO: binary protobuf).

**Technical Debt:** types.ts manually maintained, JSON payloads instead of binary protobuf, only 3 proto files fully generated (agent, auth, room).

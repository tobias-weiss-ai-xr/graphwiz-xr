# Avatar Not Rendering - Root Cause Analysis

## Date: 2026-03-01
## Issue Reported: "Avatar not displaying and room seems empty when dev server runs"

## Investigation Summary

### Files Analyzed
1. **App.tsx** (lines 1497-1532): Avatar rendering logic
2. **App.tsx** (lines 728-749): Local player entity creation
3. **App.tsx** (lines 220-230): WebSocket connection setup
4. **websocket-client.ts**: Client initialization and hello message
5. **protobuf.rs** (Presence service): SERVER_HELLO response handling

### Key Findings

#### Frontend Rendering Logic (APP.TSX)
The local player avatar IS correctly rendered when  is set:



#### WebSocket Connection Flow
1. Client creates WebSocketClient with client_id (UUID)
2. Client sends CLIENT_HELLO message to Presence service (ws://localhost:8003)
3. Presence service responds with SERVER_HELLO containing 
4. Frontend sets  from 
5. **PlayerAvatar renders immediately when  is truthy**

#### Backend Behavior (Presence Service)
The Presence service's  in  line 41:
- Returns SERVER_HELLO with 
- Does NOT broadcast ENTITY_SPAWN messages
- Does NOT send initial player state

### ROOT CAUSE

**No backend services are running (docker-compose is empty)**

When running NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS, the output shows NO containers running:



Without the Presence service running at :
1. WebSocket connection fails
2.  never gets set (stays null)
3. PlayerAvatar is never rendered (conditional rendering at line 728-749)
4. Room appears empty

### Evidence

Line 221-227 in App.tsx:


If the connection fails,  stays null and the avatar never renders.

## FIX REQUIRED

### Option 1: Start Backend Services (PREFERRED)
#1 [internal] load local bake definitions
#1 reading from stdin 3.51kB done
#1 DONE 0.0s

#2 [admin-client internal] load build definition from Dockerfile.admin-client
#2 transferring dockerfile:
#2 transferring dockerfile: 1.53kB 0.0s done
#2 DONE 0.3s

#3 [auth internal] load build definition from Dockerfile.auth
#3 transferring dockerfile: 1.58kB 0.0s done
#3 DONE 0.3s

#4 [hub internal] load build definition from Dockerfile.hub
#4 transferring dockerfile: 1.35kB 0.0s done
#4 DONE 0.3s

#5 [auth internal] load metadata for docker.io/library/rust:1.88-alpine
#5 ...

#6 [avatar internal] load build definition from Dockerfile.avatar
#6 transferring dockerfile: 2.57kB 0.0s done
#6 DONE 0.4s

#7 [presence internal] load build definition from Dockerfile.presence
#7 transferring dockerfile: 2.58kB 0.0s done
#7 DONE 0.4s

#8 [hub-client internal] load build definition from Dockerfile.hub-client
#8 transferring dockerfile: 2.71kB 0.0s done
#8 DONE 0.4s

#9 [sfu internal] load build definition from Dockerfile.sfu
#9 transferring dockerfile: 1.43kB 0.0s done
#9 DONE 0.4s

#10 [sfu internal] load metadata for docker.io/library/alpine:3.19
#10 ...

#11 [hub-client internal] load metadata for docker.io/library/node:20-alpine
#11 DONE 0.8s

#12 [hub-client internal] load .dockerignore
#12 transferring context: 2B done
#12 DONE 0.1s

#13 [hub-client internal] load build context
#13 DONE 0.0s

#14 [hub-client dependencies 1/8] FROM docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8
#14 resolve docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 0.1s done
#14 DONE 0.1s

#14 [hub-client dependencies 1/8] FROM docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8
#14 CACHED

#13 [hub-client internal] load build context
#13 ...

#5 [auth internal] load metadata for docker.io/library/rust:1.88-alpine
#5 DONE 1.6s

#13 [hub-client internal] load build context
#13 ...

#12 [presence internal] load .dockerignore
#12 transferring context: 2B done
#12 DONE 0.1s

#15 [presence internal] load metadata for docker.io/library/debian:bookworm-slim
#15 DONE 1.7s

#16 [presence internal] load build context
#16 DONE 0.0s

#17 [hub-client dependencies 2/8] WORKDIR /app
#17 DONE 0.7s

#13 [hub-client internal] load build context
#13 ...

#18 [avatar builder  1/15] FROM docker.io/library/debian:bookworm-slim@sha256:74d56e3931e0d5a1dd51f8c8a2466d21de84a271cd3b5a733b803aa91abf4421
#18 resolve docker.io/library/debian:bookworm-slim@sha256:74d56e3931e0d5a1dd51f8c8a2466d21de84a271cd3b5a733b803aa91abf4421 0.1s done
#18 DONE 0.1s

#19 [hub internal] load metadata for docker.io/library/rust:1.75-alpine
#19 DONE 1.9s

#16 [presence internal] load build context
#16 ...

#12 [auth internal] load .dockerignore
#12 transferring context: 2B done
#12 DONE 0.1s

#14 [admin-client dependencies 1/8] FROM docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8
#14 resolve docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 0.1s done
#14 CACHED

#17 [admin-client dependencies 2/8] WORKDIR /app
#17 DONE 0.7s

#10 [auth internal] load metadata for docker.io/library/alpine:3.19
#10 DONE 2.0s

#20 [hub internal] load build context
#20 DONE 0.0s

#21 [auth internal] load build context
#21 DONE 0.0s

#16 [presence internal] load build context
#16 ...

#22 [sfu internal] load build context
#22 DONE 0.0s

#16 [presence internal] load build context
#16 ...

#23 [admin-client internal] load build context
#23 transferring context: 3.71MB 0.5s done
#23 DONE 0.7s

#24 [admin-client dependencies 3/5] COPY packages/clients/admin-client/package.json packages/clients/admin-client/pnpm-lock.yaml ./
#24 ERROR: failed to calculate checksum of ref uftqbc9xmgzu8gk1ymkd67psh::pwlxwa8d2a6wrsm0kvsgwvo1a: "/packages/clients/admin-client/pnpm-lock.yaml": not found

#25 [admin-client production 2/4] RUN apk add --no-cache nginx
#25 CANCELED

#26 [auth builder  1/11] FROM docker.io/library/rust:1.88-alpine@sha256:9dfaae478ecd298b6b5a039e1f2cc4fc040fc818a2de9aa78fa714dea036574d
#26 resolve docker.io/library/rust:1.88-alpine@sha256:9dfaae478ecd298b6b5a039e1f2cc4fc040fc818a2de9aa78fa714dea036574d 0.1s done
#26 DONE 0.7s

#16 [presence internal] load build context
#16 ...

#27 [hub stage-1 2/6] RUN apk add --no-cache     ca-certificates     libgcc
#27 CANCELED

#26 [auth builder  1/11] FROM docker.io/library/rust:1.88-alpine@sha256:9dfaae478ecd298b6b5a039e1f2cc4fc040fc818a2de9aa78fa714dea036574d
#26 sha256:d10869bf5acf1b483e8abfd13984e5282076c5c456ef0e9c82dbcbe638ff826d 0B / 259.43MB 0.7s
#26 ...

#28 [auth builder  2/11] RUN apk add --no-cache     musl-dev     postgresql-client     pkgconf     openssl-dev
#28 CANCELED

#29 [sfu builder 1/8] FROM docker.io/library/rust:1.75-alpine@sha256:65aa0b28d02612a3811a7fd0c65b56e4ba766c35cef71965f1cacae7555771a0
#29 resolve docker.io/library/rust:1.75-alpine@sha256:65aa0b28d02612a3811a7fd0c65b56e4ba766c35cef71965f1cacae7555771a0 0.2s done
#29 sha256:1ffe342ed7260b95666c165ad4e54762468867e4df5879e5fdc34e67cf45212d 5.24MB / 216.89MB 0.8s
#29 sha256:8bee9a3318268c539b5c897260eca6e5a5763f74b9ce4bf5aae4696e6fea0654 2.10MB / 55.34MB 0.8s
#29 sha256:4abcf20661432fb2d719aaf90656f55c287f8ca915dc1c92ec14ff61e67fbaf8 2.10MB / 3.41MB 0.8s
#29 ...

#30 [hub builder 2/8] RUN apk add --no-cache     musl-dev     postgresql-client     pkgconfig     openssl-dev
#30 CANCELED

#22 [sfu internal] load build context
#22 transferring context: 1.39MB 1.1s done
#22 CANCELED

#20 [hub internal] load build context
#20 transferring context: 1.39MB 1.2s done
#20 CANCELED

#16 [presence internal] load build context
#16 transferring context: 1.69MB 1.7s done
#16 CANCELED

#21 [auth internal] load build context
#21 transferring context: 1.83MB 1.1s done
#21 CANCELED

#13 [hub-client internal] load build context
#13 transferring context: 33.72MB 2.6s done
#13 CANCELED

#31 [auth stage-1 1/6] FROM docker.io/library/alpine:3.19@sha256:6baf43584bcb78f2e5847d1de515f23499913ac9f12bdf834811a3145eb11ca1
#31 resolve docker.io/library/alpine:3.19@sha256:6baf43584bcb78f2e5847d1de515f23499913ac9f12bdf834811a3145eb11ca1 0.2s done
#31 sha256:17a39c0ba978cc27001e9c56a480f98106e1ab74bd56eb302f9fd4cf758ea43f 3.42MB / 3.42MB 0.6s done
#31 extracting sha256:17a39c0ba978cc27001e9c56a480f98106e1ab74bd56eb302f9fd4cf758ea43f 0.2s done
#31 ...

#32 [hub-client development  3/10] RUN npm install -g pnpm@8
#32 CANCELED

#33 [avatar builder  2/15] RUN apt-get update && apt-get install -y     pkg-config     libssl-dev     protobuf-compiler     curl     ca-certificates     build-essential     && rm -rf /var/lib/apt/lists/*
#33 1.075 Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]
#33 1.152 Get:2 http://deb.debian.org/debian bookworm-updates InRelease [55.4 kB]
#33 1.174 Get:3 http://deb.debian.org/debian-security bookworm-security InRelease [48.0 kB]
#33 1.575 Get:4 http://deb.debian.org/debian bookworm/main amd64 Packages [8792 kB]
#33 CANCELED

#34 [presence stage-1 2/6] RUN apt-get update && apt-get install -y     ca-certificates     libssl3     wget     && rm -rf /var/lib/apt/lists/*
#34 1.078 Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]
#34 1.154 Get:2 http://deb.debian.org/debian bookworm-updates InRelease [55.4 kB]
#34 1.175 Get:3 http://deb.debian.org/debian-security bookworm-security InRelease [48.0 kB]
#34 1.575 Get:4 http://deb.debian.org/debian bookworm/main amd64 Packages [8792 kB]
#34 CANCELED

#31 [auth stage-1 1/6] FROM docker.io/library/alpine:3.19@sha256:6baf43584bcb78f2e5847d1de515f23499913ac9f12bdf834811a3145eb11ca1
------
 > [admin-client dependencies 3/5] COPY packages/clients/admin-client/package.json packages/clients/admin-client/pnpm-lock.yaml ./:
------

This starts all required services:
- Presence service (port 8003)
- Hub service (port 8002)
- Auth service (port 8001)
- Storage service (port 8005)
- PostgreSQL
- Redis

### Option 2: Mock Local Development Mode
Add a dev mode that renders the local player without backend:


## RECOMMENDATION

Start the docker-compose services. The rendering logic is correct, it just needs the backend to be running.

## Notes Files Updated
- 


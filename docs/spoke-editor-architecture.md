# Spoke Editor Architecture

**Generated:** 2026-03-12  
**Context:** Tauri + React Three Fiber scene editor for GraphWiz-XR  
**Purpose:** Replace Hubs Spoke with modern, native desktop application

---

## Executive Summary

Spoke Editor is a **Tauri 2.0 + React + Three.js** desktop application for creating and editing VR scenes. It follows industry-standard editor UI patterns (Unity/Blender/Spline) with a dockable panel system, real-time 3D viewport, and asset management. The editor supports object hierarchy, transform controls, material editing, and GLTF/GLB export.

**Key Principles:**

1. **Native File Access:** Tauri provides secure, cross-platform file system APIs
2. **React Data Flow:** Single source of truth (scene state) → renders editor UI
3. **Component Composition:** Reusable editor UI components
4. **Performance:** Efficient Three.js scene graph, lazy loading, caching

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         SPOKE EDITOR                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    MAIN LAYOUT                           │    │
│  │  ┌──────────┬─────────────────────────────────┬────────┐│    │
│  │  │  Hierarchy│          3D Viewport             │ Inspector││    │
│  │  │  Panel   │  ┌───────────────────────────┐   │  Panel ││    │
│  │  │  (Left)  │  │  Scene Graph (Ortho/Persp)│   │ (Right)││    │
│  │  │          │  │  - Camera + Lights        │   │        ││    │
│  │  │  - Tree  │  │  - Grid + Gizmos          │   │  - Transform  ││
│  │  │  - Search│  │  - TransformControls      │   │  - Rotation   ││
│  │  │  - Drag- │  │  - Raycasting + Selection │   │  - Scale      ││
│  │  │  Drop    │  └───────────────────────────┘   │  - Material   ││    │
│  │  └──────────┴─────────────────────────────────┴────────┘│    │
│  │                                                            │    │
│  │  ┌─────────────────────────────────────────────────────┐│    │
│  │ │  Assets Panel (Bottom, Dockable)                     ││    │
│  │ │  - Asset Browser                                   ││    │
│  │ │  - Import Models/Textures/Audio                    ││    │
│  │ │  - Thumbnail Preview                               ││    │
│  │ └─────────────────────────────────────────────────────┘│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Toolbars & Menus                                            ││
│  │  - Top: File, Edit, View, Help menus                        ││
│  │  - Viewport: Transform Mode Toggle (Translate/Rotate/Scale)││
│  │  - Viewport: Grid Toggle, Lock Camera, Snap to Grid        ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│  Scene Manager  ──┐  Asset Manager ──┐  File Persistence       │
│  - Scene Graph    │  - Asset Loader  │  - Save/Load (JSON)     │
│  - Transform      │  - GLTF Import   │  - Export to GLTF/GLB   │
│  - Entity CRUD    │  - Texture Cache │  - Auto-save            │
├─────────────────────────────────────────────────────────────────┤
│                      THREE.JS LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ThreeScene ──┐  ThreeCamera ──┐  OrbitControls ──┐  TransformControls │
│  - SceneMgr   │  - Perspective │  - Orbit/Pan/Zoom │  - Transform Gizmos│
│  - Object3D   │  - Orthographic│  - Screen Space   │  - Translate/Rotate/Scale│
│  - Lights     │  - Viewport    │  - Damping        │  - Component Locking│
├─────────────────────────────────────────────────────────────────┤
│                     TAURI BACKEND                                │
├─────────────────────────────────────────────────────────────────┤
│  File System API ──┐  Dialog API ──┐  App Commands              │
│  - read/write files│  - Open/Save  │  - GLTF Export             │
│  - Resource Access │  - Directory  │  - Native Permissions      │
│  - App Directories │               │                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Main Layout Components

#### **SPOKE_EDITOR** (Root)

- **Module:** `spoke/frontend/src/SPOKE_EDITOR.tsx`
- **Purpose:** Main application container
- **State:**
  - Current tool (Translate/Rotate/Scale)
  - Current viewport mode (Perspective/Orthographic)
  - Selected entity ID
  - Undo/redo history

#### **VIEWPORT_CANVAS**

- **Module:** `spoke/frontend/src/components/ViewportCanvas.tsx`
- **Libraries:** `@react-three/fiber`, `@react-three/drei`
- **Children:**
  - `Canvas` with shadows and anti-aliasing
  - `OrbitControls` (orbit, pan, zoom with damping)
  - `TransformControls` (attached to selected entity)
  - `GridHelper` (configurable snap grid)
  - `AxesHelper` (world axes visualization)
  - Lights (ambient, directional for viewport)
  - Environment preset
- **Props:**
  - `sceneRef` (ref to scene graph)
  - `selectedObject` (Three.js Object3D)
  - `cameraMode` ('perspective' | 'ortho')
  - `showGrid` (boolean)
  - `showAxes` (boolean)
  - `showSelectionBox` (boolean)

#### **HIERARCHY_PANEL**

- **Module:** `spoke/frontend/src/components/HierarchyPanel.tsx`
- **UI Pattern:** Tree view with search
- **Features:**
  - Recursive tree rendering
  - Search/filter by name
  - Drag-drop reparenting
  - Context menu (new child, delete, rename)
  - Keyboard shortcuts (Del, F=focus camera, Ctrl+D=dup)
- **Events:**
  - `onEntitySelect(entityId)`
  - `onEntityRename(entityId, newName)`
  - `onEntityDelete(entityId)`
  - `onEntityFocus(entityId)`
  - `onDragDrop(parentId, childId, index)`

#### **INSPECTOR_PANEL**

- **Module:** `spoke/frontend/src/components/InspectorPanel.tsx`
- **UI Pattern:** Tabbed panel with collapsible sections
- **Tabs:**
  - **Transform** (position/rotation/scale inputs)
  - **Material** (color, metalness, roughness, emissive)
  - **Light** (type, intensity, color, distance, decay)
  - **Audio** (volume, spatial settings, autoplay)
  - **Custom** (component-specific props)
- **Features:**
  - Input fields with min/max validation
  - Color picker (react-colorful/react-beautiful-color)
  - Number sliders with step increment
  - Dropdowns for enumerations (light type)
  - Boolean toggles
- **Events:**
  - `onChangeTransform(entityId, data)`
  - `onChangeMaterial(entityId, data)`
  - `onChangeLight(entityId, data)`
  - `onChangeAudio(entityId, data)`

#### **ASSETS_PANEL**

- **Module:** `spoke/frontend/src/components/AssetsPanel.tsx`
- **Features:**
  - Asset browser (thumbnails for models/textures)
  - Import from file/dir
  - Asset cache viewer
  - Drag-drop assets into viewport
- **Assets Supported:**
  - Models (GLB/GLTF/fbx)
  - Textures (PNG/JPG/WebP)
  - Audio (MP3/OGG)
  - Videos (MP4)
- **Events:**
  - `onAssetImport(asset, file)`
  - `onAssetDrop(asset, position, rotation)`

---

### 2. Editor UI Components

#### **TOOLBAR**

- **Module:** `spoke/frontend/src/components/Toolbar.tsx`
- **Sections:**
  - **File Menu:** New, Open, Save, Save As, Export GLTF, Exit
  - **Edit Menu:** Undo, Redo, Cut, Copy, Paste, Delete
  - **View Menu:** Perspective/Orthographic toggle, Grid toggle, Snap toggle
  - **Mode Toggle:** Translate (W), Rotate (E), Scale (R)
  - **Viewport Tools:** Lock camera, center selection, fit to viewport

#### **CONTEXT_MENU**

- **Module:** `spoke/frontend/src/components/ContextMenu.tsx`
- **Trigger:** Right-click in viewport or hierarchy
- **Menu Items:**
  - Create New: Cube, Sphere, Plane, Light, Camera
  - Import: Model, Texture, Audio
  - Edit: Duplicate, Delete, Rename, Group
  - Transform: Center, Reset Transform

#### **COLOR_PICKER**

- **Module:** `spoke/frontend/src/components/ColorPicker.tsx`
- **Library:** `react-colorful` or `react-beautiful-color`
- **Features:**
  - HSL/RGB/HEX formats
  - Preset swatches
  - Custom color input
  - Alpha channel support
- **Placement:** Inspector panel (Material tab)

#### **PROPERTY_INPUT**

- **Module:** `spoke/frontend/src/components/PropertyInput.tsx`
- **Types:**
  - NumberInput (with min/max, step)
  - TextInput (string value)
  - BooleanInput (toggle)
  - SelectInput (dropdown)
  - ColorInput (color picker)
  - Vector3Input (x/y/z with axes labeling)

---

### 3. Three.js Components

#### **SCENE_GRAPH_COMPONENT**

- **Module:** `spoke/frontend/src/components/SceneGraph.tsx`
- **Purpose:** Renders entities in the 3D viewport
- **Features:**
  - Object3D creation for each entity
  - Transform sync (position/rotation/scale)
  - Model loading (GLTFLoader)
  - Material assignment
  - Light/Camera rendering
  - Selection highlighting (outline/emissive)

#### **ORBIT_CONTROLS_WRAPPER**

- **Module:** `spoke/frontend/src/components/OrbitControlsWrapper.tsx`
- **Library:** `@react-three/drei`
- **Features:**
  - Orbit around target
  - Pan (middle mouse or Shift+drag)
  - Zoom (wheel, pinch)
  - Enable/disable switching
  - Damping for smooth motion
  - Min/max distance bounds

#### **TRANSFORM_CONTROLS_CONFIGURATOR**

- **Module:** `spoke/frontend/src/components/TransformControlsConfig.tsx`
- **Library:** `@react-three/drei`
- **Features:**
  - Translate mode (X/Y/Z axes)
  - Rotate mode (X/Y/Z arcs)
  - Scale mode (X/Y/Z boxes)
  - Component locking (lockX/Y/Z)
  - Snap to grid (0.1, 0.5, 1.0)
  - Coordinate system toggle (World/Local)

---

### 4. State Management Components

#### **SCENE_MANAGER**

- **Module:** `spoke/frontend/src/stores/scene-store.ts` (Zustand)
- **State:**
  - `entities: Record<entityId, Entity>`
  - `selectedId: entityId | null`
  - `history: UndoRedoStack`
  - `sceneName: string`
- **Actions:**
  - `addEntity(entity)`
  - `updateEntity(entityId, patch)`
  - `deleteEntity(entityId)`
  - `reparentEntity(entityId, parentId)`
  - `selectEntity(entityId)`
  - `undo()` / `redo()`
  - `clearScene()`

#### **ASSET_MANAGER**

- **Module:** `spoke/frontend/src/stores/asset-store.ts` (Zustand)
- **State:**
  - `assets: Map<assetId, AssetDefinition>`
  - `loading: Record<assetId, boolean>`
  - `thumbnails: Map<assetId, URL>`
- **Actions:**
  - `importAsset(file, assetType)`
  - `loadAsset(assetId)`
  - `getAsset(assetId)`
  - `deleteAsset(assetId)`
  - `clearCache()`

#### **EDITOR_SETTINGS**

- **Module:** `spoke/frontend/src/stores/settings-store.ts` (Zustand)
- **State:**
  - `snapEnabled: boolean`
  - `snapGridSize: number`
  - `showGrid: boolean`
  - `showAxes: boolean`
  - `defaults: {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: [1, 1, 1],
  color: '#808080'
}`
  - `viewportMode: 'perspective' | 'ortho'`
- **Actions:**
  - `updateSetting(key, value)`
  - `resetDefaults()`

---

### 5. Backend (Tauri Rust) Components

#### **FILE_SERVICE**

- **Module:** `spoke/src-tauri/src/file_service.rs`
- **API Commands:**
  - `save_scene(scene_data: &str) -> Result<String>`
  - `load_scene() -> Result<String>`
  - `export_gltf(scene_data: &str, output_path: &str) -> Result<()>`
  - `open_file_dialog() -> Result<Option<String>>`
  - `save_file_dialog(default_name: &str) -> Result<Option<String>>`
  - `get_app_data_dir() -> Result<String>`
- **Features:**
  - Cross-platform path handling
  - Thread-safe file I/O
  - Error handling with proper status codes

#### **GLTF_EXPORTER**

- **Module:** `spoke/src-tauri/src/gltf_exporter.rs`
- **Purpose:** Convert scene to GLTF format using Rust
- **Libraries:** `gltf`, `wgpu` (or use node-three-gltf via tauri-plugin-node)
- **Output:**
  - JSON (.gltf) or binary (.glb)
  - Embedded textures
  - Draco compression (optional)
  - Scene hierarchy preservation

#### **RESOURCE_LOADER**

- **Module:** `spoke/src-tauri/src/resource_loader.rs`
- **Features:**
  - Load assets from resources directory
  - Cache asset data in memory
  - Background loading with progress

---

## File Structure

```
packages/editors/spoke/
├── frontend/                     # React frontend (Vite)
│   ├── src/
│   │   ├── App.tsx              # Root component
│   │   ├── main.tsx             # Entry point
│   │   ├── index.css            # Global styles
│   │   │
│   │   ├── components/          # UI components
│   │   │   ├── SPOKE_EDITOR.tsx           # Main layout
│   │   │   ├── ViewportCanvas.tsx         # 3D scene canvas
│   │   │   ├── HierarchyPanel.tsx         # Object list
│   │   │   ├── InspectorPanel.tsx         # Property editor
│   │   │   ├── AssetsPanel.tsx            # Asset browser
│   │   │   ├── Toolbar.tsx                # Menu bar
│   │   │   ├── ContextMenu.tsx            # Right-click menu
│   │   │   ├── ColorPicker.tsx            # Color picker wrapper
│   │   │   ├── PropertyInput.tsx          # Reusable inputs
│   │   │   ├── TransformControlsConfig.tsx    # Transform tool
│   │   │   ├── SceneGraph.tsx             # Three.js rendering
│   │   │   ├── OrbitControlsWrapper.tsx   # Camera controls
│   │   │   └── LoadingSpinner.tsx         # Loading indicator
│   │   │
│   │   ├── stores/              # Zustand state management
│   │   │   ├── scene-store.ts
│   │   │   ├── asset-store.ts
│   │   │   ├── settings-store.ts
│   │   │   └── undo-redo-store.ts
│   │   │
│   │   ├── types/               # TypeScript types
│   │   │   ├── entity.ts
│   │   │   ├── scene.ts
│   │   │   ├── asset.ts
│   │   │   └── transform.ts
│   │   │
│   │   ├── utils/               # Helper functions
│   │   │   ├── scene-helpers.ts         # Scene graph ops
│   │   │   ├── transform-helpers.ts     # Transform math
│   │   │   ├── file-utils.ts            # File I/O
│   │   │   ├── gltf-utils.ts            # GLTF parsing
│   │   │   └── uuid.ts                # ID generation
│   │   │
│   │   └── hooks/               # Custom React hooks
│   │       ├── useScene.ts
│   │       ├── useAsset.ts
│   │       ├── useKeyboard.ts
│   │       └── useViewport.ts
│   │
│   ├── public/                  # Static assets
│   │   ├── icons/
│   │   └── default-scene.glb
│   │
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── src-tauri/                   # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs              # Tauri entry point
│   │   ├── lib.rs               # Library exports
│   │   ├── file_service.rs      # File system API
│   │   ├── gltf_exporter.rs     # GLTF export
│   │   ├── resource_loader.rs   # Asset loading
│   │   └── util.rs              # Shared utilities
│   │
│   ├── Cargo.toml               # Rust dependencies
│   ├── build.rs                 # Build script
│   ├── tauri.conf.json          # Tauri config
│   ├── capabilities/            # Tauri capabilities
│   │   └── default.json
│   └── icons/                   # App icons
│
├── src/                         # Deprecated (for reference)
│   ├── App.tsx                  # Old implementation
│   └── main.tsx
│
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js           # Tailwind CSS config
├── README.md
└── index.html
```

---

## TypeScript Type Definitions

```typescript
// types/entity.ts

export type EntityType = 'mesh' | 'light' | 'camera' | 'group' | 'empty';

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  parentId: string | null;
  children: string[];
}

export interface TransformData {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

export interface MaterialData {
  color: string;
  emissive: string;
  emissiveIntensity: number;
  metalness: number;
  roughness: number;
  opacity: number;
  transparent: boolean;
}

export interface LightData {
  type: 'ambient' | 'directional' | 'point' | 'spot' | 'hemisphere';
  intensity: number;
  color: string;
  distance: number; // point/spot only
  decay: number; // point/spot only
  angle: number; // spot only
  penumbra: number; // spot only
  castShadow: boolean;
}

export interface CameraData {
  fov: number;
  near: number;
  far: number;
  type: 'perspective' | 'orthographic';
  orthoZoom: number;
}

export interface SceneEntity extends Entity {
  transform: TransformData;
  material?: MaterialData;
  light?: LightData;
  camera?: CameraData;
  modelPath?: string; // GLTF/GLB path (optional)
  audioPath?: string; // Audio path (optional)
  components: Component[];
}

// types/scene.ts

export interface Scene {
  id: string;
  name: string;
  entities: Record<string, SceneEntity>;
  selectedEntityId: string | null;
  createdAt: Date;
  updatedAt: Date;
  metadata: {
    version: string;
    author?: string;
    description?: string;
  };
}

// types/asset.ts

export type AssetType = 'model' | 'texture' | 'audio' | 'video' | 'font' | 'unknown';

export interface AssetDefinition {
  id: string;
  name: string;
  type: AssetType;
  path: string;
  thumbnailUrl?: URL;
  fileUrl?: URL;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    fileSize?: number;
  };
}

// types/transform.ts

import type { Vector3, Euler } from 'three';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Euler {
  x: number;
  y: number;
  z: number;
}

export interface TransformConstraints {
  locked: {
    x: boolean;
    y: boolean;
    z: boolean;
  };
  axis: 'x' | 'y' | 'z' | 'xyz';
  space: 'world' | 'local';
  snapValue?: number;
}

export interface TransformOperation {
  type: 'translate' | 'rotate' | 'scale';
  axis: TransformConstraints['axis'];
  value: number;
}

// types/undo-redo.ts

export interface HistoryState {
  scene: Scene | null;
  selectedId: string | null;
  timestamp: number;
}

export interface UndoRedoStack {
  past: HistoryState[];
  future: HistoryState[];
  currentIndex: number;
  maxStackSize: number;
}
```

---

## Implementation Phases

### Phase 1: Core Foundation

**Priority:** 🔴 HIGH (Week 1)

**Tasks:**

1. Set up Tauri 2.0 with Vite + React + TypeScript
2. Create basic layout (viewport + panels)
3. Implement Three.js scene rendering
4. Add OrbitControls for camera navigation
5. Set up Zustand state management
6. Create Entity type and scene graph data structure

**Deliverables:**

- Basic app skeleton with viewport
- Ability to create and render basic 3D shapes (box, sphere)
- Hierarchy panel with entity list

---

### Phase 2: Object Manipulation

**Priority:** 🔴 HIGH (Week 2)

**Tasks:**

1. Implement TransformControls (translate/rotate/scale)
2. Add inspector panel with property inputs
3. Implement entity selection (raycasting)
4. Add drag-drop reparenting in hierarchy
5. Keyboard shortcuts (W/E/R for tools, Del to delete, F to focus)
6. Snap to grid functionality

**Deliverables:**

- Full transform manipulation
- Inspector editing for position/rotation/scale
- Keyboard control system

---

### Phase 3: Scene Persistence

**Priority:** 🔴 HIGH (Week 3)

**Tasks:**

1. Implement file save/load (JSON format)
2. Add GLTF/GLB model import
3. Create save file dialog (Tauri dialog plugin)
4. Add auto-save functionality
5. Implement undo/redo history
6. Create new/blank scene template

**Deliverables:**

- File save/load system
- Model import from disk
- Auto-save with backup

---

### Phase 4: Material & Assets

**Priority:** 🟡 MEDIUM (Week 4)

**Tasks:**

1. Build color picker component
2. Implement material editing (color, metalness, roughness)
3. Create asset browser panel
4. Add thumbnail generation for models/textures
5. Drag-drop assets from browser to viewport
6. Asset caching and preload management

**Deliverables:**

- Material editor with color picker
- Asset browser with thumbnails
- Drag-drop from asset panel

---

### Phase 5: GLTF Export

**Priority:** 🟡 MEDIUM (Week 5)

**Tasks:**

1. Implement GLTF export in Rust backend
2. Write Three.js GLTFExporter integration
3. Handle texture embedding
4. Add Draco compression (optional)
5. Test with Blender/Maya imports
6. Export scene metadata

**Deliverables:**

- Full GLTF/GLB export
- Texture embedding support
- Cross-tool compatibility

---

### Phase 6: Advanced Features

**Priority:** 🟢 LOW (Week 6+)

**Tasks:**

1. Light system editor (add/remove/edit lights)
2. Camera controls (add/edit/camera types)
3. Audio system integration
4. Animation preview timeline
5. Multi-scene support
6. Plugin system for custom components

**Deliverables:**

- Complete scene editing workflow
- Multi-scene project support
- Extensible architecture

---

## Key Patterns & Best Practices

### 1. Scene Data Model

```typescript
// Single source of truth
const sceneStore = useSceneStore();

// React renders derived state
function InspectorPanel() {
  const entity = sceneStore.getEntity(selectedId);
  return (
    <InspectorPanel>
      <TransformInput
        value={entity.transform}
        onChange={(newTransform) => {
          sceneStore.updateTransform(selectedId, newTransform);
        }}
      />
    </InspectorPanel>
  );
}
```

### 2. Transform Controls Integration

```typescript
// Sync Three.js object with entity
function ViewportCanvas() {
  const selectedId = useSceneStore((s) => s.selectedId);
  const selectedEntity = useSceneStore((s) =>
    selectedId ? s.getEntity(selectedId) : null
  );

  const threeRef = useRef<Group>(null);

  // Sync on selection change
  useEffect(() => {
    if (threeRef.current && selectedEntity) {
      // Three.js object created from entity
      threeRef.current.position.copy(selectedEntity.transform.position);
      // ...etc
    }
  }, [selectedEntity]);

  return (
    <Canvas>
      <OrbitControls />
      <TransformControls
        object={threeRef.current}
        mode={useKeyboardStore((s) => s.currentTool)}
        onSelect={() => onSelectEntity(entityId)}
      />
      {/* Render scene graph... */}
    </Canvas>
  );
}
```

### 3. Undo/Redo Pattern

```typescript
// Zustand store with history
function createUndoRedoStore(set, get) {
  return {
    past: [],
    future: [],

    pushToHistory: (newScene: Scene) => {
      const { past, future } = get();
      set({
        past: [...past.slice(-MAX_HISTORY), { scene: get().scene, timestamp: Date.now() }],
        future: [] // Clear future on new action
      });
      sceneStore.setScene(newScene);
    },

    undo: () => {
      const { past, future, scene } = get();
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      set({
        past: past.slice(0, -1),
        future: [{ scene, timestamp: Date.now() }, ...future]
      });
      sceneStore.setScene(previous.scene);
    },

    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return;

      const next = future[0];
      set({
        past: [...past, { scene, timestamp: Date.now() }],
        future: future.slice(1)
      });
      sceneStore.setScene(next.scene);
    }
  };
}
```

### 4. File I/O Pattern

```typescript
// Frontend calls Tauri commands
async exportToGLTF(scene: Scene) {
  const { invoke } = await import('@tauri-apps/api/core');
  const options = await invoke<{ defaultPath: string, dialogType: string }>(
    'show_save_dialog',
    { defaultName: 'scene.glb' }
  );

  const gltfData = sceneToGLTF(scene);
  await invoke('save_file', {
    path: options.path,
    data: gltfData,
  });
}
```

---

## Dependencies

### Frontend (Vite + React)

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-three-fiber": "8.15.14",
    "three": "r160",
    "@react-three/drei": "9.96.1",
    "zustand": "4.4.7",
    "@tauri-apps/api": "^2.0.0",
    "uuid": "9.0.0",
    "react-colorful": "5.6.1",
    "lucide-react": "0.294.0" // Icons
  },
  "devDependencies": {
    "@types/react": "18.2.43",
    "@types/react-dom": "18.2.17",
    "@types/three": "0.159.0",
    "@types/uuid": "9.0.7",
    "vite": "5.0.6",
    "typescript": "5.3.2",
    "tailwindcss": "3.3.5",
    "autoprefixer": "10.4.16"
  }
}
```

### Backend (Rust)

```toml
[package]
name = "spoke"
version = "0.1.0"

[dependencies]
tauri = { version = "2.0.0", features = ["dialog-all", "fs-all"] }
tauri-plugin-dialog = "2.0.0"
tauri-plugin-fs = "2.0.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
dirs = "5.0"
gltf = "1.4.0"  # For GLTF export
wgpu = "0.19"   # For rendering (optional)

[build-dependencies]
tauri-build = { version = "2.0.0" }
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// src/stores/__tests__/scene-store.test.ts
describe('SceneStore', () => {
  it('adds new entity to scene', () => {
    const store = createSceneStore();
    const entity = store.createEntity({
      name: 'Test Cube',
      type: 'mesh',
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1]
      }
    });

    expect(store.entities[entity.id]).toBeDefined();
    expect(store.entities[entity.id].name).toBe('Test Cube');
  });

  it('undoes last action', () => {
    const store = createSceneStore();
    const entity1 = store.createEntity({ name: 'A' });
    const entity2 = store.createEntity({ name: 'B' });
    store.undo();

    expect(store.entities).toHaveProperty(entity1.id);
    expect(store.entities).not.toHaveProperty(entity2.id);
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/editor.spec.ts
test('creates and transforms cube', async () => {
  await page.goto('http://localhost:1420');

  // Click + Cube button
  await page.click('button:Add Cube');

  // Verify cube appears in viewport
  await expect(page.locator('viewport-cube')).toBeVisible();

  // Select cube
  await page.click('hierarchy-item:Cube');

  // Transform using Inspector
  await page.fill('input:Position X', '5');
  await page.press('Editor viewport', 'KeyW'); // Translate mode

  // Use TransformControls
  await page.click('transform-control:Translate');
  await page.hover('transform-handle:X-axis');
  await page.mouseDown();
  await page.mouseMove(100, 0);
  await page.mouseUp();

  // Verify transform
  await expect(page.locator('input:Position X')).toHaveValue('10');
});
```

---

## Performance Optimizations

1. **Lazy Loading:** Only load models when entity is created
2. **Asset Caching:** Cache loaded assets in Zustand store
3. **Memoization:** Use React.memo for expensive components
4. **Three.js Disposal:** Dispose geometries/materials on entity delete
5. **Canvas Optimizations:**
   - Use `useFrame` sparingly
   - Reuse renderers
   - Use `@react-three/drei` optimizations (`useInstance` for repeated objects)
6. **File I/O:** Throttle auto-save, use debounced writes

---

## Security Considerations

### Tauri Security Model

1. **Capability-based permissions:** Only allowlist needed APIs
2. **File system scope:** Restrict paths to app directories
3. **Dialog permissions:** Require explicit user action for file dialogs
4. **No eval:** Avoid eval() in frontend code
5. **Input sanitization:** Validate all user inputs before saving

### Tauri Configuration

```json
{
  "tauri": {
    "allowlist": {
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "scope": ["$APPDATA/*", "$RESOURCE/*"]
      }
    }
  }
}
```

---

## Comparison with Alternatives

### vs. Three.js Editor (web-based)

| Feature            | Spoke Editor                 | Three.js Editor      |
| ------------------ | ---------------------------- | -------------------- |
| Native file access | ✅ (Tauri)                   | ❌ (browser sandbox) |
| Performance        | ✅ (native backend)          | ⚠️ (JS runtime)      |
| Offline support    | ✅                           | ⚠️ (service worker)  |
| Cross-platform     | ✅ (Windows/macOS/Linux)     | ✅ (browser only)    |
| Bundle size        | ⚠️ (larger with native deps) | ✅ (smaller)         |

### vs. Blender (full 3D suite)

| Feature            | Spoke Editor    | Blender            |
| ------------------ | --------------- | ------------------ |
| Purpose            | Scene editing   | Full 3D creation   |
| Learning curve     | 🟢 Low          | 🔴 High            |
| Node-based editing | ❌              | ✅                 |
| Animation timeline | 🟡 Basic        | ✅ Full            |
| Modeling tools     | ⚠️ Basic shapes | ✅ Full CAD        |
| Export to VR       | ✅ Native       | ⚠️ Requires export |

### vs. Unity/Unreal

| Feature        | Spoke Editor | Unity/Unreal |
| -------------- | ------------ | ------------ |
| Game engine    | ❌           | ✅           |
| Scripting      | ⚠️ Simple    | ✅ Full      |
| Physics        | 🟡 Basic     | ✅ Full      |
| Asset pipeline | ⚠️ GLTF only | ✅ Full      |

**Spoke's Niche:** Lightweight, VR-focused scene editor with native desktop experience, optimized for creating scenes to use in GraphWiz-XR VR clients.

---

## Migration from Hubs Spoke

Current Hubs Spoke uses:

- **A-Frame** (WebVR, deprecated)
- **Web-based** interface
- **JSON-based** scene files

Spoke Editor migration path:

1. Import existing JSON scenes → convert to internal format
2. Support legacy material properties (A-Frame → Three.js PBR)
3. Add import button for "Open Hubs Spoke Scene"
4. Auto-convert old assets to GLTF

---

## Summary

This architecture provides:

- ✅ **Modern tech stack**: Tauri 2.0 + React 18 + Three.js r160
- ✅ **Industry-standard UI**: Hierarchy, Inspector, Assets panels
- ✅ **Native file access**: Cross-platform file dialogs and storage
- ✅ **Performance optimizations**: Lazy loading, caching, Three.js best practices
- ✅ **Extensible design**: Plugin-ready architecture for future features
- ✅ **Production-ready**: Unit tests, E2E tests, security considerations

**Next Step:** Begin Phase 1 implementation following this architecture specification.

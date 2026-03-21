# Type Safety Guidelines: When and How to Use `any`

**Created:** 2026-03-13  
**Purpose:** Define criteria for acceptable `any` types in GraphWiz-XR codebase

---

## Philosophy

The goal is **ZERO `any` types in production code**, but we recognize some scenarios require pragmatic exceptions.

### Primary Objective

Maximize type safety while acknowledging real-world constraints:

- Third-party libraries with incomplete TypeScript support
- Complex union types better expressed as `unknown`
- Temporary workarounds with explicit TODO comments

---

## Acceptability Framework

### ❌ NEVER Acceptable (Remove These First)

| Pattern                                      | Example                         | Better Alternative                         |
| -------------------------------------------- | ------------------------------- | ------------------------------------------ |
| **Local variables with inferable types**     | `let data = JSON.parse(str);`   | `let data = JSON.parse(str) as User;`      |
| **Function parameters with clear structure** | `function handle(data) {}`      | `function handle(data: RequestOptions) {}` |
| **Object properties with consistent shape**  | `const obj = { name: 'test' };` | `const obj: { name: string } = ...`        |
| **React props with known interface**         | `function Foo(props) {}`        | `function Foo(props: FooProps) {}`         |
| **Array items with known type**              | `const arr = []; arr.push(1);`  | `const arr: number[] = [];`                |

**Rule:** If you can determine the type from context, you MUST use it.

### ✅ Acceptable with Documentation

| Pattern                       | Example                                             | Requirements                                                                  |
| ----------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Third-party library types** | `const data: any = someLib.getData();`              | Must include comment: `// TODO: Replace with actual type from @types/somelib` |
| **Complex union types**       | `const value: any = ...;`                           | Better: Use `unknown` + type guard                                            |
| **Temporary workaround**      | `const val: any = ...;`                             | Must have explicit TODO with GitHub issue or comment explaining why           |
| **Generic type parameters**   | `function identity<T>(val: T): any { return val; }` | Better: `function identity<T>(val: T): T { return val; }`                     |

**Rule:** Every `any` must have either:

1. A clear TODO to replace it
2. A justification comment explaining why it's necessary
3. Evidence that the third-party library lacks TypeScript definitions

---

## Preferred Alternatives (In Order)

### 1. **Type Inference** (Best)

```typescript
// ❌ Bad
const items: any[] = [];

// ✅ Good
const items = []; // TypeScript infers: never[]
const items: number[] = [1, 2, 3]; // Infers: number[]
```

### 2. **Generic Types** (When type varies)

```typescript
// ❌ Bad
function getValue(input: any): any {
  return input;
}

// ✅ Good
function getValue<T>(input: T): T {
  return input;
}

// ✅ Even better
function getValue<T extends {}>(input: T): T {
  return input;
}
```

### 3. **Type Assertions** (When you know better than TS)

```typescript
// ❌ Bad
const json = JSON.parse(str); // type: any
const user = json; // type: any

// ✅ Good
const json = JSON.parse(str) as User;
const user = json as User;

// ✅ Better (with runtime check)
const parsed = JSON.parse(str);
const user: User = validateUser(parsed); // type guard
```

### 4. **Type Guards** (Safe type narrowing)

```typescript
// ❌ Bad
function isUser(obj: any): boolean {
  return obj.name !== undefined && obj.id !== undefined;
}

// ✅ Good
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'name' in obj && 'id' in obj;
}

const user = maybeUser as User; // Safe after type guard
```

### 5. **`unknown` Type** (Safest alternative to `any`)

```typescript
// ❌ Bad
function handleData(data: any) {
  // Can do anything with 'any' - potentially unsafe!
  const x = data.property; // TypeScript doesn't warn
}

// ✅ Good
function handleData(data: unknown) {
  // Must check type first - safer!
  if (typeof data === 'object' && data !== null && 'prop' in data) {
    const x = (data as { prop: string }).prop; // Type-safe!
  }
}
```

---

## React-Specific Guidelines

### Component Props

```tsx
// ❌ Bad
function MyComponent(props) {
  return <div>{props.title}</div>;
}

// ✅ Good
interface MyComponentProps {
  title: string;
  count?: number; // Optional with default
}

function MyComponent({ title, count = 0 }: MyComponentProps) {
  return (
    <div>
      {title}: {count}
    </div>
  );
}
```

### Event Handlers

```tsx
// ❌ Bad
<input onChange={handleChange} />;
function handleChange(e: any) {}

// ✅ Good
<input onChange={(e: React.ChangeEvent<HTMLInputElement>) => {}} />;
function handleChange(e: React.ChangeEvent<HTMLInputElement>) {}
```

### useFrame and Hooks

```tsx
// ❌ Bad
useFrame((state, delta) => {
  // delta: any (incorrect!)
});

// ✅ Good
useFrame(({ clock }, delta: number) => {
  // delta is clearly typed
});
```

### React Three Fiber Pattern

```tsx
// ❌ Bad (from plan, example of acceptable `any`)
useFrame((state, delta) => {
  // state type is complex, often inferred as any
});

// ✅ Better (from documentation)
useFrame(({ clock, scene }, delta: number) => {
  delta is clearly typed as number
  clock is type: Clock
  scene is type: Scene | undefined
});
```

---

## ESLint Rules Configuration

### Recommended Setup (`.eslintrc.cjs` or `eslint.config.js`)

```json
{
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/no-unsafe-assignment": "warn",
  "@typescript-eslint/no-unsafe-member-access": "warn",
  "@typescript-eslint/no-unsafe-call": "warn",
  "@typescript-eslint/no-unsafe-return": "warn"
}
```

### When to Upgrade from `warn` to `error`

| Rule                      | Current | Target | Rationale                                                  |
| ------------------------- | ------- | ------ | ---------------------------------------------------------- |
| `no-explicit-any`         | warn    | error  | **Strict policy:** Never allow `any` without explicit TODO |
| `no-unsafe-assignment`    | warn    | error  | **Strict policy:** Prevent any-to-variable assignments     |
| `no-unsafe-member-access` | warn    | warn   | **Tolerant:** Some third-party libraries require access    |
| `no-unsafe-call`          | warn    | warn   | **Tolerant:** Allow method calls on uncertain types        |

---

## Migration Strategy

### Phase 1: Assess Current State

1. Run `pnpm lint` → Record `no-explicit-any` count
2. Categorize each `any`:
   - **Fixable:** Can add proper type
   - **Acceptable:** Third-party lib, documented
   - **Complex:** Requires major refactoring

### Phase 2: Fix High-Value Locations

**Priority:** Files you're already changing

1. App.tsx (7 instances)
   - `handleReaction(emoji: EmojiReaction): void`
   - `useFrame(({ clock }, delta: number)` → Add explicit type
   - `React.CSSProperties` or type inference

2. Avatar system (12 instances)
   - `Vector3` for positions
   - `NetworkedAvatarConfig` for customization
   - TransformComponent types

3. Admin client API (6 instances)
   - Response types from backend
   - Document response structure

### Phase 3: Systematic Cleanup

- Work through remaining `any` types
- Use `unknown` + type guards where appropriate
- Update third-party library @types if needed

### Phase 4: Enforce Policy

- Upgrade ESLint `no-explicit-any` from `warn` to `error`
- Require TODO comment for any remaining `any`
- Add pre-commit hook to catch new `any` types

---

## Examples from GraphWiz-XR

### App.tsx Examples

```typescript
// ❌ Before (from codebase)
const handleReaction = (emoji: any): void => { ... };
useFrame((state, delta) => { ... });

// ✅ After
const handleReaction = (emoji: EmojiReaction): void => { ... };
useFrame(({ clock }, delta: number) => { ... });
```

### Avatar-System Examples

```typescript
// ❌ Before
export type AvatarState = {
  position: any;
  rotation: any;
};

// ✅ After
import { Vector3, Euler } from 'three';

export type AvatarState = {
  position: Vector3;
  rotation: Euler;
};

// ❌ Before
export function processAvatarData(data: any): AvatarComponent { ... }

// ✅ After
export function processAvatarData(data: NetworkedAvatarConfig): AvatarComponent { ... }
```

### Admin-Client API Examples

```typescript
// ❌ Before
export async function fetchMetrics(start: string, end: string): Promise<any> { ... }

// ✅ After
export async function fetchMetrics(
  start: string,
  end: string
): Promise<HistoricalMetricsResponse> { ... }

interface HistoricalMetricsResponse {
  avgRoomCount: number;
  maxRoomCount: number;
  avgUserCount: number;
  maxUserCount: number;
  avgLatency: number;
  maxLatency: number;
  period: { start: string; end: string };
}
```

---

## Verification

After fixing `any` types:

```bash
# 1. Verify TypeScript is still clean
pnpm check

# 2. Verify no new ESLint errors
pnpm lint | grep "no-explicit-any"

# 3. Verify build still works
pnpm build

# 4. Verify tests still pass
pnpm test
```

**Expected:**

- 0 `no-explicit-any` errors (0 warnings if using strict policy)
- 0 TypeScript errors
- All tests passing
- Build succeeding

---

## FAQ

**Q: What if I don't know the type?**  
A: Use `unknown` instead of `any`. `unknown` requires type checks before you can use it, while `any` disables all type checking.

**Q: What if the type is complex?**  
A: Break it into smaller types or interfaces. Complexity is a code smell, not a reason for `any`.

**Q: What if it's a third-party library?**  
A: Check `@types/` on npm. If no types exist, either:

1. Write a type declaration file in your codebase
2. Use `unknown` + type assertions
3. Add `any` with explicit TODO comment

**Q: What if I'm in a legacy codebase?**  
A: Use the migration strategy above. Don't try to fix everything at once.

**Q: Are there exceptions for performance?**  
A: No. Type safety doesn't impact runtime performance. It only affects compile-time type checking.

---

## References

- [TypeScript Handbook: Any vs Unknown](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [ESLint TypeScript Plugin Rules](https://typescript-eslint.io/rules/no-explicit-any/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

---

**Maintainance:** This document should be updated whenever new patterns emerge or when transitioning from `warn` to `error` for ESLint rules.

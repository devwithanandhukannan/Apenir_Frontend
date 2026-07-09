# useAbortController Hook Documentation

The `useAbortController` hook is a custom utility for Next.js applications that manages multiple named `AbortController` instances. It allows components to register, retrieve, reset, and abort HTTP requests centrally, avoiding double-fetches, request race conditions, and memory leaks.

## Why

1. **Avoid Double Fetches & Races**: Cancel slow, outdated requests when a user clicks quickly or updates options.
2. **Prevent Memory Leaks**: Automatically cancels all pending/active requests in the registry when the component unmounts.
3. **Registry Pattern**: Avoids manually instantiating, saving, and checking raw browser `AbortController` objects in components.
4. **Re-render Optimization**: Cached inside React's `useRef`, operations on controllers do not trigger unnecessary component renders.

## How It Works

- **Ref-Cached Registry**: Uses `Map<string, AbortController>` inside `useRef` to store browser `AbortController` references.
- **Reactive Wrapper (Getters)**: Returns wrappers that expose the controller parameters (`signal`, `isAborted`) using Javascript getters. Whenever a consumer reads `.isAborted`, it dynamically evaluates `controller.signal.aborted` on the active controller.
- **Re-Instantiation (Reset)**: Calling `.reset()` automatically aborts the current active request for that specific controller and reinstantiates a new browser `AbortController` seamlessly, updating `.signal`.
- **Auto-Cleanup**: A `useEffect` hook cleans up the registry by executing `.abort()` on all registered items when the component unmounts.

---

## How to Use

### Basic Import

```typescript
import { useAbortController } from "@/core_components/hooks/useAbortController/useAbortController";
```

### 1. Pre-Registered Controllers

If you know which endpoints you will abort in advance, register them on initialization by passing an array of string keys. The hook returns bound controller instances inside a `controllers` object.

```typescript
const MyComponent = () => {
  const { get, loading } = useApi();
  const { controllers, abortAll } = useAbortController([
    'USER_API',
    'ABC_CONTROLLER'
  ]);

  const loadData = async () => {
    // If a request was running, reset it before launching a new one
    controllers.USER_API.reset();

    await get({
      endpoint: '/api/users',
      signal: controllers.USER_API.signal
    });
  };

  return (
    <div>
      <button onClick={loadData}>Load Users</button>
      <button onClick={() => controllers.USER_API.abort()}>Cancel Users Request</button>
      <button onClick={abortAll}>Cancel All Requests</button>
    </div>
  );
};
```

### 2. Dynamically Created Controllers

For dynamic pages or actions (like multi-file uploads), fetch controllers dynamically with `getController(key)`. If it doesn't exist, it is created automatically.

```typescript
const { getController } = useAbortController();

const uploadFile = (fileId: string, fileData: any) => {
  const fileController = getController(`FILE_UPLOAD_${fileId}`);

  api.post({
    endpoint: `/api/upload/${fileId}`,
    body: fileData,
    signal: fileController.signal,
  });
};

const cancelUpload = (fileId: string) => {
  getController(`FILE_UPLOAD_${fileId}`).abort();
};
```

---

## API Reference

### Exported Types

#### `ControllerInstance`

Represents an active controller container:

```typescript
export interface ControllerInstance {
  key: string; // Unique name registry key
  controller: AbortController; // Access to raw browser controller
  signal: AbortSignal; // Active AbortSignal
  isAborted: boolean; // Reactive getter reflecting signal status
  abort(): void; // Cancels only this request
  reset(): void; // Aborts active request and registers fresh signal
}
```

#### `UseAbortControllerReturn<TKeys>`

Returns pre-registered instances alongside utility controls:

```typescript
export type UseAbortControllerReturn<TKeys extends readonly string[]> = {
  controllers: {
    [K in TKeys[number]]: ControllerInstance;
  };
  getController(key: string): ControllerInstance;
  abortAll(): void;
  removeController(key: string): void;
};
```

# useApi Hook Documentation

The `useApi` hook is a production-ready, reusable HTTP client utility designed for Next.js applications. It abstracts Axios request configurations, automates JWT authentication, manages query parameters, and exposes a consistent lifecycle state interface with strong TypeScript typing.

## Why

1. **Avoid Boilerplate**: Eliminates repetitive try-catch blocks, loading/error states, and headers setup in components.
2. **Auto-Authentication**: Automatically retrieves the JWT token from `localStorage` and attaches the `Authorization: Bearer <token>` header to private requests.
3. **SSR Safety**: Safe to use in both Server-Side Rendered contexts and Client-Side contexts (checks `typeof window` before accessing web storage).
4. **Generic Type Safety**: Provides fully typed response data and request payloads.
5. **Request Cancellation**: Integrates natively with `AbortSignal` for cancelling pending requests.

## How It Works

- **State Management**: Keeps track of `loading` (boolean) and `error` (`AxiosError | null`) states. `error` is reset on every new request.
- **Request Registry**: Active request controllers are stored during execution and cleaned up if the component unmounts to prevent memory leaks.
- **Axios Configuration**: Builds and executes requests using Axios. Cancels (aborted requests) are gracefully caught and ignored to avoid updating unmounted states.
- **Return Values**: Request methods return a promise resolving to a consistent `ApiResponse` payload:
  ```typescript
  {
    success: boolean;
    data?: T;
    error?: AxiosError;
  }
  ```

---

## How to Use

### Basic Import

```typescript
import { useApi } from "@/core_components/hooks/useApi";
```

### 1. GET Request (Private Endpoints)

By default, `requireAuth` is `true`.

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const MyComponent = () => {
  const { get, loading, error } = useApi();
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async () => {
    const res = await get<User[]>({
      endpoint: '/api/users',
      onSuccess: (data) => setUsers(data),
      onError: (err) => console.error('Failed to load users', err)
    });

    if (res.success) {
      console.log('Fetched data:', res.data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {users.map(u => <li key={u.id}>{u.name}</li>)}
    </ul>
  );
};
```

### 2. POST / PUT / PATCH Requests (Mutations with Body)

```typescript
interface CreateUserPayload {
  name: string;
  email: string;
}

const { post, loading } = useApi();

const handleCreateUser = async () => {
  const response = await post<User, CreateUserPayload>({
    endpoint: "/api/users",
    body: { name: "John Doe", email: "john@example.com" },
    onSuccess: (data) => alert(`Created user ${data.name}!`),
  });
};
```

### 3. Public Endpoints (Bypassing Auth Token Attachment)

To request public APIs without sending the JWT authorization header, set `requireAuth: false`.

```typescript
const { get } = useApi();

const fetchPublicNews = async () => {
  await get({
    endpoint: "/api/public/news",
    requireAuth: false,
  });
};
```

### 4. Custom Headers & Query Parameters

You can pass custom headers or query strings using `headers` and `params`.

```typescript
await get({
  endpoint: "/api/reports",
  params: { format: "pdf", year: 2026 },
  headers: { "X-Custom-Client": "Appenir-Admin" },
});
```

---

## API Reference

### Exported Interfaces

#### `ApiResponse<T>`

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AxiosError;
}
```

#### `BaseRequestOptions<T>`

```typescript
export interface BaseRequestOptions<T> {
  endpoint: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  requireAuth?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: AxiosError) => void;
}
```

#### `MutationRequestOptions<T, B>`

Extends `BaseRequestOptions<T>`:

```typescript
export interface MutationRequestOptions<T, B> extends BaseRequestOptions<T> {
  body?: B;
}
```

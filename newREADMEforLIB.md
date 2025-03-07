

# go-errors: Enterprise-Grade Error Handling for TypeScript

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Bun Version](https://img.shields.io/badge/Bun-1.0.0-blueviolet)](https://bun.sh)

## Table of Contents
- [Core Philosophy](#core-philosophy)
- [Installation & Setup](#installation--setup)
- [Basic Usage](#basic-usage)
- [Advanced Patterns](#advanced-patterns)
- [Real-World Scenarios](#real-world-scenarios)
- [Performance Optimization](#performance-optimization)
- [Type Safety Deep Dive](#type-safety-deep-dive)
- [API Reference](#api-reference)
- [Testing Strategies](#testing-strategies)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Core Philosophy

### Design Principles
1. **Explicit Control Flow**
   ```typescript
   // Traditional
   try {
     const data = riskyOperation();
   } catch (e) {
     // Hidden error path
   }
   
   // go-errors
   const [data, err] = goSync(riskyOperation);
   if (err) { /* Explicit error path */ }
   ```

2. **Type-Safe Errors**
   ```typescript
   class DatabaseError extends Error { /* ... */ }
   
   const [result, err] = goSync<Data, DatabaseError>(() => dbQuery());
   if (err instanceof DatabaseError) {
     // Type-safe error handling
   }
   ```

3. **Composable Operations**
   ```typescript
   const pipeline = pipe(
     fetchUser,
     transformData,
     handleErrors
   );
   
   const [result, err] = await pipeline(userId);
   ```

---

## Installation & Setup

### Bun Installation
```bash
bun add go-errors
```

### Framework Integration

#### Next.js API Route
```typescript
import { go, goFetch } from 'go-errors';

export async function GET(req: Request) {
  const [session, err] = await go(fetchSession(req));
  if (err) return errorResponse(401, 'Invalid session');
  
  const [data, dataErr] = await goFetch<ApiData>('/data-endpoint', {
    headers: { Authorization: `Bearer ${session.token}` }
  });
  
  return dataErr 
    ? errorResponse(502, 'Upstream failure') 
    : Response.json(data);
}
```

#### Express Middleware
```typescript
import { goSync } from 'go-errors';

app.use((req, res, next) => {
  const [token, err] = goSync(() => validateToken(req));
  if (err) return res.status(401).json({ error: err.message });
  next();
});
```

#### SvelteKit Load Function
```typescript
export async function load({ params }) {
  const [product, err] = await goFetch<Product>(`/api/products/${params.id}`);
  
  if (err) throw error(502, 'Product service unavailable');
  
  return { product };
}
```

---

## Basic Usage

### Synchronous Operations
```typescript
import { goSync } from 'go-errors';

// File parsing
function parseConfig(path: string) {
  const [content, err] = goSync(() => fs.readFileSync(path, 'utf-8'));
  if (err) return [null, new ConfigError('Read failed')] as const;
  
  const [config, parseErr] = goSync(() => JSON.parse(content));
  return parseErr
    ? [null, new ConfigError('Invalid JSON')] as const
    : [config, null] as const;
}
```

### Asynchronous Operations
```typescript
async function fetchResource(url: string) {
  const [response, err] = await go(fetch(url));
  if (err) return [null, new NetworkError(err.message)] as const;
  
  const [data, parseErr] = await go(response.json());
  return parseErr
    ? [null, new ParseError('Invalid JSON')] as const
    : [data, null] as const;
}
```

### Fetch Wrapper
```typescript
interface User {
  id: string;
  name: string;
}

const [user, err] = await goFetch<User>('/api/user/123', {
  responseTransformer: (data) => ({
    id: data.id,
    name: `${data.firstName} ${data.lastName}`
  }),
  errorTransformer: (e) => new ApiError(e instanceof Error ? e.message : 'Unknown')
});

if (err?.code === 'API_RATE_LIMIT') {
  // Handle specific error type
}
```

---

## Advanced Patterns

### Error Chaining
```typescript
class ServiceError extends Error {
  constructor(public stage: string, cause: Error) {
    super(`Service failed at ${stage}: ${cause.message}`);
  }
}

async function orderPipeline(userId: string) {
  const [cart, cartErr] = await go(getCart(userId));
  if (cartErr) return [null, new ServiceError('cart', cartErr)] as const;
  
  const [order, orderErr] = await go(createOrder(cart));
  if (orderErr) return [null, new ServiceError('order', orderErr)] as const;
  
  const [receipt, receiptErr] = await go(generateReceipt(order));
  return receiptErr
    ? [null, new ServiceError('receipt', receiptErr)] as const
    : [receipt, null] as const;
}
```

### Batch Processing
```typescript
async function processBatch<T>(items: T[], handler: (item: T) => Promise<void>) {
  const results = await Promise.all(
    items.map(item => go(handler(item)))
  );

  const errors = results
    .filter(([_, err]) => err)
    .map(([_, err]) => err!);

  return errors.length > 0
    ? [null, new BatchError(errors)] as const
    : [results.map(([res]) => res!), null] as const;
}
```

### Timeout Handling
```typescript
import { goAsyncWithTimeout } from 'go-errors';

async function criticalOperation() {
  const [result, err] = await goAsyncWithTimeout(
    fetch('/time-sensitive'),
    5000 // 5 second timeout
  );
  
  if (err?.name === 'TimeoutError') {
    // Handle timeout specifically
  }
}
```

### Result Helpers
```typescript
const result = await go(fetchData());

if (isOk(result)) {
  // Type narrowed to [T, null]
  processData(result[0]);
}

if (isErr(result)) {
  // Type narrowed to [null, E]
  logError(result[1]);
}

const safeValue = unwrapOr(result, defaultValue);
const riskyValue = unwrap(result); // Throws if error
```

---

## Real-World Scenarios

### API Gateway
```typescript
interface ApiResponse<T> {
  data: T;
  metadata: {
    timestamp: string;
    source: string;
  };
}

async function apiGateway<T>(endpoint: string): GoResult<T, ApiError> {
  const [response, err] = await goFetch<ApiResponse<T>>(endpoint, {
    responseTransformer: (res) => ({
      ...res.data,
      _meta: {
        receivedAt: new Date(),
        source: res.metadata.source
      }
    }),
    errorTransformer: (e) => new ApiError(
      e instanceof Error ? e.message : 'Unknown',
      getErrorCode(e)
    )
  });

  return err
    ? [null, err] as const
    : [response, null] as const;
}
```

### Database Transaction
```typescript
async function transferFunds(senderId: string, receiverId: string, amount: number) {
  const [tx, txErr] = await go(startTransaction());
  if (txErr) return [null, txErr] as const;
  
  try {
    const [_, withdrawErr] = await go(withdraw(tx, senderId, amount));
    if (withdrawErr) throw withdrawErr;
    
    const [_, depositErr] = await go(deposit(tx, receiverId, amount));
    if (depositErr) throw depositErr;
    
    const [commitErr] = await go(tx.commit());
    return commitErr
      ? [null, commitErr] as const
      : [true, null] as const;
  } catch (e) {
    await tx.rollback();
    return [null, normalizeError(e)] as const;
  }
}
```

### File Processing Pipeline
```typescript
async function processUpload(file: File) {
  const processingPipeline = pipe(
    validateFileType,
    virusScan,
    compressImage,
    uploadToS3
  );

  const [result, err] = await processingPipeline(file);
  
  if (err) {
    await cleanupTempFiles();
    return [null, err] as const;
  }
  
  return [result, null] as const;
}
```

---

## Performance Optimization

### Memory Management
```typescript
// Reuse common error objects
const errorCache = new Map<string, Error>();

function getCachedError(message: string): Error {
  if (!errorCache.has(message)) {
    errorCache.set(message, new Error(message));
  }
  return errorCache.get(message)!;
}

// In normalizeError
if (typeof error === 'string') {
  return getCachedError(error);
}
```

### Async Optimization
```typescript
// Connection pooling with error boundaries
class ConnectionPool {
  private pool: DatabaseConnection[] = [];
  
  async withConnection<T>(fn: (conn: DatabaseConnection) => Promise<T>) {
    const conn = this.pool.pop() || await createConnection();
    const [result, err] = await go(fn(conn));
    
    if (err) {
      await conn.reset();
      this.pool.push(conn);
      return [null, err] as const;
    }
    
    this.pool.push(conn);
    return [result, null] as const;
  }
}
```

### Performance Monitoring
```typescript
interface PerfMetrics {
  successCount: number;
  errorCount: number;
  errorTypes: Map<string, number>;
}

const metrics: PerfMetrics = {
  successCount: 0,
  errorCount: 0,
  errorTypes: new Map()
};

function trackResult<T, E>(result: GoResult<T, E>) {
  if (isOk(result)) {
    metrics.successCount++;
  } else {
    metrics.errorCount++;
    const errorName = result[1].constructor.name;
    metrics.errorTypes.set(errorName, (metrics.errorTypes.get(errorName) || 0) + 1);
  }
}
```

---

## Type Safety Deep Dive

### Narrowing Types
```typescript
class ValidationError extends Error { /* ... */ }
class NetworkError extends Error { /* ... */ }

async function fetchData(): GoResult<Data, ValidationError | NetworkError> {
  // ...
}

const [data, err] = await fetchData();

if (err instanceof ValidationError) {
  // Handle validation issues
} else if (err instanceof NetworkError) {
  // Handle network issues
}
```

### Generic Constraints
```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

async function paginatedFetch<T>(
  url: string,
  opts: GoFetchOptions<PaginatedResponse<T>>
): Promise<GoResult<PaginatedResponse<T>, ApiError>> {
  // ...
}
```

### Type Guards
```typescript
function isApiError(e: unknown): e is ApiError {
  return e instanceof Error && 'code' in e && 'details' in e;
}

const [response, err] = await goFetch('/api');
if (err && isApiError(err)) {
  // Access err.code safely
}
```

---

## API Reference

### Core Functions

#### `goSync<T, E = Error>(fn: () => T): GoResult<T, E>`
```typescript
const [data, err] = goSync(() => JSON.parse(input));
```

#### `goAsync<T, E = Error>(promise: Promise<T>): Promise<GoResult<T, E>>`
```typescript
const [file, err] = await goAsync(readFile('data.txt'));
```

#### `goFetch<T, E = string>(url: string, options?: GoFetchOptions): Promise<GoResult<T, E>>`
```typescript
const [user, err] = await goFetch<User>('/api/user', {
  responseTransformer: (data) => ({
    ...data,
    fullName: `${data.firstName} ${data.lastName}`
  })
});
```

### Helper Functions

#### `isOk(result: GoResult): result is [T, null]`
```typescript
if (isOk(result)) {
  // result[0] is T
}
```

#### `unwrapOr(result: GoResult, defaultValue: T): T`
```typescript
const value = unwrapOr(await fetchData(), fallbackValue);
```

---

## Testing Strategies

### Unit Testing
```typescript
import { describe, expect, test } from 'vitest';
import { goSync } from 'go-errors';

describe('error normalization', () => {
  test('handles circular references', () => {
    const circular: any = { data: 'test' };
    circular.self = circular;
    
    const [_, err] = goSync(() => { throw circular; });
    expect(err?.message).toMatch('circular');
  });
});
```

### Integration Testing
```typescript
describe('API integration', () => {
  test('handles 404 responses', async () => {
    const [response, err] = await goFetch('/invalid-endpoint');
    expect(err).toBeInstanceOf(NotFoundError);
  });
});
```

### Benchmarking
```typescript
import { bench } from 'vitest';

bench('error handling overhead', async () => {
  await bench('go-errors', async () => {
    await go(fetchData());
  });
  
  await bench('try/catch', async () => {
    try {
      await fetchData();
    } catch (e) {
      // Handle error
    }
  });
});
```

---

## Migration Guide

### From Try/Catch
**Before**
```typescript
try {
  const data = await fetchData();
  return process(data);
} catch (e) {
  handleError(e);
}
```

**After**
```typescript
const [data, err] = await go(fetchData());
if (err) {
  handleError(err);
  return;
}
return process(data);
```

### From Callback Style
**Before**
```typescript
fs.readFile('data.txt', (err, data) => {
  if (err) { /* ... */ }
  // ...
});
```

**After**
```typescript
const [data, err] = await go(new Promise((resolve, reject) => {
  fs.readFile('data.txt', (err, data) => 
    err ? reject(err) : resolve(data)
  );
}));
```

---

## Troubleshooting

### Common Issues

**Circular References**
```typescript
// Before
const circular = { data: 'test' };
circular.self = circular;
throw circular;

// Fix
import { normalizeError } from 'go-errors';
console.log(normalizeError(circular).message); // Properly stringified
```

**Type Assertion Errors**
```typescript
// Before
const [data] = await go(fetchData());
data.property; // Possible runtime error

// Fix
if (isOk(result)) {
  // Safely access data
}
```

---

## Contributing

### Development Setup
```bash
bun install
bun test
bun run build
```

### Testing Guidelines
```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Coverage
bun test --coverage
```

---

This comprehensive guide covers all aspects of using go-errors in production-grade applications. The library provides:
- 100% Type Safety
- Zero Dependencies
- Full Async Support
- Flexible Error Handling
- Enterprise-Ready Patterns

For additional resources:
- [API Documentation](https://go-errors-docs.vercel.app)
- [GitHub Repository](https://github.com/ashkansamadiyan/go-style-errors)
- [Community Discord](https://discord.gg/go-errors)

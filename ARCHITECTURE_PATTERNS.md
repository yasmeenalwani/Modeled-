# Architecture Patterns & Best Practices

## Overview
This document outlines standardized patterns for building maintainable, error-resistant code in the Modeled Management application.

## Core Principles

1. **Fail Gracefully** - Always provide fallbacks and never crash the entire app
2. **Consistent Error Handling** - Use standardized utilities for all error handling
3. **Mock Data First** - Support mock data mode for development and testing
4. **Type Safety** - Validate inputs and handle edge cases
5. **Logging** - Consistent error logging with context

## Database Operations

### Pattern: Use `databaseOperations.js` utilities

**❌ BAD:**
```javascript
const client = generateClient();
const { data } = await client.models.Professional.get({ id });
```

**✅ GOOD:**
```javascript
import { safeGet } from '../utils/databaseOperations';
import { getMockProfessional } from '../utils/mockDataService';

const professional = await safeGet(
  'Professional',
  id,
  () => getMockProfessional(id)
);
```

### Available Functions
- `safeGet(modelName, id, mockFn)` - Get single record
- `safeList(modelName, filter, limit, mockFn)` - List records
- `safeCreate(modelName, data, mockFn)` - Create record
- `safeUpdate(modelName, id, data, mockFn)` - Update record
- `safeDelete(modelName, id, mockFn)` - Delete record

## Error Handling

### Pattern: Use `errorHandling.js` utilities

**❌ BAD:**
```javascript
try {
  const result = await someOperation();
} catch (error) {
  console.error(error);
}
```

**✅ GOOD:**
```javascript
import { safeAsync, logError } from '../utils/errorHandling';

const result = await safeAsync(
  () => someOperation(),
  null, // defaultValue
  (error) => logError(error, 'ComponentName', { context: 'operation' })
);
```

### Available Functions
- `safeAsync(operation, defaultValue, onError)` - Safe async wrapper
- `safeDbQuery(queryFn, mockFn, operationName)` - Database query with fallback
- `validateRequired(params, required, context)` - Parameter validation
- `safeGet(obj, path, defaultValue)` - Safe property access
- `logError(error, context, metadata)` - Consistent error logging
- `retryOperation(operation, maxRetries, initialDelay)` - Retry with backoff
- `safeFunction(fn, defaultValue, functionName)` - Function wrapper

## Amplify Client Initialization

### Pattern: Use `amplifyClient.js` utilities

**❌ BAD:**
```javascript
const client = generateClient();
if (client.models) {
  // ...
}
```

**✅ GOOD:**
```javascript
import { getAmplifyClient, isDatabaseAvailable } from '../utils/amplifyClient';

const client = getAmplifyClient();
if (isDatabaseAvailable()) {
  // ...
}
```

### Available Functions
- `getAmplifyClient()` - Get initialized client (null if failed)
- `isDatabaseAvailable()` - Check if database operations are available
- `safeDbOperation(dbOperation, fallback)` - Execute with fallback

## React Components

### Pattern: Use Error Boundaries

**❌ BAD:**
```javascript
export default function MyComponent() {
  // No error handling
  return <div>{data.property}</div>;
}
```

**✅ GOOD:**
```javascript
import ErrorBoundary from '../components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <MyComponent />
    </ErrorBoundary>
  );
}
```

## Mock Data Integration

### Pattern: Always provide mock data fallback

**❌ BAD:**
```javascript
const data = await client.models.Model.list();
```

**✅ GOOD:**
```javascript
import { safeList } from '../utils/databaseOperations';
import { getMockModels } from '../utils/mockDataService';

const models = await safeList(
  'ModelProfile',
  null,
  100,
  () => getMockModels()
);
```

## File Structure

```
src/
├── utils/
│   ├── amplifyClient.js          # Client initialization
│   ├── databaseOperations.js     # Database wrappers
│   ├── errorHandling.js          # Error handling utilities
│   └── mockDataService.js        # Mock data management
├── components/
│   └── ErrorBoundary.jsx         # React error boundary
└── ...
```

## Migration Checklist

When updating existing code:

- [ ] Replace `generateClient()` with `getAmplifyClient()`
- [ ] Replace direct `client.models.*` calls with `safe*` functions
- [ ] Add mock data fallbacks to all database operations
- [ ] Wrap async operations with `safeAsync` or try-catch
- [ ] Add `ErrorBoundary` around major component trees
- [ ] Use `logError` for consistent error logging
- [ ] Validate required parameters with `validateRequired`
- [ ] Use `safeGet` for nested property access

## Common Patterns

### Loading Data in Components

```javascript
import { useState, useEffect } from 'react';
import { safeList } from '../utils/databaseOperations';
import { getMockRequests } from '../utils/mockDataService';
import { safeAsync } from '../utils/errorHandling';

export default function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const result = await safeAsync(
        () => safeList('ModelRequest', null, 100, () => getMockRequests()),
        [],
        (error) => console.error('Failed to load data:', error)
      );
      setData(result);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* render data */}</div>;
}
```

### Creating Records

```javascript
import { safeCreate } from '../utils/databaseOperations';
import { createMockRequest } from '../utils/mockDataService';
import { validateRequired } from '../utils/errorHandling';

async function createRequest(data) {
  validateRequired(data, ['serviceType', 'preferredDate'], 'createRequest');
  
  return await safeCreate(
    'ModelRequest',
    data,
    () => createMockRequest(data)
  );
}
```

## Testing

- Always test with mock data mode enabled
- Test error scenarios (network failures, invalid data)
- Test with and without database connection
- Verify fallbacks work correctly

## Questions?

If you're unsure about which pattern to use, ask! It's better to confirm than to introduce inconsistencies.

# Quick Reference Guide

## Most Common Patterns

### 1. Loading Data in a Component

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
      );
      setData(result);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* render */}</div>;
}
```

### 2. Getting a Single Record

```javascript
import { safeGet } from '../utils/databaseOperations';
import { getMockProfessional } from '../utils/mockDataService';

const professional = await safeGet(
  'Professional',
  id,
  () => getMockProfessional(id)
);
```

### 3. Creating a Record

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

### 4. Safe Property Access

```javascript
import { safeGet as safeProp } from '../utils/errorHandling';

const userName = safeProp(user, 'profile.name', 'Unknown');
const email = safeProp(user, 'contact.email', '');
```

### 5. Error Logging

```javascript
import { logError } from '../utils/errorHandling';

try {
  await someOperation();
} catch (error) {
  logError(error, 'ComponentName', { userId, action: 'loadData' });
}
```

## Import Cheat Sheet

```javascript
// Database operations
import { safeGet, safeList, safeCreate, safeUpdate, safeDelete } from '../utils/databaseOperations';

// Error handling
import { safeAsync, logError, validateRequired, safeGet as safeProp } from '../utils/errorHandling';

// Amplify client
import { getAmplifyClient, isDatabaseAvailable } from '../utils/amplifyClient';

// Mock data
import { getMockRequests, getMockProfessional, shouldUseMockData } from '../utils/mockDataService';

// Error boundary
import ErrorBoundary from '../components/ErrorBoundary';
```

## Common Mistakes to Avoid

❌ **Don't do this:**
```javascript
const client = generateClient();
const { data } = await client.models.Professional.get({ id });
```

✅ **Do this:**
```javascript
import { safeGet } from '../utils/databaseOperations';
const professional = await safeGet('Professional', id, () => getMockProfessional(id));
```

❌ **Don't do this:**
```javascript
const name = user.profile.name; // Crashes if profile is undefined
```

✅ **Do this:**
```javascript
import { safeGet as safeProp } from '../utils/errorHandling';
const name = safeProp(user, 'profile.name', 'Unknown');
```

❌ **Don't do this:**
```javascript
try {
  await operation();
} catch (error) {
  // Silent failure
}
```

✅ **Do this:**
```javascript
import { safeAsync, logError } from '../utils/errorHandling';
await safeAsync(
  () => operation(),
  null,
  (error) => logError(error, 'ComponentName')
);
```

## Need Help?

See `ARCHITECTURE_PATTERNS.md` for detailed patterns and examples.

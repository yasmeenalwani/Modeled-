# Disaster Recovery Guide - Blank Screen Issues

## Problem: Blank White Screen on Localhost

If your React/Vite app shows a completely blank white screen and nothing renders, follow these steps:

### Quick Diagnosis Steps

1. **Check Browser Console** (F12 → Console tab)
   - Look for red error messages
   - Note any "Unterminated regular expression" or syntax errors

2. **Check Network Tab** (F12 → Network tab)
   - Refresh the page
   - Verify files are loading (status 200)
   - Check if `main.jsx` and `App.jsx` are being served

3. **Check Dev Server Terminal**
   - Look for compilation errors
   - Check if Vite is actually running and compiling

### Nuclear Option: Complete Reset

If nothing works, use this step-by-step recovery:

#### Step 1: Kill All Node Processes
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force
```

#### Step 2: Create Minimal Test App

Replace `src/App.jsx` with:
```jsx
export default function App() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: 'red',
      color: 'white',
      padding: '50px',
      fontSize: '30px',
      fontFamily: 'Arial'
    }}>
      <h1>MODELED MANAGEMENT</h1>
      <p>IF YOU SEE THIS RED PAGE, IT WORKS!</p>
    </div>
  );
}
```

Replace `src/main.jsx` with:
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

console.log('Starting app...');

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('App rendered!');
} else {
  document.body.innerHTML = '<h1 style="color: red;">ROOT NOT FOUND</h1>';
}
```

#### Step 3: Temporarily Disable CSS
Comment out the CSS import in `src/main.jsx`:
```jsx
// import './index.css'  // TEMPORARILY DISABLED
```

#### Step 4: Restart Dev Server
```powershell
cd C:\Users\yalwa\modeled-frontend
npm run dev
```

#### Step 5: Hard Refresh Browser
- Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or: Open DevTools → Right-click refresh → "Empty Cache and Hard Reload"

**Expected Result:** You should see a RED page with white text. If you see this, React is working!

### Common Issues and Fixes

#### Issue 1: Syntax Errors in Comments
**Problem:** Comments with nested JSX comments or `/*` in route paths
```jsx
// BAD - causes "Unterminated regular expression"
/* Comment with {/* nested comment */} */
<Route path="/*" ... />  // /* in string can confuse parser
```

**Fix:** Use single-line comments `//` or properly escape regex patterns

#### Issue 2: Missing Imports
**Problem:** Component uses hooks outside their context
```jsx
// BAD - useAuthenticator outside Authenticator wrapper
function LandingPage() {
  const { signOut } = useAuthenticator(); // ERROR!
}
```

**Fix:** Remove hooks that require context, or wrap component properly

#### Issue 3: Malformed JSX in Comment Blocks
**Problem:** Multi-line comments with JSX inside
```jsx
/* COMMENTED OUT
  <Route path="/*" element={...} />  // /* confuses parser
*/
```

**Fix:** Remove commented code or use single-line comments

### Restoring Full App

Once the minimal test works:

1. **Restore basic routing first:**
   - Add Router
   - Add public routes only (no auth wrapper)
   - Test each route

2. **Then add authentication:**
   - Wrap only protected routes in Authenticator
   - Keep public routes outside

3. **Finally restore all features:**
   - Admin routes
   - Portal routes
   - All components

### Prevention

1. **Always test incrementally** - Don't make huge changes at once
2. **Check console immediately** after changes
3. **Use proper comment syntax** - avoid nested comments in JSX
4. **Validate route paths** - be careful with special characters like `/*`
5. **Keep a working backup** - commit working code before major refactors

### Emergency Contacts

If this happens again:
1. Check this document first
2. Look at git history for working version
3. Use the "Nuclear Option" above

### Files to Check if Issues Persist

- `src/App.jsx` - Main app component
- `src/main.jsx` - Entry point
- `index.html` - Root HTML
- `vite.config.js` - Vite configuration
- `package.json` - Dependencies
- Browser console errors
- Dev server terminal output

---

**Last Updated:** After fixing blank screen issue on 2026-01-05
**Status:** Tested and Working ✅


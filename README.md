# Modeled Frontend

The frontend application for Modeled Management Platform.

## Quick Start

### Option 1: Double-click the script (Easiest!)
- **Windows**: Double-click `start-dev.bat`
- **PowerShell**: Right-click `start-dev.ps1` → "Run with PowerShell"

### Option 2: Command Line
```bash
npm run dev
```

## Access Your App

Once the server starts, open your browser and go to:
- **http://localhost:5173**

You should see the Modeled Management landing page!

## Stopping the Server

Press `Ctrl+C` in the terminal/command prompt to stop the server.

## Troubleshooting

**"Site can't be reached" error?**
1. Make sure the server is running (you should see "Local: http://localhost:5173" in the terminal)
2. Try `http://127.0.0.1:5173` instead
3. Check if port 5173 is already in use
4. Make sure you're in the project directory when running the command

**Port already in use?**
- The server will automatically try the next available port
- Check the terminal output for the actual port number

## Development

- **Framework**: React 19 + Vite
- **Routing**: React Router
- **Auth**: AWS Amplify (Cognito)
- **Database**: AWS Amplify Data (GraphQL)
- **Styling**: Inline styles + CSS modules

## Project Structure

```
src/
├── pages/          # Public pages (onboarding, shop)
├── admin/          # Admin portal pages
├── portal/         # Professional & Model portals
├── components/     # Reusable components
└── utils/          # Utilities and helpers
```

---

**Need help?** The dev server should start automatically and be accessible at `http://localhost:5173`

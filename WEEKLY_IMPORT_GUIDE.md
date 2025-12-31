# Weekly Stats Import Guide

Quick guide for importing 2025-2026 regular season stats.

## Prerequisites

Make sure your backend server is running:
```powershell
cd backend
npm run dev
```

The server should be running on `http://localhost:3001`

## Quick Start

### Import Current Week (Recommended)

Run this to import the current week's stats automatically:

```powershell
.\import-weekly-stats.ps1
```

This script:
- Checks current week status from ESPN
- Shows what weeks you already have
- Imports current week stats
- Verifies the import

**💡 Perfect for live testing!** Run this multiple times during games to get updates.

### Import Specific Week

To import a specific week:

```powershell
.\import-specific-week.ps1 -Week 1 -Year 2025
```

### Check Status

Quick status check without importing:

```powershell
.\check-stats-status.ps1
```

## Manual Commands

If you prefer to run commands manually:

### Check Current Week
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/status/current-week" -Method GET
```

### Check Available Weeks
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/available-weeks" -Method GET
```

### Import Current Week
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/weekly-update" -Method POST
```

### Import Specific Week
```powershell
$body = @{week=1; year=2025} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/import-week" -Method POST -ContentType "application/json" -Body $body
```

## Notes

- All imports use `ON CONFLICT` - safe to re-run (updates existing stats)
- The `weekly-update` endpoint automatically detects the current week/year
- Perfect for live testing - can run multiple times during games
- Processing may take 1-2 minutes depending on number of games

## Troubleshooting

**Server not responding?**
- Make sure backend is running on port 3001
- Check `http://localhost:3001/api/health`

**No data imported?**
- Verify ESPN API is accessible
- Check backend console logs for errors
- Some weeks may not have games (bye weeks)

**Want to catch up on missing weeks?**
- Check available weeks first
- Then import specific missing weeks one by one using `import-specific-week.ps1`


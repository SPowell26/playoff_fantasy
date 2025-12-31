# Week Status System Setup

This document explains how to set up and use the new week status system that automatically determines the current NFL week and playoff status.

## What It Does

The week status system:
- **Automatically detects** the current NFL week (1-18 for regular season, 19-22 for playoffs)
- **Maps ESPN weeks** to your fantasy week system
- **Provides real-time updates** on playoff status (Wild Card, Divisional, Conference Championship, Super Bowl)
- **Caches results** to avoid hitting ESPN API too frequently

## API Endpoints

### 1. Current Week Status
```
GET /api/status/current-week
```

**Response:**
```json
{
  "currentWeek": 19,
  "espnWeek": 1,
  "seasonType": "postseason",
  "seasonYear": 2025,
  "isPlayoffs": true,
  "playoffRound": "Wild Card",
  "lastUpdated": "2025-01-15T10:30:00.000Z",
  "source": "ESPN API"
}
```

### 2. Week for Specific Date
```
GET /api/status/week-for-date/2025-01-15
```

### 3. Debug Endpoint
```
GET /api/status/debug
```

## Week Mapping

| ESPN Week | Fantasy Week | Description |
|-----------|--------------|-------------|
| 1-18      | 1-18         | Regular Season |
| 1         | 19           | Wild Card Weekend |
| 2         | 20           | Divisional Weekend |
| 3         | 21           | Conference Championship |
| 4         | 22           | Super Bowl |

## Frontend Integration

The `WeekStatus` component automatically displays:
- Current week number
- Season type (Regular Season/Playoffs)
- Playoff round (if applicable)
- Loading states and error handling
- Manual refresh button

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install pg
```

### 2. Create .env File
```bash
# backend/.env
DB_PASSWORD=your_postgres_password
PORT=3001
```

### 3. Start Backend
```bash
cd backend
npm run dev
```

### 4. Test API
```bash
cd backend
node test-status-api.js
```

## Usage Examples

### In React Components
```jsx
import { useYearly } from '../context/YearlyContext';

function MyComponent() {
  const { currentWeek, isPlayoffs, playoffRound } = useYearly();
  
  return (
    <div>
      <h2>Current Week: {currentWeek}</h2>
      {isPlayoffs && <p>Playoff Round: {playoffRound}</p>}
    </div>
  );
}
```

### For Player Stats
```jsx
// When applying player stats, use the current week from context
const { currentWeek } = useYearly();

const applyPlayerStats = (playerId, stats) => {
  const statRecord = {
    player_id: playerId,
    week: currentWeek,
    year: new Date().getFullYear(),
    passing_yards: stats.passingYards,
    // ... other stats
  };
  
  // Save to database with correct week/year
};
```

## Troubleshooting

### Common Issues

1. **"pg module not found"**
   - Run `npm install pg` in backend directory

2. **Database connection failed**
   - Check your .env file has correct DB_PASSWORD
   - Ensure PostgreSQL is running

3. **ESPN API errors**
   - Check network connectivity
   - ESPN API may be temporarily down
   - System will fall back to cached data

4. **Week not updating**
   - Check browser console for errors
   - Verify backend is running on port 3001
   - Check CORS settings

### Debug Mode

Use the debug endpoint to see raw ESPN API responses:
```
GET http://localhost:3001/api/status/debug
```

## Future Enhancements
ld 
- [ ] Add more reliable fallback APIs
- [ ] Implement week validation logic
- [ ] Add historical week data
- [ ] Create week transition notificationssho
- [ ] Add commissioner override for week management

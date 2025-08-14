# 🚀 Import Routes Reference Guide

## Overview
This document details all the import routes that were actually implemented, tested, and used during the development of the playoff fantasy application. These routes handle importing real NFL playoff data from ESPN APIs into the PostgreSQL database.

---

## 📊 **Player Import Routes**

### 1. **POST `/api/players/import`**
**Purpose**: One-time import of all NFL players from ESPN API
**Status**: ✅ **WORKING** - Successfully imports ~7000 players

**Data Source**: 
```
https://partners.api.espn.com/v2/sports/football/nfl/athletes?limit=7000
```

**What It Does**:
- Fetches complete roster of NFL athletes from ESPN
- Filters for active players with valid positions and teams
- Transforms ESPN data structure to match database schema
- Inserts/updates players with `ON CONFLICT` handling
- Populates `players` table with master player list

**Database Table**: `players`
**Fields Populated**:
- `id`, `name`, `position`, `team`
- `jersey_number`, `height`, `weight`, `age`
- `experience`, `college`, `status`

**Usage**: 
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/players/import" -Method POST

# Or test script
node test-playoff-import.js
```

---

## 🏈 **Player Stats Import Routes**

### 2. **POST `/api/players/import-stats`**
**Purpose**: Import player statistics from ESPN Fantasy API (mBoxscore view)
**Status**: ❌ **LIMITED** - Only contains regular season data (weeks 0-18)

**Data Source**:
```
https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mBoxscore
```

**What It Does**:
- Attempts to fetch player stats from ESPN Fantasy API
- Filters for playoff weeks (19-22) 
- Maps ESPN stat IDs to database fields
- **LIMITATION**: This endpoint only contains regular season data

**Database Table**: `player_stats`
**Fields Attempted**:
- `passing_yards`, `passing_touchdowns`, `interceptions`
- `rushing_yards`, `rushing_touchdowns`
- `receiving_yards`, `receiving_touchdowns`
- `fumbles_lost`, `sacks`, `interceptions_defense`
- `field_goals_0_39`, `field_goals_40_49`, `field_goals_50_plus`
- `extra_points`

**Usage**:
```bash
Invoke-RestMethod -Uri "http://localhost:3001/api/players/import-stats" -Method POST
```

---

### 3. **POST `/api/stats/import-playoff`** ⭐ **PRIMARY ROUTE**
**Purpose**: Import real playoff player statistics from ESPN Game Summary API
**Status**: ✅ **WORKING** - Successfully imports playoff stats for weeks 19-22

**Data Sources**:
1. **Playoff Games List**:
   ```
   https://partners.api.espn.com/v2/sports/football/nfl/events?dates=20240101-20240215
   ```

2. **Individual Game Stats**:
   ```
   https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event={gameId}
   ```

**What It Does**:
- Fetches playoff game IDs from ESPN Events API
- For each playoff game, fetches detailed player statistics
- Extracts individual player stats from `boxscore.players[teamIndex].statistics[].athletes[]`
- Maps ESPN stat categories to database fields:
  - `passing`, `rushing`, `receiving`, `defensive`, `fumbles`, `kicking`
- **Special Feature**: Extracts field goal distances from `scoringPlays` text
- Determines playoff week based on game date
- Inserts/updates `player_stats` table with real playoff data

**Database Table**: `player_stats`
**Fields Successfully Populated**:
- **Offensive**: `passing_yards`, `passing_touchdowns`, `interceptions`
- **Rushing**: `rushing_yards`, `rushing_touchdowns`
- **Receiving**: `receiving_yards`, `receiving_touchdowns`
- **Defensive**: `sacks`, `interceptions_defense`, `fumble_recoveries`
- **Special Teams**: `field_goals_0_39`, `field_goals_40_49`, `field_goals_50_plus`, `extra_points`
- **Misc**: `fumbles_lost`, `week`, `year`, `source`

**Key Features**:
- **Field Goal Distance Mapping**: Automatically categorizes FGs by distance
- **Week Detection**: Maps game dates to fantasy weeks (1=Wild Card, 2=Divisional, etc.)
- **Source Tracking**: Marks data as `'espn_game_summary'` for debugging
- **Conflict Handling**: Uses `ON CONFLICT` to update existing stats

**Usage**:
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/import-playoff" -Method POST

# Test script
node test-playoff-import.js
```

**Results**: Successfully imported **221 playoff stat entries** for 3 playoff games

---

## 📋 **Data Retrieval Routes**

### 4. **GET `/api/stats/` (Multiple Endpoints)**
**Purpose**: Retrieve imported playoff stats with various filtering options
**Status**: ✅ **WORKING**

**Available Endpoints**:
- **`GET /api/stats/`** - All stats with optional filtering (week, year, player_id, position, team)
- **`GET /api/stats/player/:playerId`** - Stats for specific player
- **`GET /api/stats/week/:week`** - Stats for specific week
- **`GET /api/stats/week/:week/player/:playerId`** - Specific player's week stats
- **`GET /api/stats/week/:week/top/:position`** - Top performers by position for a week
- **`GET /api/stats/summary`** - Summary statistics and source breakdown

**What It Returns**:
- Summary statistics (total stats, unique players, weeks covered)
- Sample of stats with player names and positions
- Useful for verifying data quality and completeness

**Usage**:
```bash
# Get all stats
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/" -Method GET

# Get stats for week 1 (Wild Card)
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/week/1" -Method GET

# Get summary
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/summary" -Method GET
```

---

## 🔍 **Data Flow Architecture**

### **Import Process Flow**:
```
1. ESPN Events API → Get Playoff Game IDs
2. ESPN Game Summary API → Get Player Stats for Each Game
3. Data Transformation → Map ESPN Format to Database Schema
4. Database Insertion → Populate player_stats Table
5. Frontend Integration → Connect to Scoring Engine
```

### **Data Sources Hierarchy**:
```
✅ WORKING (Primary):
- ESPN Game Summary API (individual player stats)
- ESPN Events API (game schedule)

❌ LIMITED (Regular Season Only):
- ESPN Fantasy API (mBoxscore, mLiveScoring views)

✅ WORKING (Player List):
- ESPN Athletes API (master player roster)
```

---

## 🎯 **Key Success Factors**

### **What Made the Import Work**:
1. **Correct API Discovery**: Found that `ESPN Game Summary API` contains individual player stats
2. **Data Structure Mapping**: Successfully navigated nested `boxscore.players[].statistics[].athletes[]` structure
3. **Field Goal Distance Extraction**: Parsed `scoringPlays` text to get accurate FG distances
4. **Week Mapping Logic**: Converted game dates to fantasy playoff weeks
5. **Conflict Handling**: Used `ON CONFLICT` to handle duplicate imports gracefully

### **What Didn't Work**:
1. **ESPN Fantasy API Views**: `mBoxscore` and `mLiveScoring` only contain regular season data
2. **Direct Player Stats**: No single endpoint provides all playoff player stats in one call
3. **Simple Data Structure**: Required complex nested data extraction from game summaries

---

## 🚀 **Next Steps for Integration**

### **Frontend Data Bridge Needed**:
1. **API Endpoint**: Create route to fetch player stats by week/player
2. **Data Transformation**: Convert database format to match scoring engine expectations
3. **Real-time Updates**: Connect live scoring to existing calculation functions

### **Scoring Engine Integration**:
- Your existing `calculations.js` is ready to use
- Need to transform `player_stats` table data to `player.weeklyStats[week]` format
- Connect real playoff data to fantasy point calculations

---

## 📝 **Testing Commands**

### **Start Backend Server**:
```bash
cd backend
node server.js
```

### **Test Import Routes**:
```bash
# Import players (one-time)
Invoke-RestMethod -Uri "http://localhost:3001/api/players/import" -Method POST

# Import playoff stats (weekly)
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/import-playoff" -Method POST

# Verify imported data
Invoke-RestMethod -Uri "http://localhost:3001/api/stats/summary" -Method GET
```

### **Health Check**:
```bash
Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET
```

---

## 🎉 **Current Status**

**✅ COMPLETED**:
- Player roster import (7000+ players)
- Playoff stats import (221 stat entries)
- Database schema and structure
- Scoring engine logic

**🔄 NEXT PHASE**:
- Connect frontend to real playoff data
- Test scoring calculations with live stats
- Implement real-time updates
- Deploy functional application

---

*Last Updated: January 2025*  
*Data Source: ESPN APIs*  
*Database: PostgreSQL*  
*Backend: Node.js/Express*  
*Frontend: React with Context API*

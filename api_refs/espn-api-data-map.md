# ESPN API Data Mapping Reference

## Overview
This document maps out all available ESPN API endpoints and the data they provide for our fantasy playoff football application.

## Core NFL Data Endpoints

### 1. NFL Athletes API ✅
- **URL**: `https://partners.api.espn.com/v2/sports/football/nfl/athletes`
- **Purpose**: Core player roster data
- **Data Structure**: Object with athletes array
- **Key Fields**:
  - `athletes[]`: Array of athlete objects
  - `id`: ESPN player ID
  - `displayName`: Player name
  - `position.abbreviation`: Position (QB, RB, WR, TE, K, DEF)
  - `team.abbreviation`: Team abbreviation
  - `jersey`: Jersey number
  - `height`, `weight`, `age`, `experience`
  - `college.name`: College attended
  - `status.type`: Active status
- **Use Case**: Player roster management, team building
- **Data Size**: 33,443 characters (100 players sample)

### 2. NFL Events API ✅
- **URL**: `https://partners.api.espn.com/v2/sports/football/nfl/events`
- **Purpose**: Game schedules and event data
- **Data Structure**: Object with events array
- **Key Fields**:
  - `events[]`: Array of game events
  - `id`, `date`, `name`, `shortName`
  - `competitions[]`: Game competitions within events
  - `competitors[]`: Teams competing with home/away, scores
  - `attendance`, `venue`, `status`
- **Use Case**: Game scheduling, playoff brackets
- **Data Size**: 16,497 characters (10 events sample)

### 3. NFL Scoreboard API ✅
- **URL**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard`
- **Purpose**: Current week status and live scores
- **Data Structure**: Object with week/season info
- **Key Fields**:
  - `week.number`: Current week number (currently 2)
  - `season.type`: Season type (1 = Preseason)
  - `season.year`: Season year (2025)
  - `events[]`: Current week games (16 games)
  - `leagues[]`: League information
- **Use Case**: Week detection, season status, live scoring
- **Data Size**: 135,707 characters (full current week data)

## Fantasy API Views (2024 Season - Historical Data)

### 4. mBoxscore View ✅
- **URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mBoxscore`
- **Purpose**: Detailed player statistics and scoring
- **Data Structure**: Array of player objects with stats
- **Key Fields**:
  - `eligibleSlots[]`: Fantasy position eligibility
  - `firstName`, `lastName`, `fullName`
  - `id`: Player ID
  - `proTeamId`: Team ID
  - `stats[]`: Array of weekly stats (38 weeks)
  - `scoringPeriodId`: ESPN week number
  - `stats.stats`: Individual stat values (ESPN stat IDs)
- **Use Case**: Player statistics import, fantasy scoring calculations
- **Data Size**: 401,047 characters (50 players with full season stats)

### 5. mMatchup View ✅
- **URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mMatchup`
- **Purpose**: Fantasy matchup data
- **Data Structure**: Array of player objects
- **Key Fields**:
  - `active`, `droppable`: Player availability
  - `defaultPositionId`: Primary position
  - `eligibleSlots[]`: Position eligibility
  - `injured`, `injuryStatus`: Health status
  - `proTeamId`: Team ID
- **Use Case**: Head-to-head matchups, league structure
- **Data Size**: 11,990 characters (50 players, basic matchup info)

### 6. mMatchupScore View ✅
- **URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mMatchupScore`
- **Purpose**: Fantasy matchup scoring results
- **Data Structure**: Array of player objects with stats
- **Key Fields**:
  - `stats[]`: Array of weekly stats (38 weeks)
  - `variance`: Statistical variance for each stat type
  - `scoringPeriodId`: Week number
  - `stats.stats`: Individual stat values
- **Use Case**: Final scores, standings calculations
- **Data Size**: 468,545 characters (50 players with variance data)

### 7. mLiveScoring View ✅
- **URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mLiveScoring`
- **Purpose**: Real-time live scoring updates during games
- **Data Structure**: Array of player objects with stats
- **Key Fields**:
  - `fullName`: Player name
  - `id`: Player ID
  - `proTeamId`: Team ID
  - `stats[]`: Array of weekly stats (38 weeks)
  - `scoringPeriodId`: Week number
  - `stats.stats`: Individual stat values
- **Use Case**: Live fantasy updates, real-time standings
- **Data Size**: 396,598 characters (50 players with live scoring data)

### 8. mRoster View ✅
- **URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mRoster`
- **Purpose**: Fantasy roster composition
- **Data Structure**: Array of player objects with roster data
- **Key Fields**:
  - `active`, `droppable`: Availability
  - `defaultPositionId`: Primary position
  - `eligibleSlots[]`: Position eligibility
  - `draftRanksByRankType`: Draft rankings (STANDARD, PPR)
  - `ownership`: Ownership percentages, ADP
  - `injured`, `injuryStatus`: Health status
  - `stats[]`: Weekly statistics
- **Use Case**: Team roster management, player availability
- **Data Size**: 426,326 characters (50 players with roster data)

### 9. mStats View ✅
- **URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/players?view=mStats`
- **Purpose**: Fantasy statistics and performance metrics
- **Data Structure**: Array of player objects
- **Key Fields**: Minimal data structure
- **Use Case**: Performance analysis, player rankings
- **Data Size**: 151 characters (very limited data)

## Fantasy API Views (2025 Season - Current)

### 10. 2025 mBoxscore View ✅
- **URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/players?view=mBoxscore`
- **Purpose**: Current season player statistics
- **Data Structure**: Array of player objects with stats
- **Key Fields**:
  - `eligibleSlots[]`: Position eligibility
  - `firstName`, `lastName`, `fullName`
  - `id`: Player ID
  - `proTeamId`: Team ID (note: changed from 25 to 9 for Abanikanda)
  - `stats[]`: Array of weekly stats (40 weeks including preseason)
  - `scoringPeriodId`: Week number (0 = preseason, 1+ = regular season)
- **Use Case**: Current season stats, preseason data
- **Data Size**: 666,852 characters (50 players with current season data)

### 11. 2025 mLiveScoring View ✅
- **URL**: `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2025/players?view=mLiveScoring`
- **Purpose**: Current season live scoring
- **Data Structure**: Array of player objects with stats
- **Key Fields**:
  - `fullName`: Player name
  - `id`: Player ID
  - `proTeamId`: Team ID
  - `stats[]`: Array of weekly stats (40 weeks)
  - `scoringPeriodId`: Week number
- **Use Case**: Live updates for current season
- **Data Size**: 662,411 characters (50 players with live scoring data)

## Additional Endpoints

### 12. NFL Teams API ✅
- **URL**: `https://partners.api.espn.com/v2/sports/football/nfl/teams`
- **Purpose**: Team information and details
- **Data Structure**: Object with teams array
- **Key Fields**:
  - `teams[]`: Array of 32 NFL teams
  - `id`, `abbreviation`, `displayName`
  - `location`, `name`, `slug`
  - `color`, `alternateColor`: Team colors
  - `record`: Current season record
  - `links`: Team pages and resources
- **Use Case**: Team management, logos, colors
- **Data Size**: 19,012 characters (32 teams)

### 13. NFL Standings API ✅
- **URL**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/standings`
- **Purpose**: NFL standings and rankings
- **Data Structure**: Object with link to full standings
- **Key Fields**:
  - `fullViewLink`: Link to complete standings page
- **Use Case**: Playoff seeding, team performance
- **Data Size**: 86 characters (redirect link only)

### 14. NFL Schedule API ❌
- **URL**: `https://site.api.espn.com/apis/site/v2/sports/football/nfl/schedule`
- **Purpose**: NFL season schedule and game dates
- **Status**: 404 Error - Endpoint not available
- **Use Case**: Season planning, game dates
- **Alternative**: Use NFL Events API for schedule data

## Data Flow Architecture

### Primary Data Sources
1. **Week/Season Detection**: NFL Scoreboard API ✅
2. **Player Management**: NFL Athletes API ✅
3. **Game Scheduling**: NFL Events API ✅
4. **Player Statistics**: Fantasy mBoxscore API ✅
5. **Live Updates**: Fantasy mLiveScoring API ✅

### Data Integration Points
- **Player Import**: NFL Athletes → Database players table
- **Stats Import**: Fantasy mBoxscore → Database player_stats table
- **Week Detection**: NFL Scoreboard → YearlyContext currentWeek
- **Live Scoring**: Fantasy mLiveScoring → Real-time updates
- **Game Schedule**: NFL Events → Database game_schedule table

## ESPN Stat ID Mappings

### Offensive Stats
- `3`: Passing Yards
- `4`: Passing Touchdowns
- `2`: Interceptions
- `5`: Rushing Yards
- `6`: Rushing Touchdowns
- `7`: Receiving Yards
- `8`: Receiving Touchdowns
- `9`: Fumbles Lost

### Defensive Stats
- `99`: Sacks
- `10`: Defensive Interceptions
- `11`: Fumble Recoveries
- `12`: Safeties
- `13`: Blocked Kicks
- `14`: Punt Return Touchdowns
- `15`: Kickoff Return Touchdowns
- `16`: Points Allowed

### Kicker Stats
- `17`: Field Goals 0-39 yards
- `18`: Field Goals 40-49 yards
- `19`: Field Goals 50+ yards
- `20`: Extra Points

## Key Discoveries

### 1. Current Season Status
- **Current Week**: 2 (Preseason Week 2)
- **Season Type**: 1 (Preseason)
- **Season Year**: 2025
- **Total Games**: 16 games this week

### 2. Data Richness Ranking
1. **fantasy_2025_mBoxscore**: 666,852 chars (most comprehensive)
2. **fantasy_2025_mLiveScoring**: 662,411 chars
3. **fantasy_mRoster**: 426,326 chars
4. **fantasy_mMatchupScore**: 468,545 chars
5. **fantasy_mBoxscore**: 401,047 chars
6. **fantasy_mLiveScoring**: 396,598 chars

### 3. Player Data Evolution
- **2024 Season**: 38 weeks of data
- **2025 Season**: 40 weeks (including preseason weeks 0-1)
- **Team Changes**: Players can change teams between seasons (e.g., Abanikanda: GB → SF)

### 4. Live Scoring Capabilities
- All fantasy views include `stats[]` arrays
- `scoringPeriodId` maps to specific weeks
- `proTeamId` changes reflect roster moves
- Real-time updates available through mLiveScoring

## Testing Status
- [x] NFL Athletes API ✅
- [x] NFL Events API ✅
- [x] NFL Scoreboard API ✅
- [x] Fantasy mBoxscore View ✅
- [x] Fantasy mMatchup View ✅
- [x] Fantasy mMatchupScore View ✅
- [x] Fantasy mLiveScoring View ✅
- [x] Fantasy mRoster View ✅
- [x] Fantasy mStats View ✅
- [x] 2025 mBoxscore View ✅
- [x] 2025 mLiveScoring View ✅
- [x] NFL Teams API ✅
- [x] NFL Standings API ✅
- [x] NFL Schedule API ❌

## Next Steps
1. **Integrate Current Week Detection**: Use NFL Scoreboard API in status endpoint
2. **Update Player Import**: Use NFL Athletes API for comprehensive roster
3. **Implement Stats Import**: Use Fantasy mBoxscore API for detailed statistics
4. **Add Live Scoring**: Use Fantasy mLiveScoring API for real-time updates
5. **Build Game Schedule**: Use NFL Events API for playoff scheduling

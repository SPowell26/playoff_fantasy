-- Fantasy Playoff Football Database Schema
-- This file creates all the tables needed for our fantasy football application

-- ============================================================================
-- LEAGUES TABLE
-- ============================================================================
CREATE TABLE leagues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    commissioner VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL, -- Track which year this league is for
    scoring_rules JSONB NOT NULL, -- Store our dynamic scoring rules as JSON
    max_teams INTEGER NOT NULL DEFAULT 12,
    bench_spots INTEGER NOT NULL DEFAULT 2,
    flex_spots INTEGER NOT NULL DEFAULT 1, -- W/R/T flex positions
    draft_locked BOOLEAN DEFAULT FALSE, -- Prevent changes after draft
    first_game_date DATE, -- When playoffs start (for validation)
    settings_locked BOOLEAN DEFAULT FALSE, -- Prevent changes after playoffs start
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PLAYERS TABLE (from ESPN API)
-- ============================================================================
CREATE TABLE players (
    id INTEGER PRIMARY KEY, -- ESPN player ID
    name VARCHAR(255) NOT NULL,
    position VARCHAR(10) NOT NULL, -- QB, RB, WR, TE, K, DEF
    team VARCHAR(10) NOT NULL, -- Team abbreviation
    jersey_number INTEGER,
    height VARCHAR(10),
    weight INTEGER,
    age INTEGER,
    experience INTEGER,
    college VARCHAR(255),
    status VARCHAR(50), -- Active, Injured, etc.
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- When data was last refreshed from ESPN
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TEAM ROSTERS TABLE (many-to-many relationship)
-- ============================================================================
CREATE TABLE team_rosters (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(id) ON DELETE CASCADE, -- Track which league
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    roster_position VARCHAR(10) NOT NULL, -- QB, RB, WR, TE, K, DEF, BN
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(league_id, player_id) -- Prevent same player in same league twice
);

-- ============================================================================
-- PLAYER STATS TABLE (weekly/playoff stats)
-- ============================================================================
CREATE TABLE player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    week INTEGER NOT NULL, -- Playoff week (1, 2, 3, 4)
    year INTEGER NOT NULL, -- Year of playoffs
    -- Offensive stats
    passing_yards INTEGER DEFAULT 0,
    passing_touchdowns INTEGER DEFAULT 0,
    interceptions INTEGER DEFAULT 0,
    rushing_yards INTEGER DEFAULT 0,
    rushing_touchdowns INTEGER DEFAULT 0,
    receiving_yards INTEGER DEFAULT 0,
    receiving_touchdowns INTEGER DEFAULT 0,
    fumbles_lost INTEGER DEFAULT 0,
    -- Defensive stats
    sacks INTEGER DEFAULT 0,
    interceptions_defense INTEGER DEFAULT 0,
    fumble_recoveries INTEGER DEFAULT 0,
    safeties INTEGER DEFAULT 0,
    blocked_kicks INTEGER DEFAULT 0,
    punt_return_touchdowns INTEGER DEFAULT 0,
    kickoff_return_touchdowns INTEGER DEFAULT 0,
    points_allowed INTEGER DEFAULT 0,
    team_win BOOLEAN DEFAULT FALSE,
    -- Kicker stats
    field_goals_0_39 INTEGER DEFAULT 0,
    field_goals_40_49 INTEGER DEFAULT 0,
    field_goals_50_plus INTEGER DEFAULT 0,
    extra_points INTEGER DEFAULT 0,
    -- Calculated fields
    fantasy_points DECIMAL(10,2) DEFAULT 0,
    -- Data integrity fields
    manually_updated BOOLEAN DEFAULT FALSE, -- Was this stat manually corrected?
    updated_by VARCHAR(255), -- Who made the manual update (commissioner)
    update_reason TEXT, -- Why was it changed
    source VARCHAR(20) DEFAULT 'espn', -- 'espn', 'manual', 'backup'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, week, year) -- One stat record per player per week
);

-- ============================================================================
-- LEAGUE MEMBERS TABLE (for future user authentication)
-- ============================================================================
CREATE TABLE league_members (
    id SERIAL PRIMARY KEY,
    league_id INTEGER REFERENCES leagues(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE, -- Link to specific team
    user_email VARCHAR(255) NOT NULL, -- Email for notifications
    username VARCHAR(255) NOT NULL, -- Display name
    password_hash VARCHAR(255), -- Hashed password for authentication
    role VARCHAR(20) DEFAULT 'member', -- member, commissioner
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id), -- One member per team
    UNIQUE(league_id, user_email) -- One member per league
);

-- ============================================================================
-- SYSTEM SETTINGS TABLE (global week tracking)
-- ============================================================================
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    current_week INTEGER NOT NULL DEFAULT 1, -- Current playoff week (1, 2, 3, 4)
    current_year INTEGER NOT NULL DEFAULT 2025, -- Current playoff year
    playoff_started BOOLEAN DEFAULT FALSE, -- Whether playoffs have started
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- GAME SCHEDULE TABLE (real NFL playoff games)
-- ============================================================================
CREATE TABLE game_schedule (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL, -- Year of playoffs
    week INTEGER NOT NULL, -- Playoff week (1, 2, 3, 4)
    game_date TIMESTAMP NOT NULL, -- When the game starts
    home_team VARCHAR(10) NOT NULL, -- Home team abbreviation
    away_team VARCHAR(10) NOT NULL, -- Away team abbreviation
    game_status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in_progress, final
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, week, home_team, away_team) -- Prevent duplicate games
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_teams_league_id ON teams(league_id);
CREATE INDEX idx_team_rosters_league_id ON team_rosters(league_id);
CREATE INDEX idx_team_rosters_team_id ON team_rosters(team_id);
CREATE INDEX idx_team_rosters_player_id ON team_rosters(player_id);
CREATE INDEX idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX idx_player_stats_week_year ON player_stats(week, year);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_team ON players(team);
CREATE INDEX idx_game_schedule_year_week ON game_schedule(year, week);
CREATE INDEX idx_game_schedule_teams ON game_schedule(home_team, away_team);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert a sample league
INSERT INTO leagues (name, commissioner, year, scoring_rules, max_teams, bench_spots, flex_spots) VALUES (
    'Playoff Fantasy League',
    'John Doe',
    2025,
    '{
        "offensive": {
            "passing": {"yardsPerPoint": 0.04, "touchdownPoints": 4, "interceptionPoints": -2},
            "rushing": {"yardsPerPoint": 0.1, "touchdownPoints": 6},
            "receiving": {"yardsPerPoint": 0.1, "touchdownPoints": 6},
            "fumbles": {"lostPoints": -2}
        },
        "defensive": {
            "specialTeams": {
                "blockedKickPoints": 2, "safetyPoints": 2, "fumbleRecoveryPoints": 1,
                "interceptionPoints": 2, "sackPoints": 1, "puntReturnTDPoints": 6,
                "kickoffReturnTDPoints": 6
            },
            "pointsAllowed": {
                "shutoutPoints": 10, "oneToSixPoints": 7, "sevenToThirteenPoints": 4,
                "fourteenToTwentyPoints": 1, "twentyOneToTwentySevenPoints": 0,
                "twentyEightToThirtyFourPoints": -1, "thirtyFivePlusPoints": -4
            },
            "teamWinPoints": 5
        },
        "kicker": {
            "fieldGoals": {
                "zeroToThirtyNinePoints": 3, "fortyToFortyNinePoints": 4, "fiftyPlusPoints": 5
            },
            "extraPointPoints": 1
        }
    }',
    12,
    2,
    1
);

-- Insert a sample team
INSERT INTO teams (league_id, name, owner) VALUES (1, 'Team Alpha', 'Alice');

-- Insert a sample league member (team owner)
INSERT INTO league_members (league_id, team_id, user_email, username, role) VALUES (1, 1, 'alice@email.com', 'Alice', 'commissioner');

-- Insert a sample roster entry (with league_id)
INSERT INTO team_rosters (league_id, team_id, player_id, roster_position) VALUES (1, 1, 1, 'QB');

-- Insert system settings
INSERT INTO system_settings (current_week, current_year, playoff_started) VALUES (1, 2025, FALSE);

-- Insert sample playoff schedule for 2025
INSERT INTO game_schedule (year, week, game_date, home_team, away_team) VALUES
-- Wild Card Round (Week 1)
(2025, 1, '2025-01-11 16:30:00', 'BAL', 'CLE'),
(2025, 1, '2025-01-11 20:15:00', 'BUF', 'MIA'),
(2025, 1, '2025-01-12 13:00:00', 'KC', 'PIT'),
(2025, 1, '2025-01-12 16:30:00', 'HOU', 'IND'),
(2025, 1, '2025-01-12 20:15:00', 'DAL', 'GB'),
(2025, 1, '2025-01-13 13:00:00', 'DET', 'LAR'),
(2025, 1, '2025-01-13 16:30:00', 'SF', 'SEA'),
(2025, 1, '2025-01-13 20:15:00', 'PHI', 'TB'),

-- Divisional Round (Week 2) - Example matchups
(2025, 2, '2025-01-18 16:30:00', 'BAL', 'BUF'),
(2025, 2, '2025-01-18 20:15:00', 'KC', 'HOU'),
(2025, 2, '2025-01-19 13:00:00', 'DAL', 'DET'),
(2025, 2, '2025-01-19 16:30:00', 'SF', 'PHI'),

-- Conference Championships (Week 3)
(2025, 3, '2025-01-25 15:00:00', 'BAL', 'KC'),
(2025, 3, '2025-01-25 18:30:00', 'DAL', 'SF'),

-- Super Bowl (Week 4)
(2025, 4, '2025-02-08 18:30:00', 'BAL', 'DAL');

-- Display what we created
SELECT 'Database schema created successfully!' as status; 
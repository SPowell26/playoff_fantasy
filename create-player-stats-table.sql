-- Recreate the missing player_stats table
CREATE TABLE player_stats (
    id SERIAL PRIMARY KEY,
    player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
    league_id INTEGER REFERENCES leagues(id) ON DELETE CASCADE,
    team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
    week INTEGER NOT NULL, -- Playoff week (1, 2, 3, 4)
    year INTEGER NOT NULL, -- Year of playoffs
    game_id INTEGER REFERENCES game_schedule(id) ON DELETE CASCADE,
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

-- Create indexes for performance
CREATE INDEX idx_player_stats_player_id ON player_stats(player_id);
CREATE INDEX idx_player_stats_week_year ON player_stats(week, year);

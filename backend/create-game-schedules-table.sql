-- Create table to store weekly game schedules
-- This stores game times for each week so we know when to automatically pull stats

CREATE TABLE IF NOT EXISTS game_schedules (
    id SERIAL PRIMARY KEY,
    week INTEGER NOT NULL,
    year INTEGER NOT NULL,
    season_type VARCHAR(20) NOT NULL DEFAULT 'regular',
    game_id VARCHAR(50) NOT NULL,
    game_name VARCHAR(255) NOT NULL,
    game_date TIMESTAMP WITH TIME ZONE NOT NULL,
    home_team VARCHAR(10),
    away_team VARCHAR(10),
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(week, year, season_type, game_id)
);

-- Index for efficient lookups by week and date
CREATE INDEX IF NOT EXISTS idx_game_schedules_week_year ON game_schedules(week, year, season_type);
CREATE INDEX IF NOT EXISTS idx_game_schedules_date ON game_schedules(game_date);

-- Add comment
COMMENT ON TABLE game_schedules IS 'Stores weekly NFL game schedules with game times for automated stat pulling';


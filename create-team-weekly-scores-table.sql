-- Create team_weekly_scores table for storing weekly best-ball lineups and scores
-- This table stores the optimal lineup and calculated weekly score for each team

CREATE TABLE IF NOT EXISTS team_weekly_scores (
    id SERIAL PRIMARY KEY,
    league_id INTEGER NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    week INTEGER NOT NULL,
    year INTEGER NOT NULL,
    season_type VARCHAR(20) NOT NULL DEFAULT 'regular',
    
    -- Optimal lineup players and their fantasy points
    qb_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    qb_fantasy_points DECIMAL(10,2) DEFAULT 0,
    
    rb1_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    rb1_fantasy_points DECIMAL(10,2) DEFAULT 0,
    rb2_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    rb2_fantasy_points DECIMAL(10,2) DEFAULT 0,
    
    wr1_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    wr1_fantasy_points DECIMAL(10,2) DEFAULT 0,
    wr2_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    wr2_fantasy_points DECIMAL(10,2) DEFAULT 0,
    
    te_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    te_fantasy_points DECIMAL(10,2) DEFAULT 0,
    
    flex_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    flex_fantasy_points DECIMAL(10,2) DEFAULT 0,
    
    k_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    k_fantasy_points DECIMAL(10,2) DEFAULT 0,
    
    def_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
    def_fantasy_points DECIMAL(10,2) DEFAULT 0,
    
    -- Calculated total
    weekly_score DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    lineup_json JSONB, -- Full lineup details as JSON
    source VARCHAR(50) DEFAULT 'best_ball_engine',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for ON CONFLICT clause
    CONSTRAINT team_weekly_scores_unique UNIQUE (league_id, team_id, week, year, season_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_weekly_scores_league ON team_weekly_scores(league_id);
CREATE INDEX IF NOT EXISTS idx_team_weekly_scores_team ON team_weekly_scores(team_id);
CREATE INDEX IF NOT EXISTS idx_team_weekly_scores_week_year ON team_weekly_scores(week, year);
CREATE INDEX IF NOT EXISTS idx_team_weekly_scores_season_type ON team_weekly_scores(season_type);
CREATE INDEX IF NOT EXISTS idx_team_weekly_scores_team_week_year ON team_weekly_scores(team_id, week, year, season_type);

-- Verify table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'team_weekly_scores'
ORDER BY ordinal_position;


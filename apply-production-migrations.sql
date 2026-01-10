-- Production Database Migrations
-- Run this script on Railway database to apply all schema changes since going live
-- Migration order: season_type → player_stats updates → missed kicks

-- ============================================================================
-- MIGRATION 1: Add season_type to leagues table
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leagues' AND column_name = 'season_type'
    ) THEN
        ALTER TABLE leagues ADD COLUMN season_type VARCHAR(20) DEFAULT 'regular';
        
        ALTER TABLE leagues ADD CONSTRAINT check_season_type 
            CHECK (season_type IN ('regular', 'postseason', 'preseason'));
        
        UPDATE leagues SET season_type = 'regular' WHERE season_type IS NULL;
        
        ALTER TABLE leagues ALTER COLUMN season_type SET NOT NULL;
        
        RAISE NOTICE 'Added season_type column to leagues table';
    ELSE
        RAISE NOTICE 'season_type column already exists in leagues table';
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leagues_season_type ON leagues(season_type);
CREATE INDEX IF NOT EXISTS idx_leagues_year_season_type ON leagues(year, season_type);

-- ============================================================================
-- MIGRATION 2: Add season_type and receptions to player_stats table
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' AND column_name = 'season_type'
    ) THEN
        ALTER TABLE player_stats ADD COLUMN season_type VARCHAR(20);
        RAISE NOTICE 'Added season_type column to player_stats table';
    ELSE
        RAISE NOTICE 'season_type column already exists in player_stats table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' AND column_name = 'receptions'
    ) THEN
        ALTER TABLE player_stats ADD COLUMN receptions INTEGER DEFAULT 0;
        RAISE NOTICE 'Added receptions column to player_stats table';
    ELSE
        RAISE NOTICE 'receptions column already exists in player_stats table';
    END IF;
END $$;

-- Make league_id, team_id, and game_id nullable if they're not already
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' 
        AND column_name = 'league_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE player_stats ALTER COLUMN league_id DROP NOT NULL;
        RAISE NOTICE 'Made league_id nullable in player_stats table';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' 
        AND column_name = 'team_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE player_stats ALTER COLUMN team_id DROP NOT NULL;
        RAISE NOTICE 'Made team_id nullable in player_stats table';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' 
        AND column_name = 'game_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE player_stats ALTER COLUMN game_id DROP NOT NULL;
        RAISE NOTICE 'Made game_id nullable in player_stats table';
    END IF;
END $$;

-- ============================================================================
-- MIGRATION 3: Add missed kicks columns to player_stats table
-- ============================================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' AND column_name = 'field_goals_missed'
    ) THEN
        ALTER TABLE player_stats ADD COLUMN field_goals_missed INTEGER DEFAULT 0;
        RAISE NOTICE 'Added field_goals_missed column to player_stats table';
    ELSE
        RAISE NOTICE 'field_goals_missed column already exists in player_stats table';
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' AND column_name = 'extra_points_missed'
    ) THEN
        ALTER TABLE player_stats ADD COLUMN extra_points_missed INTEGER DEFAULT 0;
        RAISE NOTICE 'Added extra_points_missed column to player_stats table';
    ELSE
        RAISE NOTICE 'extra_points_missed column already exists in player_stats table';
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION: Show what columns exist now
-- ============================================================================
SELECT 'Migration complete! Verifying columns...' as status;

-- Verify leagues table
SELECT 
    'leagues' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'leagues' 
  AND column_name = 'season_type';

-- Verify player_stats table new columns
SELECT 
    'player_stats' as table_name,
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'player_stats' 
  AND column_name IN ('season_type', 'receptions', 'field_goals_missed', 'extra_points_missed')
ORDER BY column_name;


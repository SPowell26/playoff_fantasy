-- Fix player_stats table to match what the import code expects
-- This adds missing columns that the import endpoints are trying to use

-- Add season_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' AND column_name = 'season_type'
    ) THEN
        ALTER TABLE player_stats ADD COLUMN season_type VARCHAR(20);
    END IF;
END $$;

-- Add receptions column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' AND column_name = 'receptions'
    ) THEN
        ALTER TABLE player_stats ADD COLUMN receptions INTEGER DEFAULT 0;
    END IF;
END $$;

-- Make league_id, team_id, and game_id nullable if they're not already
DO $$ 
BEGIN
    -- These should already be nullable, but just in case
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' 
        AND column_name = 'league_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE player_stats ALTER COLUMN league_id DROP NOT NULL;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' 
        AND column_name = 'team_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE player_stats ALTER COLUMN team_id DROP NOT NULL;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' 
        AND column_name = 'game_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE player_stats ALTER COLUMN game_id DROP NOT NULL;
    END IF;
END $$;

-- Verify the columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'player_stats' 
ORDER BY ordinal_position;


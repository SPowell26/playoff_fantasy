-- Add columns for tracking missed field goals and extra points
-- This enables proper scoring penalties for missed kicks

-- Add field_goals_missed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' AND column_name = 'field_goals_missed'
    ) THEN
        ALTER TABLE player_stats ADD COLUMN field_goals_missed INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add extra_points_missed column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'player_stats' AND column_name = 'extra_points_missed'
    ) THEN
        ALTER TABLE player_stats ADD COLUMN extra_points_missed INTEGER DEFAULT 0;
    END IF;
END $$;

-- Verify the columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'player_stats' 
  AND column_name IN ('field_goals_missed', 'extra_points_missed')
ORDER BY column_name;


-- Fix the unique constraint for player_stats table
-- This ensures ON CONFLICT works properly

-- Drop existing constraint if it exists with our name
ALTER TABLE player_stats 
DROP CONSTRAINT IF EXISTS player_stats_player_week_year_unique;

-- Create the unique constraint with a specific name (required for ON CONFLICT)
ALTER TABLE player_stats 
ADD CONSTRAINT player_stats_player_week_year_unique 
UNIQUE (player_id, week, year);

-- Verify the constraint was created
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'player_stats'::regclass
AND conname = 'player_stats_player_week_year_unique';

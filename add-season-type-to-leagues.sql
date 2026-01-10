-- Add season_type column to leagues table
-- This allows leagues to be categorized as regular season or postseason
-- Enables proper week display and data filtering per league context

-- Add season_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'leagues' AND column_name = 'season_type'
    ) THEN
        ALTER TABLE leagues ADD COLUMN season_type VARCHAR(20) DEFAULT 'regular';
        
        -- Add constraint to ensure valid season types
        ALTER TABLE leagues ADD CONSTRAINT check_season_type 
            CHECK (season_type IN ('regular', 'postseason', 'preseason'));
        
        -- Update existing leagues to have 'regular' as default
        UPDATE leagues SET season_type = 'regular' WHERE season_type IS NULL;
        
        -- Make season_type NOT NULL now that we've set defaults
        ALTER TABLE leagues ALTER COLUMN season_type SET NOT NULL;
        
        RAISE NOTICE 'Added season_type column to leagues table';
    ELSE
        RAISE NOTICE 'season_type column already exists in leagues table';
    END IF;
END $$;

-- Create index for performance when filtering by season_type
CREATE INDEX IF NOT EXISTS idx_leagues_season_type ON leagues(season_type);
CREATE INDEX IF NOT EXISTS idx_leagues_year_season_type ON leagues(year, season_type);

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'leagues' AND column_name = 'season_type';


-- Find player IDs for specific players to create test stats
SELECT id, name, position, team FROM players 
WHERE name ILIKE '%mahomes%' 
   OR name ILIKE '%brown%' 
   OR name ILIKE '%barkley%' 
   OR name ILIKE '%aubrey%' 
   OR name ILIKE '%chiefs%'
ORDER BY name;

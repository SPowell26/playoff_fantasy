# Add user library to library path
user_lib <- "C:/Users/spowell/AppData/Local/R/win-library/4.5"
.libPaths(c(user_lib, .libPaths()))

# Load required libraries
library(nflfastR)
library(jsonlite)
library(dplyr)

cat("Loading nflfastR data...\n")

# Load 2024 play-by-play data
pbp <- load_pbp(2024)

cat("Processing weekly playoff data...\n")

# Define week mapping
week_mapping <- list(
  "wild_card" = 1,
  "divisional" = 2, 
  "conference" = 3,
  "super_bowl" = 4
)

# Get weekly stats for playoff teams
weekly_stats <- pbp %>%
  # Filter for playoff teams and playoff games
  filter(playoff_team %in% c("KC", "BAL", "BUF", "HOU", "SF", "DET", "GB", "TB")) %>%
  filter(season_type == "POST") %>%  # Only playoff games
  # Group by player, team, and week
  group_by(player_name, position, team, playoff_team, week) %>%
  summarize(
    passing_yards = sum(passing_yards, na.rm = TRUE),
    passing_touchdown = sum(passing_touchdown, na.rm = TRUE),
    interception = sum(interception, na.rm = TRUE),
    rushing_yards = sum(rushing_yards, na.rm = TRUE),
    rushing_touchdown = sum(rushing_touchdown, na.rm = TRUE),
    receiving_yards = sum(receiving_yards, na.rm = TRUE),
    receiving_touchdown = sum(receiving_touchdown, na.rm = TRUE),
    fumble = sum(fumble, na.rm = TRUE),
    .groups = 'drop'
  ) %>%
  # Remove players with no stats in this week
  filter(passing_yards > 0 | rushing_yards > 0 | receiving_yards > 0) %>%
  # Create unique IDs
  mutate(
    id = paste0(team, "_", gsub(" ", "", player_name)),
    isActive = TRUE,
    isEliminated = FALSE
  ) %>%
  # Rename columns to match your app structure
  rename(
    nflTeam = team,
    playoffTeam = playoff_team,
    passingTD = passing_touchdown,
    rushingTD = rushing_touchdown,
    receivingTD = receiving_touchdown,
    fumbles = fumble
  )

cat("Found", nrow(weekly_stats), "player-week combinations\n")

# Convert to weekly structure
players_weekly <- weekly_stats %>%
  # Create stats object for each week
  mutate(
    week_stats = list(list(
      passingYards = passing_yards,
      passingTD = passingTD,
      interceptions = interception,
      rushingYards = rushing_yards,
      rushingTD = rushingTD,
      receivingYards = receiving_yards,
      receivingTD = receivingTD,
      fumbles = fumbles
    ))
  ) %>%
  # Group by player and create weekly stats object
  group_by(id, player_name, position, nflTeam, playoffTeam, isActive, isEliminated) %>%
  summarize(
    weeklyStats = setNames(week_stats, as.character(week)),
    .groups = 'drop'
  ) %>%
  rename(name = player_name)

# Create the export structure
export_data <- list(
  weekMapping = week_mapping,
  players = players_weekly,
  positionStats = list(
    QB = c("passingYards", "passingTD", "interceptions", "rushingYards", "rushingTD", "fumbles"),
    RB = c("rushingYards", "rushingTD", "receivingYards", "receivingTD", "fumbles"),
    WR = c("receivingYards", "receivingTD", "rushingYards", "rushingTD", "fumbles"),
    TE = c("receivingYards", "receivingTD", "rushingYards", "rushingTD", "fumbles")
  ),
  scoringRules = list(
    passingYards = 0.04,
    passingTD = 4,
    interceptions = -2,
    rushingYards = 0.1,
    rushingTD = 6,
    receivingYards = 0.1,
    receivingTD = 6,
    fumbles = -2
  )
)

# Export to JSON
cat("Exporting to JSON...\n")
write_json(export_data, "playoff_players_weekly.json", pretty = TRUE)

cat("Export complete! Check playoff_players_weekly.json\n")
cat("Found", nrow(players_weekly), "players with weekly playoff stats\n")


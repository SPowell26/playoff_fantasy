# TODO List

## Master Account Setup
- Set `MASTER_EMAIL=your.email@example.com` in Railway environment variables
- This gives god-mode access to all leagues and bypasses commissioner restrictions
- Useful for testing, admin operations, and emergency fixes

## Pending Features

### 1. Basic Commissioner Email Auth/Permission System
- Protect API writes/delete operations
- Implement email-based authentication for commissioners
- Add permission checks for write/delete endpoints
- Store commissioner email in league settings

### 2. Automate Score Updates
- Set up scheduled jobs (cron) to fetch player stats from ESPN API
- Automatically update player_stats table with latest data
- Update team_weekly_scores with new best-ball lineups
- Handle playoff weeks and game completion status

### 3. Automate Email Notifications
- Send emails with team parameters (no auth required for recipients)
- Email notifications for:
  - Weekly score updates
  - Roster changes
  - League events
  - Game completions
- Use team owner emails from database

### 4. ML Model Score Projection
- Build machine learning model to predict fantasy scores
- Train on historical player performance data
- Integrate projections into frontend display
- Show projected vs actual scores

### 5. Team Page → League HQ Navigation Fix
- Improve navigation flow from team page back to league headquarters
- Add breadcrumbs or back button
- Ensure smooth navigation experience


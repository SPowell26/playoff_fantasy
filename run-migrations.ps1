# Run Recent Migrations on Railway Database
# This script runs the apply-recent-migrations.sql file on your Railway database

Write-Host "=== Running Recent Migrations on Railway ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Getting Railway database connection string..." -ForegroundColor Yellow
Write-Host "1. Go to your Railway PostgreSQL service" -ForegroundColor White
Write-Host "2. Click on the 'Connect' tab" -ForegroundColor White
Write-Host "3. Copy the 'Postgres Connection URL'" -ForegroundColor White
Write-Host ""
$railwayConnectionString = Read-Host "Paste Railway connection string"

if ([string]::IsNullOrWhiteSpace($railwayConnectionString)) {
    Write-Host "Error: Railway connection string is required!" -ForegroundColor Red
    exit 1
}

$migrationFile = "apply-recent-migrations.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file '$migrationFile' not found!" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project root directory." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Running migrations from: $migrationFile" -ForegroundColor Cyan
Write-Host "This will add:" -ForegroundColor White
Write-Host "  - defensive_touchdowns column" -ForegroundColor Gray
Write-Host "  - two_point_conversions_passing column" -ForegroundColor Gray
Write-Host "  - two_point_conversions_receiving column" -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Executing migrations..." -ForegroundColor Yellow

# Run the migration file
psql $railwayConnectionString -f $migrationFile

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Error running migrations!" -ForegroundColor Red
    Write-Host "Check the error above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✓ Migrations completed successfully!" -ForegroundColor Green
Write-Host "The new columns have been added to your player_stats table." -ForegroundColor Green

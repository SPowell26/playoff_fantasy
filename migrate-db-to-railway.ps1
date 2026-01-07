# Migrate Database to Railway
# This script exports your local database and helps you import it to Railway

Write-Host "=== Database Migration to Railway ===" -ForegroundColor Cyan
Write-Host ""

# Get local database credentials
$localDB = Read-Host "Local database name [fantasy_playoff_db]"
if ([string]::IsNullOrWhiteSpace($localDB)) { $localDB = "fantasy_playoff_db" }

$localUser = Read-Host "Local database user [postgres]"
if ([string]::IsNullOrWhiteSpace($localUser)) { $localUser = "postgres" }

$localHost = Read-Host "Local database host [localhost]"
if ([string]::IsNullOrWhiteSpace($localHost)) { $localHost = "localhost" }

$localPort = Read-Host "Local database port [5432]"
if ([string]::IsNullOrWhiteSpace($localPort)) { $localPort = "5432" }

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

$backupFile = "railway-migration-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"

Write-Host ""
Write-Host "Step 1: Exporting local database..." -ForegroundColor Cyan
Write-Host "Backup file: $backupFile" -ForegroundColor Gray

# Export schema and data
Write-Host "Enter local database password:" -ForegroundColor Yellow
$securePassword = Read-Host -AsSecureString
$localPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))
$env:PGPASSWORD = $localPassword

pg_dump -h $localHost -p $localPort -U $localUser -d $localDB --clean --if-exists --no-owner --no-acl -f $backupFile

# Clear password from environment
Remove-Item Env:PGPASSWORD

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error exporting database!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Database exported successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Importing to Railway..." -ForegroundColor Cyan
Write-Host "This will replace all data in your Railway database!" -ForegroundColor Yellow
$confirm = Read-Host "Continue? Type 'yes' to continue"

if ($confirm -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 0
}

# Import to Railway
psql $railwayConnectionString -f $backupFile

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error importing to Railway!" -ForegroundColor Red
    Write-Host "Check the error above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✓ Migration completed successfully!" -ForegroundColor Green
Write-Host "Your database has been migrated to Railway." -ForegroundColor Green
Write-Host ""
Write-Host "Backup file saved as: $backupFile" -ForegroundColor Gray
Write-Host "You can delete this file after verifying the migration worked." -ForegroundColor Gray


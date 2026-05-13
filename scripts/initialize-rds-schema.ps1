# Initialize RDS PostgreSQL Schema
# This script connects to RDS and runs the schema.sql file

param(
    [string]$Region = "us-east-1",
    [string]$DatabaseName = "modeled_analytics"
)

Write-Host "📊 Initializing RDS PostgreSQL Schema" -ForegroundColor Green
Write-Host ""

# Check if psql is installed
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ psql is not installed or not in PATH." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL client tools:" -ForegroundColor Yellow
    Write-Host "  Windows: Download from https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "  Or use AWS RDS Query Editor (see alternative method below)" -ForegroundColor White
    Write-Host ""
    Write-Host "Alternative: Use AWS RDS Query Editor" -ForegroundColor Cyan
    Write-Host "  1. Go to AWS RDS Console → Databases → modeled-analytics" -ForegroundColor White
    Write-Host "  2. Click 'Query Editor' (or use RDS Query Editor v2)" -ForegroundColor White
    Write-Host "  3. Connect and paste schema.sql contents" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Get RDS endpoint from Secrets Manager
Write-Host "Step 1: Getting RDS endpoint from Secrets Manager..." -ForegroundColor Yellow
$EndpointSecret = aws secretsmanager get-secret-value --region $Region --secret-id "rds-endpoint" --query "SecretString" --output text 2>$null

if (-not $EndpointSecret -or $EndpointSecret -eq "None") {
    Write-Host "  ❌ Could not retrieve endpoint from Secrets Manager." -ForegroundColor Red
    Write-Host "  Please run setup-rds-postgres.ps1 first." -ForegroundColor Yellow
    exit 1
}

$Endpoint = $EndpointSecret.Trim('"')
Write-Host "  Endpoint: $Endpoint" -ForegroundColor Green

# Get credentials from Secrets Manager
Write-Host "Step 2: Getting database credentials..." -ForegroundColor Yellow
$CredentialsSecret = aws secretsmanager get-secret-value --region $Region --secret-id "modeled-analytics-db-credentials" --query "SecretString" --output text 2>$null

if (-not $CredentialsSecret -or $CredentialsSecret -eq "None") {
    Write-Host "  ❌ Could not retrieve credentials from Secrets Manager." -ForegroundColor Red
    Write-Host "  Please run setup-rds-postgres.ps1 first." -ForegroundColor Yellow
    exit 1
}

$Credentials = $CredentialsSecret | ConvertFrom-Json
$Username = $Credentials.username
$Password = $Credentials.password

Write-Host "  Username: $Username" -ForegroundColor Green

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $Password

# Check if schema file exists
$SchemaFile = "amplify/analytics/schema.sql"
if (-not (Test-Path $SchemaFile)) {
    Write-Host "  ❌ Schema file not found: $SchemaFile" -ForegroundColor Red
    exit 1
}

Write-Host "Step 3: Running schema.sql..." -ForegroundColor Yellow
Write-Host "  Schema file: $SchemaFile" -ForegroundColor Gray

# Run schema
$Result = & psql -h $Endpoint -U $Username -d $DatabaseName -f $SchemaFile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Schema initialized successfully!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Schema initialization failed." -ForegroundColor Red
    Write-Host "  Error output:" -ForegroundColor Yellow
    Write-Host $Result -ForegroundColor Red
    exit 1
}

# Verify tables were created
Write-Host "Step 4: Verifying schema..." -ForegroundColor Yellow
$TablesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
$Tables = & psql -h $Endpoint -U $Username -d $DatabaseName -t -c $TablesQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    $TableList = $Tables | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $_.Trim() }
    Write-Host "  ✅ Found $($TableList.Count) tables:" -ForegroundColor Green
    foreach ($Table in $TableList) {
        Write-Host "    - $Table" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  Could not verify tables. Check connection." -ForegroundColor Yellow
}

# Clean up
Remove-Item Env:\PGPASSWORD

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Schema Initialization Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""


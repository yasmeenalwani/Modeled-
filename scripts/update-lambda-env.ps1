# Update Lambda Function Environment Variables
# This script updates the analytics-api Lambda function with RDS connection info

param(
    [string]$Region = "us-east-1"
)

Write-Host "🔧 Updating Lambda Function Environment Variables" -ForegroundColor Green
Write-Host ""

# Get Lambda function name
Write-Host "Step 1: Finding Lambda function..." -ForegroundColor Yellow
$LambdaFunctionName = aws lambda list-functions --region $Region --query "Functions[?contains(FunctionName, 'analytics-api')].FunctionName" --output text 2>$null

if (-not $LambdaFunctionName -or $LambdaFunctionName -eq "None") {
    Write-Host "  ❌ Lambda function 'analytics-api' not found." -ForegroundColor Red
    Write-Host "  Please deploy backend first: npx ampx sandbox" -ForegroundColor Yellow
    exit 1
}

Write-Host "  Found: $LambdaFunctionName" -ForegroundColor Green

# Get RDS secret ARN
Write-Host "Step 2: Getting RDS secret ARN..." -ForegroundColor Yellow
$SecretArn = aws secretsmanager describe-secret --region $Region --secret-id "modeled-analytics-db-credentials" --query "ARN" --output text 2>$null

if (-not $SecretArn -or $SecretArn -eq "None") {
    Write-Host "  ❌ Secret 'modeled-analytics-db-credentials' not found." -ForegroundColor Red
    Write-Host "  Please run setup-rds-postgres.ps1 first." -ForegroundColor Yellow
    exit 1
}

Write-Host "  Secret ARN: $SecretArn" -ForegroundColor Green

# Get RDS endpoint
Write-Host "Step 3: Getting RDS endpoint..." -ForegroundColor Yellow
$Endpoint = aws secretsmanager get-secret-value --region $Region --secret-id "rds-endpoint" --query "SecretString" --output text 2>$null

if (-not $Endpoint -or $Endpoint -eq "None") {
    Write-Host "  ⚠️  Endpoint secret not found. Will retrieve from credentials secret." -ForegroundColor Yellow
    $Credentials = aws secretsmanager get-secret-value --region $Region --secret-id "modeled-analytics-db-credentials" --query "SecretString" --output text | ConvertFrom-Json
    $Endpoint = $Credentials.host
}

if ($Endpoint) {
    $Endpoint = $Endpoint.Trim('"')
    Write-Host "  Endpoint: $Endpoint" -ForegroundColor Green
} else {
    Write-Host "  ❌ Could not retrieve RDS endpoint." -ForegroundColor Red
    exit 1
}

# Get current environment variables
Write-Host "Step 4: Getting current Lambda configuration..." -ForegroundColor Yellow
$CurrentConfig = aws lambda get-function-configuration --region $Region --function-name $LambdaFunctionName --output json | ConvertFrom-Json
$CurrentEnv = $CurrentConfig.Environment.Variables

# Update environment variables
Write-Host "Step 5: Updating environment variables..." -ForegroundColor Yellow
$NewEnv = @{
    RDS_SECRET_ARN = $SecretArn
    RDS_ENDPOINT = $Endpoint
    RDS_DATABASE = "modeled_analytics"
    RDS_REGION = $Region
}

# Merge with existing environment variables
foreach ($Key in $CurrentEnv.PSObject.Properties.Name) {
    if (-not $NewEnv.ContainsKey($Key)) {
        $NewEnv[$Key] = $CurrentEnv.$Key
    }
}

# Convert to JSON format for AWS CLI
$EnvJson = $NewEnv | ConvertTo-Json -Compress

# Update Lambda function
$UpdateResult = aws lambda update-function-configuration --region $Region --function-name $LambdaFunctionName --environment "Variables=$EnvJson" --output json 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Lambda function updated successfully!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Failed to update Lambda function." -ForegroundColor Red
    Write-Host $UpdateResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Lambda Function Updated!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Updated Environment Variables:" -ForegroundColor Cyan
Write-Host "  RDS_SECRET_ARN: $SecretArn" -ForegroundColor White
Write-Host "  RDS_ENDPOINT: $Endpoint" -ForegroundColor White
Write-Host "  RDS_DATABASE: modeled_analytics" -ForegroundColor White
Write-Host "  RDS_REGION: $Region" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test the connection:" -ForegroundColor Cyan
Write-Host "  .\scripts\test-rds-connection.ps1" -ForegroundColor White
Write-Host ""


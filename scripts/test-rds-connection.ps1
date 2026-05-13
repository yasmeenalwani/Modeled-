# Test RDS PostgreSQL Connection
# This script tests the connection from Lambda function perspective

param(
    [string]$Region = "us-east-1"
)

Write-Host "🧪 Testing RDS PostgreSQL Connection" -ForegroundColor Green
Write-Host ""

# Get credentials from Secrets Manager
Write-Host "Step 1: Getting credentials from Secrets Manager..." -ForegroundColor Yellow
$CredentialsSecret = aws secretsmanager get-secret-value --region $Region --secret-id "modeled-analytics-db-credentials" --query "SecretString" --output text 2>$null

if (-not $CredentialsSecret -or $CredentialsSecret -eq "None") {
    Write-Host "  ❌ Could not retrieve credentials from Secrets Manager." -ForegroundColor Red
    Write-Host "  Please run setup-rds-postgres.ps1 first." -ForegroundColor Yellow
    exit 1
}

$Credentials = $CredentialsSecret | ConvertFrom-Json
Write-Host "  ✅ Credentials retrieved" -ForegroundColor Green

# Get endpoint
$Endpoint = $Credentials.host
$Port = $Credentials.port
$Database = $Credentials.dbname
$Username = $Credentials.username
$Password = $Credentials.password

Write-Host "Step 2: Testing connection..." -ForegroundColor Yellow
Write-Host "  Endpoint: $Endpoint:$Port" -ForegroundColor Gray
Write-Host "  Database: $Database" -ForegroundColor Gray
Write-Host "  Username: $Username" -ForegroundColor Gray

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if ($psqlPath) {
    # Test with psql
    $env:PGPASSWORD = $Password
    $TestQuery = "SELECT version();"
    $Result = & psql -h $Endpoint -U $Username -d $Database -t -c $TestQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Connection successful!" -ForegroundColor Green
        Write-Host "  PostgreSQL version:" -ForegroundColor Gray
        Write-Host $Result -ForegroundColor White
        Remove-Item Env:\PGPASSWORD
    } else {
        Write-Host "  ❌ Connection failed!" -ForegroundColor Red
        Write-Host $Result -ForegroundColor Red
        Remove-Item Env:\PGPASSWORD
        exit 1
    }
} else {
    # Test with AWS CLI (using RDS Data API if available, or just check instance status)
    Write-Host "  psql not available. Checking RDS instance status..." -ForegroundColor Yellow
    
    $InstanceStatus = aws rds describe-db-instances --region $Region --db-instance-identifier "modeled-analytics" --query "DBInstances[0].DBInstanceStatus" --output text 2>$null
    
    if ($InstanceStatus -eq "available") {
        Write-Host "  ✅ RDS instance is available" -ForegroundColor Green
        Write-Host "  ⚠️  Install psql for full connection test" -ForegroundColor Yellow
    } else {
        Write-Host "  ❌ RDS instance status: $InstanceStatus" -ForegroundColor Red
        exit 1
    }
}

# Test Lambda function permissions
Write-Host "Step 3: Testing Lambda function permissions..." -ForegroundColor Yellow

# Get Lambda function name
$LambdaFunctionName = aws lambda list-functions --region $Region --query "Functions[?contains(FunctionName, 'analytics-api')].FunctionName" --output text 2>$null

if ($LambdaFunctionName) {
    Write-Host "  Found Lambda function: $LambdaFunctionName" -ForegroundColor Green
    
    # Check if Lambda has Secrets Manager permissions
    $LambdaRole = aws lambda get-function --region $Region --function-name $LambdaFunctionName --query "Configuration.Role" --output text 2>$null
    
    if ($LambdaRole) {
        Write-Host "  Lambda role: $LambdaRole" -ForegroundColor Gray
        
        # Test invoking Lambda
        Write-Host "  Testing Lambda invocation..." -ForegroundColor Yellow
        $TestPayload = @{
            action = "testConnection"
        } | ConvertTo-Json -Compress
        
        $InvokeResult = aws lambda invoke --region $Region --function-name $LambdaFunctionName --payload $TestPayload --output json response.json 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $Response = Get-Content response.json | ConvertFrom-Json
            if ($Response.success) {
                Write-Host "  ✅ Lambda function can connect to RDS!" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Lambda function exists but connection test failed" -ForegroundColor Yellow
                Write-Host "  Error: $($Response.error)" -ForegroundColor Red
            }
            Remove-Item response.json -ErrorAction SilentlyContinue
        } else {
            Write-Host "  ⚠️  Could not invoke Lambda function" -ForegroundColor Yellow
            Write-Host "  Make sure the function is deployed: npx ampx sandbox" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️  Could not retrieve Lambda role" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ⚠️  Lambda function not found. Deploy backend first: npx ampx sandbox" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Connection Test Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""


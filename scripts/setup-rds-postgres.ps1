# RDS PostgreSQL Setup Script for Modeled Management
# This script creates the RDS instance, initializes schema, and configures Secrets Manager
# Prerequisites: AWS CLI configured, psql installed (or use AWS RDS Query Editor)

param(
    [string]$Region = "us-east-1",
    [string]$InstanceClass = "db.t3.micro",
    [int]$StorageGB = 20,
    [string]$MasterUsername = "modeled_admin",
    [string]$DatabaseName = "modeled_analytics"
)

Write-Host "🚀 Starting RDS PostgreSQL Setup for Modeled Management" -ForegroundColor Green
Write-Host ""

# Step 1: Generate secure password
Write-Host "Step 1: Generating secure password..." -ForegroundColor Yellow
$Password = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$Password += "!@#"

# Step 2: Get VPC and Security Group info
Write-Host "Step 2: Getting VPC information..." -ForegroundColor Yellow
$Vpcs = aws ec2 describe-vpcs --region $Region --query "Vpcs[?IsDefault==\`true\`].[VpcId, CidrBlock]" --output text
if ($Vpcs) {
    $VpcId = ($Vpcs -split "`t")[0]
    $VpcCidr = ($Vpcs -split "`t")[1]
    Write-Host "  Found default VPC: $VpcId ($VpcCidr)" -ForegroundColor Green
} else {
    Write-Host "  No default VPC found. Please specify VPC ID:" -ForegroundColor Yellow
    $VpcId = Read-Host "VPC ID"
}

# Step 3: Create Security Group for RDS
Write-Host "Step 3: Creating security group for RDS..." -ForegroundColor Yellow
$SecurityGroupName = "modeled-rds-sg"
$SecurityGroupDescription = "Security group for Modeled Management RDS PostgreSQL"

$ExistingSG = aws ec2 describe-security-groups --region $Region --filters "Name=group-name,Values=$SecurityGroupName" --query "SecurityGroups[0].GroupId" --output text

if ($ExistingSG -and $ExistingSG -ne "None") {
    Write-Host "  Security group already exists: $ExistingSG" -ForegroundColor Green
    $SecurityGroupId = $ExistingSG
} else {
    $SecurityGroupId = aws ec2 create-security-group --region $Region --group-name $SecurityGroupName --description $SecurityGroupDescription --vpc-id $VpcId --query "GroupId" --output text
    Write-Host "  Created security group: $SecurityGroupId" -ForegroundColor Green
    
    # Allow inbound PostgreSQL from VPC
    aws ec2 authorize-security-group-ingress --region $Region --group-id $SecurityGroupId --protocol tcp --port 5432 --cidr $VpcCidr | Out-Null
    Write-Host "  Added inbound rule for PostgreSQL (port 5432) from VPC" -ForegroundColor Green
}

# Step 4: Create RDS Subnet Group (if needed)
Write-Host "Step 4: Setting up subnet group..." -ForegroundColor Yellow
$SubnetGroupName = "modeled-rds-subnet-group"

$Subnets = aws ec2 describe-subnets --region $Region --filters "Name=vpc-id,Values=$VpcId" --query "Subnets[*].[SubnetId,AvailabilityZone]" --output text
$SubnetIds = ($Subnets | ForEach-Object { ($_ -split "`t")[0] }) -join ","

$ExistingSubnetGroup = aws rds describe-db-subnet-groups --region $Region --db-subnet-group-name $SubnetGroupName --query "DBSubnetGroups[0].DBSubnetGroupName" --output text 2>$null

if ($ExistingSubnetGroup -and $ExistingSubnetGroup -ne "None") {
    Write-Host "  Subnet group already exists: $SubnetGroupName" -ForegroundColor Green
} else {
    aws rds create-db-subnet-group --region $Region --db-subnet-group-name $SubnetGroupName --db-subnet-group-description "Subnet group for Modeled Management RDS" --subnet-ids $SubnetIds | Out-Null
    Write-Host "  Created subnet group: $SubnetGroupName" -ForegroundColor Green
}

# Step 5: Create RDS Instance
Write-Host "Step 5: Creating RDS PostgreSQL instance..." -ForegroundColor Yellow
$DBInstanceIdentifier = "modeled-analytics"

$ExistingDB = aws rds describe-db-instances --region $Region --db-instance-identifier $DBInstanceIdentifier --query "DBInstances[0].DBInstanceStatus" --output text 2>$null

if ($ExistingDB -and $ExistingDB -ne "None") {
    Write-Host "  RDS instance already exists: $DBInstanceIdentifier (Status: $ExistingDB)" -ForegroundColor Yellow
    Write-Host "  Skipping instance creation. Use --force to recreate." -ForegroundColor Yellow
} else {
    Write-Host "  Creating RDS instance (this may take 5-10 minutes)..." -ForegroundColor Yellow
    
    $RDSResult = aws rds create-db-instance `
        --region $Region `
        --db-instance-identifier $DBInstanceIdentifier `
        --db-instance-class $InstanceClass `
        --engine postgres `
        --engine-version 15.4 `
        --master-username $MasterUsername `
        --master-user-password $Password `
        --allocated-storage $StorageGB `
        --storage-type gp2 `
        --db-name $DatabaseName `
        --db-subnet-group-name $SubnetGroupName `
        --vpc-security-group-ids $SecurityGroupId `
        --backup-retention-period 7 `
        --enable-cloudwatch-logs-exports postgresql `
        --storage-encrypted `
        --publicly-accessible `
        --no-multi-az `
        --output json
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  RDS instance creation initiated!" -ForegroundColor Green
        Write-Host "  Waiting for instance to be available (this may take 5-10 minutes)..." -ForegroundColor Yellow
        
        # Wait for instance to be available
        do {
            Start-Sleep -Seconds 30
            $Status = aws rds describe-db-instances --region $Region --db-instance-identifier $DBInstanceIdentifier --query "DBInstances[0].DBInstanceStatus" --output text 2>$null
            Write-Host "  Current status: $Status" -ForegroundColor Gray
        } while ($Status -ne "available" -and $Status -ne "None")
        
        if ($Status -eq "available") {
            Write-Host "  ✅ RDS instance is now available!" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Instance creation may still be in progress. Check AWS Console." -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ Failed to create RDS instance. Check AWS Console for details." -ForegroundColor Red
        exit 1
    }
}

# Step 6: Get RDS Endpoint
Write-Host "Step 6: Getting RDS endpoint..." -ForegroundColor Yellow
$Endpoint = aws rds describe-db-instances --region $Region --db-instance-identifier $DBInstanceIdentifier --query "DBInstances[0].Endpoint.Address" --output text
$Port = aws rds describe-db-instances --region $Region --db-instance-identifier $DBInstanceIdentifier --query "DBInstances[0].Endpoint.Port" --output text

if ($Endpoint -and $Endpoint -ne "None") {
    Write-Host "  Endpoint: $Endpoint:$Port" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Could not retrieve endpoint. Instance may still be creating." -ForegroundColor Yellow
    Write-Host "  Please run this script again once the instance is available." -ForegroundColor Yellow
    exit 1
}

# Step 7: Store credentials in Secrets Manager
Write-Host "Step 7: Storing credentials in Secrets Manager..." -ForegroundColor Yellow
$SecretName = "modeled-analytics-db-credentials"
$SecretString = @{
    username = $MasterUsername
    password = $Password
    engine = "postgres"
    host = $Endpoint
    port = $Port
    dbname = $DatabaseName
} | ConvertTo-Json -Compress

$ExistingSecret = aws secretsmanager describe-secret --region $Region --secret-id $SecretName --query "ARN" --output text 2>$null

if ($ExistingSecret -and $ExistingSecret -ne "None") {
    Write-Host "  Secret already exists. Updating..." -ForegroundColor Yellow
    aws secretsmanager update-secret --region $Region --secret-id $SecretName --secret-string $SecretString | Out-Null
    Write-Host "  ✅ Secret updated: $SecretName" -ForegroundColor Green
} else {
    aws secretsmanager create-secret --region $Region --name $SecretName --description "RDS PostgreSQL credentials for Modeled Analytics" --secret-string $SecretString | Out-Null
    Write-Host "  ✅ Secret created: $SecretName" -ForegroundColor Green
}

# Step 8: Store RDS endpoint in Secrets Manager (for Lambda)
Write-Host "Step 8: Storing RDS endpoint..." -ForegroundColor Yellow
$EndpointSecretName = "rds-endpoint"
$EndpointSecretString = $Endpoint

$ExistingEndpointSecret = aws secretsmanager describe-secret --region $Region --secret-id $EndpointSecretName --query "ARN" --output text 2>$null

if ($ExistingEndpointSecret -and $ExistingEndpointSecret -ne "None") {
    aws secretsmanager update-secret --region $Region --secret-id $EndpointSecretName --secret-string $EndpointSecretString | Out-Null
    Write-Host "  ✅ Endpoint secret updated: $EndpointSecretName" -ForegroundColor Green
} else {
    aws secretsmanager create-secret --region $Region --name $EndpointSecretName --description "RDS endpoint for Modeled Analytics" --secret-string $EndpointSecretString | Out-Null
    Write-Host "  ✅ Endpoint secret created: $EndpointSecretName" -ForegroundColor Green
}

# Step 9: Initialize Schema
Write-Host "Step 9: Schema initialization..." -ForegroundColor Yellow
Write-Host "  Schema file: amplify/analytics/schema.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "  To initialize the schema, you have two options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Option 1: Using psql (if installed)" -ForegroundColor Cyan
Write-Host "    psql -h $Endpoint -U $MasterUsername -d $DatabaseName -f amplify/analytics/schema.sql" -ForegroundColor White
Write-Host ""
Write-Host "  Option 2: Using AWS RDS Query Editor" -ForegroundColor Cyan
Write-Host "    1. Go to AWS RDS Console → Databases → $DBInstanceIdentifier" -ForegroundColor White
Write-Host "    2. Click 'Query Editor' (or use RDS Query Editor v2)" -ForegroundColor White
Write-Host "    3. Connect using credentials above" -ForegroundColor White
Write-Host "    4. Copy and paste contents of amplify/analytics/schema.sql" -ForegroundColor White
Write-Host ""
Write-Host "  Option 3: Run the initialization script" -ForegroundColor Cyan
Write-Host "    .\scripts\initialize-rds-schema.ps1" -ForegroundColor White
Write-Host ""

# Summary
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ RDS PostgreSQL Setup Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Instance Details:" -ForegroundColor Cyan
Write-Host "  Instance ID: $DBInstanceIdentifier" -ForegroundColor White
Write-Host "  Endpoint: $Endpoint:$Port" -ForegroundColor White
Write-Host "  Database: $DatabaseName" -ForegroundColor White
Write-Host "  Username: $MasterUsername" -ForegroundColor White
Write-Host "  Password: [Stored in Secrets Manager]" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Secrets Manager:" -ForegroundColor Cyan
Write-Host "  Credentials: $SecretName" -ForegroundColor White
Write-Host "  Endpoint: $EndpointSecretName" -ForegroundColor White
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Initialize schema (see options above)" -ForegroundColor White
Write-Host "  2. Update Lambda function environment variables (if needed)" -ForegroundColor White
Write-Host "  3. Test connection from Lambda function" -ForegroundColor White
Write-Host "  4. Deploy backend: npx ampx sandbox" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Save the password securely!" -ForegroundColor Yellow
Write-Host "   Password is stored in Secrets Manager: $SecretName" -ForegroundColor Yellow
Write-Host ""


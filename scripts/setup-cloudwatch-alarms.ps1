# CloudWatch Alarms Setup Script (PowerShell)
# This script sets up all critical CloudWatch alarms for Modeled Management

param(
    [Parameter(Mandatory=$false)]
    [string]$SnsTopicName = "modeled-management-alerts",
    
    [Parameter(Mandatory=$false)]
    [string]$AlertEmail = "",
    
    [Parameter(Mandatory=$false)]
    [string]$AlertPhone = ""
)

Write-Host "🚨 Setting up CloudWatch Alarms for Modeled Management..." -ForegroundColor Cyan

# Step 1: Create SNS Topic
Write-Host "📢 Creating SNS topic: $SnsTopicName" -ForegroundColor Yellow
$topicResponse = aws sns create-topic --name $SnsTopicName 2>&1
if ($LASTEXITCODE -ne 0) {
    # Topic might already exist, try to get it
    Write-Host "   Topic may already exist, getting ARN..." -ForegroundColor Yellow
    $topicArn = aws sns list-topics --query "Topics[?contains(TopicArn, '$SnsTopicName')].TopicArn" --output text
} else {
    $topicObj = $topicResponse | ConvertFrom-Json
    $topicArn = $topicObj.TopicArn
}

if ([string]::IsNullOrEmpty($topicArn)) {
    Write-Host "❌ Error: Could not create or find SNS topic" -ForegroundColor Red
    exit 1
}

Write-Host "✅ SNS Topic ARN: $topicArn" -ForegroundColor Green

# Subscribe email if provided
if (-not [string]::IsNullOrEmpty($AlertEmail)) {
    Write-Host "📧 Subscribing email: $AlertEmail" -ForegroundColor Yellow
    aws sns subscribe --topic-arn $topicArn --protocol email --notification-endpoint $AlertEmail
    Write-Host "   Check your email to confirm subscription!" -ForegroundColor Yellow
}

# Subscribe SMS if provided
if (-not [string]::IsNullOrEmpty($AlertPhone)) {
    Write-Host "📱 Subscribing SMS: $AlertPhone" -ForegroundColor Yellow
    aws sns subscribe --topic-arn $topicArn --protocol sms --notification-endpoint $AlertPhone
}

# Step 2: Create Critical Alarms
Write-Host ""
Write-Host "🔴 Creating Critical Alarms..." -ForegroundColor Cyan

# Lambda Errors
Write-Host "   Creating Lambda Errors alarm..." -ForegroundColor Yellow
aws cloudwatch put-metric-alarm `
    --alarm-name ModeledManagement-LambdaErrors `
    --alarm-description "Alert when Lambda functions have errors" `
    --metric-name Errors `
    --namespace AWS/Lambda `
    --statistic Sum `
    --period 300 `
    --evaluation-periods 1 `
    --threshold 1 `
    --comparison-operator GreaterThanThreshold `
    --alarm-actions $topicArn `
    --treat-missing-data notBreaching | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ Lambda Errors alarm created" -ForegroundColor Green }

# DynamoDB Throttling
Write-Host "   Creating DynamoDB Throttling alarm..." -ForegroundColor Yellow
aws cloudwatch put-metric-alarm `
    --alarm-name ModeledManagement-DynamoDBThrottling `
    --alarm-description "Alert when DynamoDB tables are throttled" `
    --metric-name ThrottledRequests `
    --namespace AWS/DynamoDB `
    --statistic Sum `
    --period 300 `
    --evaluation-periods 1 `
    --threshold 10 `
    --comparison-operator GreaterThanThreshold `
    --alarm-actions $topicArn `
    --treat-missing-data notBreaching | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ DynamoDB Throttling alarm created" -ForegroundColor Green }

# AppSync 5XX Errors
Write-Host "   Creating AppSync 5XX Errors alarm..." -ForegroundColor Yellow
aws cloudwatch put-metric-alarm `
    --alarm-name ModeledManagement-AppSync5XXErrors `
    --alarm-description "Alert when AppSync has server errors" `
    --metric-name 5XXError `
    --namespace AWS/AppSync `
    --statistic Sum `
    --period 300 `
    --evaluation-periods 1 `
    --threshold 5 `
    --comparison-operator GreaterThanThreshold `
    --alarm-actions $topicArn `
    --treat-missing-data notBreaching | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ AppSync 5XX Errors alarm created" -ForegroundColor Green }

# SES Bounce Rate
Write-Host "   Creating SES Bounce Rate alarm..." -ForegroundColor Yellow
aws cloudwatch put-metric-alarm `
    --alarm-name ModeledManagement-SESBounceRate `
    --alarm-description "Alert when SES bounce rate exceeds 5%" `
    --metric-name Reputation.BounceRate `
    --namespace AWS/SES `
    --statistic Average `
    --period 300 `
    --evaluation-periods 2 `
    --threshold 5.0 `
    --comparison-operator GreaterThanThreshold `
    --alarm-actions $topicArn `
    --treat-missing-data notBreaching | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ SES Bounce Rate alarm created" -ForegroundColor Green }

# SES Complaint Rate
Write-Host "   Creating SES Complaint Rate alarm..." -ForegroundColor Yellow
aws cloudwatch put-metric-alarm `
    --alarm-name ModeledManagement-SESComplaintRate `
    --alarm-description "Alert when SES complaint rate exceeds 0.1%" `
    --metric-name Reputation.ComplaintRate `
    --namespace AWS/SES `
    --statistic Average `
    --period 300 `
    --evaluation-periods 2 `
    --threshold 0.1 `
    --comparison-operator GreaterThanThreshold `
    --alarm-actions $topicArn `
    --treat-missing-data notBreaching | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ SES Complaint Rate alarm created" -ForegroundColor Green }

# Step 3: Create Performance Alarms
Write-Host ""
Write-Host "⚡ Creating Performance Alarms..." -ForegroundColor Cyan

# Lambda Duration
Write-Host "   Creating Lambda Duration alarm..." -ForegroundColor Yellow
aws cloudwatch put-metric-alarm `
    --alarm-name ModeledManagement-LambdaSlow `
    --alarm-description "Alert when Lambda functions are slow (>10s)" `
    --metric-name Duration `
    --namespace AWS/Lambda `
    --statistic Average `
    --period 300 `
    --evaluation-periods 2 `
    --threshold 10000 `
    --comparison-operator GreaterThanThreshold `
    --alarm-actions $topicArn `
    --treat-missing-data notBreaching | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ Lambda Duration alarm created" -ForegroundColor Green }

# AppSync Latency
Write-Host "   Creating AppSync Latency alarm..." -ForegroundColor Yellow
aws cloudwatch put-metric-alarm `
    --alarm-name ModeledManagement-AppSyncLatency `
    --alarm-description "Alert when AppSync latency is high (>2s)" `
    --metric-name Latency `
    --namespace AWS/AppSync `
    --statistic p95 `
    --period 300 `
    --evaluation-periods 2 `
    --threshold 2000 `
    --comparison-operator GreaterThanThreshold `
    --alarm-actions $topicArn `
    --treat-missing-data notBreaching | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "   ✅ AppSync Latency alarm created" -ForegroundColor Green }

# Step 4: Create Cost Alarm (if billing metrics enabled)
Write-Host ""
Write-Host "💰 Creating Cost Alarm..." -ForegroundColor Cyan
Write-Host "   Note: Billing metrics must be enabled in Billing Console first" -ForegroundColor Yellow

aws cloudwatch put-metric-alarm `
    --alarm-name ModeledManagement-MonthlyBilling `
    --alarm-description "Alert when monthly AWS costs exceed $100" `
    --metric-name EstimatedCharges `
    --namespace AWS/Billing `
    --statistic Maximum `
    --period 21600 `
    --evaluation-periods 1 `
    --threshold 100 `
    --comparison-operator GreaterThanThreshold `
    --dimensions Name=Currency,Value=USD `
    --alarm-actions $topicArn `
    --treat-missing-data notBreaching | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Monthly Billing alarm created" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Billing alarm failed (billing metrics may not be enabled)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "✅ CloudWatch Alarms setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View alarms:" -ForegroundColor Cyan
Write-Host "   https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Confirm SNS email subscription (check your inbox)" -ForegroundColor White
Write-Host "   2. Test alarms by triggering an error" -ForegroundColor White
Write-Host "   3. Review alarm thresholds and adjust as needed" -ForegroundColor White
Write-Host "   4. Create CloudWatch dashboard for visual monitoring" -ForegroundColor White
Write-Host ""
Write-Host "📚 See docs/deployment/2026-01-05_CLOUDWATCH_ALARMS_SETUP.md for details" -ForegroundColor Yellow


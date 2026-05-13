# S3 Intelligent Tiering Setup Script (PowerShell)
# This script enables Intelligent Tiering on the Modeled Storage bucket

Write-Host "🚀 Setting up S3 Intelligent Tiering for Modeled Storage..." -ForegroundColor Cyan

# Get bucket name
Write-Host "📦 Finding S3 bucket..." -ForegroundColor Yellow
$buckets = aws s3api list-buckets --query "Buckets[?contains(Name, 'modeledStorage')].Name" --output text
$BUCKET_NAME = $buckets.Trim()

if ([string]::IsNullOrEmpty($BUCKET_NAME)) {
    Write-Host "❌ Error: Could not find modeledStorage bucket" -ForegroundColor Red
    Write-Host "   Make sure you've deployed the Amplify backend first: npx ampx sandbox" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found bucket: $BUCKET_NAME" -ForegroundColor Green

# Enable Intelligent Tiering for entire bucket
Write-Host "🔧 Enabling Intelligent Tiering for entire bucket..." -ForegroundColor Yellow
aws s3api put-bucket-intelligent-tiering-configuration `
  --bucket "$BUCKET_NAME" `
  --id EntireBucket `
  --intelligent-tiering-configuration '{"Id": "EntireBucket", "Status": "Enabled", "Filter": {}}'
if ($LASTEXITCODE -eq 0) { Write-Host "✅ EntireBucket configuration created" -ForegroundColor Green }

# Enable for profile photos
Write-Host "🔧 Enabling Intelligent Tiering for profile photos..." -ForegroundColor Yellow
aws s3api put-bucket-intelligent-tiering-configuration `
  --bucket "$BUCKET_NAME" `
  --id ProfilePhotos `
  --intelligent-tiering-configuration '{"Id": "ProfilePhotos", "Status": "Enabled", "Filter": {"Prefix": "profile-photos/"}}'
if ($LASTEXITCODE -eq 0) { Write-Host "✅ ProfilePhotos configuration created" -ForegroundColor Green }

# Enable for session photos
Write-Host "🔧 Enabling Intelligent Tiering for session photos..." -ForegroundColor Yellow
aws s3api put-bucket-intelligent-tiering-configuration `
  --bucket "$BUCKET_NAME" `
  --id SessionPhotos `
  --intelligent-tiering-configuration '{"Id": "SessionPhotos", "Status": "Enabled", "Filter": {"Prefix": "session-photos/"}}'
if ($LASTEXITCODE -eq 0) { Write-Host "✅ SessionPhotos configuration created" -ForegroundColor Green }

# Enable for portfolios
Write-Host "🔧 Enabling Intelligent Tiering for portfolios..." -ForegroundColor Yellow
aws s3api put-bucket-intelligent-tiering-configuration `
  --bucket "$BUCKET_NAME" `
  --id Portfolios `
  --intelligent-tiering-configuration '{"Id": "Portfolios", "Status": "Enabled", "Filter": {"Prefix": "portfolios/"}}'
if ($LASTEXITCODE -eq 0) { Write-Host "✅ Portfolios configuration created" -ForegroundColor Green }

# Enable for documents
Write-Host "🔧 Enabling Intelligent Tiering for documents..." -ForegroundColor Yellow
aws s3api put-bucket-intelligent-tiering-configuration `
  --bucket "$BUCKET_NAME" `
  --id Documents `
  --intelligent-tiering-configuration '{"Id": "Documents", "Status": "Enabled", "Filter": {"Prefix": "documents/"}}'
if ($LASTEXITCODE -eq 0) { Write-Host "✅ Documents configuration created" -ForegroundColor Green }

# Enable for videos
Write-Host "🔧 Enabling Intelligent Tiering for videos..." -ForegroundColor Yellow
aws s3api put-bucket-intelligent-tiering-configuration `
  --bucket "$BUCKET_NAME" `
  --id Videos `
  --intelligent-tiering-configuration '{"Id": "Videos", "Status": "Enabled", "Filter": {"Prefix": "videos/"}}'
if ($LASTEXITCODE -eq 0) { Write-Host "✅ Videos configuration created" -ForegroundColor Green }

# Enable for marketing
Write-Host "🔧 Enabling Intelligent Tiering for marketing..." -ForegroundColor Yellow
aws s3api put-bucket-intelligent-tiering-configuration `
  --bucket "$BUCKET_NAME" `
  --id Marketing `
  --intelligent-tiering-configuration '{"Id": "Marketing", "Status": "Enabled", "Filter": {"Prefix": "marketing/"}}'
if ($LASTEXITCODE -eq 0) { Write-Host "✅ Marketing configuration created" -ForegroundColor Green }

# Verify configurations
Write-Host ""
Write-Host "📊 Verifying configurations..." -ForegroundColor Cyan
aws s3api list-bucket-intelligent-tiering-configurations `
  --bucket "$BUCKET_NAME" `
  --query 'IntelligentTieringConfigurationList[*].[Id,Status]' `
  --output table

Write-Host ""
Write-Host "✅ S3 Intelligent Tiering setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Monitor CloudWatch metrics for tier transitions"
Write-Host "   2. Check S3 Storage Class Analysis after 30+ days"
Write-Host "   3. Review cost savings in Cost Explorer"
Write-Host ""
Write-Host "📚 See docs/deployment/2026-01-05_S3_INTELLIGENT_TIERING_SETUP.md for details" -ForegroundColor Yellow


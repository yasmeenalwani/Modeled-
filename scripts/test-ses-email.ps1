# Test SES Email Sending Script (PowerShell)
# This script tests sending an email via the notifications Lambda function

param(
    [Parameter(Mandatory=$true)]
    [string]$ToEmail,
    
    [Parameter(Mandatory=$false)]
    [string]$FunctionName = "notifications-*"
)

Write-Host "🧪 Testing SES email sending..." -ForegroundColor Cyan

# Find Lambda function
Write-Host "🔍 Finding Lambda function..." -ForegroundColor Yellow
$functions = aws lambda list-functions --query "Functions[?contains(FunctionName, 'notifications')].FunctionName" --output text
$FUNCTION_NAME = ($functions -split "`n" | Select-Object -First 1).Trim()

if ([string]::IsNullOrEmpty($FUNCTION_NAME)) {
    Write-Host "❌ Error: Could not find notifications Lambda function" -ForegroundColor Red
    Write-Host "   Make sure you've deployed the Amplify backend: npx ampx sandbox" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found function: $FUNCTION_NAME" -ForegroundColor Green

# Create test payload
$payload = @{
    type = "email"
    template = "booking_confirmed"
    recipient = @{
        email = $ToEmail
        name = "Test User"
    }
    data = @{
        bookingId = "test-123"
        serviceType = "Haircut"
        professionalName = "Sarah M."
        appointmentDate = "2026-01-15"
        appointmentTime = "10:00 AM"
        location = "123 Main St, New York, NY"
    }
} | ConvertTo-Json -Depth 10

# Invoke Lambda
Write-Host "📧 Sending test email to: $ToEmail" -ForegroundColor Yellow
$response = aws lambda invoke `
    --function-name $FUNCTION_NAME `
    --payload $payload `
    response.json

if ($LASTEXITCODE -eq 0) {
    $result = Get-Content response.json | ConvertFrom-Json
    if ($result.statusCode -eq 200) {
        Write-Host "✅ Email sent successfully!" -ForegroundColor Green
        Write-Host "   Message ID: $($result.body | ConvertFrom-Json | Select-Object -ExpandProperty results | Select-Object -ExpandProperty email | Select-Object -ExpandProperty messageId)"
    } else {
        Write-Host "❌ Error sending email" -ForegroundColor Red
        Write-Host "   Response: $($result | ConvertTo-Json)"
    }
} else {
    Write-Host "❌ Error invoking Lambda function" -ForegroundColor Red
}

# Cleanup
if (Test-Path response.json) {
    Remove-Item response.json
}

Write-Host ""
Write-Host "📝 Check your email inbox (and spam folder) for the test email" -ForegroundColor Cyan


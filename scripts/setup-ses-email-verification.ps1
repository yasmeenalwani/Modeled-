# SES Email Verification Setup Script (PowerShell)
# This script helps verify email addresses in SES

param(
    [Parameter(Mandatory=$true)]
    [string]$EmailAddress
)

Write-Host "📧 Setting up SES email verification for: $EmailAddress" -ForegroundColor Cyan

# Verify email address
Write-Host "🔧 Verifying email address in SES..." -ForegroundColor Yellow
aws ses verify-email-identity --email-address $EmailAddress

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Verification email sent to: $EmailAddress" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Check your email inbox for verification email from AWS"
    Write-Host "   2. Click the verification link in the email"
    Write-Host "   3. Wait for status to change to 'Verified' in SES Console"
    Write-Host ""
    Write-Host "🔍 Check verification status:" -ForegroundColor Yellow
    Write-Host "   aws ses get-identity-verification-attributes --identities $EmailAddress"
} else {
    Write-Host "❌ Error: Failed to send verification email" -ForegroundColor Red
    Write-Host "   Make sure you have SES access and the email is valid"
    exit 1
}


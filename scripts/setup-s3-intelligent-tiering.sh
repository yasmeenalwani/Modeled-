#!/bin/bash
# S3 Intelligent Tiering Setup Script
# This script enables Intelligent Tiering on the Modeled Storage bucket

set -e

echo "🚀 Setting up S3 Intelligent Tiering for Modeled Storage..."

# Get bucket name
echo "📦 Finding S3 bucket..."
BUCKET_NAME=$(aws s3api list-buckets --query "Buckets[?contains(Name, 'modeledStorage')].Name" --output text)

if [ -z "$BUCKET_NAME" ]; then
  echo "❌ Error: Could not find modeledStorage bucket"
  echo "   Make sure you've deployed the Amplify backend first: npx ampx sandbox"
  exit 1
fi

echo "✅ Found bucket: $BUCKET_NAME"

# Enable Intelligent Tiering for entire bucket
echo "🔧 Enabling Intelligent Tiering for entire bucket..."
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket "$BUCKET_NAME" \
  --id EntireBucket \
  --intelligent-tiering-configuration '{
    "Id": "EntireBucket",
    "Status": "Enabled",
    "Filter": {}
  }' && echo "✅ EntireBucket configuration created"

# Enable for profile photos
echo "🔧 Enabling Intelligent Tiering for profile photos..."
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket "$BUCKET_NAME" \
  --id ProfilePhotos \
  --intelligent-tiering-configuration '{
    "Id": "ProfilePhotos",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "profile-photos/"
    }
  }' && echo "✅ ProfilePhotos configuration created"

# Enable for session photos
echo "🔧 Enabling Intelligent Tiering for session photos..."
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket "$BUCKET_NAME" \
  --id SessionPhotos \
  --intelligent-tiering-configuration '{
    "Id": "SessionPhotos",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "session-photos/"
    }
  }' && echo "✅ SessionPhotos configuration created"

# Enable for portfolios
echo "🔧 Enabling Intelligent Tiering for portfolios..."
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket "$BUCKET_NAME" \
  --id Portfolios \
  --intelligent-tiering-configuration '{
    "Id": "Portfolios",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "portfolios/"
    }
  }' && echo "✅ Portfolios configuration created"

# Enable for documents
echo "🔧 Enabling Intelligent Tiering for documents..."
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket "$BUCKET_NAME" \
  --id Documents \
  --intelligent-tiering-configuration '{
    "Id": "Documents",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "documents/"
    }
  }' && echo "✅ Documents configuration created"

# Enable for videos
echo "🔧 Enabling Intelligent Tiering for videos..."
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket "$BUCKET_NAME" \
  --id Videos \
  --intelligent-tiering-configuration '{
    "Id": "Videos",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "videos/"
    }
  }' && echo "✅ Videos configuration created"

# Enable for marketing
echo "🔧 Enabling Intelligent Tiering for marketing..."
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket "$BUCKET_NAME" \
  --id Marketing \
  --intelligent-tiering-configuration '{
    "Id": "Marketing",
    "Status": "Enabled",
    "Filter": {
      "Prefix": "marketing/"
    }
  }' && echo "✅ Marketing configuration created"

# Verify configurations
echo ""
echo "📊 Verifying configurations..."
aws s3api list-bucket-intelligent-tiering-configurations \
  --bucket "$BUCKET_NAME" \
  --query 'IntelligentTieringConfigurationList[*].[Id,Status]' \
  --output table

echo ""
echo "✅ S3 Intelligent Tiering setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Monitor CloudWatch metrics for tier transitions"
echo "   2. Check S3 Storage Class Analysis after 30+ days"
echo "   3. Review cost savings in Cost Explorer"
echo ""
echo "📚 See docs/deployment/2026-01-05_S3_INTELLIGENT_TIERING_SETUP.md for details"


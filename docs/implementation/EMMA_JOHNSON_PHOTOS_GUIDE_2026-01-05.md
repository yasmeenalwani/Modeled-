# Emma Johnson - Photo Upload Guide

## Profile Information
- **Name:** Emma Johnson
- **Email:** emma.j@email.com
- **Phone:** (555) 123-4567
- **Location:** 10001 (Manhattan)
- **Status:** Active

## Hair Profile
- **Hair Length:** Long
- **Hair Color:** Blonde
- **Hair Texture:** Wavy
- **Hair Density:** Medium
- **Hair Condition:** Virgin

## Photo Storage Location

### For Production (Real Database):
Photos for Emma Johnson would be stored in AWS S3 at:
```
profile-photos/models/{userId}/
```

Where `userId` is Emma Johnson's unique user ID from the database.

### For Development/Mock Data:
Since Emma Johnson is currently mock data, photos can be:

1. **Stored locally in public folder:**
   - Place images in: `public/assets/models/emma-johnson/`
   - Reference them as: `/assets/models/emma-johnson/photo1.jpg`

2. **Using placeholder services:**
   - Use services like `https://picsum.photos/` or `https://via.placeholder.com/`
   - Example: `https://picsum.photos/400/600?random=1`

3. **Manual S3 Upload (if AWS is configured):**
   - Use AWS CLI: `aws s3 cp photo.jpg s3://bucket-name/profile-photos/models/{userId}/photo1.jpg`
   - Or use the Amplify Storage upload functions in the application

## Recommended Photo Types for Model Card

For the Model Card section, Emma Johnson should have:

1. **Headshot/Profile Photo** (Primary)
   - File: `headshot.jpg` or `profile.jpg`
   - Dimensions: 400x400px (square) or 400x600px (portrait)
   - Used as the main avatar/profile picture

2. **Hair Profile Photos** (3-6 photos recommended)
   - Show different angles of hair
   - Natural lighting preferred
   - Clear view of hair texture, color, and length
   - Files: `hair-front.jpg`, `hair-side.jpg`, `hair-back.jpg`, etc.

3. **Optional: Full Body Photos**
   - Show overall styling
   - Help professionals see complete look

## Upload Methods

### Method 1: Via Application UI (Recommended)
1. Log in as Emma Johnson
2. Navigate to Model Portal → Model Card (Profile)
3. Click "Add Photo" or "Change Photo"
4. Upload images through the file uploader
5. Photos will automatically be stored in S3 at the correct path

### Method 2: Via Admin Panel
1. Log in as Admin
2. Navigate to Admin → Models → Emma Johnson
3. Edit profile
4. Upload photos through admin interface

### Method 3: Direct Database Update (Advanced)
If photos are already uploaded to S3, update the ModelProfile record:
```graphql
mutation UpdateModelProfile {
  updateModelProfile(input: {
    id: "emma-johnson-id"
    headshotUrl: "profile-photos/models/{userId}/headshot.jpg"
    photoUrls: [
      "profile-photos/models/{userId}/photo1.jpg",
      "profile-photos/models/{userId}/photo2.jpg",
      "profile-photos/models/{userId}/photo3.jpg"
    ]
  }) {
    id
    headshotUrl
    photoUrls
  }
}
```

## Current Mock Data Status

Emma Johnson's current mock data (in `src/matching/mockModels.js`):
- `photoCount: 6` (indicates 6 photos should exist)
- No photo URLs currently set (would need to be added)

## Notes

- Photos must be in supported formats: JPEG, PNG, WebP, or HEIC
- Maximum file size: 10MB per photo
- Recommended dimensions: 1080x1080px or higher for profile photos
- Photos are automatically analyzed by the Hair Engine for attribute tagging
- All photos require user consent and privacy compliance


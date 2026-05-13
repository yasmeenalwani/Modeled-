# How to Extract Images from Canva for Seraphina Luna's Profile

## Overview
Since Canva doesn't provide direct API access, you'll need to extract image URLs or download images from your Canva design. Here are the best methods:

## Method 1: Download Images from Canva (Recommended)

1. **Open Your Canva Design**
   - Go to: https://www.canva.com/design/DAG99gEQFbY/HcvrmN-fj9RkdtZeNmdFAQ/edit
   - Make sure you're logged in

2. **Select Each Image**
   - Click on each image in your design
   - Click "Download" from the toolbar
   - Choose format: JPG or PNG
   - Choose quality: High or Original
   - Download to your computer

3. **Upload Images to a Cloud Service**
   - **Option A: Use Imgur** (Free, public)
     - Go to https://imgur.com
     - Upload each image
     - Right-click on uploaded image → "Copy image address"
     - You'll get a URL like: `https://i.imgur.com/xxxxx.jpg`
   
   - **Option B: Use Cloudinary** (Free tier available)
     - Go to https://cloudinary.com
     - Sign up for free account
     - Upload images to your media library
     - Copy the URL for each image
   
   - **Option C: Use AWS S3** (If you have AWS setup)
     - Upload images to your S3 bucket
     - Make images public
     - Copy the public URL

4. **Update Profile with Image URLs**
   - Once you have the URLs, we can update `src/utils/mockDataService.js` with the image URLs
   - Images will automatically appear in Seraphina Luna's profile

## Method 2: Right-Click and Copy Image Address (If Images are Already Public)

1. **In Canva Design Editor**
   - Right-click on an image
   - Select "Copy image address" or "Copy image URL"
   - This works if Canva provides direct image URLs

2. **Paste URLs**
   - Save the URLs in a text file
   - We'll add them to the profile data

## Method 3: Use Canva Share Link (Temporary)

1. **Share Your Canva Design**
   - Click "Share" in Canva
   - Generate a public link
   - Note: These links may expire, so this is temporary

2. **Extract Image URLs from Page Source** (Advanced)
   - Open the shared Canva link in browser
   - Right-click → "Inspect Element"
   - Look for `<img>` tags in the HTML
   - Copy the `src` attribute URLs

## Method 4: Export Design as PDF and Extract Images

1. **Export as PDF**
   - In Canva, click "Download"
   - Choose "PDF Print" format
   - Download the PDF

2. **Extract Images from PDF**
   - Use online PDF to image converter
   - Or use Adobe Acrobat to export pages as images
   - Then upload to Imgur/Cloudinary as in Method 1

## Recommended Structure for Images

Once you have the image URLs, we'll structure them like this in the code:

```javascript
{
  id: 'mock-model-1',
  firstName: 'Seraphina',
  lastName: 'Luna',
  headshotUrl: 'https://your-image-url.com/profile-photo.jpg', // Main profile photo
  photoUrls: [
    'https://your-image-url.com/photo1.jpg',
    'https://your-image-url.com/photo2.jpg',
    'https://your-image-url.com/photo3.jpg',
    'https://your-image-url.com/photo4.jpg',
    'https://your-image-url.com/photo5.jpg',
    // ... add all your Canva images here
  ],
}
```

## Quick Steps for You

1. **Download all images from Canva** (5-10 images recommended)
2. **Upload to Imgur** (fastest, free option)
3. **Copy all image URLs**
4. **Send me the URLs** and I'll update the profile immediately!

## Alternative: I Can Help Set Up Image Upload

If you prefer, we can also set up a local image upload system where you can:
- Upload images directly through the Model Profile page
- Images will be stored locally (for now) or uploaded to S3 (if configured)
- No need to extract URLs from Canva

Let me know which method you prefer!

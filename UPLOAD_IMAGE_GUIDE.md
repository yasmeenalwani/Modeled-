# How to Upload Your Image and Get a Web URL

You added a local file path: `C:\Users\yalwa\OneDrive\Desktop\YA - Styled Hair.png`

**This won't work in a web browser** because browsers can't access local files for security reasons. You need to upload it to get a web URL.

## Quick Solution: Upload to Imgur (Free & Easy)

1. **Go to https://imgur.com**
2. **Click "New post"** (top left)
3. **Drag and drop** your image file: `YA - Styled Hair.png`
4. **Right-click on the uploaded image** → **"Copy image address"**
5. **You'll get a URL like:** `https://i.imgur.com/xxxxx.png`

## Then Update the Code

Once you have the Imgur URL, update `src/utils/mockDataService.js`:

**Line 35** - Replace `headshotUrl` with your Imgur URL:
```javascript
headshotUrl: 'https://i.imgur.com/your-image-id.png',
```

**Line 40** - Replace the placeholder with your Imgur URL:
```javascript
'https://i.imgur.com/your-image-id.png', // Your styled hair image
```

## Alternative: Use Cloudinary (More Professional)

1. **Sign up at https://cloudinary.com** (free tier available)
2. **Upload your image** to their media library
3. **Copy the URL** they provide
4. **Use that URL** in the code

## Alternative: Convert to Base64 (For Testing Only)

If you just want to test quickly, I can help you convert the image to a base64 data URL, but this makes the code file very large and isn't recommended for production.

---

**Once you have the web URL, just paste it in and the image will appear as Seraphina Luna's profile picture!**

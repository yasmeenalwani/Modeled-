# 🎨 Modeled Creative Assets

## 📁 Folder Structure

```
public/
├── assets/
│   ├── images/          # General images, photos, icons
│   ├── logos/           # Logo files (PNG, SVG)
│   └── backgrounds/     # Background images, textures
```

## 📍 Full Path
**Windows:** `C:\Users\yalwa\modeled-frontend\public\assets\`

## 📝 File Naming Conventions

### Logos
- `modeled-management-logo.png` - Main logo (vertical: "modeled" + "management")
- `modeled-management-logo-horizontal.png` - Horizontal version (if you have one)
- `modeled-management-logo-icon.png` - Icon/favicon version

### Backgrounds
- `pearl-background.jpg` - Pearl background image
- `landing-background.jpg` - Landing page background
- `texture-*.jpg` - Any texture overlays

### Images
- `hero-*.jpg` - Hero section images
- `card-*.jpg` - Card/component images
- `icon-*.png` - Icon files

## 🎯 Current Assets Needed

### ✅ Already Referenced in Code:
1. **Logo:** `public/modeled-management-logo.png`
   - Used in: Header & Hero section
   - Recommended size: 400-600px wide, transparent or beige background

2. **Background:** `public/pearl-background.jpg`
   - Used in: Landing page background
   - Recommended: High resolution, 1920x1080 or larger

## 📤 How to Add Files

1. **Copy your files** into the appropriate folder:
   - Logos → `public/assets/logos/`
   - Backgrounds → `public/assets/backgrounds/`
   - Images → `public/assets/images/`

2. **Update file paths in code** if you use the assets folder:
   - Current: `/modeled-management-logo.png`
   - Assets folder: `/assets/logos/modeled-management-logo.png`

## 💡 Tips

- **PNG** for logos (supports transparency)
- **JPG** for photos/backgrounds (smaller file size)
- **SVG** for scalable graphics (logos, icons)
- Keep file names lowercase with hyphens (kebab-case)
- Optimize images before adding (compress for web)

## 🔗 Quick Access

**To open this folder in File Explorer:**
1. Press `Win + R`
2. Type: `C:\Users\yalwa\modeled-frontend\public\assets`
3. Press Enter

**Or navigate manually:**
```
C:\Users\yalwa\modeled-frontend\public\assets\
```


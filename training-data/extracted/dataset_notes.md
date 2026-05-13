# Free Dataset Research Notes for Modeled Hair Engine

## 1. Figaro1k Dataset

**Source:** University of Brescia / Michele Svanera
**URL:** https://www.michelesvanera.org/figaro-1k/
**Download:** https://osf.io (linked from main page)
**Code:** GitHub available

### Details:
- **Size:** 1,050 images
- **Type:** Annotated images with segmentation masks
- **Classes:** 7 hairstyle classes (150 images each)
  - Straight (frame00001-00150)
  - Wavy (frame00151-00300)
  - Curly (frame00301-00450)
  - Kinky (frame00451-00600)
  - Braids (frame00601-00750)
  - Dreadlocks (frame00751-00900)
  - Short-men (frame00901-01050)

### Additional Data:
- **Patch-F1k:** Auxiliary database for training
  - 1,050 pure hair texture images
  - 1,050 pure non-hair texture images
  - Total: 2,100 images (227×227 pixels)
  - Split: 840 training, 210 testing

### License/Usage:
- Images collected from web for non-profit scientific experiments
- NOT University of Brescia property
- Any use other than "fair use" must be negotiated with picture owners
- University not responsible for content/meaning of images

### Use Cases:
- Hair segmentation training
- Hairstyle classification
- Hair region detection

---


## 2. CelebA (Large-scale CelebFaces Attributes) Dataset

**Source:** MMLAB, The Chinese University of Hong Kong
**URL:** https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html
**Download:** Google Drive or Baidu Drive (password: rp0s)

### Details:
- **Size:** 202,599 face images
- **Identities:** 10,177 unique celebrities
- **Annotations:** 40 binary attributes per image + 5 landmark locations

### Hair-Related Attributes (from 40 total):
- Black_Hair
- Blond_Hair
- Brown_Hair
- Gray_Hair
- Bald
- Bangs
- Straight_Hair
- Wavy_Hair
- Receding_Hairline

### Downloads Available:
- In-The-Wild Images
- Align & Cropped Images
- Landmarks Annotations
- Attributes Annotations
- Identities Annotations
- Train/Val/Test Partitions

### License/Agreement:
- Available for NON-COMMERCIAL research purposes ONLY
- Images obtained from Internet - not MMLAB property
- NOT allowed to: reproduce, duplicate, copy, sell, trade, resell, exploit commercially
- NOT allowed to: further copy, publish, or distribute
- Internal use at single site within same organization IS allowed
- MMLAB reserves right to terminate access at any time

### Related Datasets:
- CelebAMask-HQ (high-quality with segmentation masks)
- CelebA-Spoof (anti-spoofing)
- CelebA-Dialog (text descriptions)
- LFWA+ Dataset

### Use Cases:
- Face attribute recognition
- Face recognition
- Face detection
- Landmark localization
- Face editing & synthesis
- Hair color classification (4 colors + bald)

---


## 3. UTKFace Dataset

**Source:** University of Tennessee, Knoxville
**URL:** https://susanqq.github.io/UTKFace/
**Download:** Kaggle (multiple versions available)

### Details:
- **Size:** 20,000+ face images
- **Age Range:** 0-116 years old
- **Annotations:** Age, Gender, Ethnicity per image

### Ethnicity Categories:
- White
- Black
- Asian
- Indian
- Other

### File Naming Convention:
`[age]_[gender]_[race]_[date&time].jpg`
- Gender: 0=Male, 1=Female
- Race: 0=White, 1=Black, 2=Asian, 3=Indian, 4=Others

### License:
- Available for NON-COMMERCIAL research purposes only
- Aligned/cropped images obtained via Dlib

### Use Cases for Hair Engine:
- Skin tone correlation with hair color
- Demographic-based hair analysis
- Age-related hair characteristics

---

## 4. Black Hair Detection Dataset (Roboflow)

**Source:** Aishas Workspace / Roboflow Universe
**URL:** https://universe.roboflow.com/aishas-workspace/black-hair-detection
**License:** CC BY 4.0 (Creative Commons Attribution)

### Details:
- **Size:** 704 images
- **Type:** Object Detection with bounding boxes
- **Model:** YOLOv8s

### Hairstyle Classes (10 total):
1. Afro
2. Bantu Knots
3. Bob
4. Braids
5. Cornrows
6. Fade
7. Locs (Dreadlocks)
8. Long Hair
9. Sisterlocs
10. TWA (Teeny Weeny Afro)

### Model Performance:
- mAP@50: 91.1%
- Precision: 90.4%
- Recall: 84.8%

### Key Advantage:
- INCLUSIVE dataset focusing on Black community hairstyles
- CC BY 4.0 license allows commercial use with attribution
- Pre-trained model available

### Related Roboflow Datasets:
- hair_classification: 1.76k images, 2 models
- woman hairstyles: 306 images, 2 models
- braids detections: 365 images, 2 models

---


## 5. CelebAMask-HQ Dataset

**Source:** MMLAB, The Chinese University of Hong Kong
**URL:** https://github.com/switchablenorms/CelebAMask-HQ
**Download:** Google Drive / Baidu Drive

### Details:
- **Size:** 30,000 high-resolution face images
- **Resolution:** 512 x 512 segmentation masks
- **Source:** Selected from CelebA dataset following CelebA-HQ

### Segmentation Classes (19 total):
1. Skin
2. Nose
3. Eyes (left/right)
4. Eyebrows (left/right)
5. Ears (left/right)
6. Mouth
7. Upper Lip
8. Lower Lip
9. **Hair** ← KEY FOR HAIR ENGINE
10. Hat
11. Eyeglass
12. Earring
13. Necklace
14. Neck
15. Cloth

### License/Agreement:
- Available for NON-COMMERCIAL research purposes ONLY
- NOT allowed to: reproduce, duplicate, copy, sell, trade, resell, exploit commercially
- NOT allowed to: further copy, publish, distribute
- Internal use at single site within same organization IS allowed

### Use Cases:
- Face parsing / semantic segmentation
- Hair segmentation training
- Face recognition
- GANs for face generation and editing
- Hair mask extraction

---

## 6. FFHQ (Flickr-Faces-HQ) Dataset

**Source:** NVIDIA
**URL:** https://github.com/NVlabs/ffhq-dataset
**Download:** Kaggle, Archive.org, Google Drive

### Details:
- **Size:** 70,000 high-quality PNG images
- **Resolution:** 1024×1024 (also available at 128×128, 256×256, 512×512)
- **Source:** Flickr photos (Creative Commons licensed)

### Characteristics:
- Considerable variation in age, ethnicity, image background
- Accessories like eyeglasses, sunglasses, hats
- Various lighting conditions
- High quality suitable for GAN training

### License:
- Individual images have varying Creative Commons licenses
- Dataset itself under NVIDIA license for research

### Use Cases:
- GAN training (StyleGAN, etc.)
- Face generation
- Hair style transfer
- High-resolution face analysis

---

## 7. FairFace Dataset

**Source:** UCLA
**URL:** https://github.com/joojs/fairface
**Download:** GitHub, Hugging Face

### Details:
- **Size:** 108,501 images
- **Purpose:** Balanced race, gender, and age dataset

### Race Categories (7):
1. White
2. Black
3. Indian
4. East Asian
5. Southeast Asian
6. Middle Eastern
7. Latino/Hispanic

### Age Groups:
0-2, 3-9, 10-19, 20-29, 30-39, 40-49, 50-59, 60-69, 70+

### Gender:
Male, Female

### Key Advantage:
- Racially BALANCED dataset (addresses bias in other datasets)
- Better for training inclusive hair analysis models
- Diverse skin tones for hair color correlation

### Use Cases:
- Bias measurement and mitigation
- Diverse demographic training
- Hair color across skin tones

---

## 8. LIP (Look Into Person) Dataset

**Source:** SYSU-HCP Lab
**URL:** https://www.sysu-hcp.net/resources/datasets/
**Download:** Official website

### Details:
- **Size:** 50,462 images
- **Annotations:** 20 semantic categories + 16 body joints

### Semantic Categories (20):
Including: Background, Hat, **Hair**, Glove, Sunglasses, Upper-clothes, Dress, Coat, Socks, Pants, Jumpsuits, Scarf, Skirt, Face, Left-arm, Right-arm, Left-leg, Right-leg, Left-shoe, Right-shoe

### Key Features:
- Largest human parsing dataset
- Full body + face parsing
- Hair region included in annotations

### Use Cases:
- Human parsing
- Hair region detection in full-body images
- Pose estimation with hair context

---

## 9. CIHP (Crowd Instance-level Human Parsing) Dataset

**Source:** LIP Challenge
**URL:** Available via LIP dataset page

### Details:
- **Size:** 38,280 images
- **Type:** Instance-level human parsing (multiple people per image)

### Key Features:
- Multi-person scenes
- Instance segmentation
- Same 20 categories as LIP including Hair

### Use Cases:
- Multi-person hair segmentation
- Crowd scene hair analysis

---

## 10. Additional Kaggle Datasets

### Hair Type Dataset
**URL:** https://www.kaggle.com/datasets/kavyasreeb/hair-type-dataset
- High-quality images for hair type classification
- Diverse hair types

### Hair Detection & Segmentation Dataset
**URL:** https://www.kaggle.com/datasets/trainingdatapro/hair-detection-and-segmentation-dataset
- Diverse hair styles, colors, lengths, textures
- Annotated with segmentation masks

### Hair Segmentation Dataset (from CelebAMaskHQ)
**URL:** https://www.kaggle.com/datasets/siddhantkulkarni73/hair-segmentation-dataset
- Pre-extracted hair masks from CelebAMask-HQ
- Ready for training

### The Three Hair Types
**URL:** https://www.kaggle.com/datasets/vyombhatia/the-three-hair-types
- ~1,000 images
- Three common hair types (300+ images each)

---


# 📋 Proprietary Model Engine - Data Template

**Fill this out and share with me to get started!**

---

## 1. CLASSIFICATION SCHEMA

### Attribute Definitions

Copy this template for each attribute you want to classify:

```json
{
  "attributeName": {
    "type": "categorical | continuous | binary",
    "values": ["value1", "value2", "value3"],
    "priority": "critical | important | nice-to-have",
    "description": "What this attribute represents",
    "examplePhotos": [
      "path/to/example1.jpg",
      "path/to/example2.jpg"
    ],
    "edgeCases": "Notes about difficult cases (e.g., dyed hair, wigs, etc.)"
  }
}
```

### Your Attributes (Fill Below):

#### Hair Attributes
```json
{
  "hairColor": {
    "type": "categorical",
    "values": [],
    "priority": "",
    "description": "",
    "examplePhotos": [],
    "edgeCases": ""
  },
  "hairLength": {
    "type": "categorical",
    "values": [],
    "priority": "",
    "description": "",
    "examplePhotos": [],
    "edgeCases": ""
  },
  "hairTexture": {
    "type": "categorical",
    "values": [],
    "priority": "",
    "description": "",
    "examplePhotos": [],
    "edgeCases": ""
  },
  "hairCondition": {
    "type": "categorical",
    "values": [],
    "priority": "",
    "description": "",
    "examplePhotos": [],
    "edgeCases": ""
  },
  "hairDensity": {
    "type": "categorical",
    "values": [],
    "priority": "",
    "description": "",
    "examplePhotos": [],
    "edgeCases": ""
  }
}
```

#### Face/Skin Attributes
```json
{
  "skinTone": {
    "type": "categorical",
    "values": [],
    "priority": "",
    "description": "",
    "examplePhotos": [],
    "edgeCases": ""
  },
  "eyeColor": {
    "type": "categorical",
    "values": [],
    "priority": "",
    "description": "",
    "examplePhotos": [],
    "edgeCases": ""
  }
}
```

#### Other Attributes (Add as needed)
```json
{
  "attributeName": {
    "type": "",
    "values": [],
    "priority": "",
    "description": "",
    "examplePhotos": [],
    "edgeCases": ""
  }
}
```

---

## 2. DATASET INVENTORY

### Dataset Template

Copy this for each dataset:

```
Dataset Name: [Name]
- Location: [Where is it stored? S3? Local? Google Drive?]
- Size: [Number of images]
- Format: [JPEG, PNG, etc.]
- Labeled Attributes: [Which attributes have labels?]
- Label Format: [JSON, CSV, folder structure, etc.]
- Quality: [Professional, selfies, mixed]
- Diversity: [Demographics breakdown]
- Notes: [Any special considerations]
```

### Your Datasets (Fill Below):

```
Dataset 1: [Name]
- Location: 
- Size: 
- Format: 
- Labeled Attributes: 
- Label Format: 
- Quality: 
- Diversity: 
- Notes: 

Dataset 2: [Name]
- Location: 
- Size: 
- Format: 
- Labeled Attributes: 
- Label Format: 
- Quality: 
- Diversity: 
- Notes: 

[Add more as needed]
```

---

## 3. SAMPLE LABELED DATA

### Provide 10-20 Example Images

For each example, provide:
- Image file (or path)
- Labels in this format:

```json
{
  "imageId": "example_001.jpg",
  "labels": {
    "hairColor": "blonde",
    "hairLength": "long",
    "hairTexture": "wavy",
    "hairCondition": "healthy",
    "hairDensity": "medium",
    "skinTone": "fair",
    "eyeColor": "blue"
  },
  "confidence": "high | medium | low",
  "notes": "Any special notes about this example"
}
```

**Where to share:**
- Upload to S3 bucket: `[bucket-name]/model-training/samples/`
- Or share Google Drive/Dropbox link
- Or provide local path if I have access

---

## 4. TECHNICAL PREFERENCES

### Infrastructure Access
- [ ] AWS SageMaker (yes/no)
- [ ] AWS EC2 with GPU (yes/no)
- [ ] Google Colab/Vertex AI (yes/no)
- [ ] Local GPU (specs: ___________)
- [ ] Other: ___________

### Budget
- Training budget: $___________
- Monthly inference budget: $___________

### Performance Requirements
- Accuracy target: _____% (e.g., 85%)
- Speed requirement: [ ] Real-time (< 1 second) [ ] Batch processing (minutes OK)
- Priority: [ ] Accuracy [ ] Speed [ ] Balanced

### Integration Preference
- [ ] Replace Rekognition completely
- [ ] Run alongside Rekognition (A/B test)
- [ ] Use as fallback if Rekognition fails
- [ ] Other: ___________

---

## 5. TIMELINE & PRIORITIES

- Target completion: [ ] 2 weeks [ ] 1 month [ ] 3 months [ ] 6+ months
- MVP priority: Which attributes are MUST-HAVE for MVP?
  1. ___________
  2. ___________
  3. ___________

---

## 6. EXISTING FILES TO SHARE

If you have existing files with classifications, datasets, or documentation, please share:
- [ ] Classification documents
- [ ] Dataset descriptions
- [ ] Labeling guidelines
- [ ] Example code/scripts
- [ ] Other: ___________

**Where to share files:**
- Upload to: `[S3 bucket]/model-training/documents/`
- Or share link: ___________

---

## ✅ CHECKLIST BEFORE STARTING

- [ ] Classification schema complete
- [ ] Dataset inventory complete
- [ ] Sample labeled data ready (10-20 examples)
- [ ] Technical preferences filled out
- [ ] Timeline discussed
- [ ] All existing files shared

---

**Once you fill this out, we can start building! 🚀**


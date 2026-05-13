# Photo Analysis Integration Example

## How to Integrate Auto-Tagging into Photo Upload Flow

### Step 1: Update Photo Upload Component

In your photo upload component (e.g., `PhotoUploader.jsx`), add analysis trigger after successful upload:

```javascript
import { analyzePhoto, applyAutoTaggedAttributes } from '../utils/photoAnalysis';
import { generateClient } from 'aws-amplify/api';
import { updateModelProfile } from '../graphql/mutations'; // Your GraphQL mutation

const client = generateClient();

async function handlePhotoUpload(results) {
  // ... existing upload logic ...
  
  // After photo is uploaded, trigger analysis
  for (const result of results) {
    try {
      const analysis = await analyzePhoto(
        result.key, // S3 key
        currentUserId,
        'profile' // or 'hair' or 'headshot'
      );
      
      if (analysis.success) {
        // Update model profile with auto-tagged attributes
        await client.graphql({
          query: updateModelProfile,
          variables: {
            input: {
              id: modelProfileId,
              autoTaggedAttributes: analysis.attributes,
              attributeConfidence: analysis.confidence,
              lastPhotoAnalysis: new Date().toISOString(),
              photoAnalysisStatus: 'completed',
            },
          },
        });
        
        // Show notification to user
        showNotification('✨ Photo analyzed! Check your auto-tagged attributes.');
      }
    } catch (error) {
      console.error('Photo analysis failed:', error);
      // Don't block the upload flow - analysis is optional
    }
  }
}
```

### Step 2: Display Auto-Tagged Attributes

In your model profile page, add the `AutoTaggedAttributes` component:

```javascript
import AutoTaggedAttributes from '../components/AutoTaggedAttributes';
import { generateClient } from 'aws-amplify/api';
import { getModelProfile, updateModelProfile } from '../graphql/queries'; // Your GraphQL queries

function ModelProfilePage() {
  const [profile, setProfile] = useState(null);
  const client = generateClient();
  
  // Load profile with auto-tagged attributes
  useEffect(() => {
    loadProfile();
  }, []);
  
  async function loadProfile() {
    const result = await client.graphql({
      query: getModelProfile,
      variables: { id: profileId },
    });
    setProfile(result.data.getModelProfile);
  }
  
  async function handleConfirmAttribute(attributeKey, value) {
    // Apply confirmed attribute to profile
    await client.graphql({
      query: updateModelProfile,
      variables: {
        input: {
          id: profile.id,
          [attributeKey]: value, // e.g., hairColor: 'blonde'
        },
      },
    });
    
    // Remove from auto-tagged (already applied)
    const updatedAutoTagged = { ...profile.autoTaggedAttributes };
    delete updatedAutoTagged[attributeKey];
    
    await client.graphql({
      query: updateModelProfile,
      variables: {
        input: {
          id: profile.id,
          autoTaggedAttributes: updatedAutoTagged,
        },
      },
    });
    
    loadProfile(); // Refresh
  }
  
  async function handleEditAttribute(attributeKey, currentValue) {
    // Open edit modal/form for this attribute
    // ... your edit UI ...
  }
  
  return (
    <div>
      {/* Existing profile content */}
      
      {/* Auto-Tagged Attributes Section */}
      {profile && (
        <AutoTaggedAttributes
          attributes={profile.autoTaggedAttributes || {}}
          confidence={profile.attributeConfidence || {}}
          onConfirm={handleConfirmAttribute}
          onEdit={handleEditAttribute}
          isLoading={profile.photoAnalysisStatus === 'analyzing'}
        />
      )}
    </div>
  );
}
```

### Step 3: Automatic S3 Trigger (Optional)

For automatic analysis without frontend calls, set up S3 event notification:

1. Go to AWS Console → S3 → Your bucket
2. Properties → Event notifications → Create event notification
3. Configure:
   - **Name**: `photo-analysis-trigger`
   - **Prefix**: `profile-photos/models/`
   - **Event types**: `PUT` (when objects are created)
   - **Destination**: Lambda function → `photo-analysis`

This will automatically analyze photos when uploaded, without frontend code changes.

## Database Schema

The `ModelProfile` now includes:

```typescript
{
  // ... existing fields ...
  
  // Auto-tagged attributes (from AI analysis)
  autoTaggedAttributes: {
    hairColor: 'blonde',
    hairLength: 'long',
    hairTexture: 'wavy',
    // ... etc
  },
  
  // Confidence scores (0-100)
  attributeConfidence: {
    hairColor: 85,
    hairLength: 90,
    hairTexture: 75,
    // ... etc
  },
  
  // Metadata
  lastPhotoAnalysis: '2024-01-15T10:30:00Z',
  photoAnalysisStatus: 'completed', // 'pending' | 'analyzing' | 'completed' | 'failed'
}
```

## Attribute Mapping

The system automatically maps AI output to your matching engine attributes:

- **Hair Color**: `black`, `dark_brown`, `light_brown`, `blonde`, `red`, `gray`, `colored`
- **Hair Length**: `short`, `medium`, `long`, `extra_long`
- **Hair Texture**: `straight`, `wavy`, `curly`, `coily`
- **Hair Density**: `thin`, `medium`, `thick`
- **Hair Condition**: `healthy`, `damaged`, `color_treated`, `virgin`
- **Skin Tone**: `fair`, `light`, `medium`, `olive`, `tan`, `brown`, `dark`
- **Eye Color**: `brown`, `blue`, `green`, `hazel`, `gray`

These match your existing `MODEL_ATTRIBUTES` in `matchingEngine.js`!

## No Separate Database Needed

The attribute definitions and mapping rules are in **code** (`attributeMapper.ts`), not a database. This means:

✅ **Fast**: No database queries needed  
✅ **Version controlled**: Changes tracked in git  
✅ **Easy to update**: Just edit the code  
✅ **No extra setup**: Works out of the box  

If you want to make attributes configurable via admin panel later, you can move the mapping to DynamoDB, but it's not necessary for MVP.


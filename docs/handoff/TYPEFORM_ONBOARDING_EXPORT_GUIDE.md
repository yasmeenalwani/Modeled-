# Typeform emergency export guide (Model + Partner)

Sources used:
- `src/pages/ModelOnboard.jsx`
- `src/pages/PartnerOnboard.jsx`
- `src/components/IdentityVerification.jsx` (model identity step)

## Export files
- `docs/handoff/TYPEFORM_MODEL_ONBOARDING_EXPORT.csv`
- `docs/handoff/TYPEFORM_PARTNER_ONBOARDING_EXPORT.csv`

## Fast setup instructions
1. Create two Typeforms: one for Models and one for Partners.
2. Recreate fields in the same order as each CSV.
3. Mark all rows with `required=yes` as required in Typeform.
4. For model photo upload, if Typeform cannot force exactly 6 images, enforce manually during admin import review.
5. Add hidden tracking fields in Typeform (`source`, `utm_source`, `utm_campaign`, `role`).

## Mock response example (Model)
```json
{
  "firstName": "Ari",
  "lastName": "Lopez",
  "email": "ari.lopez@example.com",
  "phone": "(646) 555-1234",
  "locationZip": "10001",
  "somethingFun": "I teach salsa on weekends.",
  "whatYouCareAbout": "Creative expression and wellness.",
  "serviceYouLove": "Silk press",
  "serviceYouWantToTry": "Soft balayage",
  "communityInterests": ["events", "photoshoots"],
  "communityInterestsOther": "",
  "hairLengthSimple": "long",
  "hairColorSimple": "brown",
  "hairTextureSimple": "wavy",
  "hairCondition": "healthy",
  "skinToneSimple": "medium",
  "idDocumentType": "drivers_license",
  "termsAccepted": true
}
```

## Mock response example (Partner)
```json
{
  "businessName": "Luxe Studio",
  "contactName": "Maya Chen",
  "email": "maya@luxestudio.com",
  "phone": "(212) 555-7890",
  "website": "https://luxestudio.com",
  "city": "New York",
  "state": "NY",
  "zip": "10019",
  "message": "We want to host model practice days monthly.",
  "termsAccepted": true
}
```

## Manual import notes
- Model Typeform responses should map into `ModelProfile` fields (see `maps_to_modelprofile` column).
- Partner Typeform responses should map into `Partner` fields (see `maps_to_partner` column).
- Keep `status` as `pending` for new intake records.

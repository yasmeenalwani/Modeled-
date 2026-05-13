# Model & Professional — Verification & Approval Flow

**What happens automatically vs what you (admin) must check before final approval.**

---

## 1. How They Get to You

### Models
1. Sign up via Cognito → lands on `/onboard/model`
2. Complete onboarding (see §2 below)
3. On **Submit**, profile is saved to `ModelProfile` with **`status: 'pending'`**
4. They appear in **Admin → People → Models** and can be filtered by status "Pending"

### Professionals
1. Sign up via Cognito → lands on `/onboard/professional`
2. Complete onboarding (see §2 below)
3. On **Submit**, profile is saved to `Professional` with **`status: 'pending'`**
4. They appear in **Admin → People → Professionals** and can be filtered by status "Pending"

**Important:** Until you change status to `approved` or `active`, they cannot use the portal. `PortalStatusGate` blocks access for `status === 'pending'` and shows "Application Under Review."

---

## 2. What Happens Automatically

### 2.1 Identity Verification (Models & Professionals)

| When | What | Result |
|------|------|--------|
| During onboarding | User uploads ID (license/passport/state ID) + selfie | `IdentityVerification` Lambda is called |
| Rekognition | Compares selfie to ID photo (70% min similarity threshold) | Returns confidence 0–100 |
| Auto outcome | **≥80%** → `identityVerified: true`, `identityVerificationStatus: 'verified'` | Auto-pass |
| Auto outcome | **70–79%** → `identityVerificationStatus: 'manual_review'` | Admin must decide |
| Auto outcome | **<70%** → `identityVerificationStatus: 'failed'` | User blocked from submit |

**Bypass:** If `VITE_SKIP_IDENTITY_VERIFICATION=true`, onboarding skips this check and sets `manual_review` so they can submit.

---

### 2.2 Photo Analysis (Models Only)

| When | What | Result |
|------|------|--------|
| After photos uploaded | Photos go to S3 `profile-photos/models/{userId}/` | S3 event triggers `photo-analysis` Lambda |
| Rekognition | Moderation (inappropriate content) | Rejected → photo deleted, no DB update |
| Rekognition | Face detection, quality (blurry/tilted/occluded) | Failed → user told to re-upload |
| Rekognition + Bedrock | Hair & beauty analysis | Writes `autoTaggedAttributes`, `hairLengthSimple`, `hairColorSimple`, `skinToneSimple`, etc. |
| ModelProfile | `photoAnalysisStatus` | `pending` → `analyzing` → `completed` or `failed` |
| User | Validates/corrects attributes in onboarding | Stored in `userValidatedAttributes` |

**Note:** Photo analysis is **asynchronous**. At submit time, `photoAnalysisStatus` may still be `pending`. User must complete **user-validated** attributes (hair length, color, texture, skin tone, condition) before submit, regardless of AI status.

---

### 2.3 Professional License (Professionals Only)

- **No automatic verification.** `licenseNumber` is stored as entered.
- You must manually verify license validity if required by your policy.

---

## 3. What You Must Check (Admin Review Checklist)

### 3.1 Models — Before Approving

Go to **Admin → People → Models** → open the model (View Details) → check:

| Item | Where in Modal | What to Verify |
|------|----------------|----------------|
| **Identity** | Overview tab | `identityVerificationStatus`: `verified` = auto-pass; `manual_review` = you must decide (compare selfie vs ID in S3 if needed); `failed` = do not approve |
| **Photos** | Overview / Files | At least 1 headshot; photos appropriate and of the person |
| **Hair attributes** | Overview (Hair Profile) | Hair length, color, texture, condition sensible for matching |
| **Contact** | Overview | Email, phone, ZIP valid |
| **Terms** | Schema | `termsAccepted: true` (collected at submit) |
| **Allergies** | Schema | Critical for color/keratin — check if they declared any |

**Verification tab:** The admin modal includes a **Verification** tab showing identity status, score, ID type, links to ID/selfie documents, and photo analysis status. See `docs/admin/IDENTITY_AND_PHOTO_ANALYSIS.md` for design details on ID, selfie, and photo analysis accuracy.

---

### 3.2 Professionals — Before Approving

Go to **Admin → People → Professionals** → open the pro (View Details) → check:

| Item | Where in Modal | What to Verify |
|------|----------------|----------------|
| **Identity** | Overview | Same as Models: `verified` / `manual_review` / `failed` |
| **License** | Overview | `licenseNumber` — manually verify with state board if required |
| **Salon** | Overview | Salon name, address, location make sense |
| **Portfolio** | Overview | Portfolio items and service labels look legitimate |
| **Terms** | Schema | `termsAccepted: true` |

**Verification tab:** Same as Models — identity status, ID/selfie links, and license number. See `docs/admin/IDENTITY_AND_PHOTO_ANALYSIS.md` for design details.

---

## 4. Admin Actions (What You Do)

### 4.1 Approving a Model or Professional

1. Open the detail modal (View Details).
2. In **Status Management**, change dropdown from **Pending** to **Approved** or **Active**.
3. Click **Save** (or equivalent).
4. `ModelProfile.update` / `Professional.update` is called with `status: 'approved'` or `'active'`.
5. User can now access their portal (Card, Matched, Booked, Portfolio, Chat).

**Status meaning:**
- `pending` — Awaiting admin approval
- `approved` — Admin approved; can use portal
- `active` — Same as approved for access
- `inactive` — Blocked

---

### 4.2 Rejecting or Flagging

- Set status to **Inactive** and add notes in **Admin Notes**.
- Use `verificationAdminNotes` (schema exists) for identity/verification-specific notes — ensure the modal exposes this if you want it.

---

## 5. Schema Fields for Verification (Quick Reference)

### ModelProfile
```
identityVerified: boolean
identityVerificationStatus: 'pending' | 'verified' | 'failed' | 'manual_review'
identityVerificationScore: 0–100 (Rekognition confidence)
idDocumentUrl: S3 key
idDocumentType: drivers_license | passport | state_id | other
verificationSelfieUrl: S3 key
verificationAdminNotes, verificationReviewedBy, verificationReviewedAt
photoAnalysisStatus: 'pending' | 'analyzing' | 'completed' | 'failed'
autoTaggedAttributes: JSON (hair/beauty from AI)
userValidatedAttributes: JSON (what user confirmed)
```

### Professional
```
identityVerified, identityVerificationStatus, identityVerificationScore
idDocumentUrl, idDocumentType, verificationSelfieUrl
verificationAdminNotes, verificationReviewedBy, verificationReviewedAt
licenseNumber (no auto-verification)
```

---

## 6. Gaps / Next Steps for MVP

1. ~~**Admin modals** — Add a **Verification** tab~~ ✅ Done — see `ModelDetailModal.jsx` and `ProfessionalDetailModal.jsx`.
2. **License check** — If you need license verification, add manual checklist or future API integration.
3. **Email on approval** — No automated “You’re approved” email yet; add a notification/Lambda if desired.

---

## 7. Summary

| Step | Automatic | Admin Must Do |
|------|-----------|---------------|
| Sign up | Cognito | — |
| Onboard | Collect data, terms | — |
| Identity | Rekognition compare (verified/manual_review/failed) | Decide on `manual_review`; do not approve `failed` |
| Photo analysis (Models) | Lambda writes hair/beauty attributes | Optionally confirm quality; no hard requirement to approve |
| License (Pros) | — | Manually verify if required |
| Final approval | — | Change status Pending → Approved/Active in modal |
| Portal access | PortalStatusGate checks status | — |

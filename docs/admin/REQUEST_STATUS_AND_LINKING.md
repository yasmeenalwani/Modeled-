# Request Status & Matching Flow

## Pending vs Matching

| Status    | Meaning |
|----------|---------|
| **Pending** | Request has been submitted by the professional but the admin has not started the matching process yet. No Match records exist. |
| **Matching** | Admin has run the matching engine for this request. The system has found potential models and created Match records. The admin (or pro) can now **View Matches** to see the list. |

**Flow:** `pending` → (admin clicks "Start Matching") → `matching` → (admin approves, sends to models) → `matched` → (model accepts) → `booked`

## View Matches

**View Matches** opens the Match Engine or Match Approval page where you can:
- See the list of models that match the request
- Review match scores
- Approve/send matches to models, or run matching again with different criteria

(Professionals can view matches but cannot approve—admin only.)

## Linking: Model ↔ Pro ↔ Admin

**Yes—everything is linked once you hit Match.**

When admin runs matching:
1. **ModelRequest** (pro’s request) exists with `professionalId`
2. **Match** records are created linking: `requestId`, `modelId`, `professionalId`
3. When a model accepts, a **Booking** is created linking: `modelId`, `professionalId`, `requestId`, `matchId`

So: Model → Match → Request → Professional, and Admin has visibility into all of it.

# Pro & Partner Payment Flow — Design

## Current State

- **Model**: Card on file in Model Profile; pays when accepting a match (model fee only).
- **Pro**: No card on file; `proPaid: false` on booking creation; notification says "Proceed to payment" but no UI.
- **Partner**: No payment fields; pros can be linked via `professional.partnerId`.

**Fee breakdown (from services.js):**
- **Model fee**: Model pays (e.g. $25 for haircut)
- **Professional fee**: Pro pays (e.g. $21 for haircut, ~17% of service price)
- **Total** = modelFee + professionalFee (platform holds, then disburses)

---

## Proposed Flow: Card on File + Charge on Accept

### 1. Card on file for pros and partners

**Pros**
- Charge professional fee automatically when model accepts.
- No separate payment step; booking confirms right away.
- Consistent with model card-on-file.

**Partners** (optional)
- Partner pays when applicable (e.g. salon/platform fee, chair rental).
- Card on file for partners who have recurring or per-booking fees.
- Pros linked to a partner may have fees split or paid by partner.

---

## Payment Triggers

| Trigger | Who Pays | When |
|---------|----------|------|
| Model accepts match | Model | Immediate (card on file or one-time payment) |
| Model accepts match | Pro | Immediate (card on file — charged when model pays) |
| Model accepts match | Partner | Optional, per agreement (card on file or invoiced) |

### Recommended sequence

1. **Model accepts** → model pays model fee.
2. **If model payment succeeds** → charge pro (professional fee) from pro’s card on file.
3. **If partner pays** → charge partner (e.g. salon fee) from partner’s card on file or handle via invoice.
4. **If any charge fails** → booking is not confirmed; notify and retry or ask for new payment method.

---

## Schema Additions

### Professional
```ts
stripeCustomerId: a.string(),
defaultPaymentMethodId: a.string(),
cardOnFileStatus: a.enum(['none', 'valid', 'expired', 'declined', 'removed']).default('none'),
cardOnFileFlaggedAt: a.datetime(),
```

### Partner
```ts
stripeCustomerId: a.string(),
defaultPaymentMethodId: a.string(),
cardOnFileStatus: a.enum(['none', 'valid', 'expired', 'declined', 'removed']).default('none'),
cardOnFileFlaggedAt: a.datetime(),
```

---

## Who Pays What

| Role | Fee | When | Source |
|------|-----|------|--------|
| **Model** | modelFee | On accept | Card on file (required for matching) |
| **Pro** | professionalFee | When model accepts & pays | Card on file |
| **Partner** | platform/salon fee (TBD) | When model accepts, or periodic | Card on file or invoice |

---

## Partner Payment Scenarios

1. **Pro pays only** — Pro has card on file; partner gets a cut via payout split (no partner card).
2. **Partner pays** — Partner has card on file; partner pays platform/salon fee per booking.
3. **Split** — Pro pays pro fee; partner pays partner fee (if configured).
4. **Invoicing** — Partner pays monthly or per batch instead of per-booking card charge.

---

## Implementation Phases

### Phase 1: Pro card on file
- Add `stripeCustomerId`, `defaultPaymentMethodId`, `cardOnFileStatus` to Professional schema.
- ProCardSection component (mirror Model’s CardOnFileSection).
- Require card on file before pro can create requests (or before matching).

### Phase 2: Charge pro on accept
- When model pays successfully, charge professional fee using pro’s default payment method.
- Update `professionalPaymentStatus` on the booking.
- Retry or notify if charge fails.

### Phase 3: Partner card on file (if needed)
- Add same stripe fields to Partner schema.
- PartnerCardSection in Partner portal.
- Define when partners pay (per booking vs invoiced).

### Phase 4: Partner payment logic
- If `professional.partnerId` and partner has fees: charge partner or allocate from payout.
- Admin config for partner fee structure (flat, %, or none).

---

## Edge Cases

- **Pro has no card on file** → Cannot create request until added, or allow request but block matching until card added.
- **Pro card declines** → Notify pro; keep booking pending; allow pro to update card and retry.
- **Partner invoice model** → Skip card charge; track balance; send invoice; handle separate payment.
- **Refund** → Refund model and pro (and partner if applicable) per cancellation policy.

---

## Matching Gate (Current Model Behavior)

Models without valid card on file are excluded from matching. Same idea for pros:

- **Pro** — Card on file required to receive matches (or to confirm when model accepts).
- **Partner** — Only needed if partner pays per booking.

---

## Summary

| Question | Answer |
|----------|--------|
| Pro card on file? | Yes — mirror model flow; charge when model accepts/pays |
| When does pro pay? | When model accepts and model payment succeeds |
| Partner pays? | Optional; card on file or invoice depending on agreement |
| Charge order | 1) Model → 2) Pro → 3) Partner (if applicable) |

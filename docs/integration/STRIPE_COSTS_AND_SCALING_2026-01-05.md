# Stripe Payment Processing - Costs & Scaling Guide
## Modeled Management Platform

---

## 🎯 **Key Insight: Focus on Revenue, Not Fees**

**The Bottom Line**: As you scale revenue, Stripe fees become a smaller percentage of your total revenue. At $100K+/month revenue, you're paying ~3.7% in fees, but that's **$96,300+ in your pocket**. 

**Focus on making money first** - the fees are just the cost of doing business, and they're competitive with any payment processor. Once you're processing $1M+/month, you can negotiate custom rates and save even more.

**Remember**: You only pay Stripe when transactions succeed. No revenue = no fees. More revenue = more fees, but WAY more money in your pocket! 💰

---

## 💳 Stripe Overview

**Stripe** is a payment processor that handles credit/debit card transactions, bank transfers, and other payment methods. Unlike AWS services (which charge for infrastructure), Stripe charges **per transaction** - you only pay when money moves.

**Key Point:** Stripe fees scale with **revenue**, not users or infrastructure usage.

---

## 📊 Stripe Pricing Structure

### **Standard Stripe Payments (What You'll Use)**

#### **Online Payments (Credit/Debit Cards)**
- **Fee**: 2.9% + $0.30 per successful charge
- **Example**: $100 charge = $2.90 + $0.30 = **$3.20 fee** (you receive $96.80)

#### **In-Person Payments (If you add card readers later)**
- **Fee**: 2.7% + $0.05 per successful charge
- **Example**: $100 charge = $2.70 + $0.05 = **$2.75 fee** (you receive $97.25)

#### **International Cards**
- **Fee**: 3.9% + $0.30 per successful charge
- **Example**: $100 charge = $3.90 + $0.30 = **$4.20 fee** (you receive $95.80)

#### **Additional Fees**
- **Disputes (Chargebacks)**: $15 per dispute (refunded if you win)
- **Refunds**: Original fee is refunded, but the $0.30 is NOT refunded
- **Failed Payments**: No fee (only charged on successful transactions)

---

## 💰 Cost Examples by Revenue Level

### **MVP Phase (Low Volume)**
**Scenario**: 50 bookings/month, average $25 payment
- Revenue: 50 × $25 = **$1,250/month**
- Stripe fees: ($1,250 × 2.9%) + (50 × $0.30) = $36.25 + $15 = **$51.25/month**
- **Net revenue: $1,198.75**
- **Effective fee rate: 4.1%** (higher due to fixed $0.30 fee on small transactions)

**Scenario**: 100 shop orders/month, average $30 order
- Revenue: 100 × $30 = **$3,000/month**
- Stripe fees: ($3,000 × 2.9%) + (100 × $0.30) = $87 + $30 = **$117/month**
- **Net revenue: $2,883**
- **Effective fee rate: 3.9%**

**Total MVP Stripe Costs: ~$168/month** (bookings + shop)

---

### **Growth Phase (Medium Volume)**
**Scenario**: 500 bookings/month, average $30 payment
- Revenue: 500 × $30 = **$15,000/month**
- Stripe fees: ($15,000 × 2.9%) + (500 × $0.30) = $435 + $150 = **$585/month**
- **Net revenue: $14,415**
- **Effective fee rate: 3.9%**

**Scenario**: 500 shop orders/month, average $35 order
- Revenue: 500 × $35 = **$17,500/month**
- Stripe fees: ($17,500 × 2.9%) + (500 × $0.30) = $507.50 + $150 = **$657.50/month**
- **Net revenue: $16,842.50**
- **Effective fee rate: 3.76%**

**Total Growth Stripe Costs: ~$1,242.50/month**

---

### **Scale Phase (High Volume)**
**Scenario**: 2,000 bookings/month, average $35 payment
- Revenue: 2,000 × $35 = **$70,000/month**
- Stripe fees: ($70,000 × 2.9%) + (2,000 × $0.30) = $2,030 + $600 = **$2,630/month**
- **Net revenue: $67,370**
- **Effective fee rate: 3.76%**

**Scenario**: 2,000 shop orders/month, average $40 order
- Revenue: 2,000 × $40 = **$80,000/month**
- Stripe fees: ($80,000 × 2.9%) + (2,000 × $0.30) = $2,320 + $600 = **$2,920/month**
- **Net revenue: $77,080**
- **Effective fee rate: 3.65%**

**Total Scale Stripe Costs: ~$5,550/month**

---

### **Enterprise Phase (Very High Volume)**
**Scenario**: 10,000 bookings/month, average $40 payment
- Revenue: 10,000 × $40 = **$400,000/month**
- Stripe fees: ($400,000 × 2.9%) + (10,000 × $0.30) = $11,600 + $3,000 = **$14,600/month**
- **Net revenue: $385,400**
- **Effective fee rate: 3.65%**

**Scenario**: 5,000 shop orders/month, average $50 order
- Revenue: 5,000 × $50 = **$250,000/month**
- Stripe fees: ($250,000 × 2.9%) + (5,000 × $0.30) = $7,250 + $1,500 = **$8,750/month**
- **Net revenue: $241,250**
- **Effective fee rate: 3.5%**

**Total Enterprise Stripe Costs: ~$23,350/month**

**Note**: At this volume, you can negotiate **custom pricing** with Stripe (typically 2.4-2.6% + $0.30, saving ~$2,000-4,000/month)

---

## 📈 How Stripe Fees Scale

### **Key Insights:**

1. **Fixed Fee Impact Decreases with Transaction Size**
   - $10 transaction: 2.9% + $0.30 = **5.9% effective rate** 😱
   - $25 transaction: 2.9% + $0.30 = **4.1% effective rate**
   - $50 transaction: 2.9% + $0.30 = **3.5% effective rate** ✅
   - $100 transaction: 2.9% + $0.30 = **3.2% effective rate** ✅
   - $500 transaction: 2.9% + $0.30 = **2.96% effective rate** ✅

2. **Volume Discounts (Automatic)**
   - Stripe automatically applies volume discounts at $80K+ processed/month
   - Rate drops to **2.6% + $0.30** for US cards
   - Saves ~$240 per $10K processed

3. **Custom Pricing (Negotiated)**
   - Available at $1M+ processed/month
   - Can negotiate to **2.4-2.6% + $0.30**
   - Requires Stripe account manager

---

## 🎯 Stripe Products You'll Use

### **1. Stripe Payments (Standard)**
**What**: Process one-time payments (bookings, shop orders)
**Cost**: 2.9% + $0.30 per transaction
**Use Cases**:
- Model booking payments
- Shop purchases
- Round-up donations

### **2. Stripe Payment Intents**
**What**: Secure payment processing with 3D Secure
**Cost**: Same as standard payments (2.9% + $0.30)
**Use Cases**:
- Booking confirmations
- Shop checkout

### **3. Stripe Connect (Future - If Needed)**
**What**: Split payments between you and professionals/salons
**Cost**: 
- Standard: 2.9% + $0.30 (you pay)
- Express: 2.9% + $0.30 (professional pays, you get 0.25% + $0.25)
**Use Cases**:
- Direct payments to professionals
- Salon revenue splits

---

## 💡 Cost Optimization Strategies

### **1. Increase Average Transaction Size**
**Problem**: Small transactions ($10-20) have high effective rates (4-6%)
**Solution**: 
- Bundle services
- Minimum order amounts
- Encourage larger purchases

**Example**:
- 100 × $15 transactions = $1,500 revenue, $73.50 fees (4.9%)
- 50 × $30 transactions = $1,500 revenue, $58.50 fees (3.9%)
- **Savings: $15/month** (same revenue, lower fees)

### **2. Use ACH/Bank Transfers for Large Payments**
**Stripe ACH Fees**: 0.8% (capped at $5)
**Use Cases**: Large booking deposits, bulk orders
**Example**: $500 payment
- Card: $14.50 fee (2.9% + $0.30)
- ACH: $4.00 fee (0.8%, capped at $5)
- **Savings: $10.50 per transaction**

### **3. Negotiate Custom Pricing (At Scale)**
**When**: $1M+ processed/month
**Savings**: ~$2,000-4,000/month
**How**: Contact Stripe sales team

### **4. Minimize Refunds**
**Problem**: Refunds cost you the $0.30 fee (not refunded)
**Solution**: 
- Clear cancellation policies
- Good customer service
- Accurate product descriptions

### **5. Use Stripe Radar (Fraud Prevention)**
**Cost**: FREE (included)
**Benefit**: Reduces chargebacks ($15 each) and fraud
**ROI**: Prevents 1 chargeback = saves $15 + original transaction fee

---

## 📊 Stripe vs. Other Payment Processors

### **Stripe vs. PayPal**
| Feature | Stripe | PayPal |
|---------|--------|--------|
| **Fee** | 2.9% + $0.30 | 2.9% + $0.30 |
| **Setup** | Easy | Easy |
| **Developer Experience** | Excellent | Good |
| **International** | Better | Good |
| **Customization** | High | Medium |
| **Verdict** | ✅ Better for developers | Good for simple use cases |

### **Stripe vs. Square**
| Feature | Stripe | Square |
|---------|--------|--------|
| **Online Fee** | 2.9% + $0.30 | 2.9% + $0.30 |
| **In-Person Fee** | 2.7% + $0.05 | 2.6% + $0.10 |
| **Hardware** | No | Yes (card readers) |
| **Verdict** | ✅ Better for online-only | Better if you need hardware |

### **Stripe vs. Traditional Merchant Accounts**
| Feature | Stripe | Traditional |
|---------|--------|-------------|
| **Setup Time** | Minutes | Days/Weeks |
| **Monthly Fee** | $0 | $10-30/month |
| **Transaction Fee** | 2.9% + $0.30 | 2.5-3.5% + $0.25-0.35 |
| **Contract** | None | 1-3 years |
| **Verdict** | ✅ Better for startups | Better for very high volume |

---

## 🎯 Stripe Costs for Modeled Platform

### **Revenue Sources:**

1. **Booking Payments** (Model fees)
   - Average: $25-40 per booking
   - Volume: 50-10,000/month (scales with users)

2. **Shop Orders** (Wear Care merch, Pro shop)
   - Average: $30-50 per order
   - Volume: 100-5,000/month (scales with users)

3. **Round-Up Donations** (Optional $0.99)
   - Average: $0.99 per donation
   - Volume: 50-2,000/month
   - **Note**: Small transactions = higher effective rate (5.9%)

### **Monthly Stripe Cost Projections:**

| Revenue Level | Bookings | Shop Orders | Total Revenue | Stripe Fees | Effective Rate |
|--------------|----------|-------------|--------------|-------------|----------------|
| **MVP** | $1,250 | $3,000 | $4,250 | $168 | 3.95% |
| **Growth** | $15,000 | $17,500 | $32,500 | $1,243 | 3.83% |
| **Scale** | $70,000 | $80,000 | $150,000 | $5,550 | 3.7% |
| **Enterprise** | $400,000 | $250,000 | $650,000 | $23,350 | 3.59% |
| **Enterprise (Custom)** | $400,000 | $250,000 | $650,000 | $19,500 | 3.0% |

---

## 💰 Total Platform Costs (AWS + Stripe)

### **MVP Phase**
```
AWS:            $28/month
Stripe:         $168/month
─────────────────────────
TOTAL:          ~$196/month
```

### **Growth Phase**
```
AWS:            $104/month
Stripe:         $1,243/month
─────────────────────────
TOTAL:          ~$1,347/month
```

### **Scale Phase**
```
AWS:            $1,165/month
Stripe:         $5,550/month
─────────────────────────
TOTAL:          ~$6,715/month
```

### **Enterprise Phase**
```
AWS:            $7,495/month
Stripe:         $23,350/month (or $19,500 with custom pricing)
─────────────────────────
TOTAL:          ~$30,845/month (or ~$26,995/month with custom)
```

---

## 🚀 Key Takeaways

1. **Focus on Revenue First, Fees Second** 💰
   - More bookings = more fees, but WAY more revenue
   - At $100K/month revenue: $3,700 fees, but **$96,300 in your pocket**
   - At $1M/month revenue: $37,000 fees, but **$963,000 in your pocket**
   - **The fees become negligible as you scale** - focus on making money!

2. **Stripe fees scale with revenue, not users**
   - You only pay when transactions succeed
   - No revenue = no fees
   - More revenue = more fees, but exponentially more profit

3. **Small transactions are expensive**
   - $0.99 round-ups have 5.9% effective rate
   - Consider bundling or minimum amounts

4. **Volume discounts kick in automatically**
   - At $80K+/month, rate drops to 2.6% + $0.30
   - At $1M+/month, can negotiate custom pricing

5. **Stripe is competitive**
   - Similar fees to PayPal, Square
   - Better developer experience
   - No monthly fees or contracts

6. **Cost is a percentage of success**
   - You only pay when transactions succeed
   - Failed payments = $0 cost
   - Refunds = original fee refunded (minus $0.30)

---

## 📝 Notes for Modeled Platform

### **Current Implementation:**
- ✅ Stripe Lambda function created
- ✅ Payment intent creation ready
- ✅ Webhook handling configured
- ⏳ **Not yet processing real payments** (mock data phase)

### **When You Go Live:**
1. Set up Stripe account (free)
2. Get API keys (test mode first)
3. Configure webhook endpoint
4. Test with small transactions
5. Switch to live mode when ready

### **Optimization Opportunities:**
1. **Bundle small transactions** (e.g., booking + shop order)
2. **Encourage larger shop orders** (free shipping at $50+)
3. **Use ACH for large deposits** (if applicable)
4. **Negotiate custom pricing** (at $1M+/month)

---

**Bottom Line**: 
- ✅ **Focus on making money first** - Stripe fees are just the cost of doing business
- ✅ Fees become **negligible as you scale** - at $100K+/month, you're keeping 96%+ of revenue
- ✅ You only pay when transactions succeed - no revenue = no fees
- ✅ Competitive with any payment processor - and better developer experience
- ✅ Can negotiate custom rates at $1M+/month to save even more

**The Math**: 
- $10K revenue/month → $370 fees (3.7%) → **$9,630 profit** 💰
- $100K revenue/month → $3,700 fees (3.7%) → **$96,300 profit** 💰💰💰
- $1M revenue/month → $37K fees (3.7%) → **$963K profit** 💰💰💰💰💰

**Make the money, the fees take care of themselves!** 🚀


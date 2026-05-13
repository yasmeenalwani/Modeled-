import React, { useState, useMemo } from 'react';
import { services, formatPrice, getServiceById } from '../data/services';

/**
 * Extract first price from HTML/text (e.g. $85, $85.00)
 */
function extractPriceFromHtml(html) {
  const text = typeof html === 'string' ? html : '';
  const matches = text.match(/\$[\d,]+(?:\.\d{2})?/g) || [];
  for (const m of matches) {
    const num = parseFloat(m.replace(/[$,]/g, ''));
    if (num >= 5 && num <= 2000) return num; // reasonable service price range
  }
  return null;
}

/**
 * Fetch URL via CORS proxy and extract price for human verification
 */
async function fetchPriceFromUrl(url) {
  if (!url || !url.startsWith('http')) return { price: null, error: 'Enter a valid URL' };
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) return { price: null, error: `Fetch failed: ${res.status}` };
    const text = await res.text();
    const price = extractPriceFromHtml(text);
    return { price, error: price ? null : 'No price found — verify manually' };
  } catch (e) {
    return { price: null, error: e.message || 'Could not fetch URL' };
  }
}

/**
 * Pricing Calculator — Training program sizing & full Modeled profit
 * - Pro pays: X% of service price per paid session
 * - Model pays: booking fee per session (financially accessible)
 * - Test out + first client free for pro
 * - ROI for pro: tips + 50-model pipeline
 * - Partner mode: multiple pros, salon-level rates
 */

// ============ STYLES ============
const styles = {
  container: { padding: '2rem', background: '#0d0d14', color: '#fff', minHeight: '100vh' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.75rem', fontWeight: '600', marginBottom: '0.5rem' },
  subtitle: { color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  cardTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: 'rgba(255,255,255,0.9)' },
  inputGroup: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem' },
  input: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.95rem',
  },
  select: {
    width: '100%',
    padding: '0.6rem 0.75rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.95rem',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.6rem 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    fontSize: '0.9rem',
  },
  resultRowLast: { borderBottom: 'none', fontWeight: '600', fontSize: '1.05rem' },
  highlight: {
    background: 'linear-gradient(135deg, rgba(233,69,96,0.15), rgba(233,69,96,0.05))',
    border: '1px solid rgba(233,69,96,0.3)',
  },
  divider: { borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0', paddingTop: '1rem' },
};

const WEEKS_PER_MONTH = 4.33;
const PRO_FREE_SESSIONS = 2; // test out + first client

export default function PricingCalculatorPage() {
  const [mode, setMode] = useState('pro'); // 'pro' | 'partner'
  const [serviceId, setServiceId] = useState('blowdry');
  const [priceOverride, setPriceOverride] = useState(''); // Pulled from URL or manual — human verifies
  const [priceSourceUrl, setPriceSourceUrl] = useState(''); // URL to pull from
  const [fetchStatus, setFetchStatus] = useState(null); // { loading, price, error }
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [months, setMonths] = useState(6);
  const [proFeePercent, setProFeePercent] = useState(20);
  const [modelBookingFee, setModelBookingFee] = useState(20);
  const [tipPercent, setTipPercent] = useState(20);
  const [proCount, setProCount] = useState(1);
  const [salonFeePercent, setSalonFeePercent] = useState(0); // 0 = use pro rate; >0 = salon-level discount

  const service = useMemo(() => getServiceById(serviceId) || services[0], [serviceId]);

  async function handleFetchPrice() {
    setFetchStatus({ loading: true });
    const { price, error } = await fetchPriceFromUrl(priceSourceUrl);
    setFetchStatus({ loading: false, price, error });
    if (price != null) setPriceOverride(String(price));
  }

  const results = useMemo(() => {
    const catalogPrice = service?.price || 90;
    const fullPrice = priceOverride !== '' && !isNaN(parseFloat(priceOverride))
      ? parseFloat(priceOverride)
      : catalogPrice;
    const paidSessions = Math.round(sessionsPerWeek * WEEKS_PER_MONTH * months);
    const totalModels = paidSessions + PRO_FREE_SESSIONS;
    const effectiveProPercent = mode === 'partner' && salonFeePercent > 0
      ? Math.max(0, proFeePercent - salonFeePercent)
      : proFeePercent;

    const proRevenuePerOppy = paidSessions * (fullPrice * (effectiveProPercent / 100));
    const modelRevenuePerOppy = totalModels * modelBookingFee;
    const totalModeledPerOppy = proRevenuePerOppy + modelRevenuePerOppy;

    const scaledProRevenue = proRevenuePerOppy * proCount;
    const scaledModelRevenue = modelRevenuePerOppy * proCount;
    const totalModeledFull = scaledProRevenue + scaledModelRevenue;

    const tipsEarned = totalModels * (fullPrice * (tipPercent / 100));
    const pipelineValue = totalModels * fullPrice;

    const sessionsPerMonth = sessionsPerWeek * WEEKS_PER_MONTH;
    const proPaymentPerMonth = sessionsPerMonth * fullPrice * (effectiveProPercent / 100);
    const monthBreakdown = Array.from({ length: months }, (_, i) => ({
      month: i + 1,
      payment: Math.round(proPaymentPerMonth * 100) / 100,
    }));

    return {
      fullPrice,
      paidSessions,
      totalModels,
      proRevenuePerOppy,
      modelRevenuePerOppy,
      totalModeledPerOppy,
      scaledProRevenue,
      scaledModelRevenue,
      totalModeledFull,
      tipsEarned,
      pipelineValue,
      effectiveProPercent,
      proPaymentPerMonth,
      monthBreakdown,
    };
  }, [service, sessionsPerWeek, months, proFeePercent, modelBookingFee, tipPercent, proCount, mode, salonFeePercent, priceOverride]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Training Program Pricing Calculator</h1>
        <p style={styles.subtitle}>
          Size oppys: sessions/week × months, pro % + model booking fee. See full Modeled profit from both sides.
        </p>
      </div>

      <div style={styles.grid}>
        {/* LEFT: Inputs */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Mode</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setMode('pro')}
                style={{
                  padding: '0.5rem 1rem',
                  background: mode === 'pro' ? 'rgba(233,69,96,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mode === 'pro' ? '#e94560' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: mode === 'pro' ? '#e94560' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Single Pro
              </button>
              <button
                onClick={() => setMode('partner')}
                style={{
                  padding: '0.5rem 1rem',
                  background: mode === 'partner' ? 'rgba(233,69,96,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${mode === 'partner' ? '#e94560' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px',
                  color: mode === 'partner' ? '#e94560' : 'rgba(255,255,255,0.7)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Partner / Salon
              </button>
            </div>
            {mode === 'partner' && (
              <div style={{ ...styles.inputGroup, marginTop: '1rem' }}>
                <label style={styles.label}># of pros on program</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={proCount}
                  onChange={(e) => setProCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={styles.input}
                />
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Training program</div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Service (from catalog or override below)</label>
              <select
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  const s = getServiceById(e.target.value);
                  if (s) setModelBookingFee(s.modelFee || 20);
                  setPriceOverride(''); // clear override when changing service
                }}
                style={styles.select}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatPrice(s.price)} (catalog)
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Public list price URL — paste link, then fetch for verification</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="url"
                  placeholder="https://salon.com/services or pricing page"
                  value={priceSourceUrl}
                  onChange={(e) => setPriceSourceUrl(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleFetchPrice}
                  disabled={!priceSourceUrl || fetchStatus?.loading}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'rgba(233,69,96,0.3)',
                    border: '1px solid #e94560',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    cursor: fetchStatus?.loading ? 'wait' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {fetchStatus?.loading ? 'Fetching…' : 'Fetch price'}
                </button>
              </div>
              {fetchStatus?.error && (
                <small style={{ fontSize: '0.75rem', color: '#f5a623' }}>{fetchStatus.error}</small>
              )}
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Price ($) — pulled above or enter manually; you verify</label>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder={`Default: catalog (${formatPrice(service?.price || 90)})`}
                value={priceOverride}
                onChange={(e) => setPriceOverride(e.target.value)}
                style={styles.input}
              />
              <small style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                Catalog default used when empty. Edit pulled price if needed.
              </small>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Sessions per week</label>
              <input
                type="number"
                min={1}
                max={7}
                value={sessionsPerWeek}
                onChange={(e) => setSessionsPerWeek(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={styles.input}
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Commitment (months)</label>
              <input
                type="number"
                min={1}
                max={24}
                value={months}
                onChange={(e) => setMonths(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Rates</div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={{ color: '#4dd0e1' }}>Pro pays</span> — % of service price per session
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={proFeePercent}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v >= 0) setProFeePercent(Math.min(50, v));
                    else if (e.target.value === '') setProFeePercent(0);
                  }}
                  style={styles.input}
                />
                <span style={{ fontSize: '0.9rem', color: '#4dd0e1', whiteSpace: 'nowrap' }}>
                  {proFeePercent}% → {formatPrice(results.fullPrice * (results.effectiveProPercent / 100))}/session
                </span>
              </div>
              {results.proRevenuePerOppy === 0 && (
                <small style={{ display: 'block', fontSize: '0.75rem', color: '#f5a623', marginTop: '0.35rem' }}>
                  Pro is $0 — set Pro % &gt; 0. In Partner mode, Salon discount must be &lt; Pro %.
                </small>
              )}
            </div>
            {mode === 'partner' && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Salon-level discount (% off pro rate)</label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={salonFeePercent}
                  onChange={(e) => setSalonFeePercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  style={styles.input}
                />
              </div>
            )}
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={{ color: '#81c784' }}>Model booking fee</span> — $ per session
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={modelBookingFee}
                  onChange={(e) => setModelBookingFee(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  style={styles.input}
                />
                <span style={{ fontSize: '0.9rem', color: '#81c784', whiteSpace: 'nowrap' }}>
                  {formatPrice(modelBookingFee)}/session
                </span>
              </div>
              <small style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                Financially accessible — models get cherry-picked, inclusive self-care oppy
              </small>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                <span style={{ color: '#ffb74d' }}>Est. tip</span> — % for pro ROI
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={tipPercent}
                  onChange={(e) => setTipPercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  style={styles.input}
                />
                <span style={{ fontSize: '0.9rem', color: '#ffb74d', whiteSpace: 'nowrap' }}>
                  {tipPercent}% → {formatPrice(results.fullPrice * (tipPercent / 100))}/session
                </span>
              </div>
            </div>
            <div style={{
              ...styles.divider,
              marginTop: '1rem',
              padding: '0.75rem',
              background: 'rgba(129,199,132,0.12)',
              borderRadius: '8px',
              border: '1px solid rgba(129,199,132,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem' }}>
                <span style={{ color: '#81c784', fontWeight: '600' }}>Total model pay (fee + tip)</span>
                <span style={{ color: '#81c784', fontWeight: '700', fontSize: '1.1rem' }}>
                  {formatPrice(modelBookingFee + results.fullPrice * (tipPercent / 100))}/session
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Results */}
        <div>
          <div style={{ ...styles.card, ...styles.highlight }}>
            <div style={styles.cardTitle}>Full Modeled profit (this oppy)</div>
            <div style={styles.resultRow}>
              <span>From pro side</span>
              <span style={{ color: results.proRevenuePerOppy > 0 ? '#4caf50' : '#f5a623' }}>
                {formatPrice(results.proRevenuePerOppy)}
                {results.proRevenuePerOppy === 0 && ' — check Pro %'}
              </span>
            </div>
            <div style={styles.resultRow}>
              <span>From model side</span>
              <span style={{ color: '#4caf50' }}>{formatPrice(results.modelRevenuePerOppy)}</span>
            </div>
            <div style={styles.divider} />
            <div style={{ ...styles.resultRow, ...styles.resultRowLast }}>
              <span>Total Modeled profit (1 pro)</span>
              <span style={{ color: '#4caf50', fontWeight: '700' }}>{formatPrice(results.totalModeledPerOppy)}</span>
            </div>
            {mode === 'partner' && proCount > 1 && (
              <>
                <div style={styles.divider} />
                <div style={styles.resultRow}>
                  <span>Pro revenue × {proCount} pros</span>
                  <span>{formatPrice(results.scaledProRevenue)}</span>
                </div>
                <div style={styles.resultRow}>
                  <span>Model revenue × {proCount} pros</span>
                  <span>{formatPrice(results.scaledModelRevenue)}</span>
                </div>
                <div style={{ ...styles.resultRow, ...styles.resultRowLast }}>
                  <span>Total Modeled profit (salon)</span>
                  <span style={{ color: '#4caf50', fontWeight: '700' }}>{formatPrice(results.totalModeledFull)}</span>
                </div>
              </>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Program summary</div>
            <div style={styles.resultRow}>
              <span>Full service price</span>
              <span>{formatPrice(results.fullPrice)}</span>
            </div>
            <div style={styles.resultRow}>
              <span>Paid sessions (pro pays)</span>
              <span>{results.paidSessions}</span>
            </div>
            <div style={styles.resultRow}>
              <span>+ Test out + first client free</span>
              <span>+2</span>
            </div>
            <div style={styles.resultRow}>
              <span>Total models (pipeline)</span>
              <span style={{ fontWeight: '600' }}>{results.totalModels}</span>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Pro payments — month breakdown</div>
            <div style={styles.resultRow}>
              <span>Per month (approx)</span>
              <span style={{ fontWeight: '600' }}>{formatPrice(results.proPaymentPerMonth)}</span>
            </div>
            <div style={{ ...styles.divider, marginBottom: '0.5rem' }} />
            {results.monthBreakdown.map(({ month, payment }) => (
              <div key={month} style={styles.resultRow}>
                <span>Month {month}</span>
                <span>{formatPrice(payment)}</span>
              </div>
            ))}
            <div style={{ ...styles.resultRow, ...styles.resultRowLast }}>
              <span>Pro pays Modeled (total)</span>
              <span>{formatPrice(results.proRevenuePerOppy)}</span>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardTitle}>Pro ROI (sales talking points)</div>
            <div style={styles.resultRow}>
              <span>Est. tips during training</span>
              <span style={{ color: '#7ed321' }}>{formatPrice(results.tipsEarned)}</span>
            </div>
            <div style={styles.resultRow}>
              <span>Pipeline value ({results.totalModels} clients @ full price)</span>
              <span style={{ color: '#7ed321' }}>{formatPrice(results.pipelineValue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

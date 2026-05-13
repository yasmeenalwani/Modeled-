import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoUploader from '../../components/PhotoUploader';
import { services, getServiceById, formatPrice } from '../../admin/data/services';
import { addMockStylistMatches, addMockStylistRequest, getMockStylists } from '../../utils/mockDataService';
import { matchStylists } from '../../utils/stylistMatchService';
import { getProfilePhotoPath } from '../../utils/storage';

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#FFFEF9',
    minHeight: '100vh',
  },
  headerTabs: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  tab: {
    padding: '0.6rem 1.25rem',
    background: 'transparent',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    borderRadius: '999px',
    color: '#4A2A1A',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
    fontSize: '0.85rem',
  },
  tabActive: {
    background: 'rgba(139, 30, 63, 0.12)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  section: {
    border: '1px solid rgba(139, 30, 63, 0.15)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    background: '#FFFEF9',
    boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#4A2A1A',
    marginBottom: '0.75rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#5A3A2A',
    marginBottom: '1rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  label: {
    fontSize: '0.8rem',
    color: '#5A3A2A',
    marginBottom: '0.35rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  input: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  select: {
    width: '100%',
    padding: '0.75rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    background: '#FFFEF9',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.5rem',
  },
  tag: {
    padding: '0.35rem 0.7rem',
    borderRadius: '16px',
    border: '1px solid rgba(139, 30, 63, 0.2)',
    background: 'rgba(139, 30, 63, 0.06)',
    fontSize: '0.75rem',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
    cursor: 'pointer',
  },
  tagActive: {
    background: 'rgba(139, 30, 63, 0.18)',
    borderColor: '#8B1E3F',
    color: '#8B1E3F',
    fontWeight: '600',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  primaryBtn: {
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    background: 'linear-gradient(135deg, #8B1E3F, #A85A5A)',
    color: '#FFFEF9',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: '"Alike", "Georgia", serif',
  },
  matchesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  matchCard: {
    borderRadius: '16px',
    border: '1px solid rgba(139, 30, 63, 0.15)',
    background: '#FFFEF9',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(139, 30, 63, 0.08)',
  },
  matchHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(139, 30, 63, 0.12)',
  },
  matchTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#4A2A1A',
    fontFamily: '"Alike", "Georgia", serif',
  },
  matchBody: {
    padding: '1rem 1.25rem',
  },
  matchImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  pricingRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#5A3A2A',
    marginBottom: '0.25rem',
    fontFamily: '"Alike", "Georgia", serif',
  },
  dots: {
    display: 'flex',
    gap: '0.35rem',
    justifyContent: 'center',
    padding: '0.75rem 0',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'rgba(139, 30, 63, 0.2)',
  },
  dotActive: {
    background: '#8B1E3F',
  },
};

const boroughOptions = ['Tribeca', 'SoHo', 'West Village', 'Upper East Side', 'Midtown', 'Brooklyn', 'Williamsburg'];
const salonTypes = ['Boutique', 'Large Salon', 'Studio', 'Private Suite'];
const stylistLevels = ['Junior', 'Certified', 'Senior', 'Master'];
const inspoTags = ['highlights', 'balayage', 'blonde', 'brunette', 'soft-dimension', 'cool-tone', 'warm-tone', 'gloss', 'shine'];

const formatTimeLabel = (time) => {
  if (!time) return '';
  const [rawH, rawM] = time.split(':');
  const hours = Number(rawH);
  const minutes = Number(rawM || 0);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hours12 = ((hours + 11) % 12) + 1;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

const addMinutes = (time, minutesToAdd) => {
  const [rawH, rawM] = time.split(':');
  const minutes = Number(rawH) * 60 + Number(rawM || 0) + minutesToAdd;
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

export default function ModelStylistRequest() {
  const navigate = useNavigate();
  const [serviceId, setServiceId] = useState('highlights');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [borough, setBorough] = useState('Tribeca');
  const [budgetMin, setBudgetMin] = useState(150);
  const [budgetMax, setBudgetMax] = useState(320);
  const [salonType, setSalonType] = useState('Boutique');
  const [stylistLevel, setStylistLevel] = useState('Certified');
  const [occasion, setOccasion] = useState('Event');
  const [chatPreference, setChatPreference] = useState('Yes');
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentHairPhotos, setCurrentHairPhotos] = useState([]);
  const [inspoPhotos, setInspoPhotos] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activePanel, setActivePanel] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const userId = 'mock-user-1';

  const service = useMemo(() => getServiceById(serviceId), [serviceId]);
  const productEstimate = service ? Math.round(service.price * 0.12) : 0;
  const suggestedTip = service ? Math.round(service.price * 0.2) : 0;
  const platformCut = service ? Math.round(service.price * 0.2) : 0;

  const handleToggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const request = {
      userId: 'mock-user-1',
      serviceId,
      date,
      time,
      borough,
      budgetMin: Number(budgetMin),
      budgetMax: Number(budgetMax),
      salonType,
      stylistLevel,
      occasion,
      chatPreference,
      inspoTags: selectedTags,
      currentHairPhotos,
      inspoPhotos,
    };
    const savedRequest = addMockStylistRequest(request);
    const ranked = matchStylists(savedRequest, getMockStylists());
    const savedMatches = addMockStylistMatches(savedRequest.id, ranked);
    setMatches(savedMatches);
    setSubmitted(true);
  };

  const panels = ['cover', 'details', 'stylist', 'salon', 'prep', 'photos'];

  return (
    <div style={styles.container}>
      <div style={styles.headerTabs}>
        <button
          type="button"
          style={styles.tab}
          onClick={() => navigate('/model-portal/opportunities')}
        >
          Opportunities
        </button>
        <button type="button" style={{ ...styles.tab, ...styles.tabActive }}>
          Request Stylist
        </button>
      </div>

      <div style={styles.section}>
        <div style={styles.title}>Request a Stylist</div>
        <div style={styles.subtitle}>
          Choose service, time, and preferences. We will match you to certified stylists within budget.
        </div>

        <div style={styles.formGrid}>
          <div>
            <div style={styles.label}>Service</div>
            <select style={styles.select} value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={styles.label}>Occasion</div>
            <input style={styles.input} value={occasion} onChange={(e) => setOccasion(e.target.value)} />
          </div>
          <div>
            <div style={styles.label}>Date</div>
            <input style={styles.input} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <div style={styles.label}>Start Time</div>
            <input style={styles.input} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <div style={styles.label}>Borough / Location</div>
            <select style={styles.select} value={borough} onChange={(e) => setBorough(e.target.value)}>
              {boroughOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={styles.label}>Salon Type</div>
            <select style={styles.select} value={salonType} onChange={(e) => setSalonType(e.target.value)}>
              {salonTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={styles.label}>Stylist Level</div>
            <select style={styles.select} value={stylistLevel} onChange={(e) => setStylistLevel(e.target.value)}>
              {stylistLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={styles.label}>Chat Preference</div>
            <select style={styles.select} value={chatPreference} onChange={(e) => setChatPreference(e.target.value)}>
              <option value="Yes">Yes, I want to chat</option>
              <option value="No">No preference</option>
            </select>
          </div>
          <div>
            <div style={styles.label}>Budget Min</div>
            <input style={styles.input} type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
          </div>
          <div>
            <div style={styles.label}>Budget Max</div>
            <input style={styles.input} type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={styles.label}>Inspo Tags (used for portfolio matching)</div>
          <div style={styles.tagRow}>
            {inspoTags.map((tag) => (
              <button
                key={tag}
                type="button"
                style={{ ...styles.tag, ...(selectedTags.includes(tag) ? styles.tagActive : {}) }}
                onClick={() => handleToggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <PhotoUploader
            title="Current Hair Photos"
            subtitle="Front, side, back"
            maxFiles={6}
            accentColor="#8B1E3F"
            existingPhotos={currentHairPhotos}
            pathGenerator={(filename) => getProfilePhotoPath('model', userId, `current-${filename}`)}
            onUpload={(results) => setCurrentHairPhotos((prev) => [...prev, ...results])}
            onDelete={(photo) => setCurrentHairPhotos((prev) => prev.filter((p) => p.url !== photo.url))}
            userType="model"
            contentType="profilePhotos"
            compact={true}
          />
          <PhotoUploader
            title="Inspo Photos"
            subtitle="Styles you want"
            maxFiles={6}
            accentColor="#A85A5A"
            existingPhotos={inspoPhotos}
            pathGenerator={(filename) => getProfilePhotoPath('model', userId, `inspo-${filename}`)}
            onUpload={(results) => setInspoPhotos((prev) => [...prev, ...results])}
            onDelete={(photo) => setInspoPhotos((prev) => prev.filter((p) => p.url !== photo.url))}
            userType="model"
            contentType="inspirationPhotos"
            compact={true}
          />
        </div>

        <div style={styles.actions}>
          <button type="button" style={styles.primaryBtn} onClick={handleSubmit}>
            Find Stylists
          </button>
        </div>
      </div>

      {submitted && matches.length === 0 && (
        <div style={styles.section}>
          <div style={styles.title}>No stylists match your budget yet</div>
          <div style={styles.subtitle}>
            Try widening your budget range or adjusting location/time.
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div style={styles.section}>
          <div style={styles.title}>Matched Stylists</div>
          <div style={styles.matchesGrid}>
            {matches.map((match) => {
              const { stylist } = match;
              const panelIndex = activePanel[stylist.id] || 0;
              const panel = panels[panelIndex];
              const start = time || '10:00';
              const end = service ? addMinutes(start, service.duration || 60) : start;
              const coverPhoto = stylist.portfolio?.[0]?.url;
              const total = (service?.price || 0) + productEstimate + suggestedTip;

              return (
                <div
                  key={match.id}
                  style={styles.matchCard}
                  onClick={() =>
                    setActivePanel((prev) => ({
                      ...prev,
                      [stylist.id]: (panelIndex + 1) % panels.length,
                    }))
                  }
                >
                  {coverPhoto && panel === 'cover' && (
                    <img src={coverPhoto} alt="Cover" style={styles.matchImage} />
                  )}
                  <div style={styles.matchHeader}>
                    <div style={styles.matchTitle}>
                      {service?.name || 'Service'} • {stylist.salonName}
                    </div>
                  </div>
                  <div style={styles.matchBody}>
                    {panel === 'cover' && (
                      <>
                        <div style={styles.pricingRow}>
                          <span>{stylist.firstName} {stylist.lastName ? stylist.lastName.charAt(0) + '.' : ''} • {stylist.level}</span>
                          <span>{stylist.certified ? 'Modeled Certified' : 'In Training'}</span>
                        </div>
                        <div style={styles.pricingRow}>
                          <span>{date || 'Select date'}</span>
                          <span>{formatTimeLabel(start)} – {formatTimeLabel(end)}</span>
                        </div>
                      </>
                    )}
                    {panel === 'details' && (
                      <>
                        <div style={styles.pricingRow}>
                          <span>Booking</span>
                          <span>{formatPrice(service?.price || 0)}</span>
                        </div>
                        <div style={styles.pricingRow}>
                          <span>Products</span>
                          <span>{formatPrice(productEstimate)}</span>
                        </div>
                        <div style={styles.pricingRow}>
                          <span>Suggested Tip</span>
                          <span>{formatPrice(suggestedTip)}</span>
                        </div>
                        <div style={styles.pricingRow}>
                          <span>Platform Cut (20%)</span>
                          <span>{formatPrice(platformCut)}</span>
                        </div>
                        <div style={styles.pricingRow}>
                          <strong>Total</strong>
                          <strong>{formatPrice(total)}</strong>
                        </div>
                      </>
                    )}
                    {panel === 'stylist' && (
                      <>
                        <div style={styles.pricingRow}>
                          <span>{stylist.firstName} {stylist.lastName ? stylist.lastName.charAt(0) + '.' : ''}</span>
                          <span>{stylist.yearsExperience} yrs</span>
                        </div>
                        <div style={styles.pricingRow}>
                          <span>Services</span>
                          <span>{stylist.servicesOffered.join(', ')}</span>
                        </div>
                        <div style={styles.subtitle}>{stylist.bio}</div>
                      </>
                    )}
                    {panel === 'salon' && (
                      <>
                        <div style={styles.pricingRow}>
                          <span>{stylist.salonName}</span>
                          <span>{stylist.salonType}</span>
                        </div>
                        <div style={styles.subtitle}>{stylist.salonBio}</div>
                        <div style={styles.pricingRow}>
                          <span>Neighborhoods</span>
                          <span>{stylist.boroughs.join(', ')}</span>
                        </div>
                      </>
                    )}
                    {panel === 'prep' && (
                      <>
                        <div style={styles.subtitle}>
                          Prep: arrive with clean, dry hair and no heavy product.
                        </div>
                        <div style={styles.subtitle}>
                          Aftercare: avoid heat for 24 hours, use color‑safe products.
                        </div>
                      </>
                    )}
                    {panel === 'photos' && (
                      <>
                        <div style={styles.subtitle}>Matched to your inspo tags:</div>
                        <div style={styles.tagRow}>
                          {selectedTags.map((tag) => (
                            <span key={tag} style={styles.tag}>{tag}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <div style={styles.dots}>
                    {panels.map((p) => (
                      <span
                        key={p}
                        style={{
                          ...styles.dot,
                          ...(p === panel ? styles.dotActive : {}),
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

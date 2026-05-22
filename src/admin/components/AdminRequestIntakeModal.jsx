import React, { useState, useEffect, useMemo } from 'react';
import { services, getServiceCategories } from '../data/services';
import { findMatches, extractZipFromLocation } from '../../matching/matchingEngine';
import {
  ANY,
  HAIR_COLOR_OPTIONS,
  HAIR_LENGTH_OPTIONS,
  HAIR_TEXTURE_OPTIONS,
  HAIR_CONDITION_OPTIONS,
  HAIR_DENSITY_OPTIONS,
  AGE_RANGE_OPTIONS,
  CURL_PATTERN_OPTIONS,
  SKIN_TONE_OPTIONS,
  VIRGIN_HAIR_OPTIONS,
  OPEN_TO_CHANGE_OPTIONS,
  PRIORITY_OPTIONS,
  STYLIST_LEVEL_OPTIONS,
  SCHEDULING_MODE_OPTIONS,
  WEEKDAY_OPTIONS,
  buildMatchCriteriaFromIntakeForm,
  getOptionLabel,
  validateIntakeScheduling,
} from '../../utils/requestIntakeOptions';

const STEP_LABELS = ['1. Stylist & service', '2. Model criteria', '3. When & where'];

const ui = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  },
  modal: {
    width: '100%', maxWidth: '720px', background: '#111827',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
    padding: '1.5rem', maxHeight: '92vh', overflowY: 'auto',
  },
  steps: {
    display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap',
  },
  stepPill: (active, done) => ({
    padding: '0.4rem 0.85rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600,
    border: active ? '1px solid #e94560' : '1px solid rgba(255,255,255,0.12)',
    background: active ? 'rgba(233,69,96,0.15)' : done ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.04)',
    color: active ? '#e94560' : done ? '#9ae2a3' : 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
  }),
  field: { marginBottom: '1rem' },
  label: {
    display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase',
    letterSpacing: '0.06em', color: 'rgba(255,255,255,0.45)', marginBottom: '0.35rem',
  },
  input: {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)', background: '#1f2937',
    color: '#f3f4f6', fontSize: '0.9rem', boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.12)', background: '#1f2937',
    color: '#f3f4f6', fontSize: '0.9rem', boxSizing: 'border-box',
    colorScheme: 'dark',
  },
  optionStyle: { background: '#1f2937', color: '#f3f4f6' },
  selectedHint: {
    fontSize: '0.78rem', color: '#93c5fd', marginTop: '0.25rem', fontWeight: 500,
  },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  preview: {
    padding: '0.75rem 1rem', borderRadius: '9px', marginBottom: '1rem',
    border: '1px solid rgba(76,175,80,0.35)', background: 'rgba(76,175,80,0.08)',
    fontSize: '0.82rem',
  },
  proSummary: {
    padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem',
    background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)',
    fontSize: '0.85rem', lineHeight: 1.45,
  },
  footer: { display: 'flex', justifyContent: 'space-between', marginTop: '1.25rem', gap: '0.5rem' },
  btnGhost: {
    padding: '0.6rem 1.1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)',
    background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: '0.88rem',
  },
  btnPrimary: {
    padding: '0.6rem 1.2rem', borderRadius: '8px', border: 'none',
    background: 'linear-gradient(135deg, #e94560, #ff6b8a)', color: '#fff',
    fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem',
  },
  advanced: {
    marginTop: '0.5rem', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
    padding: '0.75rem', background: 'rgba(0,0,0,0.15)',
  },
};

function Field({ label, hint, children }) {
  return (
    <div style={ui.field}>
      <label style={ui.label}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem' }}>{hint}</div>}
    </div>
  );
}

function SelectOptions({ options }) {
  return options.map((o) => (
    <option key={o.value} value={o.value} style={ui.optionStyle}>{o.label}</option>
  ));
}

function CriteriaSelect({ label, hint, value, options, onChange }) {
  const selectedLabel = getOptionLabel(options, value);
  const isSpecific = value && value !== ANY;
  return (
    <Field label={label} hint={hint}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={ui.select}>
        <SelectOptions options={options} />
      </select>
      {isSpecific ? (
        <div style={ui.selectedHint}>Selected: {selectedLabel}</div>
      ) : (
        <div style={{ ...ui.selectedHint, color: 'rgba(255,255,255,0.35)' }}>No filter — all models eligible</div>
      )}
    </Field>
  );
}

export const INITIAL_REQUEST_FORM = {
  professionalId: '',
  requestTitle: '',
  serviceType: 'haircut',
  serviceDescription: '',
  desiredHairColor: ANY,
  desiredHairLength: ANY,
  desiredHairTexture: ANY,
  desiredHairCondition: ANY,
  desiredHairDensity: ANY,
  desiredAgeRange: ANY,
  desiredCurlPattern: ANY,
  desiredSkinTone: ANY,
  requireVirginHair: ANY,
  openToChange: ANY,
  requestedDate: '',
  requestedTime: '',
  duration: 60,
  location: '',
  locationZip: '',
  modelCount: 1,
  stylistLevel: 'senior',
  priority: 'normal',
  status: 'matching',
  modelSearchFee: '',
  modelPayment: '',
  adminNotes: '',
  schedulingMode: 'fixed',
  schedulingFlexibility: 'fixed',
  flexibleDateStart: '',
  flexibleDateEnd: '',
  flexibleTimePreference: '',
  flexibleNotes: '',
  recurringWeekday: 'tuesday',
  recurringTime: '13:00',
  recurringEndDate: '',
  recurringCount: '',
  recurringNotes: '',
  recurringCadence: 'weekly',
};

export function applyProfessionalDefaultsToForm(prev, pro) {
  if (!pro) return prev;
  const name = `${pro.firstName || ''} ${pro.lastName || ''}`.trim();
  const composedAddress =
    pro.salonAddress ||
    [pro.salonStreet, pro.salonCity, pro.salonState].filter(Boolean).join(', ');
  const zip = pro.salonZip || pro.locationZip || '';
  const level = pro.experienceLevel || (pro.title?.toLowerCase().includes('senior') ? 'senior' : '');

  return {
    ...prev,
    location: prev.location?.trim() ? prev.location : composedAddress || prev.location,
    locationZip: prev.locationZip?.trim() ? prev.locationZip : String(zip || ''),
    stylistLevel: level || prev.stylistLevel,
    requestTitle: prev.requestTitle?.trim()
      ? prev.requestTitle
      : name
        ? `${name} — model request`
        : prev.requestTitle,
  };
}

export default function AdminRequestIntakeModal({
  open,
  onClose,
  onSubmit,
  creating,
  form,
  setForm,
  professionalOptions,
  professionalProfilesById,
  modelProfilesForPreview,
  getServiceById,
}) {
  const [step, setStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const selectedPro = form.professionalId
    ? professionalProfilesById[form.professionalId]
    : null;

  useEffect(() => {
    if (!form.professionalId || !selectedPro) return;
    setForm((prev) => applyProfessionalDefaultsToForm(prev, selectedPro));
  }, [form.professionalId, selectedPro?.id]);

  useEffect(() => {
    const svc = getServiceById?.(form.serviceType);
    if (!svc) return;
    setForm((prev) => ({
      ...prev,
      duration: prev.duration || svc.duration || 60,
      modelSearchFee: prev.modelSearchFee || svc.professionalFee || '',
      modelPayment: prev.modelPayment || svc.modelFee || '',
    }));
  }, [form.serviceType, getServiceById, setForm]);

  const liveMatchPreview = useMemo(() => {
    if (!form.serviceType || !modelProfilesForPreview?.length) {
      return { qualified: 0, eligible: 0, avgScore: 0 };
    }
    try {
      const requestLocationZip = form.locationZip || extractZipFromLocation(form.location || '');
      const pro = form.professionalId ? professionalProfilesById[form.professionalId] : null;
      const fallbackZip = pro?.locationZip || pro?.salonZip || '';
      const locationForMatching = requestLocationZip || fallbackZip || form.location || '';
      const criteria = buildMatchCriteriaFromIntakeForm(form);

      const models = modelProfilesForPreview
        .filter((m) => m?.id)
        .map((m) => ({
          ...m,
          hairLength: m.hairLengthSimple || m.hairLength,
          hairColor: m.hairColorSimple || m.hairColor,
          hairTexture: m.hairTextureSimple || m.hairTexture,
          cardOnFileStatus: m.cardOnFileStatus || 'valid',
        }));
      const request = {
        serviceType: form.serviceType,
        requestedDate: form.requestedDate || null,
        requestedTime: form.requestedTime || null,
        location: locationForMatching,
        locationZip: requestLocationZip || fallbackZip,
        criteria,
      };
      const result = findMatches(models, request, { minScore: 30, limit: 100 });
      const matches = result?.matches || result || [];
      const scores = (Array.isArray(matches) ? matches : []).map((m) => m.finalScore || 0).filter((s) => s > 0);
      return {
        qualified: result?.qualifiedMatches ?? scores.length,
        eligible: models.length,
        avgScore: result?.averageScore ?? (scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0),
      };
    } catch {
      return { qualified: 0, eligible: modelProfilesForPreview.length, avgScore: 0 };
    }
  }, [form, modelProfilesForPreview, professionalProfilesById]);

  const schedulingCheck = useMemo(() => validateIntakeScheduling(form), [form]);

  const readiness = useMemo(() => {
    const missing = [];
    if (!form.professionalId) missing.push('Stylist');
    if (!form.serviceType) missing.push('Service');
    missing.push(...schedulingCheck.missing);
    return { canCreate: missing.length === 0, missing };
  }, [form, schedulingCheck]);

  const stepValid = [
    Boolean(form.professionalId && form.serviceType),
    true,
    schedulingCheck.ok,
  ];

  if (!open) return null;

  const draftOptions = professionalOptions.filter((o) => o.group === 'draft');
  const publishedOptions = professionalOptions.filter((o) => o.group !== 'draft');

  return (
    <div style={ui.overlay} onClick={() => !creating && onClose()}>
      <div className="admin-intake-modal" style={ui.modal} onClick={(e) => e.stopPropagation()}>
        <style>{`
          .admin-intake-modal select option,
          .admin-intake-modal select optgroup {
            background: #1f2937 !important;
            color: #f3f4f6 !important;
          }
        `}</style>
        <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.35rem' }}>New model request</h3>
        <p style={{ margin: '0 0 1rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.88rem' }}>
          Manual intake for you to review, match, and send to models.
        </p>

        <div style={ui.steps}>
          {STEP_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              style={ui.stepPill(step === i, i < step)}
              onClick={() => setStep(i)}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={ui.preview}>
          <strong style={{ color: '#b9f6ca' }}>{liveMatchPreview.qualified}</strong>
          {' '}of {liveMatchPreview.eligible} models match now
          {liveMatchPreview.avgScore > 0 && ` · avg score ${liveMatchPreview.avgScore}`}
        </div>

        {step === 0 && (
          <>
            <Field label="Stylist" hint="Includes unpublished drafts — published automatically when you submit if needed.">
              <select
                value={form.professionalId}
                onChange={(e) => setForm({ ...form, professionalId: e.target.value })}
                style={ui.select}
              >
                <option value="" style={ui.optionStyle}>Choose stylist…</option>
                {draftOptions.length > 0 && (
                  <optgroup label="Draft profiles">
                    {draftOptions.map((p) => (
                      <option key={p.id} value={p.id} style={ui.optionStyle}>{p.label}</option>
                    ))}
                  </optgroup>
                )}
                {publishedOptions.length > 0 && (
                  <optgroup label="Published">
                    {publishedOptions.map((p) => (
                      <option key={p.id} value={p.id} style={ui.optionStyle}>
                        {p.sublabel ? `${p.label} — ${p.sublabel}` : p.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </Field>

            {selectedPro && (
              <div style={ui.proSummary}>
                <strong>{selectedPro.firstName} {selectedPro.lastName}</strong>
                {selectedPro.isDraft && ' · will publish on submit'}
                <br />
                {selectedPro.salonName}
                {selectedPro.salonLocationSuffix && ` · ${selectedPro.salonLocationSuffix}`}
                {selectedPro.experienceLevel && ` · ${selectedPro.experienceLevel}`}
              </div>
            )}

            <Field label="Request title (internal)">
              <input
                value={form.requestTitle}
                onChange={(e) => setForm({ ...form, requestTitle: e.target.value })}
                style={ui.input}
                placeholder="e.g. Scott — haircut practice model"
              />
            </Field>

            <div style={ui.row2}>
              <Field label="Service category & type" hint="All salon service lines — grouped by category.">
                <select
                  value={form.serviceType}
                  onChange={(e) => setForm({ ...form, serviceType: e.target.value })}
                  style={ui.select}
                >
                  {getServiceCategories().map((cat) => (
                    <optgroup key={cat} label={cat}>
                      {(services || []).filter((s) => s.category === cat).map((svc) => (
                        <option key={svc.id} value={svc.id} style={ui.optionStyle}>
                          {svc.icon ? `${svc.icon} ` : ''}{svc.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Models needed">
                <input
                  type="number"
                  min={1}
                  value={form.modelCount}
                  onChange={(e) => setForm({ ...form, modelCount: e.target.value })}
                  style={ui.input}
                />
              </Field>
            </div>

            <div style={ui.row2}>
              <Field label="Duration (min)">
                <input
                  type="number"
                  min={15}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  style={ui.input}
                />
              </Field>
              <Field label="Target stylist level">
                <select
                  value={form.stylistLevel}
                  onChange={(e) => setForm({ ...form, stylistLevel: e.target.value })}
                  style={ui.select}
                >
                  <SelectOptions options={STYLIST_LEVEL_OPTIONS} />
                </select>
              </Field>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>
              Leave fields as &quot;Any&quot; for a wider pool. Select specific values to narrow the match engine — same options models use on their profiles.
            </p>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: '0 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hair attributes</p>
            <div style={ui.row2}>
              <CriteriaSelect label="Hair color" value={form.desiredHairColor} options={HAIR_COLOR_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, desiredHairColor: v }))} />
              <CriteriaSelect label="Hair length" value={form.desiredHairLength} options={HAIR_LENGTH_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, desiredHairLength: v }))} />
            </div>
            <div style={ui.row2}>
              <CriteriaSelect label="Hair texture" value={form.desiredHairTexture} options={HAIR_TEXTURE_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, desiredHairTexture: v }))} />
              <CriteriaSelect label="Hair condition" value={form.desiredHairCondition} options={HAIR_CONDITION_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, desiredHairCondition: v }))} />
            </div>
            <div style={ui.row2}>
              <CriteriaSelect label="Hair density" value={form.desiredHairDensity} options={HAIR_DENSITY_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, desiredHairDensity: v }))} />
              <CriteriaSelect label="Curl pattern (Andre Walker)" value={form.desiredCurlPattern} options={CURL_PATTERN_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, desiredCurlPattern: v }))} />
            </div>
            <div style={ui.row2}>
              <CriteriaSelect label="Virgin hair required" value={form.requireVirginHair} options={VIRGIN_HAIR_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, requireVirginHair: v }))} />
              <CriteriaSelect label="Open to major change" value={form.openToChange} options={OPEN_TO_CHANGE_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, openToChange: v }))} />
            </div>
            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: '1rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Model profile</p>
            <div style={ui.row2}>
              <CriteriaSelect label="Age range" value={form.desiredAgeRange} options={AGE_RANGE_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, desiredAgeRange: v }))} />
              <CriteriaSelect label="Skin tone" hint="Relevant for makeup / bridal." value={form.desiredSkinTone} options={SKIN_TONE_OPTIONS} onChange={(v) => setForm((p) => ({ ...p, desiredSkinTone: v }))} />
            </div>
            <Field label="Priority">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} style={ui.select}>
                <SelectOptions options={PRIORITY_OPTIONS} />
              </select>
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Scheduling type">
              <select
                value={form.schedulingMode}
                onChange={(e) => setForm({
                  ...form,
                  schedulingMode: e.target.value,
                  schedulingFlexibility: e.target.value,
                })}
                style={ui.select}
              >
                <SelectOptions options={SCHEDULING_MODE_OPTIONS} />
              </select>
            </Field>

            {form.schedulingMode === 'fixed' && (
              <div style={ui.row2}>
                <Field label="Date">
                  <input type="date" value={form.requestedDate} onChange={(e) => setForm({ ...form, requestedDate: e.target.value })} style={ui.input} />
                </Field>
                <Field label="Time">
                  <input type="time" value={form.requestedTime} onChange={(e) => setForm({ ...form, requestedTime: e.target.value })} style={ui.input} />
                </Field>
              </div>
            )}

            {form.schedulingMode === 'flexible' && (
              <>
                <div style={ui.row2}>
                  <Field label="Earliest date" hint="First day the model could come in.">
                    <input type="date" value={form.flexibleDateStart} onChange={(e) => setForm({ ...form, flexibleDateStart: e.target.value })} style={ui.input} />
                  </Field>
                  <Field label="Latest date">
                    <input type="date" value={form.flexibleDateEnd} onChange={(e) => setForm({ ...form, flexibleDateEnd: e.target.value })} style={ui.input} />
                  </Field>
                </div>
                <div style={ui.row2}>
                  <Field label="Preferred time">
                    <input type="time" value={form.flexibleTimePreference} onChange={(e) => setForm({ ...form, flexibleTimePreference: e.target.value })} style={ui.input} />
                  </Field>
                  <Field label="Flexibility notes" hint="e.g. weekday mornings, avoid Fridays">
                    <input value={form.flexibleNotes} onChange={(e) => setForm({ ...form, flexibleNotes: e.target.value })} style={ui.input} placeholder="Open Tue–Thu, morning preferred" />
                  </Field>
                </div>
              </>
            )}

            {form.schedulingMode === 'recurring' && (
              <>
                <div style={ui.row2}>
                  <Field label="Repeats every">
                    <select value={form.recurringWeekday} onChange={(e) => setForm({ ...form, recurringWeekday: e.target.value })} style={ui.select}>
                      <SelectOptions options={WEEKDAY_OPTIONS} />
                    </select>
                  </Field>
                  <Field label="At time" hint="e.g. every Tuesday at 1:00 PM">
                    <input type="time" value={form.recurringTime} onChange={(e) => setForm({ ...form, recurringTime: e.target.value })} style={ui.input} />
                  </Field>
                </div>
                <div style={ui.row2}>
                  <Field label="Until date (optional)">
                    <input type="date" value={form.recurringEndDate} onChange={(e) => setForm({ ...form, recurringEndDate: e.target.value })} style={ui.input} />
                  </Field>
                  <Field label="# of sessions (optional)">
                    <input type="number" min={1} value={form.recurringCount} onChange={(e) => setForm({ ...form, recurringCount: e.target.value })} style={ui.input} placeholder="e.g. 8" />
                  </Field>
                </div>
                <Field label="Recurring notes">
                  <input value={form.recurringNotes} onChange={(e) => setForm({ ...form, recurringNotes: e.target.value })} style={ui.input} placeholder="Same model each week if possible" />
                </Field>
                <div style={{ ...ui.preview, borderColor: 'rgba(102,126,234,0.35)', background: 'rgba(102,126,234,0.08)' }}>
                  Anchor for matching: next {getOptionLabel(WEEKDAY_OPTIONS, form.recurringWeekday) || 'Tuesday'} at {form.recurringTime || '13:00'}
                </div>
              </>
            )}
            <Field label="ZIP (for matching)" hint="Pre-filled from stylist when available.">
              <input
                value={form.locationZip}
                onChange={(e) => setForm({ ...form, locationZip: e.target.value.replace(/[^\d]/g, '').slice(0, 5) })}
                style={ui.input}
                placeholder="10016"
              />
            </Field>
            <Field label="Location / salon address">
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                style={ui.input}
                placeholder="253 5th Avenue, 5th Floor, New York, NY"
              />
            </Field>
            <Field label="Brief for models (optional)">
              <textarea
                value={form.serviceDescription}
                onChange={(e) => setForm({ ...form, serviceDescription: e.target.value })}
                style={{ ...ui.input, minHeight: 72 }}
                placeholder="What the model should expect for this session"
              />
            </Field>
          </>
        )}

        <details style={ui.advanced}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Advanced & pricing (optional)</summary>
          <div style={{ marginTop: '0.75rem' }}>
            <div style={ui.row2}>
              <Field label="Pro fee ($)">
                <input type="number" value={form.modelSearchFee} onChange={(e) => setForm({ ...form, modelSearchFee: e.target.value })} style={ui.input} />
              </Field>
              <Field label="Model payout ($)">
                <input type="number" value={form.modelPayment} onChange={(e) => setForm({ ...form, modelPayment: e.target.value })} style={ui.input} />
              </Field>
            </div>
            <Field label="Admin notes">
              <textarea value={form.adminNotes} onChange={(e) => setForm({ ...form, adminNotes: e.target.value })} style={{ ...ui.input, minHeight: 60 }} />
            </Field>
            <Field label="Workflow status on create">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={ui.select}>
                <option value="matching" style={ui.optionStyle}>Ready for matching</option>
                <option value="pending" style={ui.optionStyle}>Pending review</option>
              </select>
            </Field>
          </div>
        </details>

        <div style={ui.footer}>
          <button type="button" style={ui.btnGhost} onClick={() => (step > 0 ? setStep(step - 1) : onClose())} disabled={creating}>
            {step > 0 ? 'Back' : 'Cancel'}
          </button>
          {step < 2 ? (
            <button
              type="button"
              style={{ ...ui.btnPrimary, opacity: stepValid[step] ? 1 : 0.5 }}
              disabled={!stepValid[step]}
              onClick={() => setStep(step + 1)}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              style={{ ...ui.btnPrimary, opacity: readiness.canCreate && !creating ? 1 : 0.5 }}
              disabled={!readiness.canCreate || creating}
              onClick={onSubmit}
            >
              {creating ? 'Creating…' : 'Create & open matching'}
            </button>
          )}
        </div>
        {!readiness.canCreate && step === 2 && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>
            Still needed: {readiness.missing.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

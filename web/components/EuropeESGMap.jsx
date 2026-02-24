'use client';

import { useState, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps';
import {
  REGULATION_BY_COUNTRY,
  COUNTRY_NAMES_EN,
  REGULATION_IDS,
  STATUS_LABELS,
  RISK_LABELS,
} from '@/data/eu-regulation-status';
import { getIso2FromGeography, EUROPE_MAP_ISO2 } from '@/data/eu-map-ids';

const STATUS_EN = { draft: 'Draft', approved: 'Approved', in_force: 'In force' };
const RISK_EN = { low: 'Low', medium: 'Medium', high: 'High' };
const REG_LABEL_EN = { [REGULATION_IDS.TAXONOMY]: 'EU Taxonomy', [REGULATION_IDS.CSRD]: 'CSRD', [REGULATION_IDS.CSDDD]: 'CSDDD', [REGULATION_IDS.NFRD]: 'NFRD' };

// Taxonomía de industrias (24) — misma lista que Industries/taxonomia.py
const INDUSTRIES_TAXONOMY = [
  'Agriculture', 'Arts', 'Construction', 'Consumer Goods', 'Corporate Services',
  'Design', 'Education', 'Energy & Mining', 'Entertainment', 'Finance',
  'Hardware & Networking', 'Health Care', 'Legal', 'Manufacturing',
  'Media & Communications', 'Nonprofit', 'Public Administration', 'Public Safety',
  'Real Estate', 'Recreation & Travel', 'Retail', 'Software & IT Services',
  'Transportation & Logistics', 'Wellness & Fitness',
];

const EMPLOYEE_RANGES = [
  { value: '', label: 'Number of employees' },
  { value: '1-10', label: '1-10' },
  { value: '11-50', label: '11-50' },
  { value: '51-250', label: '51-250' },
  { value: '251-1000', label: '251-1000' },
  { value: '1000+', label: '1000+' },
];

const MAP_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Dcycle palette: blues
const dcycle = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#eff6ff',
  primaryMuted: '#dbeafe',
  hover: '#93c5fd',
  stroke: '#fff',
};

const defaultFill = '#dbeafe';
const hoverFill = dcycle.primaryDark;
const selectedFill = dcycle.primaryDark;

const styles = {
  color: {
    primary: dcycle.primary,
    primaryDark: dcycle.primaryDark,
    primaryLight: dcycle.primaryLight,
    primaryPurple: '#7c3aed',
    text: '#111827',
    textSecondary: '#374151',
    muted: '#6b7280',
    border: '#e5e7eb',
    riskHigh: '#dc2626',
    riskMedium: '#d97706',
    riskLow: '#059669',
  },
  typo: {
    h1: { fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 700, color: '#111827', lineHeight: 1.2 },
    h2: { fontSize: '1.375rem', fontWeight: 600, color: '#111827' },
    h3: { fontSize: '1.125rem', fontWeight: 600, color: '#111827' },
    subtitle: { fontSize: '1rem', color: '#6b7280', lineHeight: 1.5 },
    body: { fontSize: '0.9375rem', color: '#374151' },
    small: { fontSize: '0.8125rem', color: '#6b7280' },
  },
};

function getCountryFill(iso2, selectedIso2, hoveredIso2, hasData) {
  if (selectedIso2 === iso2) return selectedFill;
  if (hasData && hoveredIso2 === iso2) return hoverFill;
  return defaultFill;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function EuropeESGMap() {
  const [selectedIso2, setSelectedIso2] = useState(null);
  const [hoveredIso2, setHoveredIso2] = useState(null);
  const [popupCountry, setPopupCountry] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState('');

  const countryData = useMemo(() => {
    const iso2 = popupCountry || selectedIso2;
    if (!iso2) return null;
    const data = REGULATION_BY_COUNTRY[iso2] || {};
    const name = COUNTRY_NAMES_EN[iso2] || iso2;
    return { iso2, name, regulations: data };
  }, [popupCountry, selectedIso2]);

  const europeanGeographies = useMemo(() => {
    return (geographies) =>
      geographies.filter((geo) => {
        const iso2 = getIso2FromGeography(geo);
        return iso2 && EUROPE_MAP_ISO2.has(iso2);
      });
  }, []);

  const openPopup = (iso2) => {
    setSelectedIso2(iso2);
    setPopupCountry(iso2);
  };
  const closePopup = () => {
    setPopupCountry(null);
    setSelectedIso2(null);
  };

  const { color: c, typo: t } = styles;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Nav estilo Dcycle */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          background: '#fff',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <a href="https://dcycle.io" target="_blank" rel="noopener noreferrer" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111', textDecoration: 'none' }}>
          Dcycle
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <a href="https://dcycle.io" style={{ color: '#4b5563', fontSize: '0.9rem', textDecoration: 'none' }}>Start for free</a>
          <a href="https://dcycle.io" style={{ color: '#4b5563', fontSize: '0.9rem', textDecoration: 'none' }}>Sign in</a>
          <a href="https://dcycle.io/schedule-a-demo" style={{ background: c.primary, color: '#fff', padding: '0.5rem 1rem', borderRadius: 10, fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>Book a demo</a>
        </div>
      </nav>

      {/* Hero */}
      <header
        style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
          background: 'linear-gradient(180deg, #eff6ff 0%, #fff 100%)',
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <span style={{ display: 'inline-block', padding: '0.35rem 0.9rem', background: '#dbeafe', color: c.primary, ...t.small, fontWeight: 600, borderRadius: 9999, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ESG regulation · By country and sector
        </span>
        <h1 style={{ margin: 0, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto', ...t.h1 }}>
          Do you know which regulation applies to you? Don&apos;t fall behind.
        </h1>
        <p style={{ margin: '1rem 0 1.5rem', maxWidth: 580, marginLeft: 'auto', marginRight: 'auto', ...t.subtitle }}>
          With Dcycle you get clarity: check transposition by country, choose your sector and size, and stay in control with one platform for CSRD, Taxonomy and sustainability reporting.
        </p>
        <p style={{ margin: '1.25rem 0 0', ...t.small, color: c.muted }}>Trusted by 2,000+ European companies</p>
        <a href="https://dcycle.io/schedule-a-demo" style={{ display: 'inline-block', marginTop: '0.75rem', background: c.primary, color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 10, fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none' }}>
          Talk to sales
        </a>
      </header>

      {/* Filters: industry + employees */}
      <div style={{ padding: '1.5rem 1.5rem 0', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <h2 style={{ margin: '0 0 1rem', ...t.h2 }}>See what applies to you</h2>
        <p style={{ margin: '0 0 1.25rem', ...t.subtitle }}>Select your sector and headcount, then click your country. Obligations depend on your profile.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...t.small }}>
            <span style={{ color: c.muted, fontWeight: 600 }}>Industry</span>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                fontSize: '0.9rem',
                color: c.text,
                minWidth: 220,
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <option value="">Choose sector</option>
              {INDUSTRIES_TAXONOMY.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', ...t.small }}>
            <span style={{ color: c.muted, fontWeight: 600 }}>Number of employees</span>
            <select
              value={selectedEmployees}
              onChange={(e) => setSelectedEmployees(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 12,
                border: `1px solid ${c.border}`,
                fontSize: '0.9rem',
                color: c.text,
                minWidth: 180,
                background: '#fff',
                cursor: 'pointer',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {EMPLOYEE_RANGES.map((opt) => (
                <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Mapa a ancho completo */}
      <div style={{ flex: 1, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
        <div style={{ width: '100%', maxWidth: 800, aspectRatio: '4/3', background: '#f0f9ff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 14px rgba(37,99,235,0.12)' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [20, 52], scale: 400 }}
            style={{ width: '100%', height: '100%' }}
          >
            <ZoomableGroup center={[20, 52]} zoom={1}>
              <Geographies geography={MAP_URL}>
                {({ geographies }) =>
                  europeanGeographies(geographies).map((geo) => {
                    const iso2 = getIso2FromGeography(geo);
                    const hasData = !!REGULATION_BY_COUNTRY[iso2];
                    const fill = getCountryFill(iso2, selectedIso2, hoveredIso2, hasData);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fill}
                        stroke={dcycle.stroke}
                        strokeWidth={0.6}
                        style={{ default: { outline: 'none' }, hover: { outline: 'none', cursor: hasData ? 'pointer' : 'default' }, pressed: { outline: 'none' } }}
                        onMouseEnter={() => hasData && setHoveredIso2(iso2)}
                        onMouseLeave={() => setHoveredIso2(null)}
                        onClick={() => hasData && openPopup(iso2)}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>
      </div>

      {/* Popup detalle país */}
      {popupCountry && countryData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={closePopup}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              maxWidth: 400,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.25rem 0.75rem', borderBottom: `1px solid ${c.border}` }}>
              <h2 id="popup-title" style={{ margin: 0, ...t.h2 }}>{countryData.name}</h2>
              <button
                type="button"
                onClick={closePopup}
                style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: '#eff6ff', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1, color: c.primary }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{ padding: '1rem 1.25rem', overflowY: 'auto' }}>
              {Object.keys(countryData.regulations || {}).length > 0 && (
                <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#eff6ff', borderRadius: 12, borderLeft: `4px solid ${c.primary}` }}>
                  <h3 style={{ margin: '0 0 0.5rem', ...t.h3, fontSize: '1rem', color: c.primary }}>What applies to you</h3>
                  <p style={{ margin: 0, ...t.small, color: c.textSecondary }}>
                    {[countryData.name, selectedIndustry, selectedEmployees].filter(Boolean).length > 1
                      ? `In ${countryData.name}${selectedIndustry ? `, ${selectedIndustry} sector` : ''}${selectedEmployees ? `, ${selectedEmployees} employees` : ''}:`
                      : `In ${countryData.name} the following regulations apply (exact scope depends on company size and type):`}
                  </p>
                  <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', ...t.small, color: c.textSecondary }}>
                    {[REGULATION_IDS.CSRD, REGULATION_IDS.CSDDD, REGULATION_IDS.TAXONOMY, REGULATION_IDS.NFRD].map((regId) => {
                      const row = (countryData.regulations || {})[regId];
                      if (!row) return null;
                      const statusLabel = row.status ? STATUS_EN[row.status] : '—';
                      const dateStr = row.date ? formatDate(row.date) : '';
                      const riskLabel = row.risk ? RISK_EN[row.risk] : '';
                      const line = [statusLabel, dateStr, riskLabel].filter(Boolean).join(' · ');
                      return <li key={regId} style={{ marginBottom: 2 }}><strong>{REG_LABEL_EN[regId] || regId}</strong>: {line}</li>;
                    })}
                  </ul>
                </div>
              )}

              {Object.keys(countryData.regulations || {}).length === 0 ? (
                <p style={{ margin: 0, ...t.body }}>No transposition data for this country yet.</p>
              ) : (
                <>
                  <p style={{ margin: '0 0 0.5rem', ...t.small, color: c.muted }}>By regulation:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {[REGULATION_IDS.CSRD, REGULATION_IDS.CSDDD, REGULATION_IDS.TAXONOMY, REGULATION_IDS.NFRD].map((regId) => {
                      const row = (countryData.regulations || {})[regId];
                      if (!row) return null;
                      const statusLabel = row.status ? STATUS_EN[row.status] : '—';
                      const riskColor = row.risk === 'high' ? c.riskHigh : row.risk === 'medium' ? c.riskMedium : c.riskLow;
                      return (
                        <div key={regId} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: 10, borderLeft: `3px solid ${riskColor}` }}>
                          <div style={{ fontWeight: 600, ...t.body, marginBottom: 2 }}>{REG_LABEL_EN[regId] || regId}</div>
                          <div style={{ ...t.small, display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span>{statusLabel}</span>
                            <span>{formatDate(row.date)}</span>
                            <span style={{ color: riskColor, fontWeight: 600 }}>{row.risk ? RISK_EN[row.risk] : '—'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              <p style={{ margin: '1rem 0 0', ...t.small }}>Source: EUR-Lex. Updatable.</p>
            </div>
          </div>
        </div>
      )}

      {/* Legend — Dcycle palette, centered */}
      <div
        style={{
          padding: '1rem 1.5rem',
          borderTop: `1px solid ${c.border}`,
          background: 'linear-gradient(180deg, #fff 0%, #eff6ff 100%)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.85rem', background: '#fff', borderRadius: 9999, border: `1px solid ${c.border}`, ...t.small, color: c.textSecondary, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <span style={{ width: 12, height: 12, background: defaultFill, borderRadius: 4 }} />
            Country
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.85rem', background: '#eff6ff', borderRadius: 9999, border: `1px solid ${c.primary}40`, ...t.small, color: c.primary, fontWeight: 500, boxShadow: '0 1px 2px rgba(37,99,235,0.15)' }}>
            <span style={{ width: 12, height: 12, background: selectedFill, borderRadius: 4 }} />
            Selected
          </span>
        </div>
      </div>



      {/* Footer */}
      <footer style={{ padding: '2.5rem 1.5rem', background: '#111', color: c.muted, ...t.small }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.75rem', ...t.body }}>Solutions</div>
            <a href="https://dcycle.io" style={{ display: 'block', color: c.muted, textDecoration: 'none', marginBottom: 4 }}>CSRD</a>
            <a href="https://dcycle.io" style={{ display: 'block', color: c.muted, textDecoration: 'none', marginBottom: 4 }}>Taxonomy</a>
            <a href="https://dcycle.io" style={{ display: 'block', color: c.muted, textDecoration: 'none', marginBottom: 4 }}>Double Materiality</a>
            <a href="https://dcycle.io" style={{ display: 'block', color: c.muted, textDecoration: 'none' }}>Carbon Footprint</a>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.75rem', ...t.body }}>Resources</div>
            <a href="https://dcycle.io" style={{ display: 'block', color: c.muted, textDecoration: 'none', marginBottom: 4 }}>Blog</a>
            <a href="https://dcycle.io" style={{ display: 'block', color: c.muted, textDecoration: 'none' }}>Success stories</a>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.75rem', ...t.body }}>About</div>
            <a href="https://dcycle.io" style={{ display: 'block', color: c.muted, textDecoration: 'none', marginBottom: 4 }}>Work with us</a>
            <a href="https://dcycle.io" style={{ display: 'block', color: c.muted, textDecoration: 'none' }}>Privacy</a>
          </div>
        </div>
        <p style={{ margin: '2rem 0 0', textAlign: 'center', fontSize: '0.8125rem', color: c.muted }}>
          © {new Date().getFullYear()} Dcycle. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

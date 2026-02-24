'use client'

import { useState } from 'react'

/**
 * Mapa interactivo de regulación ESG europea.
 * Reemplaza este contenido por el de tu fichero esg-regulation-map.jsx si lo tienes.
 * Estilos 100% inline, sin dependencias externas de CSS.
 */
export default function ESGRegulationMap() {
  const [selected, setSelected] = useState(null)
  const regulations = [
    { id: 'csrd', name: 'CSRD', desc: 'Corporate Sustainability Reporting Directive', year: 2024 },
    { id: 'eu-taxonomy', name: 'Taxonomía EU', desc: 'Clasificación de actividades sostenibles', year: 2020 },
    { id: 'sfdr', name: 'SFDR', desc: 'Sustainable Finance Disclosure Regulation', year: 2021 },
    { id: 'nfrd', name: 'NFRD', desc: 'Non-Financial Reporting Directive', year: 2014 },
  ]

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '1.5rem',
      }}
    >
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: '#111',
        }}
      >
        Mapa de regulación ESG europea
      </h1>
      <p
        style={{
          color: '#666',
          marginBottom: '1.5rem',
          fontSize: '0.95rem',
        }}
      >
        Haz clic en una regulación para más información.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {regulations.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelected(selected === r.id ? null : r.id)}
            style={{
              padding: '1rem 1.25rem',
              border: selected === r.id ? '2px solid #0070f3' : '1px solid #ddd',
              borderRadius: 8,
              background: selected === r.id ? '#f0f7ff' : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '0.9rem',
            }}
          >
            <span style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>{r.name}</span>
            <span style={{ color: '#666', fontSize: '0.85rem' }}>{r.desc}</span>
            <span style={{ color: '#999', fontSize: '0.8rem', display: 'block', marginTop: 4 }}>
              {r.year}
            </span>
          </button>
        ))}
      </div>
      {selected && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f5f5f5',
            borderRadius: 8,
            fontSize: '0.9rem',
          }}
        >
          Regulación seleccionada: {regulations.find((r) => r.id === selected)?.name}
        </div>
      )}
    </div>
  )
}

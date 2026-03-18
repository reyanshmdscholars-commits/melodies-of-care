'use client'
import { useState, useEffect } from 'react'
import { X, ZoomIn, Loader2 } from 'lucide-react'
import { supabase, type GalleryItem } from '@/lib/supabase'

const ALL_CATEGORIES = ['All', 'Concerts', 'Memory Care', 'Community', 'Therapy', 'Events']

export default function Gallery() {
  const [items, setItems]     = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive]   = useState('All')
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  useEffect(() => {
    supabase
      .from('gallery_items')
      .select('*')
      .order('sort_order')
      .then(({ data }) => { setItems(data || []); setLoading(false) })
  }, [])

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category))).filter(Boolean)]
  const filtered = active === 'All' ? items : items.filter(i => i.category === active)

  return (
    <div style={{ paddingTop: '5rem' }}>
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="max-w-2xl mb-10">
          <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '1rem' }}>Gallery</p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>Moments of Connection</h1>
          <p style={{ fontSize: '1.05rem', color: 'rgba(26,54,93,0.65)', lineHeight: 1.8 }}>
            Every photograph captures something real — a resident swaying to music they haven&apos;t heard in decades, a volunteer finding their purpose, a room full of people simply alive to the present moment.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                background: active === cat ? 'var(--coral)' : 'rgba(255,255,255,0.5)',
                color: active === cat ? 'white' : 'rgba(26,54,93,0.7)',
                border: active === cat ? 'none' : '1px solid rgba(255,255,255,0.5)',
                backdropFilter: 'blur(8px)',
                boxShadow: active === cat ? '0 4px 16px rgba(240,147,91,0.35)' : 'none',
              }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20" style={{ color: 'rgba(26,54,93,0.4)' }}>
            <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} />
            <span>Loading gallery…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <p style={{ color: 'rgba(26,54,93,0.4)', fontSize: '0.9rem' }}>No photos in this category yet.</p>
          </div>
        ) : (
          /* Masonry */
          <div className="masonry-grid">
            {filtered.map(item => {
              const h = 200 + (item.sort_order % 3) * 60
              return (
                <div key={item.id} className="masonry-item cursor-pointer group" onClick={() => setLightbox(item)}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', height: h,
                    background: item.image_url ? undefined : item.color }}>
                    {item.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'rgba(26,54,93,0.25)', backdropFilter: 'blur(2px)' }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.5)' }}>
                        <ZoomIn size={18} color="white" />
                      </div>
                    </div>
                    <div className="w-full p-4" style={{ background: 'linear-gradient(to top, rgba(26,54,93,0.8) 0%, transparent 100%)', position: 'relative', zIndex: 1 }}>
                      <p style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.3 }}>{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)' }}>{item.date}</span>
                        <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', borderRadius: '100px', padding: '1px 7px', fontWeight: 600 }}>{item.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: 'rgba(26,54,93,0.7)', backdropFilter: 'blur(16px)' }}
          onClick={() => setLightbox(null)}>
          <div className="glass-card max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div style={{ height: 360, background: lightbox.image_url ? undefined : lightbox.color, position: 'relative' }}>
              {lightbox.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lightbox.image_url} alt={lightbox.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div className="p-6 flex items-start justify-between gap-4">
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem' }}>{lightbox.title}</h3>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '0.82rem', color: 'rgba(26,54,93,0.55)' }}>{lightbox.date}</span>
                  <span className="badge-open">{lightbox.category}</span>
                </div>
              </div>
              <button onClick={() => setLightbox(null)} className="p-2 rounded-xl flex-shrink-0" style={{ background: 'rgba(26,54,93,0.06)', color: 'rgba(26,54,93,0.5)' }}>
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

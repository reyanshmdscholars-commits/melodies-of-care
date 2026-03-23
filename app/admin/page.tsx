'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/admin-auth'
import { supabase, type Event, type Volunteer, type EventSignup, type Announcement, type FacilityInquiry, type GalleryItem, type TeamMember } from '@/lib/supabase'
import {
  Music, Users, Calendar, Plus, Pencil, Trash2, Check, X,
  LogOut, Loader2, ChevronDown, Save, RefreshCw, Megaphone, ToggleLeft, ToggleRight, FileText,
  Building2, BarChart3, Mail, Phone, MapPin, MessageSquare, Image, UserSquare2, ArrowUp, ArrowDown, Upload
} from 'lucide-react'
import type { ProgramEntry } from '@/lib/generateProgram'

type Tab = 'events' | 'volunteers' | 'signups' | 'announcements' | 'inquiries' | 'gallery' | 'team'
const MAX_SLOTS = 10

const emptyEvent: Omit<Event, 'id'> = {
  facility_name: '', date: '', time: '', status: 'open', volunteer_id: null, notes: ''
}

// ── GALLERY TAB COMPONENT ────────────────────────────────────
const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
]
const GALLERY_CATEGORIES = ['Concerts', 'Memory Care', 'Community', 'Therapy', 'Events']

const emptyGallery: Omit<GalleryItem, 'id' | 'created_at'> = {
  title: '', date: '', category: 'Concerts', image_url: '',
  color: GRADIENT_PRESETS[0], sort_order: 0,
}

function GalleryTab({ items, setItems }: { items: GalleryItem[]; setItems: React.Dispatch<React.SetStateAction<GalleryItem[]>> }) {
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState({ ...emptyGallery })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<GalleryItem | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingEdit, setUploadingEdit] = useState(false)

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('gallery').upload(filename, file, { upsert: false })
    if (error) { alert('Upload failed: ' + error.message); return null }
    const { data } = supabase.storage.from('gallery').getPublicUrl(filename)
    return data.publicUrl
  }

  const handleNewFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile(file)
    if (url) setNewItem(p => ({ ...p, image_url: url }))
    setUploading(false)
    e.target.value = ''
  }

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingEdit(true)
    const url = await uploadFile(file)
    if (url) setEditDraft(p => p ? { ...p, image_url: url } : p)
    setUploadingEdit(false)
    e.target.value = ''
  }

  const saveNew = async () => {
    setSaving(true)
    const { data } = await supabase.from('gallery_items').insert({ ...newItem, sort_order: items.length + 1 }).select().single()
    if (data) setItems(prev => [...prev, data])
    setAdding(false)
    setNewItem({ ...emptyGallery })
    setSaving(false)
  }

  const saveEdit = async () => {
    if (!editDraft) return
    setSaving(true)
    const { id, created_at, ...rest } = editDraft
    await supabase.from('gallery_items').update(rest).eq('id', id)
    setItems(prev => prev.map(i => i.id === id ? editDraft : i))
    setEditingId(null); setEditDraft(null); setSaving(false)
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this gallery item?')) return
    setDeletingId(id)
    await supabase.from('gallery_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setDeletingId(null)
  }

  const moveItem = async (id: string, dir: 'up' | 'down') => {
    const idx = items.findIndex(i => i.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === items.length - 1) return
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    const updated = [...items]
    ;[updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]]
    const reordered = updated.map((item, i) => ({ ...item, sort_order: i + 1 }))
    setItems(reordered)
    await Promise.all(reordered.map(item => supabase.from('gallery_items').update({ sort_order: item.sort_order }).eq('id', item.id)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Gallery ({items.length})</h2>
          <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Add photos, edit captions, reorder and categorize gallery items.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5" style={{ borderRadius: '100px' }}>
          <Plus size={14} /> Add Photo
        </button>
      </div>

      {adding && (
        <div className="glass-card p-6 mb-4" style={{ background: 'rgba(240,147,91,0.04)', border: '1px solid rgba(240,147,91,0.2)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--coral)' }}>New Gallery Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input className="glass-input" placeholder="Title" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} />
            <input className="glass-input" placeholder="Date (e.g. March 2025)" value={newItem.date} onChange={e => setNewItem(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <select className="glass-input" value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}>
              {GALLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-2 items-center">
              <input className="glass-input flex-1" placeholder="Image URL (optional)" value={newItem.image_url} onChange={e => setNewItem(p => ({ ...p, image_url: e.target.value }))} />
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold cursor-pointer flex-shrink-0"
                style={{ background: uploading ? 'rgba(26,54,93,0.06)' : 'rgba(240,147,91,0.1)', color: uploading ? 'rgba(26,54,93,0.4)' : 'var(--coral)', border: '1px solid rgba(240,147,91,0.25)', whiteSpace: 'nowrap' }}>
                {uploading ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</> : <><Upload size={13} /> Upload</>}
                <input type="file" accept="image/*" className="hidden" onChange={handleNewFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>
          {newItem.image_url && (
            <div className="mb-3 flex items-center gap-3">
              <img src={newItem.image_url} alt="Preview" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(26,54,93,0.1)' }} />
              <button onClick={() => setNewItem(p => ({ ...p, image_url: '' }))} className="text-xs" style={{ color: '#c4622a' }}>Remove image</button>
            </div>
          )}
          <div className="mb-4">
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(26,54,93,0.5)', marginBottom: '0.5rem' }}>Background color (used when no image URL)</p>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_PRESETS.map(g => (
                <button key={g} onClick={() => setNewItem(p => ({ ...p, color: g }))}
                  style={{ width: 32, height: 32, borderRadius: 8, background: g, border: newItem.color === g ? '2px solid var(--coral)' : '2px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveNew} disabled={saving || !newItem.title} className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5" style={{ borderRadius: '100px', opacity: !newItem.title ? 0.5 : 1 }}>
              {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />} Save
            </button>
            <button onClick={() => setAdding(false)} className="btn-ghost px-5 py-2 text-sm flex items-center gap-1.5"><X size={13} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'clip' }}>
        <div className="table-scroll">
        <table className="glass-table">
          <thead><tr><th>Preview</th><th>Title</th><th>Date</th><th>Category</th><th>Image URL</th><th>Order</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map((item, idx) => editingId === item.id && editDraft ? (
              <tr key={item.id}>
                <td>
                  <div style={{ width: 48, height: 36, borderRadius: 6, background: editDraft.image_url ? undefined : editDraft.color, overflow: 'hidden' }}>
                    {editDraft.image_url && <img src={editDraft.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                </td>
                <td><input className="glass-input" value={editDraft.title} onChange={e => setEditDraft(p => p ? { ...p, title: e.target.value } : p)} /></td>
                <td><input className="glass-input" value={editDraft.date} onChange={e => setEditDraft(p => p ? { ...p, date: e.target.value } : p)} /></td>
                <td>
                  <select className="glass-input" value={editDraft.category} onChange={e => setEditDraft(p => p ? { ...p, category: e.target.value } : p)}>
                    {GALLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td>
                  <div className="flex gap-1.5 items-center">
                    <input className="glass-input flex-1" placeholder="Image URL" value={editDraft.image_url} onChange={e => setEditDraft(p => p ? { ...p, image_url: e.target.value } : p)} />
                    <label className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex-shrink-0"
                      style={{ background: 'rgba(240,147,91,0.1)', color: 'var(--coral)', border: '1px solid rgba(240,147,91,0.25)' }}>
                      {uploadingEdit ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={11} />}
                      <input type="file" accept="image/*" className="hidden" onChange={handleEditFileUpload} disabled={uploadingEdit} />
                    </label>
                  </div>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {GRADIENT_PRESETS.map(g => (
                      <button key={g} onClick={() => setEditDraft(p => p ? { ...p, color: g } : p)}
                        style={{ width: 20, height: 20, borderRadius: 4, background: g, border: editDraft.color === g ? '2px solid var(--coral)' : '1px solid transparent', cursor: 'pointer' }} />
                    ))}
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={saveEdit} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(100,200,150,0.2)', color: '#1a6a40' }}>{saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={14} />}</button>
                    <button onClick={() => { setEditingId(null); setEditDraft(null) }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,80,80,0.1)', color: '#c4622a' }}><X size={14} /></button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr key={item.id}>
                <td>
                  <div style={{ width: 48, height: 36, borderRadius: 6, background: item.image_url ? undefined : item.color, overflow: 'hidden', flexShrink: 0 }}>
                    {item.image_url && <img src={item.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                </td>
                <td style={{ fontWeight: 600, maxWidth: 180 }}>{item.title}</td>
                <td style={{ fontSize: '0.82rem', color: 'rgba(26,54,93,0.6)' }}>{item.date}</td>
                <td><span className="badge-open" style={{ fontSize: '0.72rem' }}>{item.category}</span></td>
                <td style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.45)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.image_url || <span style={{ color: 'rgba(26,54,93,0.25)' }}>gradient</span>}</td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => moveItem(item.id, 'up')} disabled={idx === 0} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'rgba(26,54,93,0.4)', opacity: idx === 0 ? 0.3 : 1 }}><ArrowUp size={11} /></button>
                    <button onClick={() => moveItem(item.id, 'down')} disabled={idx === items.length - 1} className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'rgba(26,54,93,0.4)', opacity: idx === items.length - 1 ? 0.3 : 1 }}><ArrowDown size={11} /></button>
                  </div>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(item.id); setEditDraft(item) }} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'rgba(26,54,93,0.5)' }}><Pencil size={13} /></button>
                    <button onClick={() => deleteItem(item.id)} disabled={deletingId === item.id} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,80,80,0.08)', color: '#c4622a' }}>
                      {deletingId === item.id ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'rgba(26,54,93,0.4)', padding: '2rem' }}>No gallery items yet.</td></tr>}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}

// ── TEAM TAB COMPONENT ────────────────────────────────────────
const emptyMember: Omit<TeamMember, 'id' | 'created_at'> = {
  name: '', role: '', instrument: '', bio: '', initials: '', hue: '210', sort_order: 0,
}

const autoInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

const hueOptions = [
  { label: 'Blue',   value: '210' },
  { label: 'Orange', value: '20'  },
  { label: 'Teal',   value: '170' },
  { label: 'Purple', value: '280' },
  { label: 'Pink',   value: '340' },
  { label: 'Yellow', value: '45'  },
  { label: 'Green',  value: '90'  },
  { label: 'Cyan',   value: '190' },
  { label: 'Red',    value: '0'   },
]

type MemberDraft = Omit<TeamMember, 'id' | 'created_at'>

function MemberForm({ draft, setDraft }: { draft: MemberDraft; setDraft: (v: MemberDraft) => void }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <input className="glass-input" placeholder="Full Name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value, initials: autoInitials(e.target.value) })} />
        <input className="glass-input" placeholder="Role / Title" value={draft.role} onChange={e => setDraft({ ...draft, role: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <input className="glass-input" placeholder="Instrument" value={draft.instrument} onChange={e => setDraft({ ...draft, instrument: e.target.value })} />
        <input className="glass-input" placeholder="Initials (auto)" value={draft.initials} onChange={e => setDraft({ ...draft, initials: e.target.value.toUpperCase().slice(0, 2) })} maxLength={2} />
        <div>
          <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(26,54,93,0.45)', marginBottom: '0.35rem' }}>Avatar color</p>
          <div className="flex flex-wrap gap-1.5">
            {hueOptions.map(h => (
              <button key={h.value} onClick={() => setDraft({ ...draft, hue: h.value })}
                style={{ width: 24, height: 24, borderRadius: 6, background: `hsl(${h.value}, 60%, 65%)`, border: draft.hue === h.value ? '2px solid var(--coral)' : '2px solid transparent', cursor: 'pointer' }}
                title={h.label} />
            ))}
          </div>
        </div>
      </div>
      <textarea className="glass-input" placeholder="Bio" rows={3} value={draft.bio} onChange={e => setDraft({ ...draft, bio: e.target.value })} style={{ resize: 'vertical' }} />
    </div>
  )
}

function TeamTab({ members, setMembers }: { members: TeamMember[]; setMembers: React.Dispatch<React.SetStateAction<TeamMember[]>> }) {
  const [adding, setAdding] = useState(false)
  const [newMember, setNewMember] = useState({ ...emptyMember })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<TeamMember | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const saveNew = async () => {
    setSaving(true)
    const payload = { ...newMember, sort_order: members.length + 1, initials: newMember.initials || autoInitials(newMember.name) }
    const { data } = await supabase.from('team_members').insert(payload).select().single()
    if (data) setMembers(prev => [...prev, data])
    setAdding(false); setNewMember({ ...emptyMember }); setSaving(false)
  }

  const saveEdit = async () => {
    if (!editDraft) return
    setSaving(true)
    const { id, created_at, ...rest } = editDraft
    await supabase.from('team_members').update(rest).eq('id', id)
    setMembers(prev => prev.map(m => m.id === id ? editDraft : m))
    setEditingId(null); setEditDraft(null); setSaving(false)
  }

  const deleteMember = async (id: string) => {
    if (!confirm('Delete this team member?')) return
    setDeletingId(id)
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(prev => prev.filter(m => m.id !== id))
    setDeletingId(null)
  }

  const moveItem = async (id: string, dir: 'up' | 'down') => {
    const idx = members.findIndex(m => m.id === id)
    if (dir === 'up' && idx === 0) return
    if (dir === 'down' && idx === members.length - 1) return
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1
    const updated = [...members]
    ;[updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]]
    const reordered = updated.map((m, i) => ({ ...m, sort_order: i + 1 }))
    setMembers(reordered)
    await Promise.all(reordered.map(m => supabase.from('team_members').update({ sort_order: m.sort_order }).eq('id', m.id)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Team Members ({members.length})</h2>
          <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Add, edit, or reorder the people shown on the Meet the Team page.</p>
        </div>
        <button onClick={() => setAdding(true)} className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5" style={{ borderRadius: '100px' }}>
          <Plus size={14} /> Add Member
        </button>
      </div>

      {adding && (
        <div className="glass-card p-6 mb-4" style={{ background: 'rgba(240,147,91,0.04)', border: '1px solid rgba(240,147,91,0.2)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--coral)' }}>New Team Member</h3>
          <MemberForm draft={newMember} setDraft={setNewMember} />
          <div className="flex gap-2 mt-4">
            <button onClick={saveNew} disabled={saving || !newMember.name} className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5" style={{ borderRadius: '100px', opacity: !newMember.name ? 0.5 : 1 }}>
              {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />} Save
            </button>
            <button onClick={() => setAdding(false)} className="btn-ghost px-5 py-2 text-sm flex items-center gap-1.5"><X size={13} /> Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {members.map((m, idx) => editingId === m.id && editDraft ? (
          <div key={m.id} className="glass-card p-5" style={{ border: '1px solid rgba(240,147,91,0.25)' }}>
            <MemberForm draft={editDraft} setDraft={(v) => setEditDraft(prev => ({ ...prev!, ...v }))} />
            <div className="flex gap-2 mt-4">
              <button onClick={saveEdit} className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5" style={{ borderRadius: '100px' }}>
                {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />} Save
              </button>
              <button onClick={() => { setEditingId(null); setEditDraft(null) }} className="btn-ghost px-5 py-2 text-sm flex items-center gap-1.5"><X size={13} /> Cancel</button>
            </div>
          </div>
        ) : (
          <div key={m.id} className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: `hsl(${m.hue}, 60%, 65%)` }}>
              {m.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--navy)' }}>{m.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--coral)', fontWeight: 600 }}>{m.role}</div>
              {m.instrument && <div style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.45)', marginTop: 2 }}>🎵 {m.instrument}</div>}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'rgba(26,54,93,0.55)', lineHeight: 1.5, maxWidth: 320, flex: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{m.bio}</p>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => moveItem(m.id, 'up')} disabled={idx === 0} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'rgba(26,54,93,0.4)', opacity: idx === 0 ? 0.3 : 1 }}><ArrowUp size={12} /></button>
              <button onClick={() => moveItem(m.id, 'down')} disabled={idx === members.length - 1} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'rgba(26,54,93,0.4)', opacity: idx === members.length - 1 ? 0.3 : 1 }}><ArrowDown size={12} /></button>
              <button onClick={() => { setEditingId(m.id); setEditDraft(m) }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'rgba(26,54,93,0.5)' }}><Pencil size={12} /></button>
              <button onClick={() => deleteMember(m.id)} disabled={deletingId === m.id} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,80,80,0.08)', color: '#c4622a' }}>
                {deletingId === m.id ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
              </button>
            </div>
          </div>
        ))}
        {members.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p style={{ color: 'rgba(26,54,93,0.4)', fontSize: '0.9rem' }}>No team members yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const { isAdmin, logout } = useAdminAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('events')
  const [events, setEvents] = useState<Event[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [signups, setSignups] = useState<EventSignup[]>([])
  const [signupCounts, setSignupCounts] = useState<Record<string, number>>({})
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [inquiries, setInquiries] = useState<FacilityInquiry[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'> | null>(null)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [removingSignupId, setRemovingSignupId] = useState<string | null>(null)
  const [approvingHoursId, setApprovingHoursId] = useState<string | null>(null)
  const [adjustingHoursId, setAdjustingHoursId] = useState<string | null>(null)

  // Announcements state
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [postingAnn, setPostingAnn] = useState(false)
  const [togglingAnnId, setTogglingAnnId] = useState<string | null>(null)
  const [deletingAnnId, setDeletingAnnId] = useState<string | null>(null)
  const [deletingInquiryId, setDeletingInquiryId] = useState<string | null>(null)
  const [deletingVolunteerId, setDeletingVolunteerId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) { router.push('/'); return }
    loadAll()
  }, [isAdmin])

  const loadAll = async () => {
    setLoading(true)
    const [{ data: evs }, { data: vols }, { data: sups }, { data: anns }, { data: inqs }, { data: gal }, { data: tm }] = await Promise.all([
      supabase.from('events').select('*').order('date'),
      supabase.from('volunteers').select('*').order('name'),
      supabase.from('event_signups').select('*').order('claimed_at'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
      supabase.from('facility_inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('gallery_items').select('*').order('sort_order'),
      supabase.from('team_members').select('*').order('sort_order'),
    ])
    setEvents(evs || [])
    setVolunteers(vols || [])
    const supData = sups || []
    setSignups(supData)
    const counts: Record<string, number> = {}
    for (const s of supData) counts[s.event_id] = (counts[s.event_id] || 0) + 1
    setSignupCounts(counts)
    setAnnouncements(anns || [])
    setInquiries(inqs || [])
    setGalleryItems(gal || [])
    setTeamMembers(tm || [])
    setLoading(false)
  }

  // ── Events CRUD ────────────────────────────────────────────
  const saveNewEvent = async () => {
    if (!newEvent) return
    setSaving(true)
    const { data } = await supabase.from('events').insert(newEvent).select().single()
    if (data) setEvents(prev => [...prev, data])
    setNewEvent(null)
    setSaving(false)
  }

  const saveEditEvent = async () => {
    if (!editingEvent) return
    setSaving(true)
    const { id, ...rest } = editingEvent
    await supabase.from('events').update(rest).eq('id', id)
    setEvents(prev => prev.map(e => e.id === id ? editingEvent : e))
    setEditingEvent(null)
    setSaving(false)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event? All sign-ups for it will also be removed.')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents(prev => prev.filter(e => e.id !== id))
    setSignups(prev => prev.filter(s => s.event_id !== id))
    const newCounts = { ...signupCounts }; delete newCounts[id]; setSignupCounts(newCounts)
  }

  // ── Volunteer toggle ───────────────────────────────────────
  const toggleVolunteerStatus = async (v: Volunteer) => {
    setTogglingId(v.id)
    const newStatus = v.status === 'pending' ? 'approved' : 'pending'
    await supabase.from('volunteers').update({ status: newStatus }).eq('id', v.id)
    setVolunteers(prev => prev.map(vol => vol.id === v.id ? { ...vol, status: newStatus } : vol))
    // Open pre-filled welcome email when approving
    if (newStatus === 'approved') {
      const subject = encodeURIComponent('Welcome to Melodies of Care! 🎵')
      const body = encodeURIComponent(
        `Hi ${v.name.split(' ')[0]},\n\nGreat news — your Melodies of Care volunteer application has been approved!\n\nYou can now log in at https://melodiesofcare.com/login and start signing up for upcoming performances at senior care facilities near you.\n\nThank you for joining our mission to bring music to those who need it most.\n\nWarm regards,\nThe Melodies of Care Team`
      )
      window.open(`mailto:${v.email}?subject=${subject}&body=${body}`, '_blank')
    }
    setTogglingId(null)
  }

  // ── Delete volunteer ───────────────────────────────────────
  const deleteVolunteer = async (v: Volunteer) => {
    if (!confirm(`Permanently delete ${v.name}? This cannot be undone.`)) return
    setDeletingVolunteerId(v.id)
    await supabase.from('volunteers').delete().eq('id', v.id)
    setVolunteers(prev => prev.filter(vol => vol.id !== v.id))
    setDeletingVolunteerId(null)
  }

  // ── Delete facility inquiry ─────────────────────────────────
  const deleteInquiry = async (id: string, name: string) => {
    if (!confirm(`Delete inquiry from ${name}? This cannot be undone.`)) return
    setDeletingInquiryId(id)
    await supabase.from('facility_inquiries').delete().eq('id', id)
    setInquiries(prev => prev.filter(inq => inq.id !== id))
    setDeletingInquiryId(null)
  }

  // ── Adjust volunteer hours ──────────────────────────────────
  const adjustHours = async (v: Volunteer, delta: number) => {
    const newHours = Math.max(0, v.hours + delta)
    setAdjustingHoursId(v.id)
    await supabase.from('volunteers').update({ hours: newHours }).eq('id', v.id)
    setVolunteers(prev => prev.map(vol => vol.id === v.id ? { ...vol, hours: newHours } : vol))
    setAdjustingHoursId(null)
  }

  // ── Remove signup ──────────────────────────────────────────
  const removeSignup = async (signup: EventSignup) => {
    if (!confirm(`Remove ${signup.volunteer_name} from this event?`)) return
    setRemovingSignupId(signup.id)
    // Use the unclaim RPC so event status/waitlist is handled correctly
    await supabase.rpc('unclaim_event', { event_id: signup.event_id, v_id: signup.volunteer_id })
    // Refresh events + signups
    const [{ data: evs }, { data: sups }] = await Promise.all([
      supabase.from('events').select('*').order('date'),
      supabase.from('event_signups').select('*').order('claimed_at'),
    ])
    setEvents(evs || [])
    const supData = sups || []
    setSignups(supData)
    const counts: Record<string, number> = {}
    for (const s of supData) counts[s.event_id] = (counts[s.event_id] || 0) + 1
    setSignupCounts(counts)
    setRemovingSignupId(null)
  }

  // ── Approve Hours ──────────────────────────────────────────
  const approveHours = async (signup: EventSignup) => {
    setApprovingHoursId(signup.id)
    await supabase.rpc('approve_hours', { signup_id: signup.id })
    // Refresh signups and volunteers (hours update)
    const [{ data: sups }, { data: vols }] = await Promise.all([
      supabase.from('event_signups').select('*').order('claimed_at'),
      supabase.from('volunteers').select('*').order('name'),
    ])
    const supData = sups || []
    setSignups(supData)
    const counts: Record<string, number> = {}
    for (const s of supData) counts[s.event_id] = (counts[s.event_id] || 0) + 1
    setSignupCounts(counts)
    setVolunteers(vols || [])
    setApprovingHoursId(null)
  }

  // ── Impact Report PDF ─────────────────────────────────────
  const [generatingReport, setGeneratingReport] = useState(false)
  const handleGenerateImpactReport = async () => {
    setGeneratingReport(true)
    try {
      const { generateImpactReport } = await import('@/lib/generateImpactReport')
      await generateImpactReport(events, volunteers, signups)
    } finally {
      setGeneratingReport(false)
    }
  }

  // ── Generate Program PDF ───────────────────────────────────
  const [generatingProgramId, setGeneratingProgramId] = useState<string | null>(null)

  const handleGenerateProgram = async (event: Event) => {
    setGeneratingProgramId(event.id)
    try {
      const { data: eventSignups } = await supabase
        .from('event_signups')
        .select('volunteer_id, volunteer_name, songs, song_details')
        .eq('event_id', event.id)

      const entries: ProgramEntry[] = (eventSignups || []).map(s => ({
        volunteer_name: s.volunteer_name,
        instrument: volunteers.find(v => v.id === s.volunteer_id)?.instrument || '',
        songs: s.songs ?? 1,
        song_details: s.song_details ?? [],
      }))

      const { generateEventProgram } = await import('@/lib/generateProgram')
      await generateEventProgram(event, entries)
    } finally {
      setGeneratingProgramId(null)
    }
  }

  // ── Announcements ─────────────────────────────────────────
  const postAnnouncement = async () => {
    if (!newAnnouncement.trim()) return
    setPostingAnn(true)
    const { data } = await supabase
      .from('announcements')
      .insert({ message: newAnnouncement.trim(), is_active: true })
      .select()
      .single()
    if (data) setAnnouncements(prev => [data, ...prev])
    setNewAnnouncement('')
    setPostingAnn(false)
  }

  const toggleAnnouncement = async (ann: Announcement) => {
    setTogglingAnnId(ann.id)
    const newActive = !ann.is_active
    await supabase.from('announcements').update({ is_active: newActive }).eq('id', ann.id)
    setAnnouncements(prev => prev.map(a => a.id === ann.id ? { ...a, is_active: newActive } : a))
    setTogglingAnnId(null)
  }

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    setDeletingAnnId(id)
    await supabase.from('announcements').delete().eq('id', id)
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    setDeletingAnnId(null)
  }

  if (!isAdmin) return null

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'events',        label: 'Live Event Editor',    icon: <Calendar size={16} />,   count: events.length },
    { id: 'volunteers',    label: 'Volunteer Management', icon: <Users size={16} />,       count: volunteers.length },
    { id: 'signups',       label: 'Sign-up Tracker',      icon: <Music size={16} />,       count: signups.length },
    { id: 'announcements', label: 'Announcements',        icon: <Megaphone size={16} />,   count: announcements.filter(a => a.is_active).length },
    { id: 'inquiries',     label: 'Facility Inquiries',   icon: <Building2 size={16} />,    count: inquiries.length },
    { id: 'gallery',       label: 'Gallery',              icon: <Image size={16} />,        count: galleryItems.length },
    { id: 'team',          label: 'Team Members',         icon: <UserSquare2 size={16} />,  count: teamMembers.length },
  ]

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 sm:mb-10 flex-wrap gap-4">
          <div>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--coral)', marginBottom: '0.4rem' }}>Admin Dashboard</p>
            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>Melodies of Care</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={loadAll} className="btn-ghost px-4 py-2 text-sm flex items-center gap-2"><RefreshCw size={14} /> Refresh</button>
            <button
              onClick={handleGenerateImpactReport}
              disabled={generatingReport}
              className="btn-ghost px-4 py-2 text-sm flex items-center gap-2"
              style={{ color: '#2d6a6a', border: '1px solid rgba(45,106,106,0.25)' }}
              title="Download Impact Report PDF"
            >
              {generatingReport ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <BarChart3 size={14} />}
              Impact Report
            </button>
            <button onClick={() => { logout(); router.push('/') }} className="btn-ghost px-4 py-2 text-sm flex items-center gap-2" style={{ color: '#c4622a' }}><LogOut size={14} /> Log Out</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Events',      value: events.length,                                         color: 'var(--navy)' },
            { label: 'Total Signups',     value: signups.length,                                        color: '#2d6a6a' },
            { label: 'Total Volunteers',  value: volunteers.length,                                     color: 'var(--navy)' },
            { label: 'Pending Approval',  value: volunteers.filter(v => v.status === 'pending').length, color: '#8a6200' },
          ].map(c => (
            <div key={c.label} className="glass-card p-5">
              <div style={{ fontSize: '2rem', fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'rgba(26,54,93,0.55)', marginTop: '0.3rem', fontWeight: 500 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0"
              style={{ background: tab === t.id ? 'var(--navy)' : 'rgba(255,255,255,0.5)', color: tab === t.id ? 'white' : 'rgba(26,54,93,0.7)', border: tab === t.id ? 'none' : '1px solid rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)', whiteSpace: 'nowrap' }}>
              {t.icon} {t.label}
              <span className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: tab === t.id ? 'rgba(255,255,255,0.2)' : 'rgba(26,54,93,0.08)', color: tab === t.id ? 'white' : 'rgba(26,54,93,0.5)' }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="glass-card p-10 sm:p-16 flex items-center justify-center gap-3" style={{ color: 'rgba(26,54,93,0.4)' }}>
            <Loader2 size={22} style={{ animation: 'spin 1s linear infinite' }} /><span>Loading data…</span>
          </div>
        ) : (
          <>
            {/* ── EVENTS TAB ── */}
            {tab === 'events' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Events ({events.length})</h2>
                  <button onClick={() => setNewEvent({ ...emptyEvent })} className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5" style={{ borderRadius: '100px' }}>
                    <Plus size={14} /> Add Event
                  </button>
                </div>

                {newEvent && (
                  <div className="glass-card p-6 mb-4" style={{ background: 'rgba(240,147,91,0.05)', border: '1px solid rgba(240,147,91,0.2)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--coral)' }}>New Event</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <input className="glass-input" placeholder="Facility Name" value={newEvent.facility_name} onChange={e => setNewEvent(p => p ? { ...p, facility_name: e.target.value } : p)} />
                      <input className="glass-input" type="date" value={newEvent.date} onChange={e => setNewEvent(p => p ? { ...p, date: e.target.value } : p)} />
                      <input className="glass-input" type="time" value={newEvent.time} onChange={e => setNewEvent(p => p ? { ...p, time: e.target.value } : p)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <select className="glass-input" value={newEvent.status} onChange={e => setNewEvent(p => p ? { ...p, status: e.target.value as 'open' | 'filled' } : p)}>
                        <option value="open">Open</option><option value="filled">Filled</option>
                      </select>
                    </div>
                    <textarea className="glass-input" placeholder="Post-event notes or recap (optional)" rows={2} value={newEvent.notes} onChange={e => setNewEvent(p => p ? { ...p, notes: e.target.value } : p)} style={{ resize: 'vertical', marginBottom: '0.75rem' }} />
                    <div className="flex gap-2">
                      <button onClick={saveNewEvent} disabled={saving} className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5" style={{ borderRadius: '100px' }}>
                        {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />} Save
                      </button>
                      <button onClick={() => setNewEvent(null)} className="btn-ghost px-5 py-2 text-sm flex items-center gap-1.5"><X size={13} /> Cancel</button>
                    </div>
                  </div>
                )}

                <div className="glass-card" style={{ overflow: 'clip' }}>
                  <div className="table-scroll">
                  <table className="glass-table">
                    <thead><tr><th>Facility</th><th>Date</th><th>Time</th><th>Slots</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {events.map(event => {
                        const count = signupCounts[event.id] || 0
                        return editingEvent?.id === event.id ? (
                          <tr key={event.id}>
                            <td><input className="glass-input" value={editingEvent.facility_name} onChange={e => setEditingEvent(p => p ? { ...p, facility_name: e.target.value } : p)} /></td>
                            <td><input className="glass-input" type="date" value={editingEvent.date} onChange={e => setEditingEvent(p => p ? { ...p, date: e.target.value } : p)} /></td>
                            <td><input className="glass-input" type="time" value={editingEvent.time} onChange={e => setEditingEvent(p => p ? { ...p, time: e.target.value } : p)} /></td>
                            <td><span style={{ fontSize: '0.82rem', color: 'rgba(26,54,93,0.6)' }}>{count}/{MAX_SLOTS}</span></td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <select className="glass-input" value={editingEvent.status} onChange={e => setEditingEvent(p => p ? { ...p, status: e.target.value as 'open' | 'filled' } : p)}><option value="open">Open</option><option value="filled">Filled</option></select>
                                <textarea className="glass-input" placeholder="Recap notes…" rows={2} value={editingEvent.notes || ''} onChange={e => setEditingEvent(p => p ? { ...p, notes: e.target.value } : p)} style={{ resize: 'vertical', fontSize: '0.78rem' }} />
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <button onClick={saveEditEvent} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(100,200,150,0.2)', color: '#1a6a40' }}><Check size={14} /></button>
                                <button onClick={() => setEditingEvent(null)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,80,80,0.1)', color: '#c4622a' }}><X size={14} /></button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={event.id}>
                            <td style={{ fontWeight: 600 }}>{event.facility_name}</td>
                            <td>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td>{event.time}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: 48, height: 5, background: 'rgba(26,54,93,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${Math.min(count / MAX_SLOTS * 100, 100)}%`, background: count >= MAX_SLOTS ? 'var(--coral)' : 'rgba(178,216,216,0.8)', borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: '0.78rem', color: 'rgba(26,54,93,0.55)', fontWeight: 600 }}>{count}/{MAX_SLOTS}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span className={event.status === 'open' ? 'badge-open' : 'badge-filled'}>{event.status}</span>
                                {event.notes && (
                                  <span style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.5)', fontStyle: 'italic', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={event.notes}>
                                    📝 {event.notes}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-1">
                                <button onClick={() => setEditingEvent(event)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(26,54,93,0.06)', color: 'rgba(26,54,93,0.5)' }} title="Edit event"><Pencil size={13} /></button>
                                <button onClick={() => deleteEvent(event.id)} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,80,80,0.08)', color: '#c4622a' }} title="Delete event"><Trash2 size={13} /></button>
                                <button
                                  onClick={() => handleGenerateProgram(event)}
                                  disabled={generatingProgramId === event.id}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                                  style={{ background: 'rgba(45,140,140,0.1)', color: '#2D8C8C' }}
                                  title="Download program PDF"
                                >
                                  {generatingProgramId === event.id
                                    ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                                    : <FileText size={13} />
                                  }
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {events.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(26,54,93,0.4)', padding: '2rem' }}>No events yet. Click &quot;Add Event&quot; to get started.</td></tr>}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── VOLUNTEERS TAB ── */}
            {tab === 'volunteers' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Volunteers ({volunteers.length})</h2>
                  <div className="flex gap-2 text-sm">
                    <span className="badge-pending">{volunteers.filter(v => v.status === 'pending').length} Pending</span>
                    <span className="badge-approved">{volunteers.filter(v => v.status === 'approved').length} Approved</span>
                  </div>
                </div>
                <div className="glass-card" style={{ overflow: 'clip' }}>
                  <div className="table-scroll">
                  <table className="glass-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Instrument</th><th>Hours</th><th>Media ✓</th><th>Status</th><th>Toggle</th><th>Delete</th></tr></thead>
                    <tbody>
                      {volunteers.map(v => (
                        <tr key={v.id}>
                          <td style={{ fontWeight: 600 }}>{v.name}</td>
                          <td style={{ fontSize: '0.82rem', color: 'rgba(26,54,93,0.6)' }}>{v.email}</td>
                          <td>{v.instrument}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={() => adjustHours(v, -1)}
                                disabled={adjustingHoursId === v.id || v.hours === 0}
                                style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid rgba(220,60,60,0.4)', background: 'rgba(220,60,60,0.08)', color: '#c03030', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, opacity: (adjustingHoursId === v.id || v.hours === 0) ? 0.4 : 1, transition: 'all 0.15s' }}
                              >−</button>
                              <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 600 }}>
                                {adjustingHoursId === v.id ? '…' : `${v.hours}h`}
                              </span>
                              <button
                                onClick={() => adjustHours(v, 1)}
                                disabled={adjustingHoursId === v.id}
                                style={{ width: 22, height: 22, borderRadius: '50%', border: '1.5px solid rgba(30,160,80,0.4)', background: 'rgba(30,160,80,0.08)', color: '#1a6a30', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, opacity: adjustingHoursId === v.id ? 0.4 : 1, transition: 'all 0.15s' }}
                              >+</button>
                            </div>
                          </td>
                          <td>
                            {v.media_consent
                              ? <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1a6a40', background: 'rgba(100,200,150,0.15)', padding: '2px 8px', borderRadius: '100px' }}>✓ Yes</span>
                              : <span style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.3)' }}>—</span>
                            }
                          </td>
                          <td><span className={v.status === 'approved' ? 'badge-approved' : 'badge-pending'}>{v.status}</span></td>
                          <td>
                            <button onClick={() => toggleVolunteerStatus(v)} disabled={togglingId === v.id}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                              style={{ background: v.status === 'pending' ? 'rgba(100,200,150,0.15)' : 'rgba(255,200,100,0.15)', color: v.status === 'pending' ? '#1a6a40' : '#8a6200', border: v.status === 'pending' ? '1px solid rgba(100,200,150,0.3)' : '1px solid rgba(255,200,100,0.35)' }}>
                              {togglingId === v.id ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : v.status === 'pending' ? <><Check size={11} /> Approve</> : <><ChevronDown size={11} /> Revert</>}
                            </button>
                          </td>
                          <td>
                            <button
                              onClick={() => deleteVolunteer(v)}
                              disabled={deletingVolunteerId === v.id}
                              title="Delete volunteer"
                              style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid rgba(220,60,60,0.35)', background: 'rgba(220,60,60,0.07)', color: '#c03030', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingVolunteerId === v.id ? 0.4 : 1, transition: 'all 0.15s' }}
                            >
                              {deletingVolunteerId === v.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={12} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                      {volunteers.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', color: 'rgba(26,54,93,0.4)', padding: '2rem' }}>No volunteers yet.</td></tr>}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── SIGNUPS TAB ── */}
            {tab === 'signups' && (
              <div>
                <div className="mb-4">
                  <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Sign-up Tracker</h2>
                  <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>All volunteer event claims ({signups.length} total). Approve hours for past events, or remove any signup.</p>
                </div>
                <div className="glass-card" style={{ overflow: 'clip' }}>
                  <div className="table-scroll">
                  <table className="glass-table">
                    <thead><tr><th>Volunteer</th><th>Event / Facility</th><th>Date</th><th>Setlist</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {signups.map(s => {
                        const event = events.find(e => e.id === s.event_id)
                        const isPast = event ? new Date(event.date) < new Date(new Date().toDateString()) : false
                        const hrsLogged = (s.songs || 1) === 1 ? 2 : 5
                        return (
                          <tr key={s.id}>
                            <td style={{ fontWeight: 600 }}>{s.volunteer_name}</td>
                            <td>{event?.facility_name ?? <span style={{ color: 'rgba(26,54,93,0.35)', fontSize: '0.8rem' }}>Deleted event</span>}</td>
                            <td style={{ fontSize: '0.82rem' }}>{event ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                            <td style={{ minWidth: 160 }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {s.song_details && s.song_details.length > 0
                                  ? s.song_details.map((sd, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--coral)', minWidth: 14 }}>{i + 1}.</span>
                                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)' }}>
                                        {sd.title || <span style={{ color: 'rgba(26,54,93,0.3)', fontStyle: 'italic' }}>Untitled</span>}
                                      </span>
                                      {sd.composer && (
                                        <span style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.45)' }}>— {sd.composer}</span>
                                      )}
                                    </div>
                                  ))
                                  : (
                                    <div>
                                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy)' }}>{s.songs ?? 1}</span>
                                      <span style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.4)', marginLeft: 3 }}>song{(s.songs ?? 1) !== 1 ? 's' : ''}</span>
                                    </div>
                                  )
                                }
                              </div>
                            </td>
                            <td>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2d6a6a' }}>{hrsLogged}h</span>
                            </td>
                            <td>
                              {s.hours_approved
                                ? <span className="badge-approved" style={{ fontSize: '0.7rem' }}>✓ Approved</span>
                                : isPast
                                  ? <span className="badge-pending" style={{ fontSize: '0.7rem' }}>Pending</span>
                                  : <span style={{ fontSize: '0.72rem', color: 'rgba(26,54,93,0.35)', fontWeight: 500 }}>Upcoming</span>
                              }
                            </td>
                            <td>
                              <div className="flex gap-1.5">
                                {!s.hours_approved && isPast && (
                                  <button
                                    onClick={() => approveHours(s)}
                                    disabled={approvingHoursId === s.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                    style={{ background: 'rgba(100,200,150,0.15)', color: '#1a6a40', border: '1px solid rgba(100,200,150,0.3)', whiteSpace: 'nowrap' }}
                                  >
                                    {approvingHoursId === s.id
                                      ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                                      : <><Check size={11} /> Approve {hrsLogged}h</>
                                    }
                                  </button>
                                )}
                                <button
                                  onClick={() => removeSignup(s)}
                                  disabled={removingSignupId === s.id}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                                  style={{ background: 'rgba(220,80,80,0.08)', color: '#c4622a', border: 'none' }}
                                  title="Remove signup"
                                >
                                  {removingSignupId === s.id
                                    ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                                    : <Trash2 size={11} />
                                  }
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                      {signups.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'rgba(26,54,93,0.4)', padding: '2rem' }}>No sign-ups recorded yet.</td></tr>}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── ANNOUNCEMENTS TAB ── */}
            {tab === 'announcements' && (
              <div>
                <div className="mb-6">
                  <h2 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.3rem' }}>Announcements</h2>
                  <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.85rem' }}>Active announcements appear as a banner at the top of the Events page for all volunteers.</p>
                </div>

                {/* Compose new announcement */}
                <div className="glass-card p-6 mb-6" style={{ background: 'rgba(240,147,91,0.04)', border: '1px solid rgba(240,147,91,0.18)' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '0.85rem', color: 'var(--coral)', display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Megaphone size={15} /> Post a New Announcement
                  </h3>
                  <div className="flex gap-3">
                    <input
                      className="glass-input flex-1"
                      placeholder="e.g. Reminder: wear comfortable shoes to all performances!"
                      value={newAnnouncement}
                      onChange={e => setNewAnnouncement(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && postAnnouncement()}
                      maxLength={280}
                    />
                    <button
                      onClick={postAnnouncement}
                      disabled={postingAnn || !newAnnouncement.trim()}
                      className="btn-coral px-5 py-2 text-sm flex items-center gap-1.5"
                      style={{ borderRadius: '100px', flexShrink: 0, opacity: !newAnnouncement.trim() ? 0.5 : 1 }}
                    >
                      {postingAnn ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <><Plus size={13} /> Post</>}
                    </button>
                  </div>
                  {newAnnouncement.length > 0 && (
                    <p style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.4)', marginTop: '6px', textAlign: 'right' }}>{newAnnouncement.length}/280</p>
                  )}
                </div>

                {/* Announcements list */}
                {announcements.length === 0 ? (
                  <div className="glass-card p-12 text-center">
                    <Megaphone size={32} color="rgba(26,54,93,0.12)" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'rgba(26,54,93,0.4)', fontSize: '0.9rem' }}>No announcements yet. Post one above to show it on the Events page.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {announcements.map(ann => (
                      <div key={ann.id} className="glass-card p-5 flex items-start justify-between gap-4"
                        style={{ border: ann.is_active ? '1px solid rgba(240,147,91,0.25)' : '1px solid rgba(26,54,93,0.08)', opacity: ann.is_active ? 1 : 0.65 }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span style={{
                              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                              color: ann.is_active ? '#b25c00' : 'rgba(26,54,93,0.35)',
                              background: ann.is_active ? 'rgba(240,147,91,0.12)' : 'rgba(26,54,93,0.06)',
                              padding: '2px 8px', borderRadius: '100px'
                            }}>
                              {ann.is_active ? 'Live' : 'Hidden'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(26,54,93,0.4)' }}>
                              {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.92rem', color: 'rgba(26,54,93,0.8)', lineHeight: 1.55 }}>{ann.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => toggleAnnouncement(ann)}
                            disabled={togglingAnnId === ann.id}
                            title={ann.is_active ? 'Hide announcement' : 'Show announcement'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                            style={{ background: ann.is_active ? 'rgba(255,200,100,0.15)' : 'rgba(100,200,150,0.15)', color: ann.is_active ? '#8a6200' : '#1a6a40', border: ann.is_active ? '1px solid rgba(255,200,100,0.35)' : '1px solid rgba(100,200,150,0.3)' }}
                          >
                            {togglingAnnId === ann.id
                              ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                              : ann.is_active
                                ? <><ToggleRight size={13} /> Hide</>
                                : <><ToggleLeft size={13} /> Show</>
                            }
                          </button>
                          <button
                            onClick={() => deleteAnnouncement(ann.id)}
                            disabled={deletingAnnId === ann.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(220,80,80,0.08)', color: '#c4622a' }}
                          >
                            {deletingAnnId === ann.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={13} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* ── FACILITY INQUIRIES TAB ── */}
            {tab === 'inquiries' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Facility Inquiries ({inquiries.length})</h2>
                    <p style={{ color: 'rgba(26,54,93,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Partner facilities interested in hosting Melodies of Care performances.</p>
                  </div>
                </div>
                {inquiries.length === 0 ? (
                  <div className="glass-card p-16 text-center">
                    <Building2 size={36} color="rgba(26,54,93,0.12)" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'rgba(26,54,93,0.4)', fontSize: '0.9rem' }}>No facility inquiries yet.</p>
                    <p style={{ color: 'rgba(26,54,93,0.3)', fontSize: '0.82rem', marginTop: '0.4rem' }}>Submissions from the &quot;Partner With Us&quot; page will appear here.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {inquiries.map(inq => (
                      <div key={inq.id} className="glass-card p-6" style={{ border: '1px solid rgba(178,216,216,0.3)' }}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--navy)', marginBottom: '0.2rem' }}>{inq.facility_name}</h3>
                            <p style={{ fontSize: '0.82rem', color: 'rgba(26,54,93,0.55)' }}>
                              {new Date(inq.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                            <a
                              href={`mailto:${inq.email}?subject=${encodeURIComponent(`Re: Partnership Inquiry — ${inq.facility_name}`)}&body=${encodeURIComponent(`Hi ${inq.contact_name.split(' ')[0]},\n\nThank you for reaching out about hosting Melodies of Care at ${inq.facility_name}! We'd love to discuss bringing live music to your residents.\n\n`)}`}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold"
                              style={{ background: 'rgba(240,147,91,0.12)', color: 'var(--coral)', border: '1px solid rgba(240,147,91,0.25)', textDecoration: 'none' }}
                            >
                              <Mail size={11} /> Reply
                            </a>
                            <button
                              onClick={() => deleteInquiry(inq.id, inq.facility_name)}
                              disabled={deletingInquiryId === inq.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                              style={{ background: 'rgba(220,60,60,0.08)', color: '#c03030', border: '1px solid rgba(220,60,60,0.2)', cursor: 'pointer', opacity: deletingInquiryId === inq.id ? 0.5 : 1 }}
                            >
                              {deletingInquiryId === inq.id ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={11} />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(178,216,216,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Users size={13} color="#2d6a6a" />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(26,54,93,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Contact</div>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--navy)' }}>{inq.contact_name}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(178,216,216,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Mail size={13} color="#2d6a6a" />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(26,54,93,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Email</div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--navy)' }}>{inq.email}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(178,216,216,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Phone size={13} color="#2d6a6a" />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.7rem', color: 'rgba(26,54,93,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Phone</div>
                              <div style={{ fontSize: '0.82rem', color: 'var(--navy)' }}>{inq.phone || '—'}</div>
                            </div>
                          </div>
                        </div>
                        {inq.city && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.6rem' }}>
                            <MapPin size={12} color="rgba(26,54,93,0.4)" />
                            <span style={{ fontSize: '0.82rem', color: 'rgba(26,54,93,0.55)' }}>{inq.city}</span>
                          </div>
                        )}
                        {inq.message && (
                          <div style={{ background: 'rgba(26,54,93,0.03)', borderRadius: 10, padding: '0.75rem 1rem', border: '1px solid rgba(26,54,93,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: '0.4rem' }}>
                              <MessageSquare size={11} color="rgba(26,54,93,0.4)" />
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(26,54,93,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Message</span>
                            </div>
                            <p style={{ fontSize: '0.88rem', color: 'rgba(26,54,93,0.75)', lineHeight: 1.6 }}>{inq.message}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* ── GALLERY TAB ── */}
            {tab === 'gallery' && (
              <GalleryTab items={galleryItems} setItems={setGalleryItems} />
            )}

            {/* ── TEAM TAB ── */}
            {tab === 'team' && (
              <TeamTab members={teamMembers} setMembers={setTeamMembers} />
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

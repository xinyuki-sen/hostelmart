'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { compressImage } from '@/lib/compression';

export default function SellPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('room_essentials');
  const [condition, setCondition] = useState<'Like New' | 'Gently Used' | 'Well Used'>('Gently Used');
  const [price, setPrice] = useState<number | string>(450);
  const [hostelBlock, setHostelBlock] = useState('Block B');
  const [roomNumber, setRoomNumber] = useState('304');
  const [description, setDescription] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"
  ]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsCompressing(true);

    try {
      const files = Array.from(e.target.files);
      for (const file of files) {
        if (photos.length >= 4) {
          showToast('Maximum 4 photos allowed per listing.');
          break;
        }
        // Client-side silent compression
        const compressedBlob = await compressImage(file, { maxWidth: 1200, quality: 0.75 });
        const localPreviewUrl = URL.createObjectURL(compressedBlob);
        setPhotos(prev => [...prev, localPreviewUrl]);
      }
      showToast('⚡ Photos compressed silently (10MB ➔ ~120KB WebP)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Photo upload failed';
      showToast(message);
    } finally {
      setIsCompressing(false);
    }
  };

  const removePhoto = (index: number) => {
    if (photos.length <= 1) {
      showToast('At least 1 photo is required.');
      return;
    }
    setPhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('🚀 Listing submitted! Sent to AdminA for approval.');
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Post an Item for Sale</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 2 }}>Hand-to-hand hostel corridor deals with zero shipping</p>
          </div>
          <Link href="/" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            ✕ Cancel
          </Link>
        </div>

        <div className="modal-card" style={{ maxWidth: '100%' }}>
          <form onSubmit={handleSubmit}>
            
            {/* Step 1: Photos with Live Thumbnail Grid */}
            <div className="form-group">
              <label className="form-label">Item Photos (Min 1, Max 4)</label>
              <label style={{ border: '2px dashed var(--border-subtle)', padding: 18, borderRadius: 'var(--radius-sm)', textAlign: 'center', background: 'var(--bg-card)', cursor: 'pointer', display: 'block' }}>
                <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>📷</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Tap to Select Phone Photos</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  {isCompressing ? '⚡ Silently compressing photos...' : 'Supports high-res camera photos up to 10MB'}
                </div>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                />
              </label>

              {/* Thumbnails */}
              <div className="thumbnail-preview-grid">
                {photos.map((url, idx) => (
                  <div key={idx} className="thumb-preview-item">
                    <img src={url} className="thumb-preview-img" alt={`Upload ${idx + 1}`} />
                    {idx === 0 && <div className="thumb-cover-tag">Cover</div>}
                    <button type="button" className="thumb-delete-btn" onClick={() => removePhoto(idx)}>&times;</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Info */}
            <div className="form-group">
              <label className="form-label">Item Title</label>
              <input 
                type="text" 
                className="form-input" 
                required 
                placeholder="e.g. Havells 1.2L Electric Kettle" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="room_essentials">🛏️ Room Essentials</option>
                  <option value="electronics">⚡ Electronics</option>
                  <option value="books_academics">📚 Books & Notes</option>
                  <option value="mobility_fitness">🚲 Cycles & Fitness</option>
                  <option value="clothing_fashion">👕 Clothing & Gear</option>
                  <option value="other">📦 Miscellaneous</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Condition</label>
                <select className="form-select" value={condition} onChange={(e) => setCondition(e.target.value as 'Like New' | 'Gently Used' | 'Well Used')}>
                  <option value="Like New">Like New</option>
                  <option value="Gently Used">Gently Used</option>
                  <option value="Well Used">Well Used</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₹) <span style={{ color: '#34d399', fontWeight: 400 }}>(Enter 0 for Free Giveaway)</span></label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  min="0"
                  placeholder="₹" 
                  value={price} 
                  onChange={(e) => setPrice(Number(e.target.value))} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hostel Block & Room</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1 }}
                    value={hostelBlock} 
                    onChange={(e) => setHostelBlock(e.target.value)} 
                    placeholder="Block B" 
                  />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ width: 80 }}
                    value={roomNumber} 
                    onChange={(e) => setRoomNumber(e.target.value)} 
                    placeholder="304" 
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea 
                className="form-textarea" 
                rows={3} 
                placeholder="Mention branch/semester, accessories included, or reason for selling..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              <div className="toggle-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Allow Price Bargaining?</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Displays "Negotiable" badge to buyers</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={isNegotiable} 
                  onChange={(e) => setIsNegotiable(e.target.checked)} 
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>

              <div className="toggle-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f87171' }}>🔥 Urgent: Moving Out in 48h?</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Highlights card with clearance ribbon for rapid sale</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={isUrgent} 
                  onChange={(e) => setIsUrgent(e.target.checked)} 
                  style={{ width: 18, height: 18, cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Link href="/" className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </Link>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                🚀 Submit for Admin Approval
              </button>
            </div>
          </form>
        </div>

        {toastMsg && (
          <div className="toast show" style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--accent-blue)', padding: '10px 20px', borderRadius: 9999, zIndex: 3000, fontWeight: 600, fontSize: '0.85rem' }}>
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}

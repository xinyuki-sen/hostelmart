'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Listing } from '@/types';
import { buildWhatsAppLink } from '@/lib/whatsapp';

interface ProductDetailModalProps {
  item: Listing;
  currentUser: { username: string; role?: string } | null;
  onClose: () => void;
}

export default function ProductDetailModal({ item, currentUser, onClose }: ProductDetailModalProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const images = item.images && item.images.length > 0 ? item.images : [];
  const activeImg = images[carouselIndex] || images[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80';
  const isOwner = currentUser && item.sellerName.trim().toLowerCase() === currentUser.username.trim().toLowerCase();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card product-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ padding: '16px 20px', marginBottom: 0 }}>
          <div>
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              {item.category.replace('_', ' ').toUpperCase()}
            </span>
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', marginLeft: 6 }}>
              {item.condition}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="detail-carousel-wrap">
          <img 
            src={activeImg} 
            className="detail-carousel-img" 
            alt={item.title} 
          />
          {images.length > 1 && (
            <>
              <button 
                className="carousel-btn prev"
                onClick={() => setCarouselIndex((carouselIndex - 1 + images.length) % images.length)}
              >
                &#10094;
              </button>
              <button 
                className="carousel-btn next"
                onClick={() => setCarouselIndex((carouselIndex + 1) % images.length)}
              >
                &#10095;
              </button>
              <div className="detail-dots-row">
                {images.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`detail-dot ${idx === carouselIndex ? 'active' : ''}`}
                    onClick={() => setCarouselIndex(idx)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="detail-content-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
              {item.title}
            </h2>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: item.price === 0 ? '#34d399' : 'var(--text-main)', whiteSpace: 'nowrap', marginLeft: 14 }}>
              {item.price === 0 ? 'FREE' : `₹${item.price.toLocaleString()}`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {item.isUrgent && (
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                🔥 48h Move-Out Clearance
              </span>
            )}
            <span className={`badge ${item.isNegotiable ? 'badge-negotiable' : 'badge-fixed'}`}>
              {item.isNegotiable ? 'Negotiable' : 'Fixed Price'}
            </span>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
            {item.description}
          </div>

          <div className="detail-seller-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                👤
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {item.sellerName}
                  </span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                    Verified Resident 🟢
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  {item.hostelBlock} • Room {item.roomNumber}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Reputation</div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24' }}>⚡ 3 Deals Done</div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            {isOwner ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '10px 14px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 8, color: '#93c5fd', fontSize: '0.85rem', textAlign: 'center' }}>
                  📦 <strong>This is your listing</strong> (Interested buyers will contact your WhatsApp)
                </div>
                <Link 
                  href="/my-ads" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: 12, textAlign: 'center', fontSize: '0.9rem' }}
                >
                  ⚙️ Manage in &ldquo;My Listed Ads&rdquo; →
                </Link>
              </div>
            ) : (
              <a 
                href={buildWhatsAppLink({
                  phone: item.sellerPhone,
                  title: item.title,
                  price: item.price,
                  isNegotiable: item.isNegotiable,
                  hostelBlock: item.hostelBlock,
                  roomNumber: item.roomNumber
                })}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-whatsapp" 
                style={{ width: '100%', padding: 13, fontSize: '0.95rem' }}
              >
                <span>💬 Bargain / Contact on WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

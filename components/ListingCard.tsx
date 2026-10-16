'use client';

import React from 'react';
import type { Listing } from '@/types';

interface ListingCardProps {
  item: Listing;
  onSelect: (item: Listing) => void;
  onToggleHeart: (id: string, e: React.MouseEvent) => void;
}

export default function ListingCard({ item, onSelect, onToggleHeart }: ListingCardProps) {
  const isFree = item.price === 0;
  const isSold = item.status === 'sold';
  const coverImg = item.images && item.images.length > 0 
    ? item.images[0] 
    : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80';

  return (
    <div 
      className="chrono-card"
      style={{ opacity: isSold ? 0.65 : 1 }}
      onClick={() => onSelect(item)}
    >
      <div className="chrono-card-img-wrap">
        {item.isUrgent && <div className="urgent-banner">🔥 48h MOVING OUT CLEARANCE</div>}
        <img src={coverImg} className="chrono-card-img" alt={item.title} />
        
        <div className="photo-count-badge">📷 {item.images ? item.images.length : 1}</div>
        
        <button 
          className={`card-heart-btn ${item.isLiked ? 'liked' : ''}`}
          onClick={(e) => onToggleHeart(item.id, e)}
          title={item.isLiked ? 'Remove from Saved' : 'Save Item'}
        >
          {item.isLiked ? '❤️' : '🤍'}
        </button>

        <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 6 }}>
          {isSold ? (
            <span className="badge badge-sold">SOLD ✓</span>
          ) : isFree ? (
            <span className="badge badge-free">FREE 🎁</span>
          ) : (
            <span className={`badge ${item.isNegotiable ? 'badge-negotiable' : 'badge-fixed'}`}>
              {item.isNegotiable ? 'Negotiable' : 'Fixed'}
            </span>
          )}
        </div>
      </div>

      <div className="chrono-card-body">
        <div className="card-price-row">
          <div className={`item-price ${isFree ? 'price-free' : ''}`}>
            {isFree ? 'FREE' : `₹${item.price.toLocaleString()}`}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{item.condition}</span>
        </div>

        <div className="card-title" title={item.title}>{item.title}</div>

        <div className="card-footer-meta">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>📍</span>
            <span style={{ fontWeight: 600 }}>{item.hostelBlock}</span>
            <span>•</span>
            <span style={{ color: 'var(--text-dim)' }}>Rm {item.roomNumber}</span>
          </div>
          <span>{item.timeAgo || 'Recent'}</span>
        </div>
      </div>
    </div>
  );
}

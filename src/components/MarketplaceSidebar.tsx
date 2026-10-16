'use client';

import React from 'react';
import Link from 'next/link';

interface MarketplaceSidebarProps {
  mode: 'market' | 'iso';
  setMode: (mode: 'market' | 'iso') => void;
  myAdsCount: number;
  user: {
    username: string;
    role: 'user' | 'admin';
    hostelBlock?: string;
    roomNumber?: string;
  } | null;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export default function MarketplaceSidebar({
  mode,
  setMode,
  myAdsCount,
  user,
  onOpenProfile,
  onLogout
}: MarketplaceSidebarProps) {
  return (
    <aside className="chrono-sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-logo-wrap">
          <div className="brand-badge-icon">⚡</div>
          <span className="brand-title">HostelMart</span>
        </div>
        <div className="campus-badge">
          <span className="campus-badge-dot"></span>
          <span>CAMPUS CORRIDOR P2P</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="chrono-nav">
        <button 
          className={`chrono-nav-btn ${mode === 'market' ? 'active' : ''}`}
          onClick={() => setMode('market')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🛍️</span>
            <span>Marketplace Feed</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 9999, background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd' }}>LIVE</span>
        </button>

        <button 
          className={`chrono-nav-btn ${mode === 'iso' ? 'active' : ''}`}
          onClick={() => setMode('iso')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>🔍</span>
            <span>Looking For (ISO)</span>
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 9999, background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe' }}>NEW</span>
        </button>

        <Link href="/my-ads" className="chrono-nav-btn">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>📦</span>
            <span>My Listed Ads</span>
          </div>
          <span style={{ 
            fontSize: 11, 
            fontWeight: 700,
            padding: myAdsCount > 0 ? '1px 7px' : '0',
            borderRadius: 9999,
            background: myAdsCount > 0 ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: myAdsCount > 0 ? '#60a5fa' : 'var(--text-dim)' 
          }}>
            {user ? myAdsCount : 0}
          </span>
        </Link>

        <div className="nav-section-title">Hostel Wings</div>
        <div className="wing-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="status-dot" style={{ backgroundColor: '#3b82f6' }}></span>
            <span>Block B (Main Boys)</span>
          </div>
          <span style={{ fontSize: 10, color: '#10b981' }}>Active</span>
        </div>
        <div className="wing-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="status-dot" style={{ backgroundColor: '#f97316' }}></span>
            <span>Block A (Seniors)</span>
          </div>
          <span style={{ fontSize: 10, color: '#10b981' }}>Active</span>
        </div>
      </nav>

      {/* Sidebar Footer with Active Persona & Login / Logout */}
      <div className="sidebar-footer">
        <div className="live-indicator-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="ping-wrapper">
              <span className="ping-animate"></span>
              <span className="ping-core"></span>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#cbd5e1' }}>Campus Gateway</span>
          </div>
          <span style={{ color: '#64748b', fontSize: 10 }}>Synced</span>
        </div>

        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  👤 <strong>{user.username}</strong> ({user.role === 'admin' ? 'Admin' : 'Student'})
                </div>
                <button 
                  onClick={onLogout} 
                  style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                >
                  Logout
                </button>
              </div>
              {user.role !== 'admin' && (
                <button
                  onClick={onOpenProfile}
                  style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#60a5fa', borderRadius: 4, padding: '4px 8px', fontSize: 10, cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                >
                  <span>⚙️</span>
                  <span>Edit Room ({user.hostelBlock || 'Block B'} • {user.roomNumber || '101'})</span>
                </button>
              )}
            </div>
          ) : (
            <Link 
              href="/login" 
              style={{ fontSize: 11, color: '#60a5fa', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span>🔑 Sign In / Register</span>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

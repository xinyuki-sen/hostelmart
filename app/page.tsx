'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Listing, ISORequest } from '@/types';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { 
  getStoredListings, 
  getStoredISORequests, 
  createISORequest,
  subscribeToStore,
  SEED_LISTINGS,
  SEED_ISO 
} from '@/lib/dataStore';

const INITIAL_LISTINGS: Listing[] = SEED_LISTINGS;
const INITIAL_ISO: ISORequest[] = SEED_ISO;

interface UserState {
  username: string;
  role: 'user' | 'admin';
  hostelBlock?: string;
  roomNumber?: string;
}

export default function HomePage() {
  const [user, setUser] = useState<UserState | null>(null);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [isoRequests, setIsoRequests] = useState<ISORequest[]>(INITIAL_ISO);
  const [mode, setMode] = useState<'market' | 'iso'>('market');
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [carouselIndex, setCarouselIndex] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ISO Form State
  const [showIsoModal, setShowIsoModal] = useState(false);
  const [isoTitle, setIsoTitle] = useState('');
  const [isoBudget, setIsoBudget] = useState('300');
  const [isoUrgency, setIsoUrgency] = useState('Tonight before 10 PM');

  const loadData = useCallback(async () => {
    const [l, iso] = await Promise.all([
      getStoredListings(),
      getStoredISORequests()
    ]);
    setListings(l);
    setIsoRequests(iso);
  }, []);

  // Check login state and live data subscription
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hostelmart_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // ignore
    }

    loadData();
    const unsubscribe = subscribeToStore(() => {
      loadData();
    });

    return () => unsubscribe();
  }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem('hostelmart_user');
    setUser(null);
    showToast('Signed out successfully.');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleCreateIso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isoTitle.trim()) {
      showToast('Please enter the item you need.');
      return;
    }
    await createISORequest({
      title: isoTitle.trim(),
      budget: Number(isoBudget) || 0,
      location: `${user?.hostelBlock || 'Block B'}, Rm ${user?.roomNumber || '304'}`,
      urgency: isoUrgency.trim() || 'Urgent',
      requesterName: user?.username || 'rahul_k',
      requesterPhone: '9876543210'
    });
    showToast('🎉 Wanted request posted live to ISO Board!');
    setShowIsoModal(false);
    setIsoTitle('');
  };

  const toggleHeart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setListings(prev => prev.map(item => {
      if (item.id === id) {
        const nextLiked = !item.isLiked;
        showToast(nextLiked ? '❤️ Added to Saved Items' : 'Removed from Saved Items');
        return { ...item, isLiked: nextLiked };
      }
      return item;
    }));
  };

  const filteredListings = listings.filter(item => {
    if (item.status !== 'active' && item.status !== 'sold') return false;
    
    if (category === 'free' && item.price !== 0) return false;
    if (category === 'under500' && (item.price === 0 || item.price > 500)) return false;
    if (category !== 'all' && category !== 'free' && category !== 'under500' && item.category !== category) return false;

    const query = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(query) || item.hostelBlock.toLowerCase().includes(query);
  });

  if (sortOption === 'price_asc') {
    filteredListings.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price_desc') {
    filteredListings.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="chrono-layout">
      {/* 1. Left Sidebar */}
      <aside className="chrono-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
              ⚡
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>HostelMart</span>
                <span className="brand-badge">v2.1</span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)' }}>Hostel P2P Exchange</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          <button 
            className={`chrono-nav-btn ${mode === 'market' ? 'active' : ''}`}
            onClick={() => setMode('market')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>🏠</span>
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
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>2</span>
          </Link>

          {/* ADMIN LINK: ONLY VISIBLE IF LOGGED IN AS ADMIN! NEVER VISIBLE TO STUDENTS! */}
          {user?.role === 'admin' && (
            <div style={{ marginTop: 8, padding: '8px 4px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.25)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f87171', padding: '0 8px 4px 8px', textTransform: 'uppercase' }}>🛡️ Supervisor Only</div>
              <Link href="/admin" className="chrono-nav-btn" style={{ color: '#fca5a5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>📊</span>
                  <span>Supervisor Hub</span>
                </div>
              </Link>
            </div>
          )}

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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  👤 <strong>{user.username}</strong> ({user.role === 'admin' ? 'Admin' : 'Student'})
                </div>
                <button 
                  onClick={handleLogout} 
                  style={{ background: 'none', border: 'none', color: '#f87171', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                >
                  Logout
                </button>
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

      {/* 2. Main Content Feed */}
      <main className="chrono-main">
        <div className="feed-header">
          <div>
            <h1 className="feed-title">{mode === 'market' ? 'Campus Marketplace' : 'Looking For (Wanted Board)'}</h1>
            <p className="feed-subtitle">
              {mode === 'market' 
                ? 'Tap any item to view photos, condition & direct WhatsApp contact' 
                : 'Items requested by hostel residents. Have one? Contact them directly!'}
            </p>
          </div>
          {mode === 'market' ? (
            <Link href="/sell" className="btn btn-primary">
              <span>➕ Post an Item</span>
            </Link>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowIsoModal(true)}>
              <span>➕ Post Wanted Request</span>
            </button>
          )}
        </div>

        {/* Mode Switcher Tabs */}
        <div className="market-mode-tabs">
          <button 
            className={`market-mode-btn ${mode === 'market' ? 'active' : ''}`}
            onClick={() => setMode('market')}
          >
            📦 Items For Sale
          </button>
          <button 
            className={`market-mode-btn ${mode === 'iso' ? 'active' : ''}`}
            onClick={() => setMode('iso')}
          >
            🔍 Looking For / Wanted
          </button>
        </div>

        {/* Controls: Search & Sort */}
        <div className="controls-row">
          <div className="search-input-wrap">
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search kettles, cycles, drawing kits, table fans..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '11px 16px 11px 40px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontSize: '0.88rem', outline: 'none' }}
            />
          </div>

          {mode === 'market' && (
            <select 
              className="sort-select" 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">✨ Newest First</option>
              <option value="price_asc">💰 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
            </select>
          )}
        </div>

        {/* Category Filter Pills (Market Mode) */}
        {mode === 'market' && (
          <div className="chrono-filter-row">
            <button className={`chrono-pill ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>🔥 All</button>
            <button className={`chrono-pill pill-karma ${category === 'free' ? 'active' : ''}`} onClick={() => setCategory('free')}>🎁 Free Stuff (₹0)</button>
            <button className={`chrono-pill ${category === 'under500' ? 'active' : ''}`} onClick={() => setCategory('under500')}>⚡ Under ₹500</button>
            <button className={`chrono-pill ${category === 'room_essentials' ? 'active' : ''}`} onClick={() => setCategory('room_essentials')}>🛏️ Room Essentials</button>
            <button className={`chrono-pill ${category === 'electronics' ? 'active' : ''}`} onClick={() => setCategory('electronics')}>⚡ Electronics</button>
            <button className={`chrono-pill ${category === 'books_academics' ? 'active' : ''}`} onClick={() => setCategory('books_academics')}>📚 Books</button>
            <button className={`chrono-pill ${category === 'mobility_fitness' ? 'active' : ''}`} onClick={() => setCategory('mobility_fitness')}>🚲 Cycles</button>
          </div>
        )}

        {/* Listings Grid (Natural 4:3 Ratio, Tap-to-View) */}
        {mode === 'market' ? (
          <div className="chrono-grid">
            {filteredListings.map(item => {
              const isFree = item.price === 0;
              const isSold = item.status === 'sold';
              const coverImg = item.images && item.images.length > 0 ? item.images[0] : '';

              return (
                <div 
                  key={item.id} 
                  className="chrono-card"
                  style={{ opacity: isSold ? 0.65 : 1 }}
                  onClick={() => {
                    setSelectedListing(item);
                    setCarouselIndex(0);
                  }}
                >
                  <div className="chrono-card-img-wrap">
                    {item.isUrgent && <div className="urgent-banner">🔥 48h MOVING OUT CLEARANCE</div>}
                    <img src={coverImg} className="chrono-card-img" alt={item.title} />
                    
                    <div className="photo-count-badge">📷 {item.images ? item.images.length : 1}</div>
                    
                    <button 
                      className={`card-heart-btn ${item.isLiked ? 'liked' : ''}`}
                      onClick={(e) => toggleHeart(item.id, e)}
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

                    <div className="card-meta-line">
                      <span>📍 {item.hostelBlock} • Rm {item.roomNumber}</span>
                      <span>•</span>
                      <span>{item.timeAgo}</span>
                    </div>

                    <div className="card-tap-hint">
                      <span>Verified resident</span>
                      <span style={{ color: '#60a5fa', fontWeight: 600 }}>View Details →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Looking For (ISO) Grid */
          <div className="chrono-grid">
            {isoRequests.map(req => {
              const waLink = `https://wa.me/91${req.requesterPhone}?text=${encodeURIComponent(
                `Hey! I saw your request for "${req.title}" on HostelMart.\nI have one available in ${req.location}! Let's connect.`
              )}`;

              return (
                <div key={req.id} className="chrono-card" style={{ cursor: 'default' }}>
                  <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>WANTED</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{req.createdAt}</span>
                    </div>

                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{req.title}</div>
                    
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'var(--bg-surface-elevated)', padding: '8px 12px', borderRadius: 6 }}>
                      ⏰ <strong>Needed by:</strong> {req.urgency}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Budget:</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>₹{req.budget}</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>📍 Requested by: {req.requesterName} ({req.location})</div>

                    <div style={{ marginTop: 'auto', paddingTop: 10 }}>
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp" style={{ width: '100%' }}>
                        <span>💬 I Have This! Message</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 3. Right Sidebar */}
      <aside className="chrono-right-drawer">
        <div className="insights-box">
          <div className="insights-header">
            <span>🔥 Campus Trends</span>
          </div>
          <div className="trending-item">
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Electric Kettles</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Avg sell time: 4 hours</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>High</span>
          </div>
          <div className="trending-item">
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Scientific Calculators</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>2 students looking</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>Wanted</span>
          </div>
          <div className="trending-item">
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Mountain Bicycles</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Active trades</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#60a5fa' }}>Active</span>
          </div>
        </div>

        <div className="insights-box" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#34d399', marginBottom: 6 }}>🎁 Hostel Karma</div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Moving out or switching rooms? Post unwanted items for <strong>₹0 (Free)</strong>. Help your juniors and keep useful items out of the trash!
          </p>
        </div>

        <div className="insights-box" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 6 }}>🛡️ Safe Trading</div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45 }}>
            All sellers are registered hostel residents. Meet in common rooms or room corridors to inspect the physical item before making UPI payment.
          </p>
        </div>
      </aside>

      {/* PRODUCT DETAIL MODAL (TAP TO VIEW) */}
      {selectedListing && (
        <div className="modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="modal-card product-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '16px 20px', marginBottom: 0 }}>
              <div>
                <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  {selectedListing.category.replace('_', ' ').toUpperCase()}
                </span>
                <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', marginLeft: 6 }}>
                  {selectedListing.condition}
                </span>
              </div>
              <button className="modal-close" onClick={() => setSelectedListing(null)}>&times;</button>
            </div>

            <div className="detail-carousel-wrap">
              <img 
                src={selectedListing.images[carouselIndex] || ''} 
                className="detail-carousel-img" 
                alt={selectedListing.title} 
              />
              {selectedListing.images.length > 1 && (
                <>
                  <button 
                    className="carousel-btn prev"
                    onClick={() => setCarouselIndex((carouselIndex - 1 + selectedListing.images.length) % selectedListing.images.length)}
                  >
                    &#10094;
                  </button>
                  <button 
                    className="carousel-btn next"
                    onClick={() => setCarouselIndex((carouselIndex + 1) % selectedListing.images.length)}
                  >
                    &#10095;
                  </button>
                  <div className="detail-dots-row">
                    {selectedListing.images.map((_, idx) => (
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
                  {selectedListing.title}
                </h2>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: selectedListing.price === 0 ? '#34d399' : 'var(--text-main)', whiteSpace: 'nowrap', marginLeft: 14 }}>
                  {selectedListing.price === 0 ? 'FREE' : `₹${selectedListing.price.toLocaleString()}`}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {selectedListing.isUrgent && (
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    🔥 48h Move-Out Clearance
                  </span>
                )}
                <span className={`badge ${selectedListing.isNegotiable ? 'badge-negotiable' : 'badge-fixed'}`}>
                  {selectedListing.isNegotiable ? 'Negotiable' : 'Fixed Price'}
                </span>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                {selectedListing.description}
              </div>

              <div className="detail-seller-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    👤
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        {selectedListing.sellerName}
                      </span>
                      <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                        Verified Resident 🟢
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      {selectedListing.hostelBlock} • Room {selectedListing.roomNumber}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Reputation</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24' }}>⚡ 3 Deals Done</div>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <a 
                  href={buildWhatsAppLink({
                    phone: selectedListing.sellerPhone,
                    title: selectedListing.title,
                    price: selectedListing.price,
                    isNegotiable: selectedListing.isNegotiable,
                    hostelBlock: selectedListing.hostelBlock,
                    roomNumber: selectedListing.roomNumber
                  })}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-whatsapp" 
                  style={{ width: '100%', padding: 13, fontSize: '0.95rem' }}
                >
                  <span>💬 Bargain / Contact on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISO REQUEST CREATION MODAL */}
      {showIsoModal && (
        <div className="modal-overlay" onClick={() => setShowIsoModal(false)}>
          <div className="modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>🔍 Post Wanted (ISO) Request</h2>
              <button className="modal-close" onClick={() => setShowIsoModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateIso} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              <div className="form-group">
                <label className="form-label">Item Needed</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Casio fx-991EX Calculator or Table Fan" 
                  value={isoTitle} 
                  onChange={(e) => setIsoTitle(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Budget Willing to Pay (₹)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  min="0" 
                  placeholder="₹" 
                  value={isoBudget} 
                  onChange={(e) => setIsoBudget(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Urgency / Timeline</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. Tonight before 10 PM (Exam tomorrow)" 
                  value={isoUrgency} 
                  onChange={(e) => setIsoUrgency(e.target.value)} 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: 12, marginTop: 8 }}>
                🚀 Post to Wanted Board
              </button>
            </form>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="toast show" style={{ position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--accent-blue)', padding: '10px 20px', borderRadius: 9999, zIndex: 3000, fontWeight: 600, fontSize: '0.85rem' }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}

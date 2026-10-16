'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Listing, ISORequest } from '@/types';
import { 
  getStoredListings, 
  getStoredISORequests, 
  deleteISORequest,
  getSavedItemLikes,
  toggleItemLike,
  subscribeToStore,
  SEED_LISTINGS,
  SEED_ISO 
} from '@/lib/dataStore';
import {
  ListingCard,
  ProductDetailModal,
  ProfileModal,
  ISOModal,
  MarketplaceSidebar
} from '@/components';

const INITIAL_LISTINGS: Listing[] = SEED_LISTINGS;
const INITIAL_ISO: ISORequest[] = SEED_ISO;

interface UserState {
  username: string;
  role: 'user' | 'admin';
  phone?: string;
  hostelBlock?: string;
  roomNumber?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);
  const [listings, setListings] = useState<Listing[]>(INITIAL_LISTINGS);
  const [isoRequests, setIsoRequests] = useState<ISORequest[]>(INITIAL_ISO);
  const [mode, setMode] = useState<'market' | 'iso'>('market');
  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showIsoModal, setShowIsoModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [l, iso] = await Promise.all([
      getStoredListings(),
      getStoredISORequests()
    ]);
    const likes = getSavedItemLikes();
    setListings(l.map(item => ({ ...item, isLiked: likes.has(item.id) })));
    setIsoRequests(iso);
  }, []);

  // Check login state and live data subscription
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hostelmart_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === 'admin') {
          router.replace('/admin');
          return;
        }
        setUser(u);
      }
    } catch {
      // ignore
    }

    loadData();
    const unsubscribe = subscribeToStore(() => {
      loadData();
    });

    return () => unsubscribe();
  }, [loadData, router]);

  const handleLogout = () => {
    localStorage.removeItem('hostelmart_user');
    setUser(null);
    showToast('Signed out successfully.');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleDeleteIso = async (id: string) => {
    if (confirm('Are you sure you want to remove this wanted request?')) {
      await deleteISORequest(id);
      showToast('Wanted request removed.');
      loadData();
    }
  };

  const toggleHeart = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isNowLiked = toggleItemLike(id);
    showToast(isNowLiked ? '❤️ Added to Saved Items' : 'Removed from Saved Items');
    setListings(prev => prev.map(item => item.id === id ? { ...item, isLiked: isNowLiked } : item));
  };

  const filteredListings = listings.filter(item => {
    if (item.status !== 'active' && item.status !== 'sold') return false;
    
    if (category === 'free' && item.price !== 0) return false;
    if (category === 'under500' && (item.price === 0 || item.price > 500)) return false;
    if (category !== 'all' && category !== 'free' && category !== 'under500' && item.category !== category) return false;

    const query = searchQuery.toLowerCase();
    return item.title.toLowerCase().includes(query) || item.hostelBlock.toLowerCase().includes(query);
  }).sort((a, b) => {
    if (sortOption === 'price_asc') return a.price - b.price;
    if (sortOption === 'price_desc') return b.price - a.price;
    return 0;
  });

  const activeMarketListings = listings.filter(i => i.status === 'active');
  const myAdsCount = user 
    ? listings.filter(i => i.sellerName?.trim().toLowerCase() === user.username.trim().toLowerCase()).length 
    : 0;

  return (
    <div className="chrono-layout">
      {/* 1. Left Sidebar Navigation */}
      <MarketplaceSidebar
        mode={mode}
        setMode={setMode}
        myAdsCount={myAdsCount}
        user={user}
        onOpenProfile={() => setShowProfileModal(true)}
        onLogout={handleLogout}
      />

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

        {/* Global Search and Sort Toolbar */}
        <div className="search-bar-row">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              className="search-input" 
              placeholder={mode === 'market' ? "Search cycles, calculators, mattresses, books, or wings..." : "Search items students are looking for..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 12, background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 14 }}
              >
                ✕
              </button>
            )}
          </div>
          {mode === 'market' && (
            <select className="sort-select" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="newest">🕒 Recently Listed</option>
              <option value="price_asc">💰 Price: Low to High</option>
              <option value="price_desc">💎 Price: High to Low</option>
            </select>
          )}
        </div>

        {/* Category Filter Pills (Market Mode only) */}
        {mode === 'market' && (
          <div className="chrono-pill-row">
            <button className={`chrono-pill ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>🔥 All</button>
            <button className={`chrono-pill pill-karma ${category === 'free' ? 'active' : ''}`} onClick={() => setCategory('free')}>🎁 Free Stuff (₹0)</button>
            <button className={`chrono-pill ${category === 'under500' ? 'active' : ''}`} onClick={() => setCategory('under500')}>⚡ Under ₹500</button>
            <button className={`chrono-pill ${category === 'room_essentials' ? 'active' : ''}`} onClick={() => setCategory('room_essentials')}>🛏️ Room Essentials</button>
            <button className={`chrono-pill ${category === 'electronics' ? 'active' : ''}`} onClick={() => setCategory('electronics')}>⚡ Electronics</button>
            <button className={`chrono-pill ${category === 'books_academics' ? 'active' : ''}`} onClick={() => setCategory('books_academics')}>📚 Books</button>
            <button className={`chrono-pill ${category === 'mobility_fitness' ? 'active' : ''}`} onClick={() => setCategory('mobility_fitness')}>🚲 Cycles</button>
          </div>
        )}

        {/* Listings Grid (Market Mode) */}
        {mode === 'market' ? (
          filteredListings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)', margin: '16px 0' }}>
              <div style={{ fontSize: '3.2rem', marginBottom: 12 }}>📦</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>
                {searchQuery || category !== 'all' ? 'No Matching Items' : 'No Items Listed on Campus Yet'}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', maxWidth: 440, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
                {searchQuery || category !== 'all' 
                  ? 'No items match your active search or category filters. Try clearing your filters or search keywords.'
                  : 'Be the first student to post an item for sale or give away room essentials to juniors!'}
              </p>
              <Link href="/sell" className="btn btn-primary" style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span>⚡</span>
                <span>Post the First Item</span>
              </Link>
            </div>
          ) : (
            <div className="chrono-grid">
              {filteredListings.map(item => (
                <ListingCard
                  key={item.id}
                  item={item}
                  onSelect={setSelectedListing}
                  onToggleHeart={toggleHeart}
                />
              ))}
            </div>
          )
        ) : (
          /* Looking For / ISO Board Feed */
          <div className="iso-feed-wrap">
            {isoRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 6 }}>No Wanted Requests Right Now</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', maxWidth: 420, margin: '0 auto 20px auto' }}>
                  Looking for a specific item? Post a request with your budget and hostel block.
                </p>
                <button className="btn btn-primary" onClick={() => setShowIsoModal(true)}>
                  ➕ Post Wanted Request
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {isoRequests.map(req => {
                  const isOwner = Boolean(user && req.requesterName && req.requesterName.trim().toLowerCase() === user.username.trim().toLowerCase());
                  const cleanPhone = (req.requesterPhone || '9876543210').replace(/\D/g, '').replace(/^0+/, '');
                  const fullPhone = cleanPhone.startsWith('91') && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone}`;
                  const waText = encodeURIComponent(`Hey! I saw your Wanted request on HostelMart for *${req.title}*. I have one available in my hostel room!`);

                  return (
                    <div key={req.id} className="iso-card">
                      <div className="iso-badge-row">
                        <span className="badge badge-fixed">ISO / WANTED</span>
                        <span style={{ fontSize: 11, color: '#f87171', fontWeight: 600 }}>⏰ {req.urgency}</span>
                      </div>
                      <div className="iso-title">{req.title}</div>
                      <div className="iso-budget-row">
                        <span>Max Budget: <strong>₹{req.budget}</strong></span>
                        <span>•</span>
                        <span>Delivery / Meetup: <strong>{req.location}</strong></span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                          👤 Requested by <strong>@{req.requesterName}</strong>
                        </div>
                        {isOwner ? (
                          <button 
                            type="button" 
                            onClick={() => handleDeleteIso(req.id)}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', borderRadius: 6, padding: '5px 12px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                          >
                            🗑️ Remove My Request
                          </button>
                        ) : (
                          <a 
                            href={`https://wa.me/${fullPhone}?text=${waText}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-whatsapp" 
                            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                          >
                            <span>💬 I Have This (Chat)</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. Right Sidebar / Insights & Campus Trends */}
      <aside className="chrono-insights">
        <div className="insights-box">
          <div className="insights-header">
            <span className="insights-title">Campus Trends</span>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Live</span>
          </div>

          {(() => {
            const categoryNames: Record<string, string> = {
              room_essentials: '🛏️ Room Essentials',
              electronics: '⚡ Electronics',
              books_academics: '📚 Books & Academics',
              mobility_fitness: '🚲 Cycles & Mobility',
              clothing_fashion: '👕 Fashion & Winterwear',
              other: '📦 General Campus Items'
            };

            const counts: Record<string, number> = {};
            activeMarketListings.forEach(item => {
              counts[item.category] = (counts[item.category] || 0) + 1;
            });

            const topCategories = Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3);

            if (topCategories.length === 0 && isoRequests.length === 0) {
              return (
                <div style={{ padding: '10px 0', fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                  No campus listings yet. Be the first to post an item or request!
                </div>
              );
            }

            return (
              <>
                {topCategories.map(([catKey, count]) => (
                  <div key={catKey} className="trending-item">
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 12 }}>
                        {categoryNames[catKey] || catKey}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        {count} {count === 1 ? 'item' : 'items'} listed
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>Active</span>
                  </div>
                ))}

                {isoRequests.slice(0, 2).map(req => (
                  <div key={req.id} className="trending-item">
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 12 }}>
                        Wanted: {req.title.length > 20 ? `${req.title.substring(0, 20)}...` : req.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        Budget: ₹{req.budget} • {req.location}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#c084fc' }}>ISO</span>
                  </div>
                ))}

                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-dim)' }}>
                  <span>Live Items: <strong style={{ color: '#60a5fa' }}>{activeMarketListings.length}</strong></span>
                  <span>Wanted: <strong style={{ color: '#c084fc' }}>{isoRequests.length}</strong></span>
                </div>
              </>
            );
          })()}
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

      {/* 4. MODALS (Extracted into clean components) */}
      {selectedListing && (
        <ProductDetailModal
          item={selectedListing}
          currentUser={user}
          onClose={() => setSelectedListing(null)}
        />
      )}

      <ISOModal
        isOpen={showIsoModal}
        currentUser={user}
        onClose={() => setShowIsoModal(false)}
        onSuccess={loadData}
        showToast={showToast}
      />

      {user && (
        <ProfileModal
          isOpen={showProfileModal}
          currentUser={user}
          onClose={() => setShowProfileModal(false)}
          onSuccess={(updated) => setUser(updated)}
          showToast={showToast}
        />
      )}

      {toastMsg && (
        <div className="toast show" style={{ position: 'fixed', bottom: 84, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--accent-blue)', padding: '10px 20px', borderRadius: 9999, zIndex: 3000, fontWeight: 600, fontSize: '0.85rem' }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}

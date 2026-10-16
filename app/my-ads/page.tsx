'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Listing } from '@/types';
import { 
  getStoredListings, 
  toggleSoldStatus, 
  deleteListing, 
  subscribeToStore 
} from '@/lib/dataStore';

interface CurrentUser {
  id?: string;
  username: string;
  role?: string;
  hostelBlock?: string;
  roomNumber?: string;
}

export default function MyAdsPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadListings = useCallback(async () => {
    let user: CurrentUser | null = null;
    try {
      const stored = localStorage.getItem('hostelmart_user');
      if (stored) {
        user = JSON.parse(stored);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }

    if (!user || !user.username) {
      setUserListings([]);
      setIsLoading(false);
      return;
    }

    const all = await getStoredListings();
    const uname = user.username.trim().toLowerCase();

    // STRICT filter by logged-in user's username
    const matching = all.filter(item => 
      (item.sellerName && item.sellerName.trim().toLowerCase() === uname) ||
      (item.sellerId && user.id && item.sellerId === user.id)
    );

    setUserListings(matching);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadListings();
    const unsubscribe = subscribeToStore(() => {
      loadListings();
    });
    return () => unsubscribe();
  }, [loadListings]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleToggleSold = async (id: string) => {
    const nextStatus = await toggleSoldStatus(id);
    showToast(nextStatus === 'sold' ? 'Item marked as SOLD! Updated on live marketplace feed.' : 'Item re-activated on marketplace feed.');
    loadListings();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this listing?')) {
      await deleteListing(id);
      showToast('Item deleted successfully.');
      loadListings();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>My Listed Items</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 2 }}>
              {currentUser ? `Manage items listed by @${currentUser.username}` : 'Manage your listed campus items'}
            </p>
          </div>
          <Link href="/" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            ← Back to Feed
          </Link>
        </div>

        {/* State 1: Not logged in */}
        {!isLoading && !currentUser && (
          <div className="modal-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>🔒</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              Please Sign In
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', maxWidth: 420, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              You are not signed in. Sign in to your student account to view, edit, mark as sold, or delete your posted items.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>
                🚀 Sign In / Register
              </Link>
              <Link href="/" className="btn btn-secondary" style={{ padding: '10px 20px' }}>
                Browse Feed
              </Link>
            </div>
          </div>
        )}

        {/* State 2: Logged in but has 0 listings */}
        {!isLoading && currentUser && userListings.length === 0 && (
          <div className="modal-card" style={{ maxWidth: '100%', textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: 14 }}>📦</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: 8 }}>
              No Listed Items Yet
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', maxWidth: 440, margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              Hey <strong>@{currentUser.username}</strong>, you haven&apos;t posted any items for sale. Have room essentials, books, or electronics you no longer use?
            </p>
            <Link href="/sell" className="btn btn-primary" style={{ padding: '10px 24px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>✨</span>
              <span>Post Your First Item</span>
            </Link>
          </div>
        )}

        {/* State 3: Logged in and has listings */}
        {!isLoading && currentUser && userListings.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Showing <strong>{userListings.length}</strong> {userListings.length === 1 ? 'item' : 'items'}
              </span>
              <Link href="/sell" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                + Post Another Item
              </Link>
            </div>

            {userListings.map(item => {
              const isSold = item.status === 'sold';
              const isPending = item.status === 'pending';
              const cover = item.images && item.images.length > 0 ? item.images[0] : '';

              return (
                <div 
                  key={item.id} 
                  className="chrono-card" 
                  style={{ padding: 16, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img 
                      src={cover} 
                      style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover', background: 'var(--bg-app)' }} 
                      alt={item.title} 
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>₹{item.price.toLocaleString()}</span>
                        <span>•</span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 9999,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: isSold ? 'rgba(52, 211, 153, 0.15)' : isPending ? 'rgba(251, 191, 36, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: isSold ? '#34d399' : isPending ? '#fbbf24' : '#60a5fa'
                        }}>
                          {isPending ? '⏳ AWAITING APPROVAL' : isSold ? 'SOLD OUT' : 'LIVE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {!isPending && (
                      <>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSold ? '#34d399' : 'var(--text-muted)' }}>
                          {isSold ? 'Sold' : 'Active'}
                        </span>
                        <label className="switch" style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                          <input 
                            type="checkbox" 
                            checked={isSold} 
                            onChange={() => handleToggleSold(item.id)} 
                            style={{ opacity: 0, width: 0, height: 0 }}
                          />
                          <span style={{
                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: isSold ? 'var(--accent-blue)' : '#374151',
                            transition: '.2s', borderRadius: 24
                          }}>
                            <span style={{
                              position: 'absolute', content: '""', height: 18, width: 18, left: isSold ? 22 : 3, bottom: 3,
                              backgroundColor: '#fff', transition: '.2s', borderRadius: '50%'
                            }}></span>
                          </span>
                        </label>
                      </>
                    )}
                    <button 
                      type="button" 
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', borderRadius: 6, padding: '6px 10px', fontSize: '0.85rem', cursor: 'pointer' }}
                      title="Delete item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {toastMsg && (
          <div className="toast show" style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-surface-elevated)', color: '#fff', border: '1px solid var(--accent-blue)', padding: '10px 20px', borderRadius: 9999, zIndex: 3000, fontWeight: 600, fontSize: '0.85rem' }}>
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
}

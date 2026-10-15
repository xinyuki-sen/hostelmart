'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Listing } from '@/types';

export default function MyAdsPage() {
  const [userListings, setUserListings] = useState<Listing[]>([
    {
      id: "101",
      sellerId: "u-1",
      sellerName: "rahul_k",
      sellerPhone: "9876543210",
      hostelBlock: "Block B",
      roomNumber: "304",
      title: "Havells 1.2L Electric Kettle (Quick Boil)",
      description: "Heats 1.2L of water in under 2 minutes.",
      price: 450,
      isNegotiable: true,
      condition: "Gently Used",
      category: "room_essentials",
      images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"],
      status: "active",
      createdAt: "Yesterday",
      updatedAt: "Yesterday"
    },
    {
      id: "106",
      sellerId: "u-1",
      sellerName: "rahul_k",
      sellerPhone: "9876543210",
      hostelBlock: "Block B",
      roomNumber: "304",
      title: "High-Speed Desk Table Fan with Clamp",
      description: "Quiet and powerful motor.",
      price: 350,
      isNegotiable: false,
      condition: "Gently Used",
      category: "room_essentials",
      images: ["https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=600&q=80"],
      status: "sold",
      createdAt: "3 days ago",
      updatedAt: "Yesterday"
    }
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const toggleSold = (id: string, isSold: boolean) => {
    setUserListings(prev => prev.map(item => {
      if (item.id === id) {
        const nextStatus = isSold ? 'sold' : 'active';
        showToast(isSold ? 'Item marked as SOLD! Exited live feed.' : 'Item re-activated on feed.');
        return { ...item, status: nextStatus };
      }
      return item;
    }));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>My Listed Items</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 2 }}>Manage status & toggle items as SOLD once deal is done</p>
          </div>
          <Link href="/" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            ← Back to Feed
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {userListings.map(item => {
            const isSold = item.status === 'sold';
            const cover = item.images && item.images.length > 0 ? item.images[0] : '';

            return (
              <div 
                key={item.id} 
                className="chrono-card" 
                style={{ padding: 16, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img src={cover} style={{ width: 64, height: 64, borderRadius: 8, objectFit: 'cover' }} alt={item.title} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>{item.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: 4 }}>
                      ₹{item.price.toLocaleString()} • Status:{' '}
                      <strong style={{ color: isSold ? '#34d399' : '#60a5fa' }}>{item.status.toUpperCase()}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSold ? '#34d399' : 'var(--text-muted)' }}>
                    {isSold ? 'Sold Out ✓' : 'Active'}
                  </span>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
                    <input 
                      type="checkbox" 
                      checked={isSold} 
                      onChange={(e) => toggleSold(item.id, e.target.checked)} 
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
                </div>
              </div>
            );
          })}
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

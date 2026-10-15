'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { generateResearchCsv, downloadCsvFile } from '@/lib/exportCsv';
import type { Listing } from '@/types';

export default function AdminHubPage() {
  const [adminListings, setAdminListings] = useState<Listing[]>([
    {
      id: "101",
      sellerId: "u-1",
      sellerName: "rahul_k",
      sellerPhone: "9876543210",
      hostelBlock: "Block B",
      roomNumber: "304",
      title: "Havells 1.2L Electric Kettle (Quick Boil)",
      description: "Heats 1.2L in 2 mins.",
      price: 450,
      isNegotiable: true,
      condition: "Gently Used",
      category: "room_essentials",
      images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"],
      status: "active",
      adminNote: "High demand during winter semester. Sold within 24h usually.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "102",
      sellerId: "u-2",
      sellerName: "aditya_m",
      sellerPhone: "9876543211",
      hostelBlock: "Block A",
      roomNumber: "112",
      title: "Hercules 21-Speed Mountain Bicycle",
      description: "Dual disk brakes with front suspension.",
      price: 2400,
      isNegotiable: true,
      condition: "Like New",
      category: "mobility_fitness",
      images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80"],
      status: "active",
      adminNote: "Original purchase receipt included. Very good condition.",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "105",
      sellerId: "u-5",
      sellerName: "siddharth_r",
      sellerPhone: "9876543214",
      hostelBlock: "Block D",
      roomNumber: "108",
      title: "Krups 2-Slice Bread Toaster (Clean)",
      description: "Hardly used for 2 months.",
      price: 600,
      isNegotiable: true,
      condition: "Like New",
      category: "room_essentials",
      images: ["https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80"],
      status: "pending",
      adminNote: "Check electrical heating element compliance.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleDecision = (id: string, newStatus: 'active' | 'rejected') => {
    setAdminListings(prev => prev.map(item => {
      if (item.id === id) {
        showToast(newStatus === 'active' ? `Approved "${item.title}" for Live Feed` : `Rejected "${item.title}"`);
        return { ...item, status: newStatus };
      }
      return item;
    }));
  };

  const updateNote = (id: string, note: string) => {
    setAdminListings(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, adminNote: note };
      }
      return item;
    }));
    showToast('Admin note saved.');
  };

  const exportData = () => {
    const csvData = generateResearchCsv(adminListings);
    downloadCsvFile(csvData, `hostelmart_research_data_${Date.now()}.csv`);
    showToast('📥 Downloaded CSV Research Dataset!');
  };

  const pendingItems = adminListings.filter(i => i.status === 'pending');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 860 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Supervisor Command & Research Hub</h1>
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>AdminA Mode</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 2 }}>Moderation approvals, deal velocity & research audit trail</p>
          </div>
          <Link href="/" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            ← Back to Marketplace
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Total Inventory</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{adminListings.length}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Sell-Through</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>67%</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Avg Time-to-Sell</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>18.4 hrs</div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Pending Review</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>{pendingItems.length}</div>
          </div>
        </div>

        {/* Pending Moderation Queue */}
        <div className="modal-card" style={{ maxWidth: '100%', marginBottom: 24, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>📥 Pending Approval Queue</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Items remain hidden from feed until approved</span>
          </div>

          {pendingItems.length === 0 ? (
            <div style={{ padding: '20px', background: 'var(--bg-app)', borderRadius: 8, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.88rem' }}>
              🎉 All pending listings cleared! No items awaiting review.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pendingItems.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-card)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={item.images[0]} style={{ width: 48, height: 48, borderRadius: 6, objectFit: 'cover' }} alt={item.title} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>₹{item.price} • {item.hostelBlock}, Rm {item.roomNumber}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => handleDecision(item.id, 'active')}>
                      ✓ Approve
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#f87171' }} onClick={() => handleDecision(item.id, 'rejected')}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Private Research Ledger */}
        <div className="modal-card" style={{ maxWidth: '100%', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>📊 Private Research Ledger & Notes</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Admins can log observations, reasons for quick sales, or safety concerns</p>
            </div>
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '7px 14px' }} onClick={exportData}>
              📥 Export Dataset (CSV)
            </button>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-card)', borderRadius: 8 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-card)' }}>
                  <th style={{ padding: '10px 12px' }}>Item</th>
                  <th style={{ padding: '10px 12px' }}>Price</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Admin Private Field Note</th>
                </tr>
              </thead>
              <tbody>
                {adminListings.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</td>
                    <td style={{ padding: '10px 12px' }}>₹{item.price}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span className={`badge ${item.status === 'active' ? 'badge-fixed' : item.status === 'sold' ? 'badge-sold' : 'badge-negotiable'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <input 
                        type="text" 
                        defaultValue={item.adminNote || ''} 
                        style={{ width: '100%', background: 'transparent', border: '1px dashed var(--border-card)', color: 'var(--text-main)', padding: '4px 8px', borderRadius: 4, outline: 'none' }}
                        onBlur={(e) => updateNote(item.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

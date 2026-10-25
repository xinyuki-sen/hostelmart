'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateResearchCsv, downloadCsvFile } from '@/lib/exportCsv';
import type { Listing, ISO'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateResearchCsv, downloadCsvFile } from '@/lib/exportCsv';
import type { Listing, ISORequest } from '@/types';
import { 
  getStoredListings, 
  updateListingStatus, 
  updateListingAdminNote, 
  deleteListing,
  getStoredISORequests,
  deleteISORequest,
  getTrackedUsers,
  recordUserLogin,
  getCloudSyncInfo,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  getCustomSupabaseConfig,
  subscribeToStore,
  type UserAuditRecord 
} from '@/lib/dataStore';

export default function AdminHubPage() {
  const router = useRouter();
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [authError, setAuthError] = useState(false);
  const [adminUsername, setAdminUsername] = useState('AdminA');

  const [adminListings, setAdminListings] = useState<Listing[]>([]);
  const [isoRequests, setIsoRequests] = useState<ISORequest[]>([]);
  const [trackedUsers, setTrackedUsers] = useState<UserAuditRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'iso' | 'users' | 'all' | 'cloud'>('pending');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cloud Config State
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  const loadData = useCallback(async () => {
    const [listings, iso, users] = await Promise.all([
      getStoredListings(),
      getStoredISORequests(),
      Promise.resolve(getTrackedUsers())
    ]);
    setAdminListings(listings);
    setIsoRequests(iso);
    setTrackedUsers(users);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hostelmart_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === 'admin') {
          setIsAdminAuth(true);
          if (u.username) setAdminUsername(u.username);
        }
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

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === '123456' || passphrase === 'AdminPass@2026!') {
      setIsAdminAuth(true);
      setAuthError(false);
      const adminUser = { 
        id: 'admin-local',
        role: 'admin' as const, 
        username: adminUsername,
        hostelBlock: 'Supervisor Office',
        roomNumber: '101'
      };
      localStorage.setItem('hostelmart_user', JSON.stringify(adminUser));
      recordUserLogin(adminUser);
      loadData();
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hostelmart_user');
    setIsAdminAuth(false);Request } from '@/types';
import { 
  getStoredListings, 
  updateListingStatus, 
  updateListingAdminNote, 
  deleteListing,
  getStoredISORequests,
  deleteISORequest,
  getTrackedUsers,
  recordUserLogin,
  getCloudSyncInfo,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  getCustomSupabaseConfig,
  subscribeToStore,
  type UserAuditRecord 
} from '@/lib/dataStore';

export default function AdminHubPage() {
  const router = useRouter();
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [authError, setAuthError] = useState(false);
  const [adminUsername, setAdminUsername] = useState('AdminA');

  const [adminListings, setAdminListings] = useState<Listing[]>([]);
  const [isoRequests, setIsoRequests] = useState<ISORequest[]>([]);
  const [trackedUsers, setTrackedUsers] = useState<UserAuditRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'iso' | 'users' | 'all' | 'cloud'>('pending');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Cloud Config State
  const [customUrl, setCustomUrl] = useState('');
  const [customKey, setCustomKey] = useState('');

  const loadData = useCallback(async () => {
    const [listings, iso, users] = await Promise.all([
      getStoredListings(),
      getStoredISORequests(),
      Promise.resolve(getTrackedUsers())
    ]);
    setAdminListings(listings);
    setIsoRequests(iso);
    setTrackedUsers(users);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hostelmart_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u.role === 'admin') {
          setIsAdminAuth(true);
          if (u.username) setAdminUsername(u.username);
        }
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

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase === '123456' || passphrase === 'AdminPass@2026!') {
      setIsAdminAuth(true);
      setAuthError(false);
      const adminUser = { 
        id: 'admin-local',
        role: 'admin' as const, 
        username: adminUsername,
        hostelBlock: 'Supervisor Office',
        roomNumber: '101'
      };
      localStorage.setItem('hostelmart_user', JSON.stringify(adminUser));
      recordUserLogin(adminUser);
      loadData();
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hostelmart_user');
    setIsAdminAuth(false);
    router.push('/login');
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleDecision = async (id: string, newStatus: 'active' | 'rejected') => {
    const target = adminListings.find(i => i.id === id);
    const updated = await updateListingStatus(id, newStatus);
    setAdminListings(updated);
    showToast(newStatus === 'active' 
      ? `✓ Approved "${target?.title || 'Listing'}"! Published live to Campus Marketplace.` 
      : `✕ Rejected "${target?.title || 'Listing'}". Hidden from Marketplace.`);
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Delete this listing permanently from the marketplace?')) {
      const updated = await deleteListing(id, 'AdminA');
      setAdminListings(updated);
      showToast('Item deleted by Supervisor.');
    }
  };

  const handleDeleteIso = async (id: string) => {
    if (confirm('Remove this wanted request permanently from the board?')) {
      const updated = await deleteISORequest(id);
      setIsoRequests(updated);
      showToast('Wanted request removed by Supervisor.');
    }
  };

  const updateNote = async (id: string, note: string) => {
    const updated = await updateListingAdminNote(id, note);
    setAdminListings(updated);
    showToast('Private research note saved.');
  };

  const exportData = () => {
    const csvData = generateResearchCsv(adminListings);
    downloadCsvFile(csvData, `hostelmart_research_data_${Date.now()}.csv`);
    showToast('📥 Downloaded CSV Research Dataset!');
  };

  const pendingItems = adminListings.filter(i => i.status === 'pending');
  const activeItems = adminListings.filter(i => i.status === 'active');
  const soldItems = adminListings.filter(i => i.status === 'sold');

  // Gated Access Screen if NOT logged in as Admin
  if (!isAdminAuth) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="modal-card" style={{ maxWidth: 420, textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: '2.6rem', marginBottom: 12 }}>🛡️</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>Supervisor Portal</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4, marginBottom: 20 }}>
            Restricted to hostel supervisors for listing approvals and student login audit logs.
          </p>

          <form onSubmit={handleUnlock}>
            <div className="form-group" style={{ textAlign: 'left', marginBottom: 14 }}>
              <label className="form-label">Supervisor Persona</label>
              <select className="form-select" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)}>
                <option value="AdminA">AdminA (Supervisor A)</option>
                <option value="Admin1">Admin1 (Supervisor 1)</option>
              </select>
            </div>

            <div className="form-group" style={{ textAlign: 'left', marginBottom: 16 }}>
              <label className="form-label">Supervisor Passphrase</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Enter 123456" 
                value={passphrase} 
                onChange={(e) => setPassphrase(e.target.value)} 
                required 
              />
            </div>

            {authError && (
              <div style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: 14 }}>
                Incorrect passphrase. (Demo passcode: <strong>123456</strong>)
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
              🛡️ Unlock Admin Hub
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', padding: '24px 20px', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 980 }}>
        
        {/* Top Dedicated Admin Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: '#fff' }}>
                🛡️
              </div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>HostelMart Supervisor Console</h1>
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                {adminUsername} Active
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: 4 }}>
              Dedicated supervisor panel: Review & approve items, remove wanted requests, and track student logins
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button 
              type="button" 
              onClick={() => { loadData(); showToast('🔄 Refreshed live data!'); }}
              className="btn btn-secondary" 
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              🔄 Refresh
            </button>
            <button 
              type="button" 
              onClick={handleLogout} 
              className="btn" 
              style={{ padding: '8px 16px', fontSize: '0.82rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
            >
              🚪 Logout Admin
            </button>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Review</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: pendingItems.length > 0 ? '#f87171' : '#34d399', marginTop: 2 }}>
              {pendingItems.length}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Active on Feed</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#60a5fa', marginTop: 2 }}>
              {activeItems.length}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Wanted Requests</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', marginTop: 2 }}>
              {isoRequests.length}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-card)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>Tracked Students</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a78bfa', marginTop: 2 }}>
              {trackedUsers.filter(u => u.role === 'user').length}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 8 }}>
          <button 
            type="button" 
            className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setActiveTab('pending')}
          >
            <span>📥</span>
            <span>Approval Queue ({pendingItems.length})</span>
          </button>

          <button 
            type="button" 
            className={`btn ${activeTab === 'iso' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setActiveTab('iso')}
          >
            <span>🔍</span>
            <span>Wanted Requests ({isoRequests.length})</span>
          </button>

          <button 
            type="button" 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setActiveTab('users')}
          >
            <span>👥</span>
            <span>Student Logins & Activity ({trackedUsers.length})</span>
          </button>

          <button 
            type="button" 
            className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => setActiveTab('all')}
          >
            <span>📊</span>
            <span>All Listings ({adminListings.length})</span>
          </button>

          <button 
            type="button" 
            className={`btn ${activeTab === 'cloud' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={() => {
              const cfg = getCustomSupabaseConfig();
              if (cfg) {
                setCustomUrl(cfg.url);
                setCustomKey(cfg.anonKey);
              }
              setActiveTab('cloud');
            }}
          >
            <span>☁️</span>
            <span>Cloud & Multi-Device Sync</span>
          </button>
        </div>

        {/* TAB 1: Pending Approvals */}
        {activeTab === 'pending' && (
          <div className="modal-card" style={{ maxWidth: '100%', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  📥 Pending Listing Approvals
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  Verify item details and resident room number before publishing to the campus feed
                </p>
              </div>
              <span className="badge" style={{ background: pendingItems.length > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(52, 211, 153, 0.2)', color: pendingItems.length > 0 ? '#f87171' : '#34d399' }}>
                {pendingItems.length} awaiting review
              </span>
            </div>

            {pendingItems.length === 0 ? (
              <div style={{ padding: '48px 20px', background: 'var(--bg-app)', borderRadius: 10, textAlign: 'center', border: '1px dashed var(--border-card)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🎉</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 4 }}>
                  All Pending Approvals Cleared!
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: 400, margin: '0 auto' }}>
                  No student items are currently awaiting review. When a student posts an item on /sell, it will appear here immediately for approval.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {pendingItems.map(item => {
                  const cover = item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';
                  const waSellerLink = `https://wa.me/91${item.sellerPhone || '9876543210'}?text=${encodeURIComponent(`Hi @${item.sellerName}, this is Hostel Supervisor verifying your listing "${item.title}" in ${item.hostelBlock}, Rm ${item.roomNumber}.`)}`;

                  return (
                    <div 
                      key={item.id} 
                      className="chrono-card" 
                      style={{ padding: 18, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                        <img 
                          src={cover} 
                          style={{ width: 84, height: 84, borderRadius: 10, objectFit: 'cover', background: 'var(--bg-app)' }} 
                          alt={item.title} 
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>{item.title}</span>
                            <span className="badge" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', fontSize: '0.72rem' }}>
                              PENDING
                            </span>
                            {item.isUrgent && <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.72rem' }}>🔥 48H URGENT</span>}
                          </div>

                          <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700, marginTop: 4 }}>
                            {item.price === 0 ? 'FREE GIVEAWAY 🎁' : `₹${item.price.toLocaleString()} (${item.isNegotiable ? 'Negotiable' : 'Fixed'})`}
                            <span style={{ color: 'var(--text-dim)', fontWeight: 400, marginLeft: 8 }}>• {item.condition} • Category: {item.category}</span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.4 }}>
                            👤 <strong>Seller:</strong> @{item.sellerName} &nbsp;|&nbsp; 
                            📍 <strong>Location:</strong> {item.hostelBlock}, Rm {item.roomNumber} &nbsp;|&nbsp; 
                            📞 <strong>Phone:</strong> <a href={waSellerLink} target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', textDecoration: 'underline' }}>{item.sellerPhone || '9876543210'} (WhatsApp)</a>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, fontStyle: 'italic' }}>
                            &ldquo;{item.description}&rdquo;
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                        <button 
                          type="button"
                          className="btn btn-primary" 
                          style={{ padding: '10px 18px', fontSize: '0.85rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} 
                          onClick={() => handleDecision(item.id, 'active')}
                        >
                          <span>✓</span>
                          <span>Approve & Publish</span>
                        </button>
                        <button 
                          type="button"
                          className="btn btn-secondary" 
                          style={{ padding: '8px 16px', fontSize: '0.82rem', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }} 
                          onClick={() => handleDecision(item.id, 'rejected')}
                        >
                          ✕ Reject Listing
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Wanted (ISO) Board Moderation */}
        {activeTab === 'iso' && (
          <div className="modal-card" style={{ maxWidth: '100%', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  🔍 Wanted Board Requests Management
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  Supervisors can moderate or remove spam and fulfilled wanted requests
                </p>
              </div>
              <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc' }}>
                {isoRequests.length} Active Requests
              </span>
            </div>

            {isoRequests.length === 0 ? (
              <div style={{ padding: '40px', background: 'var(--bg-app)', borderRadius: 8, textAlign: 'center', color: 'var(--text-dim)' }}>
                No active wanted requests posted on the board.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {isoRequests.map(req => {
                  const waRequesterLink = `https://wa.me/91${req.requesterPhone || '9876543210'}?text=${encodeURIComponent(`Hi @${req.requesterName}, this is Hostel Supervisor contacting you regarding your wanted request "${req.title}".`)}`;

                  return (
                    <div 
                      key={req.id} 
                      className="chrono-card" 
                      style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{req.title}</span>
                          <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.72rem' }}>WANTED</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>Budget: ₹{req.budget}</span>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 4 }}>
                          👤 Requested by: <strong>@{req.requesterName}</strong> ({req.location}) &nbsp;|&nbsp; 
                          📞 <a href={waRequesterLink} target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', textDecoration: 'underline' }}>{req.requesterPhone} (WhatsApp)</a> &nbsp;|&nbsp;
                          ⏰ Urgency: {req.urgency}
                        </div>
                      </div>

                      <button 
                        type="button" 
                        onClick={() => handleDeleteIso(req.id)}
                        className="btn btn-secondary" 
                        style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: 6 }}
                        title="Remove request from board"
                      >
                        <span>🗑️</span>
                        <span>Remove Request</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Student Login & Activity Tracking */}
        {activeTab === 'users' && (
          <div className="modal-card" style={{ maxWidth: '100%', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  👥 Student Logins & Identity Tracking
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  Live audit log of all registered students, their hostel blocks, rooms, and last active sessions
                </p>
              </div>
              <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                {trackedUsers.length} Recorded Users
              </span>
            </div>

            {trackedUsers.length === 0 ? (
              <div style={{ padding: '40px', background: 'var(--bg-app)', borderRadius: 8, textAlign: 'center', color: 'var(--text-dim)' }}>
                No student activity recorded yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-card)', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-card)' }}>
                      <th style={{ padding: '12px 14px', color: 'var(--text-dim)', fontWeight: 600 }}>Student Username</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-dim)', fontWeight: 600 }}>Hostel Block & Room</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-dim)', fontWeight: 600 }}>Phone (WhatsApp)</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-dim)', fontWeight: 600 }}>Role</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-dim)', fontWeight: 600 }}>Logins</th>
                      <th style={{ padding: '12px 14px', color: 'var(--text-dim)', fontWeight: 600 }}>Last Login Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackedUsers.map((u, idx) => {
                      const waLink = `https://wa.me/91${u.phone}?text=${encodeURIComponent(`Hi @${u.username}, this is Hostel Supervisor contacting you regarding your HostelMart account.`)}`;
                      return (
                        <tr key={u.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--text-main)' }}>
                            @{u.username}
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>
                            📍 {u.hostelBlock}, Rm {u.roomNumber}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ color: '#34d399', textDecoration: 'underline' }}>
                              💬 {u.phone}
                            </a>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className="badge" style={{ 
                              background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                              color: u.role === 'admin' ? '#f87171' : '#60a5fa',
                              fontSize: '0.72rem'
                            }}>
                              {u.role.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-dim)' }}>
                            {u.loginCount || 1} times
                          </td>
                          <td style={{ padding: '12px 14px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                            {new Date(u.lastLogin).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: All Listings & Research Ledger */}
        {activeTab === 'all' && (
          <div className="modal-card" style={{ maxWidth: '100%', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  📊 Campus Inventory & Research Ledger
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  Private supervisor observations, price points, and 1-click dataset export
                </p>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }} onClick={exportData}>
                <span>📥</span>
                <span>Export Dataset (CSV)</span>
              </button>
            </div>

            {adminListings.length === 0 ? (
              <div style={{ padding: '40px', background: 'var(--bg-app)', borderRadius: 8, textAlign: 'center', color: 'var(--text-dim)' }}>
                No listings in platform database.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid var(--border-card)', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-card)' }}>
                      <th style={{ padding: '10px 12px' }}>Item</th>
                      <th style={{ padding: '10px 12px' }}>Seller</th>
                      <th style={{ padding: '10px 12px' }}>Price</th>
                      <th style={{ padding: '10px 12px' }}>Status</th>
                      <th style={{ padding: '10px 12px' }}>Supervisor Private Field Note</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminListings.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{item.title}</td>
                        <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>@{item.sellerName} ({item.hostelBlock})</td>
                        <td style={{ padding: '10px 12px', color: '#60a5fa', fontWeight: 700 }}>₹{item.price}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge ${item.status === 'active' ? 'badge-fixed' : item.status === 'sold' ? 'badge-sold' : 'badge-negotiable'}`}>
                            {item.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <input 
                            type="text" 
                            defaultValue={item.adminNote || ''} 
                            placeholder="Add supervisor note..."
                            style={{ width: '100%', background: 'transparent', border: '1px dashed var(--border-card)', color: 'var(--text-main)', padding: '4px 8px', borderRadius: 4, outline: 'none' }}
                            onBlur={(e) => updateNote(item.id, e.target.value)}
                          />
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteItem(item.id)}
                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}
                            title="Supervisor delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Cloud & Multi-Device Sync Hub */}
        {activeTab === 'cloud' && (
          <div className="modal-card" style={{ maxWidth: '100%', padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  ☁️ Multi-Device & Cloud Database Management
                </h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  Connect your live Supabase database to synchronize items across all students&apos; phones and laptops in real-time
                </p>
              </div>

              {(() => {
                const info = getCloudSyncInfo();
                return (
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 9999,
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: info.isConnected ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                    color: info.isConnected ? '#34d399' : '#fbbf24'
                  }}>
                    {info.isConnected ? '🟢 ACTIVE CLOUD SYNC' : '🟠 LOCAL STORAGE ENGINE'}
                  </span>
                );
              })()}
            </div>

            <div style={{ background: 'var(--bg-app)', border: '1px solid var(--border-card)', borderRadius: 8, padding: 16, marginBottom: 20 }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                Active Storage Engine Status
              </h3>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                {getCloudSyncInfo().isConnected ? (
                  <div>
                    HostelMart is connected to <strong>{getCloudSyncInfo().url}</strong>. Any listings posted, edited, or marked as sold will update instantly across any physical phone, tablet, or laptop on campus!
                  </div>
                ) : (
                  <div>
                    Currently running on <strong>Reactive Local Storage Fallback</strong>. All features work immediately within your browser sessions across tabs. To sync hand-to-hand transactions between two separate phones, enter your Supabase project credentials below.
                  </div>
                )}
              </div>
            </div>

            {/* Supabase Credential Config Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!customUrl.trim() || !customKey.trim()) {
                showToast('Please enter both Supabase URL and Anon Key.');
                return;
              }
              saveCustomSupabaseConfig(customUrl.trim(), customKey.trim());
              showToast('✅ Supabase credentials saved! Live Cloud Sync activated.');
            }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 12 }}>
                Configure Supabase Credentials
              </h3>

              <div className="form-group">
                <label className="form-label">Supabase Project URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://xyzcompany.supabase.co"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supabase Anon Public API Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
                  💾 Save & Activate Cloud Sync
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={() => {
                    clearCustomSupabaseConfig();
                    setCustomUrl('');
                    setCustomKey('');
                    showToast('Cleared custom credentials. Reverted to default local fallback.');
                  }}
                >
                  Clear / Reset
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem', marginLeft: 'auto' }}
                  onClick={() => {
                    const schema = `-- HostelMart Complete Database Schema
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  hostel_block TEXT NOT NULL,
  room_number TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  seller_id TEXT,
  seller_name TEXT NOT NULL,
  seller_phone TEXT NOT NULL,
  hostel_block TEXT NOT NULL,
  room_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_negotiable BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  condition TEXT NOT NULL,
  category TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iso_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  title TEXT NOT NULL,
  budget NUMERIC NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  urgency TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;
                    navigator.clipboard.writeText(schema);
                    showToast('📋 Copied Complete SQL Schema to clipboard! Paste into Supabase SQL Editor.');
                  }}
                >
                  📋 Copy SQL Schema
                </button>
              </div>
            </form>
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

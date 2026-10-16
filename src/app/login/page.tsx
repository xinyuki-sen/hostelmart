'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { recordUserLogin, registerStudentAccount, authenticateStudent } from '@/lib/dataStore';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'student' | 'admin'>('student');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Student Fields
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [hostelBlock, setHostelBlock] = useState('Block B');
  const [roomNumber, setRoomNumber] = useState('');

  // Admin Fields
  const [adminUsername, setAdminUsername] = useState('AdminA');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isRegisterMode) {
      // 1. REGISTRATION MODE: Save student into database
      const res = await registerStudentAccount({
        username,
        phone,
        hostelBlock,
        roomNumber,
        password
      });

      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Registration failed. Please check your details.');
        return;
      }

      // Establish authenticated session
      const studentSession = {
        id: res.user.id,
        username: res.user.username,
        phone: res.user.phone,
        hostelBlock: res.user.hostelBlock,
        roomNumber: res.user.roomNumber,
        role: 'user' as const
      };

      localStorage.setItem('hostelmart_user', JSON.stringify(studentSession));
      router.push('/');
    } else {
      // 2. SIGN IN MODE: Strictly authenticate against database
      const res = await authenticateStudent({
        username,
        password
      });

      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Authentication failed.');
        return;
      }

      // Establish authenticated session
      const studentSession = {
        id: res.user.id,
        username: res.user.username,
        phone: res.user.phone,
        hostelBlock: res.user.hostelBlock,
        roomNumber: res.user.roomNumber,
        role: 'user' as const
      };

      localStorage.setItem('hostelmart_user', JSON.stringify(studentSession));
      router.push('/');
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Accept AdminA / Admin1 with 123456 or AdminPass@2026!
    const validAdmins = ['AdminA', 'Admin1'];
    const validPasses = ['123456', 'AdminPass@2026!'];

    if (validAdmins.includes(adminUsername) && validPasses.includes(adminPassword)) {
      const adminUser = {
        id: `admin-${adminUsername.toLowerCase()}`,
        username: adminUsername,
        role: 'admin' as const,
        hostelBlock: 'Supervisor Office',
        roomNumber: '101'
      };

      localStorage.setItem('hostelmart_user', JSON.stringify(adminUser));
      recordUserLogin(adminUser);
      router.push('/admin'); // Direct to Supervisor Hub
    } else {
      setErrorMsg('Invalid supervisor credentials. (Hint: AdminA / 123456)');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: '#fff', marginBottom: 8, boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)' }}>
            ⚡
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>HostelMart</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 2 }}>Hyper-local campus P2P marketplace</p>
        </div>

        {/* Portal Switcher Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-card)', marginBottom: 20 }}>
          <button 
            type="button"
            className={`btn ${activeTab === 'student' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: 8 }}
            onClick={() => { setActiveTab('student'); setErrorMsg(null); }}
          >
            👤 Student Portal
          </button>
          <button 
            type="button"
            className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: 8 }}
            onClick={() => { setActiveTab('admin'); setErrorMsg(null); }}
          >
            🛡️ Admin Login
          </button>
        </div>

        {/* Card */}
        <div className="modal-card" style={{ maxWidth: '100%', padding: 24 }}>
          
          {errorMsg && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 8, color: '#f87171', fontSize: '0.82rem', marginBottom: 16 }}>
              {errorMsg}
            </div>
          )}

          {activeTab === 'student' ? (
            /* Student Form */
            <form onSubmit={handleStudentSubmit}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isRegisterMode ? 'Create Student Account' : 'Welcome Back'}
                </h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  {isRegisterMode ? 'Register to buy, sell, and post requests' : 'Sign in to access your listings and buy items'}
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  placeholder="e.g. rahul_k" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>

              {isRegisterMode && (
                <>
                  <div className="form-group">
                    <label className="form-label">Phone Number (For WhatsApp deal bridge)</label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      required 
                      placeholder="10-digit mobile number" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Hostel Block</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="Block B" 
                        value={hostelBlock} 
                        onChange={(e) => setHostelBlock(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Room No.</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="304" 
                        value={roomNumber} 
                        onChange={(e) => setRoomNumber(e.target.value)} 
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  required 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>

              {successMsg && (
                <div style={{ padding: '10px 14px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 8, color: '#34d399', fontSize: '0.82rem', marginBottom: 16 }}>
                  {successMsg}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 8 }}>
                {isRegisterMode ? '✨ Create Account & Browse' : '🚀 Sign In to HostelMart'}
              </button>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <button 
                  type="button" 
                  style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                >
                  {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register Now →"}
                </button>
              </div>
            </form>
          ) : (
            /* Admin Form */
            <form onSubmit={handleAdminSubmit}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Supervisor Portal</h2>
                  <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>Restricted</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  For AdminA & Admin1 to approve listings and track research
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Username</label>
                <select className="form-select" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)}>
                  <option value="AdminA">AdminA (Supervisor A)</option>
                  <option value="Admin1">Admin1 (Supervisor 1)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Admin Password</label>
                <input 
                  type="password" 
                  className="form-input" 
                  required 
                  placeholder="Enter 123456 or AdminPass@2026!" 
                  value={adminPassword} 
                  onChange={(e) => setAdminPassword(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: 8, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                🛡️ Access Supervisor Hub
              </button>

              <div style={{ padding: '10px', background: 'var(--bg-app)', borderRadius: 6, fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 14, textAlign: 'center' }}>
                💡 Default Demo Pass: <strong>123456</strong>
              </div>
            </form>
          )}

        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/" style={{ color: 'var(--text-dim)', fontSize: '0.8rem', textDecoration: 'none' }}>
            ← Back to Marketplace Feed as Guest
          </Link>
        </div>

      </div>
    </div>
  );
}

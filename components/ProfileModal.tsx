'use client';

import React, { useState } from 'react';
import { updateStudentProfile } from '@/lib/dataStore';

interface ProfileModalProps {
  isOpen: boolean;
  currentUser: {
    username: string;
    phone?: string;
    hostelBlock?: string;
    roomNumber?: string;
    role?: string;
  };
  onClose: () => void;
  onSuccess: (updated: {
    username: string;
    phone?: string;
    hostelBlock?: string;
    roomNumber?: string;
    role?: string;
  }) => void;
  showToast: (msg: string) => void;
}

export default function ProfileModal({
  isOpen,
  currentUser,
  onClose,
  onSuccess,
  showToast
}: ProfileModalProps) {
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [block, setBlock] = useState(currentUser.hostelBlock || 'Block B');
  const [room, setRoom] = useState(currentUser.roomNumber || '');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '').replace(/^0+/, '');
    if (cleanPhone && cleanPhone.length !== 10 && !(cleanPhone.startsWith('91') && cleanPhone.length === 12)) {
      showToast('⚠️ Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSaving(true);
    const res = await updateStudentProfile(currentUser.username, {
      phone: cleanPhone || currentUser.phone,
      hostelBlock: block,
      roomNumber: room.trim() || '101',
      password: password.trim() || undefined
    });

    if (res.success && res.user) {
      const updatedUser = {
        username: res.user.username,
        role: res.user.role || 'user',
        phone: res.user.phone,
        hostelBlock: res.user.hostelBlock,
        roomNumber: res.user.roomNumber
      };
      onSuccess(updatedUser);
      showToast('✅ Room & Contact details updated successfully!');
      onClose();
    } else {
      showToast(res.error || 'Failed to update profile.');
    }
    setIsSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Hostel Room & Contact Settings
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Keep your corridor pickup details up to date for @{currentUser.username}
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">WhatsApp Mobile Number</label>
            <input
              type="tel"
              className="form-input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 9876543210 (10 digits)"
              required
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
              Buyers will reach you on this number for hand-to-hand hostel deals.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Hostel Block / Wing</label>
              <select
                className="form-select"
                value={block}
                onChange={e => setBlock(e.target.value)}
              >
                <option value="Block A">Block A (Seniors)</option>
                <option value="Block B">Block B (Main Boys)</option>
                <option value="Block C">Block C (Freshers)</option>
                <option value="Block D">Block D (Girls Hostel)</option>
                <option value="Off-Campus">Off-Campus Apartment</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Room Number</label>
              <input
                type="text"
                className="form-input"
                value={room}
                onChange={e => setRoom(e.target.value)}
                placeholder="e.g. 302"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Update Password (Optional)</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

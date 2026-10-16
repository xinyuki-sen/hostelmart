'use client';

import React, { useState } from 'react';
import { createISORequest } from '@/lib/dataStore';

interface ISOModalProps {
  isOpen: boolean;
  currentUser: {
    username: string;
    phone?: string;
    hostelBlock?: string;
    roomNumber?: string;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string) => void;
}

export default function ISOModal({
  isOpen,
  currentUser,
  onClose,
  onSuccess,
  showToast
}: ISOModalProps) {
  const [title, setTitle] = useState('');
  const [budget, setBudget] = useState('300');
  const [urgency, setUrgency] = useState('Tonight before 10 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter the item you need.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createISORequest({
        title: title.trim(),
        budget: Number(budget) || 0,
        location: `${currentUser?.hostelBlock || 'Block B'}, Rm ${currentUser?.roomNumber || '101'}`,
        urgency: urgency.trim() || 'Urgent',
        requesterName: currentUser?.username || 'student',
        requesterPhone: currentUser?.phone || '9876543210'
      });
      showToast('🎉 Wanted request posted live to ISO Board!');
      setTitle('');
      onSuccess();
      onClose();
    } catch {
      showToast('Failed to post request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Looking For an Item? (ISO)
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>
              Broadcast what you urgently need to everyone in your hostel
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">What do you need?</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              placeholder="e.g. Scientific Calculator Casio fx-991EX, Cycle pump" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Your Maximum Budget (₹)</label>
            <input 
              type="number" 
              className="form-input" 
              required 
              min="0" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Urgency / Timeline</label>
            <input 
              type="text" 
              className="form-input" 
              required 
              placeholder="e.g. Tonight before 10 PM (Exam tomorrow)" 
              value={urgency} 
              onChange={(e) => setUrgency(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: 12, marginTop: 8 }} disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : '🚀 Post to Wanted Board'}
          </button>
        </form>
      </div>
    </div>
  );
}

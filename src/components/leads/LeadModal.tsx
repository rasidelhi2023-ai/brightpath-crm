import React, { useState } from 'react';
import { X, UserPlus, Phone, Mail, BookOpen, Share2 } from 'lucide-react';
import { LeadSource, LeadStatus } from '../../types/crm.types';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLead?: (leadData: any) => void;
}

export const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  onSubmitLead
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [courseInterest, setCourseInterest] = useState('Data Science & AI');
  const [source, setSource] = useState<LeadSource>('Website');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!fullName.trim()) errs.fullName = 'Student name is required';
    if (!phone.trim()) errs.phone = 'Phone number is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Invalid email address format';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (onSubmitLead) {
      onSubmitLead({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        courseInterest,
        source,
        notes: notes.trim() || null,
      });
    } else {
      alert(`Lead "${fullName}" created! (Persistence activates in Phase 4)`);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Create New Student Lead</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label required">Student Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rohan Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <div className="form-error">{errors.fullName}</div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label required">Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    className="form-input"
                    style={{ paddingLeft: '2rem' }}
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    className="form-input"
                    style={{ paddingLeft: '2rem' }}
                    placeholder="student@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label required">Course Interest</label>
                <select
                  className="form-select"
                  value={courseInterest}
                  onChange={(e) => setCourseInterest(e.target.value)}
                >
                  <option value="Data Science & AI">Data Science & AI</option>
                  <option value="Full Stack Web Development">Full Stack Web Development</option>
                  <option value="Cloud Architecture (AWS)">Cloud Architecture (AWS)</option>
                  <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
                  <option value="UI/UX Product Design">UI/UX Product Design</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Lead Source</label>
                <select
                  className="form-select"
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                >
                  <option value="Website">Website</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Referral">Referral</option>
                  <option value="Phone">Phone</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Partner">Partner</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Initial Notes / Inquiry Details</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Student background, graduation year, target intake..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

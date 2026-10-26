import React, { useState, useEffect } from 'react';
import { X, CalendarCheck, Clock, User, AlertCircle } from 'lucide-react';
import { Lead } from '../../types/crm.types';
import { leadService } from '../../services/leadService';
import { followupService } from '../../services/followupService';

interface CreateFollowUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFollowUpCreated?: () => void;
  preselectedLeadId?: string;
  preselectedLeadName?: string;
}

export const CreateFollowUpModal: React.FC<CreateFollowUpModalProps> = ({
  isOpen,
  onClose,
  onFollowUpCreated,
  preselectedLeadId,
  preselectedLeadName,
}) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadId, setLeadId] = useState(preselectedLeadId || '');
  const [note, setNote] = useState('');
  const [dueAt, setDueAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Set default due time to tomorrow at 10:00 AM
  useEffect(() => {
    if (isOpen) {
      if (preselectedLeadId) {
        setLeadId(preselectedLeadId);
      } else {
        // Load available leads for dropdown
        leadService.getLeads().then((data) => {
          setLeads(data);
          if (data.length > 0 && !leadId) {
            setLeadId(data[0].id);
          }
        });
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // Format for datetime-local: YYYY-MM-DDTHH:mm
      const formatted = tomorrow.toISOString().slice(0, 16);
      setDueAt(formatted);
      setNote('');
      setErrorMsg(null);
    }
  }, [isOpen, preselectedLeadId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      setErrorMsg('Please select a student lead');
      return;
    }
    if (!dueAt) {
      setErrorMsg('Please select a due date and time');
      return;
    }
    if (!note.trim()) {
      setErrorMsg('Please specify the follow-up note/objective');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedLead = leads.find((l) => l.id === leadId);
    const leadName = preselectedLeadName || selectedLead?.full_name;

    const res = await followupService.createFollowUp({
      leadId,
      dueAt: new Date(dueAt).toISOString(),
      note: note.trim(),
      leadName,
    });

    if (res.error) {
      setErrorMsg(res.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitting(false);
      if (onFollowUpCreated) onFollowUpCreated();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarCheck size={20} color="#2563eb" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Schedule Student Follow-up</h3>
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
            {errorMsg && (
              <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Lead Selection */}
            {preselectedLeadId && preselectedLeadName ? (
              <div className="form-group">
                <label className="form-label">Student Lead</label>
                <input
                  type="text"
                  className="form-input"
                  value={preselectedLeadName}
                  disabled
                  style={{ backgroundColor: '#f1f5f9' }}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label required">Select Student Lead</label>
                <select
                  className="form-select"
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Select Lead --</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name} ({l.course_interest}) - {l.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date & Time Picker */}
            <div className="form-group">
              <label className="form-label required">Scheduled Due Date & Time</label>
              <div style={{ position: 'relative' }}>
                <Clock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  type="datetime-local"
                  className="form-input"
                  style={{ paddingLeft: '2.25rem' }}
                  required
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                />
              </div>
              <small style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                Items become overdue automatically if not marked complete before this local time.
              </small>
            </div>

            {/* Task Note / Objective */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label required">Follow-up Task / Objective</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="e.g. Call regarding scholarship assessment score and fee instalment plan..."
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

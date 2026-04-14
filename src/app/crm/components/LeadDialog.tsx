'use client';
import { useState, useEffect } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { useManagement } from '../ManagementContext';

export default function LeadDialog() {
  const { isLeadDialogOpen, closeLeadDialog, leadToEdit, triggerRefresh } = useManagement();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
  });

  useEffect(() => {
    if (leadToEdit && isLeadDialogOpen) {
      setFormData({
        name: leadToEdit.name || '',
        email: leadToEdit.email || '',
        phone: leadToEdit.phone || '',
        country: leadToEdit.country || '',
      });
    } else if (!isLeadDialogOpen) {
      setFormData({ name: '', email: '', phone: '', country: '' });
      setError('');
    }
  }, [leadToEdit, isLeadDialogOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (leadToEdit) {
        // Edit mode
        const endpoint = leadToEdit.type === 'LEAD' 
          ? `/api/admin/leads/${leadToEdit.originalId}`
          : `/api/admin/students/${leadToEdit.originalId}`;
          
        const res = await fetch(endpoint, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error(await res.text());
      } else {
        // Add mode
        const res = await fetch('/api/admin/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      
      triggerRefresh();
      closeLeadDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!leadToEdit) return;
    if (!window.confirm('Are you sure you want to archive this contact? They will be removed from the pipeline.')) return;
    
    setLoading(true);
    try {
      const endpoint = leadToEdit.type === 'LEAD' 
        ? `/api/admin/leads/${leadToEdit.originalId}`
        : `/api/admin/students/${leadToEdit.originalId}`;
        
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      
      triggerRefresh();
      closeLeadDialog();
    } catch (err: any) {
      setError(err.message || 'Failed to archive lead');
    } finally {
      setLoading(false);
    }
  };

  if (!isLeadDialogOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '20px' }}>
      <div style={{ background: 'var(--crm-surface)', border: '1px solid var(--crm-border)', borderRadius: '12px', width: '100%', maxWidth: '440px', boxShadow: 'var(--crm-shadow-md)', position: 'relative' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--crm-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--crm-heading)' }}>
            {leadToEdit ? 'Edit Contact' : 'New Lead'}
          </h2>
          <button onClick={closeLeadDialog} style={{ background: 'transparent', border: 'none', color: 'var(--crm-text-muted)', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>{error}</div>}
          
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--crm-text-dim)', marginBottom: '6px' }}>Full Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'var(--crm-bg)', border: '1px solid var(--crm-border)', borderRadius: '8px', color: 'var(--crm-text)', fontSize: '13px', outline: 'none' }} placeholder="E.g. John Doe" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--crm-text-dim)', marginBottom: '6px' }}>Email Address *</label>
            <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'var(--crm-bg)', border: '1px solid var(--crm-border)', borderRadius: '8px', color: 'var(--crm-text)', fontSize: '13px', outline: 'none' }} placeholder="E.g. john@example.com" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--crm-text-dim)', marginBottom: '6px' }}>Phone Number</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'var(--crm-bg)', border: '1px solid var(--crm-border)', borderRadius: '8px', color: 'var(--crm-text)', fontSize: '13px', outline: 'none' }} placeholder="+62 8..." />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--crm-text-dim)', marginBottom: '6px' }}>Country Code</label>
            <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} style={{ width: '100%', padding: '10px 12px', background: 'var(--crm-bg)', border: '1px solid var(--crm-border)', borderRadius: '8px', color: 'var(--crm-text)', fontSize: '13px', outline: 'none' }} placeholder="E.g. ID, MY, US" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--crm-border)' }}>
            {leadToEdit ? (
               <button type="button" onClick={handleDelete} disabled={loading} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                 <Trash2 size={14} /> Archive
               </button>
            ) : <div />}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={closeLeadDialog} disabled={loading} style={{ background: 'transparent', border: '1px solid var(--crm-border)', color: 'var(--crm-text)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ background: 'var(--crm-brand)', border: '1px solid var(--crm-brand)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {loading && <Loader2 size={14} className="animate-spin" />} Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

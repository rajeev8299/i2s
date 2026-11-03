import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Check, Plus, Edit2, Shield, DollarSign,
  Users, ArrowRight, ExternalLink, RefreshCw, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'catalog'
  const [loading, setLoading] = useState(true);

  // Quote preparation modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quotationAmount, setQuotationAmount] = useState('');
  const [quotationNotes, setQuotationNotes] = useState('');
  const [assignedLeaderId, setAssignedLeaderId] = useState('');
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);

  // Edit / Add Service modal
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: '',
    category: 'Web Development',
    description: '',
    deliverables: '',
    pricingModel: 'FIXED',
    basePrice: '',
    billingFrequency: 'ONE_TIME',
    estimatedDuration: '',
    unit: 'project',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [srvData, reqData, uData] = await Promise.all([
        apiFetch('/services/admin'),
        apiFetch('/services/requests'),
        apiFetch('/users').catch(() => ({ users: [] })),
      ]);

      if (srvData.success) setServices(srvData.services || []);
      if (reqData.success) setRequests(reqData.requests || []);
      if (uData.users) {
        setTeamLeaders(uData.users.filter(u => u.role === 'TEAM_LEADER' || u.role === 'ADMIN'));
      }
    } catch (err) {
      console.error('Error loading admin services data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQuoteModal = (req) => {
    setSelectedRequest(req);
    setQuotationAmount(req.estimatedBudget || '');
    setQuotationNotes(`Official quotation for ${req.serviceTitles}`);
    setAssignedLeaderId('');
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !quotationAmount) return;
    setIsSubmittingQuote(true);

    try {
      const res = await apiFetch(`/services/requests/${selectedRequest.id}/quotation`, {
        method: 'POST',
        body: JSON.stringify({
          quotationAmount: parseFloat(quotationAmount),
          quotationNotes,
          assignedLeaderId: assignedLeaderId || null,
        }),
      });

      if (res.success) {
        alert('Quotation submitted and Invoice generated! Client notified.');
        setSelectedRequest(null);
        loadData();
      } else {
        alert(res.error || 'Failed to submit quotation.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...serviceForm,
        id: editingService ? editingService.id : undefined,
      };

      const res = await apiFetch('/services/admin', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setShowServiceModal(false);
        setEditingService(null);
        loadData();
      } else {
        alert(res.error || 'Failed to save service.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const openEditService = (s) => {
    setEditingService(s);
    setServiceForm({
      title: s.title,
      category: s.category || 'Web Development',
      description: s.description || '',
      deliverables: s.deliverables || '',
      pricingModel: s.pricingModel || 'FIXED',
      basePrice: s.basePrice || '',
      billingFrequency: s.billingFrequency || 'ONE_TIME',
      estimatedDuration: s.estimatedDuration || '',
      unit: s.unit || 'project',
      isActive: s.isActive !== undefined ? s.isActive : true,
    });
    setShowServiceModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            Service Management & Quotations
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Review incoming client service requests, generate formal quotations & invoices, assign Team Leaders, and manage catalog offerings.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ display: 'flex', background: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'requests' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'requests' ? 'var(--dark-navy)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Client Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'catalog' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'catalog' ? 'var(--dark-navy)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Catalog Management ({services.length})
            </button>
          </div>

          {activeTab === 'catalog' && (
            <button
              onClick={() => {
                setEditingService(null);
                setServiceForm({
                  title: '',
                  category: 'Web Development',
                  description: '',
                  deliverables: '',
                  pricingModel: 'FIXED',
                  basePrice: '',
                  billingFrequency: 'ONE_TIME',
                  estimatedDuration: '',
                  unit: 'project',
                  isActive: true,
                });
                setShowServiceModal(true);
              }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Plus size={16} /> Add Service
            </button>
          )}
        </div>
      </div>

      {activeTab === 'requests' ? (
        /* Service Requests Table */
        <div className="ref-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Client Company</th>
                  <th>Services Selected</th>
                  <th>Budget / Quoted</th>
                  <th>Status</th>
                  <th>Invoice Link</th>
                  <th>Project Link</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No service requests submitted yet.
                    </td>
                  </tr>
                ) : (
                  requests.map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 700 }}>{r.requestNumber}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{r.client?.companyName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.client?.user?.email}</div>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{r.serviceTitles}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>
                          ₹{(Number(r.quotationAmount) || Number(r.estimatedBudget) || 0).toLocaleString()}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          r.status === 'PAID' || r.status === 'CONFIRMED' ? 'badge-success' :
                          r.status === 'AWAITING_PAYMENT' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {r.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td>
                        {r.invoice ? (
                          <span className="badge badge-info">{r.invoice.invoiceNumber}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>None</span>
                        )}
                      </td>
                      <td>
                        {r.project ? (
                          <span className="badge badge-success">{r.project.code}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Pending Pay</span>
                        )}
                      </td>
                      <td>
                        {r.status === 'SUBMITTED' ? (
                          <button
                            onClick={() => handleOpenQuoteModal(r)}
                            className="btn-primary"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }}
                          >
                            Prepare Quote
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quote Sent</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Catalog Management Table */
        <div className="ref-card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Offering</th>
                  <th>Category</th>
                  <th>Pricing Model</th>
                  <th>Base Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{s.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                        {s.description?.slice(0, 75)}...
                      </div>
                    </td>
                    <td><span className="badge badge-info">{s.category}</span></td>
                    <td>{s.pricingModel} ({s.billingFrequency})</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>
                      ₹{Number(s.basePrice).toLocaleString()}/{s.unit}
                    </td>
                    <td>{s.estimatedDuration || 'N/A'}</td>
                    <td>
                      <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openEditService(s)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary-blue)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                        }}
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quotation & Invoice Modal */}
      {selectedRequest && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '550px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
              Prepare Quotation for {selectedRequest.requestNumber}
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Client: <strong>{selectedRequest.client?.companyName}</strong> | Services: {selectedRequest.serviceTitles}
            </p>

            <form onSubmit={handleSubmitQuotation}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                  Quoted Subtotal Amount (₹ Excl. 18% GST) *
                </label>
                <input
                  type="number"
                  required
                  value={quotationAmount}
                  onChange={(e) => setQuotationAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                  Assign Team Leader (Will lead project once paid)
                </label>
                <select
                  value={assignedLeaderId}
                  onChange={(e) => setAssignedLeaderId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                >
                  <option value="">Select Team Leader...</option>
                  {teamLeaders.map(tl => (
                    <option key={tl.id} value={tl.id}>
                      {tl.firstName} {tl.lastName} ({tl.role})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                  Quotation Notes & Scope Summary
                </label>
                <textarea
                  rows={3}
                  value={quotationNotes}
                  onChange={(e) => setQuotationNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: '#FFFFFF',
                    color: 'var(--dark-navy)',
                    fontSize: '0.85rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingQuote}
                  className="btn-primary"
                >
                  {isSubmittingQuote ? 'Generating...' : 'Issue Quotation & Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Add Service Modal */}
      {showServiceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '600px',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '1rem' }}>
              {editingService ? 'Edit Service Offering' : 'Add New Service Offering'}
            </h2>

            <form onSubmit={handleSaveService}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={serviceForm.title}
                    onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                    Category
                  </label>
                  <input
                    type="text"
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={serviceForm.basePrice}
                    onChange={(e) => setServiceForm({ ...serviceForm, basePrice: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                    Billing Frequency
                  </label>
                  <select
                    value={serviceForm.billingFrequency}
                    onChange={(e) => setServiceForm({ ...serviceForm, billingFrequency: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  >
                    <option value="ONE_TIME">One-Time</option>
                    <option value="MONTHLY">Monthly Retainer</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                  Deliverables Summary
                </label>
                <textarea
                  rows={2}
                  value={serviceForm.deliverables}
                  onChange={(e) => setServiceForm({ ...serviceForm, deliverables: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: '#FFFFFF',
                    color: 'var(--dark-navy)',
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServicesPage;

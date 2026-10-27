import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag, Check, Plus, ArrowRight, ShieldCheck, Clock,
  FileText, CreditCard, Sparkles, AlertCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ClientServicesPage = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'requests'

  // Modal / Checkout state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [requirements, setRequirements] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Payment state
  const [payingRequestId, setPayingRequestId] = useState(null);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  useEffect(() => {
    loadServices();
    loadMyRequests();
  }, [selectedCategory, search]);

  const loadServices = async () => {
    try {
      let query = `?category=${encodeURIComponent(selectedCategory)}`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      const res = await apiFetch(`/services${query}`);
      if (res.success) {
        setServices(res.services || []);
        // Extract distinct categories
        const distinct = ['All', ...new Set((res.services || []).map(s => s.category).filter(Boolean))];
        setCategories(distinct);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    }
  };

  const loadMyRequests = async () => {
    try {
      const res = await apiFetch('/services/requests');
      if (res.success) {
        setMyRequests(res.requests || []);
      }
    } catch (err) {
      console.error('Error loading requests:', err);
    }
  };

  const toggleSelectService = (service) => {
    if (selectedServices.some(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const totalEstimatedAmount = selectedServices.reduce((sum, s) => sum + Number(s.basePrice), 0);

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedServices.length) return;
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await apiFetch('/services/request', {
        method: 'POST',
        body: JSON.stringify({
          serviceIds: selectedServices.map(s => s.id),
          requirements,
          referenceLinks,
          targetDate: targetDate || null,
          estimatedBudget: totalEstimatedAmount,
        }),
      });

      if (res.success) {
        setSubmitMessage({ type: 'success', text: 'Service request submitted successfully! Our technical team is reviewing your requirements.' });
        setSelectedServices([]);
        setRequirements('');
        setReferenceLinks('');
        setTargetDate('');
        setShowCheckoutModal(false);
        loadMyRequests();
        setActiveTab('requests');
      } else {
        setSubmitMessage({ type: 'error', text: res.error || 'Failed to submit request.' });
      }
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayRequest = async (requestId) => {
    setPayingRequestId(requestId);
    try {
      const res = await apiFetch(`/services/requests/${requestId}/pay`, {
        method: 'POST',
        body: JSON.stringify({
          paymentMethod: 'TEST_CARD_OR_UPI',
          transactionRef: `GATEWAY-VERIFIED-${Date.now()}`,
        }),
      });

      if (res.success) {
        setPaymentSuccessData(res);
        loadMyRequests();
      } else {
        alert(res.error || 'Payment failed.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setPayingRequestId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--dark-navy)', fontFamily: 'var(--font-heading)' }}>
            Client Service Catalog & Online Solutions
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Select digital services, customize scope, request technical quotations, and track project activation.
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
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
              boxShadow: activeTab === 'catalog' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Browse Catalog ({services.length})
          </button>
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
              boxShadow: activeTab === 'requests' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            My Orders & Requests ({myRequests.length})
          </button>
        </div>
      </div>

      {submitMessage && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          background: submitMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${submitMessage.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
          color: submitMessage.type === 'success' ? '#065F46' : '#991B1B',
          fontSize: '0.85rem',
        }}>
          {submitMessage.text}
        </div>
      )}

      {/* Payment Success Confirmation Banner */}
      {paymentSuccessData && (
        <div style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          background: '#ECFDF5',
          border: '1px solid #10B981',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 800, color: '#065F46', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#10B981" /> Payment Verified & Project Activated!
            </div>
            <div style={{ color: '#047857', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Receipt Number: <strong>{paymentSuccessData.receiptNumber}</strong>. Your project is now active in your portal.
            </div>
          </div>
          <Link to="/app/client-progress" className="btn-primary" style={{ textDecoration: 'none' }}>
            Open Project Progress Timeline →
          </Link>
        </div>
      )}

      {activeTab === 'catalog' ? (
        <>
          {/* Controls: Categories & Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: 1 }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--primary-blue)' : 'var(--border-color)',
                    background: selectedCategory === cat ? 'var(--primary-blue)' : '#FFFFFF',
                    color: selectedCategory === cat ? '#FFFFFF' : 'var(--dark-navy)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search services or deliverables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                minWidth: '240px',
              }}
            />
          </div>

          {/* Service Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {services.map(s => {
              const isSelected = selectedServices.some(item => item.id === s.id);
              return (
                <div
                  key={s.id}
                  className="ref-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isSelected ? '2px solid var(--primary-blue)' : '1px solid var(--border-color)',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'var(--primary-blue)',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Check size={14} />
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{s.category}</span>
                      {s.estimatedDuration && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={12} /> {s.estimatedDuration}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
                      {s.title}
                    </h3>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
                      {s.description}
                    </p>

                    {s.deliverables && (
                      <div style={{ background: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Included Deliverables
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--dark-navy)', lineHeight: '1.4' }}>
                          {s.deliverables}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Starting from</span>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                          ₹{Number(s.basePrice).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                          /{s.unit}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSelectService(s)}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        border: isSelected ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
                        background: isSelected ? 'var(--primary-blue)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : 'var(--dark-navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSelected ? (
                        <>Selected <Check size={16} /></>
                      ) : (
                        <>Select Service <Plus size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Checkout Bar when services are selected */}
          {selectedServices.length > 0 && (
            <div style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '850px',
              background: 'var(--dark-navy)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              zIndex: 100,
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {selectedServices.length} Service{selectedServices.length > 1 ? 's' : ''} Selected
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                  Total Estimated Base: <strong style={{ color: '#FFFFFF' }}>₹{totalEstimatedAmount.toLocaleString()}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  onClick={() => setSelectedServices([])}
                  style={{
                    background: 'transparent',
                    border: '1px solid #475569',
                    color: '#94A3B8',
                    padding: '0.5rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  style={{
                    background: 'var(--primary-blue)',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '0.55rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  Proceed to Requirements & Quote <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Requests & Orders Tab */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {myRequests.length === 0 ? (
            <div className="ref-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <ShoppingBag size={42} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--dark-navy)' }}>No Service Requests Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                Browse our enterprise technology service catalog and submit your custom project requirements to begin.
              </p>
              <button onClick={() => setActiveTab('catalog')} className="btn-primary">
                Browse Service Catalog
              </button>
            </div>
          ) : (
            myRequests.map(req => {
              const isPaid = req.status === 'PAID' || req.status === 'CONFIRMED' || req.status === 'IN_PROGRESS';
              return (
                <div key={req.id} className="ref-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--dark-navy)' }}>
                          {req.requestNumber}
                        </span>
                        <span className={`badge ${
                          isPaid ? 'badge-success' : req.status === 'AWAITING_PAYMENT' ? 'badge-warning' : 'badge-info'
                        }`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Services: <strong>{req.serviceTitles}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated / Quoted Budget</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                        ₹{(Number(req.quotationAmount) || Number(req.estimatedBudget) || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: '#F8FAFC', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      SCOPE & SPECIFICATIONS:
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--dark-navy)', whiteSpace: 'pre-line' }}>
                      {req.requirements}
                    </div>
                  </div>

                  {/* Quotation & Invoice details */}
                  {req.invoice && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: '#EFF6FF', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
                          Official Invoice Generated: {req.invoice.invoiceNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Total payable: ₹{Number(req.invoice.totalAmount).toLocaleString()} (incl. 18% GST)
                        </div>
                      </div>
                      <span className={`badge ${req.invoice.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                        Invoice {req.invoice.status}
                      </span>
                    </div>
                  )}

                  {/* Actions & Next Steps */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Submitted on: {new Date(req.createdAt).toLocaleDateString()}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {req.status === 'AWAITING_PAYMENT' && req.invoice && (
                        <button
                          onClick={() => handlePayRequest(req.id)}
                          disabled={payingRequestId === req.id}
                          className="btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#059669' }}
                        >
                          <CreditCard size={16} />
                          {payingRequestId === req.id ? 'Processing...' : 'Pay Online & Activate Project'}
                        </button>
                      )}

                      {req.project && (
                        <Link to="/app/client-progress" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}>
                          <ExternalLink size={16} /> Open Progress Timeline
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Checkout Requirements Modal */}
      {showCheckoutModal && (
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
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark-navy)', marginBottom: '0.5rem' }}>
              Confirm Service Selection & Project Scope
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Selected: <strong>{selectedServices.map(s => s.title).join(', ')}</strong>
            </p>

            <form onSubmit={handleSubmitRequest}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                  Project Requirements & Deliverable Expectations *
                </label>
                <textarea
                  required
                  rows={4}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe your project, objectives, desired features, target audience, and technology requirements..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                    Calculated Estimate
                  </label>
                  <div style={{
                    padding: '0.55rem 0.75rem',
                    background: '#F1F5F9',
                    borderRadius: 'var(--radius-sm)',
                    fontWeight: 800,
                    color: 'var(--primary-blue)',
                    fontSize: '0.95rem',
                  }}>
                    ₹{totalEstimatedAmount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark-navy)', marginBottom: '0.35rem' }}>
                  Reference Links / Assets / Figma / Staging URLs (Optional)
                </label>
                <input
                  type="text"
                  value={referenceLinks}
                  onChange={(e) => setReferenceLinks(e.target.value)}
                  placeholder="https://figma.com/..., https://github.com/..."
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
                  onClick={() => setShowCheckoutModal(false)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: '#FFFFFF',
                    color: 'var(--dark-navy)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Service Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientServicesPage;

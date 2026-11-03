import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { Building, Plus, Search, FileText, CheckCircle2, ShieldAlert, Phone, Mail, MapPin } from 'lucide-react';

export const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gstin: '',
    address: '',
    city: '',
    internalNotes: '',
  });
  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    basePrice: '',
    unit: 'project',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cData, sData] = await Promise.all([
        apiFetch('/clients'),
        apiFetch('/clients/services'),
      ]);
      setClients(cData.clients || []);
      setServices(sData.services || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/clients', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowClientModal(false);
      setFormData({
        companyName: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gstin: '',
        address: '',
        city: '',
        internalNotes: '',
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/clients/services', {
        method: 'POST',
        body: JSON.stringify(serviceForm),
      });
      setShowServiceModal(false);
      setServiceForm({
        title: '',
        description: '',
        basePrice: '',
        unit: 'project',
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredClients = clients.filter((c) =>
    `${c.companyName} ${c.user?.email || ''} ${c.user?.firstName || ''} ${c.city || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Breadcrumb and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Operations &bull; Client Accounts
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Client Management & Services
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowServiceModal(true)} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} /> Add Service
          </button>
          <button onClick={() => setShowClientModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Building size={16} /> Onboard Client
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Active Clients</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{clients.length}</div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Projects Contracted</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {clients.reduce((acc, c) => acc + (c.projects?.length || 0), 0)}
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Service Catalogue</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>{services.length} Offerings</div>
          </div>
        </div>
      </div>

      {/* Clients Filter & Table Card */}
      <div className="ref-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
              Client Directory
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Registered corporate partners, billing contacts, and GST credentials.
            </p>
          </div>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by company, contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Primary Contact</th>
                <th>GSTIN & Location</th>
                <th>Active Projects</th>
                <th>Internal Directives</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                    No client records match the criteria.
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {c.companyName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: {c.id.slice(0, 8)} &bull; {c.city || 'India'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {c.user?.firstName} {c.user?.lastName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Mail size={12} /> {c.user?.email || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 600 }}>
                        {c.gstin || 'Unregistered'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={12} /> {c.address || c.city || 'Standard Address'}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {c.projects?.length || 0} Project(s)
                      </span>
                    </td>
                    <td>
                      {c.internalNotes ? (
                        <div style={{ fontSize: '0.82rem', color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#FEF3C7', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                          <ShieldAlert size={14} /> {c.internalNotes}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standard Account</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Catalogue Card */}
      <div className="ref-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
              Standard Technology Services Catalogue
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Base rate cards used for proposal quotes and automated invoice generation.
            </p>
          </div>
          <button onClick={() => setShowServiceModal(true)} className="btn-secondary" style={{ fontSize: '0.82rem' }}>
            <Plus size={14} /> New Service
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {services.map((s) => (
            <div key={s.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', background: '#FFFFFF' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{s.title}</div>
                <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  per {s.unit}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minHeight: '38px', margin: '0 0 0.75rem' }}>
                {s.description || 'Standard software engineering and enterprise consulting deliverable.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base Price</span>
                <span style={{ fontWeight: 800, color: 'var(--primary-blue)', fontSize: '1.05rem' }}>
                  Rs. {Number(s.basePrice).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Onboard Client Modal */}
      {showClientModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Onboard Enterprise Client
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Creates both the business client profile and the primary portal login account.
            </p>

            <form onSubmit={handleCreateClient} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">Company / Client Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Innovations Pvt Ltd"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="search-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Contact First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Client Portal Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">GSTIN (if registered)</label>
                  <input
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, MH"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Registered Office Address</label>
                <textarea
                  rows={2}
                  placeholder="Street address, building, postal code..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="search-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Internal Directives / Account Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated Account Manager required, Net-30 payment term"
                  value={formData.internalNotes}
                  onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                  className="search-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowClientModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save & Onboard Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showServiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Add Technology Service
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Define a rate item for standard billing and contract quotation.
            </p>

            <form onSubmit={handleCreateService} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Infrastructure Migration"
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="search-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  placeholder="Scope details and standard deliverables..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="search-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Base Price (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="50000"
                    value={serviceForm.basePrice}
                    onChange={(e) => setServiceForm({ ...serviceForm, basePrice: e.target.value })}
                    className="search-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Pricing Unit</label>
                  <select
                    value={serviceForm.unit}
                    onChange={(e) => setServiceForm({ ...serviceForm, unit: e.target.value })}
                    className="search-input"
                  >
                    <option value="project">per Project</option>
                    <option value="month">per Month</option>
                    <option value="hour">per Hour</option>
                    <option value="sprint">per Sprint</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowServiceModal(false)} className="btn-secondary">
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

export default ClientsPage;

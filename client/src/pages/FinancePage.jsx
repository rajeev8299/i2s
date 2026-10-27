import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { Receipt, Plus, Download, FileText, CheckCircle2, TrendingUp, CreditCard, DollarSign, Search, Calendar, AlertCircle } from 'lucide-react';

export const FinancePage = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Determine active section from URL path or fallback to invoices
  const getInitialTab = () => {
    if (location.pathname.includes('/payments')) return 'payments';
    if (location.pathname.includes('/ledger')) return 'ledger';
    return 'invoices';
  };

  const [invoices, setInvoices] = useState([]);
  const [reports, setReports] = useState(null);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');

  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    dueDate: '',
    discount: '0',
    taxRate: '18',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: '' }],
  });

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invData, repData, cliData] = await Promise.all([
        apiFetch('/finance/invoices'),
        user?.role !== 'CLIENT' ? apiFetch('/finance/reports').catch(() => null) : null,
        user?.role !== 'CLIENT' ? apiFetch('/clients').catch(() => ({ clients: [] })) : { clients: [] },
      ]);
      setInvoices(invData.invoices || []);
      setReports(repData);
      setClients(cliData.clients || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/finance/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceForm),
      });
      setShowInvoiceModal(false);
      setInvoiceForm({
        clientId: '',
        dueDate: '',
        discount: '0',
        taxRate: '18',
        notes: '',
        items: [{ description: '', quantity: 1, unitPrice: '' }],
      });
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await apiFetch(`/finance/invoices/${selectedInvoice.id}/payments`, {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          paymentMethod,
        }),
      });
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const addItemRow = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unitPrice: '' }],
    });
  };

  const updateItemRow = (index, field, value) => {
    const newItems = [...invoiceForm.items];
    newItems[index][field] = value;
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const removeItemRow = (index) => {
    if (invoiceForm.items.length === 1) return;
    const newItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  // Computed metrics
  const totalInvoiced = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((acc, inv) => acc + Number(inv.paidAmount || 0), 0);
  const totalPending = invoices
    .filter((inv) => ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status))
    .reduce((acc, inv) => acc + (Number(inv.totalAmount) - Number(inv.paidAmount)), 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = `${inv.invoiceNumber} ${inv.client?.companyName || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = statusFilter ? inv.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Extract all payment transactions from invoices
  const allPayments = invoices.flatMap((inv) =>
    (inv.payments || []).map((p) => ({
      ...p,
      invoiceNumber: inv.invoiceNumber,
      clientName: inv.client?.companyName,
    }))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
            Enterprise &bull; Financial Operations
          </div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Finance & Accounting
          </h1>
        </div>

        {user?.role !== 'CLIENT' && (
          <button onClick={() => setShowInvoiceModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Plus size={16} /> Create Tax Invoice
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Invoiced</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Rs. {totalInvoiced.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Collected Revenue</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16A34A' }}>
              Rs. {totalPaid.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="ref-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Outstanding Balance</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#D97706' }}>
              Rs. {totalPending.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'invoices' ? 'var(--primary-blue)' : 'transparent',
            color: activeTab === 'invoices' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <Receipt size={16} /> Invoices ({invoices.length})
        </button>

        {user?.role !== 'CLIENT' && (
          <>
            <button
              onClick={() => setActiveTab('payments')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'payments' ? 'var(--primary-blue)' : 'transparent',
                color: activeTab === 'payments' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <CreditCard size={16} /> Payment Receipts ({allPayments.length})
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'ledger' ? 'var(--primary-blue)' : 'transparent',
                color: activeTab === 'ledger' ? '#FFFFFF' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <DollarSign size={16} /> Trial Balance & Ledger
            </button>
          </>
        )}
      </div>

      {/* SECTION 1: INVOICES TAB */}
      {activeTab === 'invoices' && (
        <div className="ref-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search invoice number, client..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                  style={{ paddingLeft: '2.4rem' }}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="search-input"
                style={{ width: 'auto' }}
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="SENT">Sent</option>
                <option value="PAID">Paid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice Details</th>
                  <th>Client Name</th>
                  <th>Total Amount</th>
                  <th>Paid / Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No invoices found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--primary-blue)', fontSize: '0.92rem' }}>
                          {inv.invoiceNumber}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Due: {new Date(inv.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {inv.client?.companyName}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          Rs. {Number(inv.totalAmount).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Tax: Rs. {Number(inv.taxAmount).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#16A34A', fontWeight: 600 }}>
                          Rs. {Number(inv.paidAmount).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#D97706' }}>
                          Bal: Rs. {(Number(inv.totalAmount) - Number(inv.paidAmount)).toLocaleString('en-IN')}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            inv.status === 'PAID'
                              ? 'badge-success'
                              : inv.status === 'OVERDUE'
                              ? 'badge-danger'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {user?.role !== 'CLIENT' && inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPaymentAmount(Number(inv.totalAmount) - Number(inv.paidAmount));
                                setShowPaymentModal(true);
                              }}
                              className="btn-secondary"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                            >
                              Pay
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`/api/finance/invoices/${inv.id}/pdf`, '_blank')}
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            <Download size={13} /> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: PAYMENT RECEIPTS TAB */}
      {activeTab === 'payments' && user?.role !== 'CLIENT' && (
        <div className="ref-card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
              Recorded Payment Receipts
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
              Chronological log of inbound funds, bank transfers, and client settlements.
            </p>
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Receipt ID</th>
                  <th>Invoice Ref</th>
                  <th>Client</th>
                  <th>Amount Received</th>
                  <th>Method</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                      No payment receipts recorded yet.
                    </td>
                  </tr>
                ) : (
                  allPayments.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.id.slice(0, 8)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>{p.invoiceNumber}</td>
                      <td>{p.clientName}</td>
                      <td style={{ fontWeight: 700, color: '#16A34A' }}>
                        Rs. {Number(p.amount).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{p.paymentMethod}</span>
                      </td>
                      <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: TRIAL BALANCE & LEDGER TAB */}
      {activeTab === 'ledger' && user?.role !== 'CLIENT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="ref-card">
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                General Ledger & Trial Balance
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                Audited chart of accounts tracking debit and credit parity.
              </p>
            </div>

            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Account Code</th>
                    <th>Account Name</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Total Debit (INR)</th>
                    <th style={{ textAlign: 'right' }}>Total Credit (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {(!reports?.trialBalance || reports.trialBalance.length === 0) ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                        No ledger entries found.
                      </td>
                    </tr>
                  ) : (
                    reports.trialBalance.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.code || `ACC-${1000 + idx}`}</td>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>
                          <span className="badge badge-info">{item.type}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          Rs. {Number(item.debit || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>
                          Rs. {Number(item.credit || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Create GST Tax Invoice
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Standard compliant enterprise invoice with automated line total calculations.
            </p>

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Client *</label>
                  <select
                    required
                    value={invoiceForm.clientId}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                    className="search-input"
                  >
                    <option value="">Select Enterprise Client...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.dueDate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <label className="form-label">Invoice Items</label>
                {invoiceForm.items.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      required
                      placeholder="Service / Product Description"
                      value={item.description}
                      onChange={(e) => updateItemRow(index, 'description', e.target.value)}
                      className="search-input"
                    />
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItemRow(index, 'quantity', parseInt(e.target.value) || 1)}
                      className="search-input"
                    />
                    <input
                      type="number"
                      required
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItemRow(index, 'unitPrice', e.target.value)}
                      className="search-input"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.6rem', color: '#DC2626' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addItemRow} className="btn-secondary" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  + Add Item Line
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">GST Tax Rate (%)</label>
                  <select
                    value={invoiceForm.taxRate}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: e.target.value })}
                    className="search-input"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18% (Standard Tech Rate)</option>
                    <option value="28">28%</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Discount (INR)</label>
                  <input
                    type="number"
                    value={invoiceForm.discount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, discount: e.target.value })}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Client Notes & Payment Terms</label>
                <input
                  type="text"
                  placeholder="e.g. Bank wire instructions, Net-15 terms..."
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  className="search-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20, 38, 63, 0.6)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="ref-card" style={{ maxWidth: '440px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Record Payment Receipt
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Apply funds to {selectedInvoice.invoiceNumber} ({selectedInvoice.client?.companyName})
            </p>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div className="form-group">
                <label className="form-label">Amount Received (INR) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="search-input"
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI Payment</option>
                  <option value="CARD">Credit/Debit Card</option>
                  <option value="CASH">Cash Deposit</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;

import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import {
  getQuotations,
  getQuotationById,
  createQuotation,
  updateQuotation,
  deleteQuotation
} from './Quotation.api';
import { getCustomers } from '../../masters/customer/Customer.api';
import { getPaymentTerms } from '../../masters/payment-terms/PaymentTerms.api';
import { getBanks } from '../../masters/banks/Banks.api';
import { getItems } from '../../item-master/item/item.api';
import QuotationForm from './QuotationForm';
import './Quotation.css';

const formatDate = (value: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN');
};

const formatCurrency = (value: number) => `₹${(value ?? 0).toFixed(2)}`;

export default function QuotationPage() {
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [editingQuotation, setEditingQuotation] = useState<any>(null);
  const [viewQuotation, setViewQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const response = await getQuotations();
      const rows = response.data || [];
      setTableData(
        rows.map((q: any) => ({
          ...q,
          customerName: q.customer?.companyName ?? '—',
          quoteDateLabel: formatDate(q.quoteDate),
          expiryDateLabel: formatDate(q.expiryDate),
          grossAmountLabel: formatCurrency(q.grossAmount),
          grandTotalLabel: formatCurrency(q.grandTotal),
          quoteTypeLabel: q.quoteType === 'SERVICE' ? 'Service' : 'Goods'
        }))
      );
    } catch (error) {
      console.error('Error fetching quotations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [customersRes, paymentRes, banksRes, itemsRes] = await Promise.all([
        getCustomers(),
        getPaymentTerms(),
        getBanks(),
        getItems()
      ]);
      setCustomers(customersRes.data || []);
      setPaymentTerms(paymentRes.data || []);
      setBankAccounts(banksRes.data || []);
      setItems(itemsRes.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  useEffect(() => {
    fetchQuotations();
    fetchMasterData();
  }, []);

  const handleCreate = () => {
    setEditingQuotation(null);
    setShowForm(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await getQuotationById(id);
      setEditingQuotation(response.data);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      alert('Could not load quotation for editing.');
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await getQuotationById(id);
      setViewQuotation(response.data);
      setShowView(true);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      alert('Could not load quotation details.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this quotation?')) return;
    try {
      await deleteQuotation(id);
      await fetchQuotations();
    } catch (error) {
      console.error('Error deleting quotation:', error);
      alert('Error deleting quotation.');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingQuotation?.id) {
        await updateQuotation(editingQuotation.id, formData);
      } else {
        await createQuotation(formData);
      }
      setShowForm(false);
      setEditingQuotation(null);
      await fetchQuotations();
    } catch (error) {
      console.error('Error saving quotation:', error);
      alert('Error saving quotation.');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingQuotation(null);
  };

  return (
    <>
      <div className="page-header-container">
        <h2>Quotations</h2>
        <Button text="Create Quotation" onClick={handleCreate} />
      </div>

      <div className="page-container quotation-page">
        {loading ? (
          <p className="quotation-loading">Loading quotations…</p>
        ) : tableData.length === 0 ? (
          <p className="quotation-empty">No quotations yet. Create your first quotation.</p>
        ) : (
          <div className="quotation-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Quote #</th>
                  <th>Customer</th>
                  <th>Quote Date</th>
                  <th>Expiry</th>
                  <th>Type</th>
                  <th>Gross</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.customerName}</td>
                    <td>{row.quoteDateLabel}</td>
                    <td>{row.expiryDateLabel}</td>
                    <td>{row.quoteTypeLabel}</td>
                    <td>{row.grossAmountLabel}</td>
                    <td>{row.grandTotalLabel}</td>
                    <td>
                      <div className="quotation-row-actions">
                        <button type="button" className="action-btn view" onClick={() => handleView(row.id)}>
                          View
                        </button>
                        <button type="button" className="action-btn edit" onClick={() => handleEdit(row.id)}>
                          Edit
                        </button>
                        <button type="button" className="action-btn delete" onClick={() => handleDelete(row.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <QuotationForm
        show={showForm}
        onHide={closeForm}
        onSubmit={handleSubmit}
        initialData={editingQuotation}
        customers={customers}
        paymentTerms={paymentTerms}
        bankAccounts={bankAccounts}
        items={items}
      />

      <Modal show={showView} onHide={() => setShowView(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Quotation #{viewQuotation?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewQuotation && (
            <div className="quotation-view">
              <div className="quotation-view-grid">
                <div>
                  <span className="label">Customer</span>
                  <span>{viewQuotation.customer?.companyName ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Contact</span>
                  <span>{viewQuotation.contactPerson?.name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">GST No.</span>
                  <span>{viewQuotation.gstNo ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Quote Type</span>
                  <span>{viewQuotation.quoteType === 'SERVICE' ? 'Service' : 'Goods'}</span>
                </div>
                <div>
                  <span className="label">Quote Date</span>
                  <span>{formatDate(viewQuotation.quoteDate)}</span>
                </div>
                <div>
                  <span className="label">Expiry Date</span>
                  <span>{formatDate(viewQuotation.expiryDate)}</span>
                </div>
                <div>
                  <span className="label">Payment Terms</span>
                  <span>{viewQuotation.paymentTerms?.term_name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Bank</span>
                  <span>
                    {viewQuotation.bankAccount
                      ? `${viewQuotation.bankAccount.bank_name} - ${viewQuotation.bankAccount.account_number}`
                      : '—'}
                  </span>
                </div>
              </div>

              <h5 className="quotation-view-heading">Line Items</h5>
              <div className="quotation-view-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>HSN</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewQuotation.lineItems || []).map((line: any) => (
                      <tr key={line.id}>
                        <td>{line.description || '—'}</td>
                        <td>{line.hsnCode || '—'}</td>
                        <td>{line.qty}</td>
                        <td>{formatCurrency(line.rate)}</td>
                        <td>{formatCurrency(line.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="quotation-view-totals">
                <div>
                  <span>Gross Amount</span>
                  <strong>{formatCurrency(viewQuotation.grossAmount)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <strong>{formatCurrency(viewQuotation.shippingCharge)}</strong>
                </div>
                <div className="grand">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(viewQuotation.grandTotal)}</strong>
                </div>
              </div>

              {viewQuotation.termsAndConditions && (
                <>
                  <h5 className="quotation-view-heading">Terms & Conditions</h5>
                  <p className="quotation-view-terms">{viewQuotation.termsAndConditions}</p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button text="Close" onClick={() => setShowView(false)} />
        </Modal.Footer>
      </Modal>
    </>
  );
}

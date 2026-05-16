import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import {
  getTaxInvoices,
  getTaxInvoiceById,
  createTaxInvoice,
  updateTaxInvoice,
  deleteTaxInvoice
} from './TaxInvoice.api';
import { getCustomers } from '../../masters/customer/Customer.api';
import { getPaymentTerms } from '../../masters/payment-terms/PaymentTerms.api';
import { getPlantUnit } from '../../masters/store/plant-units/PlantUnits.api';
import { getWarehouses } from '../../masters/store/warehouse/Warehouse.api';
import { getBanks } from '../../masters/banks/Banks.api';
import { getItems } from '../../item-master/item/item.api';
import { getSalesOrders } from '../sales-order/SalesOrder.api';
import { getCompanyDetails } from '../../masters/company-details/CompanyDetails.api';
import TaxInvoiceForm from './TaxInvoiceForm';
import { printTaxInvoice } from './taxInvoicePrint';
import '../quotation/Quotation.css';
import './TaxInvoice.css';

const formatDate = (value: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN');
};

const formatCurrency = (value: number) => `₹${(value ?? 0).toFixed(2)}`;

export default function TaxInvoicePage() {
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [plantUnits, setPlantUnits] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [viewInvoice, setViewInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTaxInvoices = async () => {
    try {
      setLoading(true);
      const response = await getTaxInvoices();
      const rows = response.data || [];
      setTableData(
        rows.map((inv: any) => ({
          ...inv,
          customerName: inv.customer?.companyName ?? '—',
          invoiceDateLabel: formatDate(inv.invoiceDate),
          grandTotalLabel: formatCurrency(inv.grandTotal)
        }))
      );
    } catch (error) {
      console.error('Error fetching tax invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [customersRes, paymentRes, plantRes, warehouseRes, banksRes, itemsRes, ordersRes] =
        await Promise.all([
          getCustomers(),
          getPaymentTerms(),
          getPlantUnit(),
          getWarehouses(),
          getBanks(),
          getItems(),
          getSalesOrders()
        ]);
      setCustomers(customersRes.data || []);
      setPaymentTerms(paymentRes.data || []);
      setPlantUnits(plantRes.data || []);
      setWarehouses(warehouseRes.data || []);
      setBankAccounts(banksRes.data || []);
      setItems(itemsRes.data || []);
      setSalesOrders(ordersRes.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  useEffect(() => {
    fetchTaxInvoices();
    fetchMasterData();
  }, []);

  const handleCreate = () => {
    setEditingInvoice(null);
    setShowForm(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await getTaxInvoiceById(id);
      setEditingInvoice(response.data);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching tax invoice:', error);
      alert('Could not load tax invoice for editing.');
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await getTaxInvoiceById(id);
      setViewInvoice(response.data);
      setShowView(true);
    } catch (error) {
      console.error('Error fetching tax invoice:', error);
      alert('Could not load tax invoice details.');
    }
  };

  const handlePrint = async (id: number) => {
    try {
      const [invoiceRes, companyRes] = await Promise.all([
        getTaxInvoiceById(id),
        getCompanyDetails()
      ]);
      const company = companyRes?.data?.[0];
      if (!company) {
        alert('Company details not configured. Please add them under Master → Company Details.');
        return;
      }
      printTaxInvoice(invoiceRes.data, company);
    } catch (error) {
      console.error('Error printing tax invoice:', error);
      alert('Could not prepare tax invoice for printing.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this tax invoice?')) return;
    try {
      await deleteTaxInvoice(id);
      await fetchTaxInvoices();
    } catch (error) {
      console.error('Error deleting tax invoice:', error);
      alert('Error deleting tax invoice.');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingInvoice?.id) {
        await updateTaxInvoice(editingInvoice.id, formData);
      } else {
        await createTaxInvoice(formData);
      }
      setShowForm(false);
      setEditingInvoice(null);
      await fetchTaxInvoices();
    } catch (error) {
      console.error('Error saving tax invoice:', error);
      alert('Error saving tax invoice.');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  return (
    <>
      <div className="page-header-container">
        <h2>Tax Invoices</h2>
        <Button text="Add Tax Invoice" onClick={handleCreate} />
      </div>

      <div className="page-container quotation-page tax-invoice-page">
        {loading ? (
          <p className="quotation-loading">Loading tax invoices…</p>
        ) : tableData.length === 0 ? (
          <p className="quotation-empty">No tax invoices yet. Click Add Tax Invoice to create one.</p>
        ) : (
          <div className="quotation-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Invoice No.</th>
                  <th>Customer</th>
                  <th>Invoice Date</th>
                  <th>Ref. SO</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.id}>
                    <td>{row.invoiceNo}</td>
                    <td>{row.customerName}</td>
                    <td>{row.invoiceDateLabel}</td>
                    <td>{row.refSalesOrderId ? `#${row.refSalesOrderId}` : '—'}</td>
                    <td>{row.grandTotalLabel}</td>
                    <td>
                      <div className="quotation-row-actions">
                        <button type="button" className="action-btn view" onClick={() => handleView(row.id)}>
                          View
                        </button>
                        <button type="button" className="action-btn print" onClick={() => handlePrint(row.id)}>
                          Print
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

      <TaxInvoiceForm
        show={showForm}
        onHide={closeForm}
        onSubmit={handleSubmit}
        initialData={editingInvoice}
        customers={customers}
        paymentTerms={paymentTerms}
        plantUnits={plantUnits}
        warehouses={warehouses}
        bankAccounts={bankAccounts}
        items={items}
        salesOrders={salesOrders}
      />

      <Modal show={showView} onHide={() => setShowView(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Tax Invoice — {viewInvoice?.invoiceNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewInvoice && (
            <div className="quotation-view">
              <div className="quotation-view-grid">
                <div>
                  <span className="label">Customer</span>
                  <span>{viewInvoice.customer?.companyName ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Contact</span>
                  <span>{viewInvoice.contactPerson?.name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">GST No.</span>
                  <span>{viewInvoice.gstNo ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Invoice Date</span>
                  <span>{formatDate(viewInvoice.invoiceDate)}</span>
                </div>
                <div>
                  <span className="label">Plant Unit</span>
                  <span>{viewInvoice.plantUnit?.unit_name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Warehouse</span>
                  <span>{viewInvoice.warehouse?.name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Customer PO</span>
                  <span>{viewInvoice.customerPoNo ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Ref. Sales Order</span>
                  <span>{viewInvoice.refSalesOrderId ? `#${viewInvoice.refSalesOrderId}` : '—'}</span>
                </div>
                <div className="quotation-view-span-2">
                  <span className="label">Billing Address</span>
                  <span>{viewInvoice.billingAddressText ?? '—'}</span>
                </div>
                <div className="quotation-view-span-2">
                  <span className="label">Shipping Address</span>
                  <span>{viewInvoice.shippingAddressText ?? '—'}</span>
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
                    {(viewInvoice.lineItems || []).map((line: any) => (
                      <tr key={line.id}>
                        <td>{line.description || line.itemDetails || '—'}</td>
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
                  <strong>{formatCurrency(viewInvoice.grossAmount)}</strong>
                </div>
                <div>
                  <span>CGST</span>
                  <strong>{formatCurrency(viewInvoice.cgstAmount)}</strong>
                </div>
                <div>
                  <span>SGST</span>
                  <strong>{formatCurrency(viewInvoice.sgstAmount)}</strong>
                </div>
                <div>
                  <span>IGST</span>
                  <strong>{formatCurrency(viewInvoice.igstAmount)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <strong>{formatCurrency(viewInvoice.shippingCharge)}</strong>
                </div>
                <div>
                  <span>TCS</span>
                  <strong>{formatCurrency(viewInvoice.tcsAmount)}</strong>
                </div>
                <div className="grand">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(viewInvoice.grandTotal)}</strong>
                </div>
              </div>

              {viewInvoice.termsAndConditions && (
                <>
                  <h5 className="quotation-view-heading">Terms & Conditions</h5>
                  <p className="quotation-view-terms">{viewInvoice.termsAndConditions}</p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="action-btn print quotation-view-print"
            onClick={() => viewInvoice?.id && handlePrint(viewInvoice.id)}
          >
            Print
          </button>
          <Button text="Close" onClick={() => setShowView(false)} />
        </Modal.Footer>
      </Modal>
    </>
  );
}

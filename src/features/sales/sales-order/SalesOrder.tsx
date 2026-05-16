import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder
} from './SalesOrder.api';
import { getCustomers } from '../../masters/customer/Customer.api';
import { getPaymentTerms } from '../../masters/payment-terms/PaymentTerms.api';
import { getPlantUnit } from '../../masters/store/plant-units/PlantUnits.api';
import { getItems } from '../../item-master/item/item.api';
import { getQuotations } from '../quotation/Quotation.api';
import { getCompanyDetails } from '../../masters/company-details/CompanyDetails.api';
import SalesOrderForm from './SalesOrderForm';
import { printSalesOrder } from './salesOrderPrint';
import '../quotation/Quotation.css';
import './SalesOrder.css';

const formatDate = (value: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN');
};

const formatCurrency = (value: number) => `₹${(value ?? 0).toFixed(2)}`;

export default function SalesOrderPage() {
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [plantUnits, setPlantUnits] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const response = await getSalesOrders();
      const rows = response.data || [];
      setTableData(
        rows.map((o: any) => ({
          ...o,
          customerName: o.customer?.companyName ?? '—',
          orderDateLabel: formatDate(o.orderDate),
          poNoLabel: o.poNo || '—',
          grandTotalLabel: formatCurrency(o.grandTotal)
        }))
      );
    } catch (error) {
      console.error('Error fetching sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [customersRes, paymentRes, plantRes, itemsRes, quotationsRes] = await Promise.all([
        getCustomers(),
        getPaymentTerms(),
        getPlantUnit(),
        getItems(),
        getQuotations()
      ]);
      setCustomers(customersRes.data || []);
      setPaymentTerms(paymentRes.data || []);
      setPlantUnits(plantRes.data || []);
      setItems(itemsRes.data || []);
      setQuotations(quotationsRes.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
    fetchMasterData();
  }, []);

  const handleCreate = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await getSalesOrderById(id);
      setEditingOrder(response.data);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching sales order:', error);
      alert('Could not load sales order for editing.');
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await getSalesOrderById(id);
      setViewOrder(response.data);
      setShowView(true);
    } catch (error) {
      console.error('Error fetching sales order:', error);
      alert('Could not load sales order details.');
    }
  };

  const handlePrint = async (id: number) => {
    try {
      const [orderRes, companyRes] = await Promise.all([
        getSalesOrderById(id),
        getCompanyDetails()
      ]);
      const company = companyRes?.data?.[0];
      if (!company) {
        alert('Company details not configured. Please add them under Master → Company Details.');
        return;
      }
      printSalesOrder(orderRes.data, company);
    } catch (error) {
      console.error('Error printing sales order:', error);
      alert('Could not prepare sales order for printing.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this sales order?')) return;
    try {
      await deleteSalesOrder(id);
      await fetchSalesOrders();
    } catch (error) {
      console.error('Error deleting sales order:', error);
      alert('Error deleting sales order.');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingOrder?.id) {
        await updateSalesOrder(editingOrder.id, formData);
      } else {
        await createSalesOrder(formData);
      }
      setShowForm(false);
      setEditingOrder(null);
      await fetchSalesOrders();
    } catch (error) {
      console.error('Error saving sales order:', error);
      alert('Error saving sales order.');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  return (
    <>
      <div className="page-header-container">
        <h2>Sales Orders</h2>
        <Button text="Add Sales Order" onClick={handleCreate} />
      </div>

      <div className="page-container quotation-page sales-order-page">
        {loading ? (
          <p className="quotation-loading">Loading sales orders…</p>
        ) : tableData.length === 0 ? (
          <p className="quotation-empty">No sales orders yet. Click Add Sales Order to create one.</p>
        ) : (
          <div className="quotation-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Order Date</th>
                  <th>PO No.</th>
                  <th>Ref Quote</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.customerName}</td>
                    <td>{row.orderDateLabel}</td>
                    <td>{row.poNoLabel}</td>
                    <td>{row.refQuotationId ? `#${row.refQuotationId}` : '—'}</td>
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

      <SalesOrderForm
        show={showForm}
        onHide={closeForm}
        onSubmit={handleSubmit}
        initialData={editingOrder}
        customers={customers}
        paymentTerms={paymentTerms}
        plantUnits={plantUnits}
        items={items}
        quotations={quotations}
      />

      <Modal show={showView} onHide={() => setShowView(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Sales Order #{viewOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewOrder && (
            <div className="quotation-view">
              <div className="quotation-view-grid">
                <div>
                  <span className="label">Customer</span>
                  <span>{viewOrder.customer?.companyName ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Contact</span>
                  <span>{viewOrder.contactPerson?.name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">GST No.</span>
                  <span>{viewOrder.gstNo ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Order Date</span>
                  <span>{formatDate(viewOrder.orderDate)}</span>
                </div>
                <div>
                  <span className="label">PO No.</span>
                  <span>{viewOrder.poNo ?? '—'}</span>
                </div>
                <div>
                  <span className="label">PO Date</span>
                  <span>{formatDate(viewOrder.poDate)}</span>
                </div>
                <div>
                  <span className="label">Plant Unit</span>
                  <span>{viewOrder.plantUnit?.unit_name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Ref Quote</span>
                  <span>{viewOrder.refQuotationId ? `#${viewOrder.refQuotationId}` : '—'}</span>
                </div>
                <div>
                  <span className="label">Payment Terms</span>
                  <span>{viewOrder.paymentTerms?.term_name ?? '—'}</span>
                </div>
                <div className="quotation-view-span-2">
                  <span className="label">Shipping Address</span>
                  <span>{viewOrder.shippingAddressText ?? '—'}</span>
                </div>
              </div>

              <h5 className="quotation-view-heading">Line Items</h5>
              <div className="quotation-view-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>PO Line</th>
                      <th>HSN</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewOrder.lineItems || []).map((line: any) => (
                      <tr key={line.id}>
                        <td>{line.description || line.itemDetails || '—'}</td>
                        <td>{line.poLineNo || '—'}</td>
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
                  <strong>{formatCurrency(viewOrder.grossAmount)}</strong>
                </div>
                <div>
                  <span>CGST</span>
                  <strong>{formatCurrency(viewOrder.cgstAmount)}</strong>
                </div>
                <div>
                  <span>SGST</span>
                  <strong>{formatCurrency(viewOrder.sgstAmount)}</strong>
                </div>
                <div>
                  <span>IGST</span>
                  <strong>{formatCurrency(viewOrder.igstAmount)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <strong>{formatCurrency(viewOrder.shippingCharge)}</strong>
                </div>
                <div className="grand">
                  <span>Grand Total</span>
                  <strong>{formatCurrency(viewOrder.grandTotal)}</strong>
                </div>
              </div>

              {viewOrder.termsAndConditions && (
                <>
                  <h5 className="quotation-view-heading">Terms & Conditions</h5>
                  <p className="quotation-view-terms">{viewOrder.termsAndConditions}</p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="action-btn print quotation-view-print"
            onClick={() => viewOrder?.id && handlePrint(viewOrder.id)}
          >
            Print
          </button>
          <Button text="Close" onClick={() => setShowView(false)} />
        </Modal.Footer>
      </Modal>
    </>
  );
}

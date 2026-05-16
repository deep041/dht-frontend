import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
} from './PurchaseOrder.api';
import { getPlantUnit } from '../../masters/store/plant-units/PlantUnits.api';
import { getSalesOrders } from '../../sales/sales-order/SalesOrder.api';
import { getPurchaseIndents } from '../purchase-indent/PurchaseIndent.api';
import { getItems } from '../../item-master/item/item.api';
import { getHSNList } from '../../item-master/hsn/HSN.api';
import { getSuppliers } from '../../masters/suppliers/Suppliers.api';
import { getPaymentTerms } from '../../masters/payment-terms/PaymentTerms.api';
import { getCompanyDetails } from '../../masters/company-details/CompanyDetails.api';
import PurchaseOrderForm from './PurchaseOrderForm';
import { printPurchaseOrder } from './purchaseOrderPrint';
import '../purchase-indent/PurchaseIndent.css';
import './PurchaseOrder.css';

const formatDate = (value: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN');
};

const formatCurrency = (value: number) => `₹${(value ?? 0).toFixed(2)}`;

const formatContactPersonLabel = (cp: {
  name: string;
  designation?: string | null;
  mobileNo?: string | null;
}) => {
  const extras = [cp.designation, cp.mobileNo].filter(Boolean);
  return extras.length ? `${cp.name} (${extras.join(' · ')})` : cp.name;
};

export default function PurchaseOrderPage() {
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [plantUnits, setPlantUnits] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [purchaseIndents, setPurchaseIndents] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [hsnList, setHsnList] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getPurchaseOrders();
      const rows = response.data || [];
      setTableData(
        rows.map((row: any) => ({
          ...row,
          supplierName: row.supplier?.companyName ?? '—',
          orderDateLabel: formatDate(row.orderDate),
          plantUnitName: row.plantUnit?.unit_name ?? '—',
          grandTotalLabel: formatCurrency(row.grandTotal)
        }))
      );
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [plantRes, soRes, indentRes, itemsRes, hsnRes, suppliersRes, paymentRes] =
        await Promise.all([
          getPlantUnit(),
          getSalesOrders(),
          getPurchaseIndents(),
          getItems(),
          getHSNList(),
          getSuppliers(),
          getPaymentTerms()
        ]);
      setPlantUnits(plantRes.data || []);
      setSalesOrders(soRes.data || []);
      setPurchaseIndents(indentRes.data || []);
      setItems(itemsRes.data || []);
      setHsnList(hsnRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setPaymentTerms(paymentRes.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchMasterData();
  }, []);

  const handleCreate = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await getPurchaseOrderById(id);
      setEditingOrder(response.data);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      alert('Could not load purchase order for editing.');
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await getPurchaseOrderById(id);
      setViewOrder(response.data);
      setShowView(true);
    } catch (error) {
      console.error('Error fetching purchase order:', error);
      alert('Could not load purchase order details.');
    }
  };

  const handlePrint = async (id: number) => {
    try {
      const [orderRes, companyRes] = await Promise.all([
        getPurchaseOrderById(id),
        getCompanyDetails()
      ]);
      const company = companyRes?.data?.[0];
      if (!company) {
        alert('Company details not configured. Please add them under Master → Company Details.');
        return;
      }
      printPurchaseOrder(orderRes.data, company, items);
    } catch (error) {
      console.error('Error printing purchase order:', error);
      alert('Could not prepare purchase order for printing.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this purchase order?')) return;
    try {
      await deletePurchaseOrder(id);
      await fetchOrders();
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      alert('Error deleting purchase order.');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingOrder?.id) {
        await updatePurchaseOrder(editingOrder.id, formData);
      } else {
        await createPurchaseOrder(formData);
      }
      setShowForm(false);
      setEditingOrder(null);
      await fetchOrders();
    } catch (error) {
      console.error('Error saving purchase order:', error);
      alert('Error saving purchase order.');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  const getItemName = (itemId: number | null) => {
    if (!itemId) return '—';
    const item = items.find(i => i.id === itemId);
    return item?.itemName || `Item #${itemId}`;
  };

  return (
    <>
      <div className="page-header-container">
        <h2>Purchase Order</h2>
        <Button text="Add Purchase Order" onClick={handleCreate} />
      </div>

      <div className="page-container pi-page">
        {loading ? (
          <p className="pi-loading">Loading purchase orders…</p>
        ) : tableData.length === 0 ? (
          <p className="pi-empty">No purchase orders yet. Add your first order.</p>
        ) : (
          <div className="pi-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Order Date</th>
                  <th>Supplier</th>
                  <th>Plant</th>
                  <th>Grand Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.orderDateLabel}</td>
                    <td>{row.supplierName}</td>
                    <td>{row.plantUnitName}</td>
                    <td>{row.grandTotalLabel}</td>
                    <td>
                      <div className="pi-row-actions">
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

      <PurchaseOrderForm
        show={showForm}
        onHide={closeForm}
        onSubmit={handleSubmit}
        initialData={editingOrder}
        suppliers={suppliers}
        paymentTerms={paymentTerms}
        plantUnits={plantUnits}
        salesOrders={salesOrders}
        purchaseIndents={purchaseIndents}
        items={items}
        hsnList={hsnList}
      />

      <Modal show={showView} onHide={() => setShowView(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Order #{viewOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewOrder && (
            <div className="pi-view">
              <div className="pi-view-grid">
                <div>
                  <span className="label">PO Type</span>
                  <span>{viewOrder.poType ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Supplier</span>
                  <span>{viewOrder.supplier?.companyName ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Contact Person</span>
                  <span>
                    {viewOrder.contactPerson?.name
                      ? formatContactPersonLabel(viewOrder.contactPerson)
                      : '\u2014'}
                  </span>
                </div>
                <div>
                  <span className="label">Order Date</span>
                  <span>{formatDate(viewOrder.orderDate)}</span>
                </div>
                <div>
                  <span className="label">Plant</span>
                  <span>{viewOrder.plantUnit?.unit_name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Payment Terms</span>
                  <span>{viewOrder.paymentTerms?.term_name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Grand Total</span>
                  <span>{formatCurrency(viewOrder.grandTotal)}</span>
                </div>
              </div>

              {viewOrder.remarks && (
                <>
                  <h5 className="pi-view-heading">Remarks</h5>
                  <p className="pi-view-remarks">{viewOrder.remarks}</p>
                </>
              )}

              <h5 className="pi-view-heading">Item Details</h5>
              <div className="pi-view-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewOrder.lineItems || []).map((line: any) => (
                      <tr key={line.id}>
                        <td>{getItemName(line.itemId)}</td>
                        <td>{line.description || '—'}</td>
                        <td>{line.qty}</td>
                        <td>{line.rate}</td>
                        <td>{line.lineTotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            type="button"
            className="action-btn print pi-view-print"
            onClick={() => viewOrder?.id && handlePrint(viewOrder.id)}
          >
            Print PDF
          </button>
          <Button text="Close" onClick={() => setShowView(false)} />
        </Modal.Footer>
      </Modal>
    </>
  );
}

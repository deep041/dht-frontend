import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import {
  getPurchaseInquiries,
  getPurchaseInquiryById,
  createPurchaseInquiry,
  updatePurchaseInquiry,
  deletePurchaseInquiry
} from './PurchaseInquiry.api';
import { getPlantUnit } from '../../masters/store/plant-units/PlantUnits.api';
import { getSalesOrders } from '../../sales/sales-order/SalesOrder.api';
import { getPurchaseIndents } from '../purchase-indent/PurchaseIndent.api';
import { getItems } from '../../item-master/item/item.api';
import { getHSNList } from '../../item-master/hsn/HSN.api';
import { getSuppliers } from '../../masters/suppliers/Suppliers.api';
import { getCompanyDetails } from '../../masters/company-details/CompanyDetails.api';
import PurchaseInquiryForm from './PurchaseInquiryForm';
import { printPurchaseInquiry } from './purchaseInquiryPrint';
import '../purchase-indent/PurchaseIndent.css';

const formatDate = (value: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN');
};

export default function PurchaseInquiryPage() {
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [plantUnits, setPlantUnits] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [purchaseIndents, setPurchaseIndents] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [hsnList, setHsnList] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [editingInquiry, setEditingInquiry] = useState<any>(null);
  const [viewInquiry, setViewInquiry] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await getPurchaseInquiries();
      const rows = response.data || [];
      setTableData(
        rows.map((row: any) => ({
          ...row,
          plantUnitName: row.plantUnit?.unit_name ?? '—',
          enquiryDateLabel: formatDate(row.enquiryDate),
          refSoLabel: row.refSalesOrderId ? `SO #${row.refSalesOrderId}` : '—',
          refIndentLabel: row.refPurchaseIndentId ? `Indent #${row.refPurchaseIndentId}` : '—',
          supplierName: row.supplier?.companyName ?? '—'
        }))
      );
    } catch (error) {
      console.error('Error fetching purchase inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [plantRes, soRes, indentRes, itemsRes, hsnRes, suppliersRes] = await Promise.all([
        getPlantUnit(),
        getSalesOrders(),
        getPurchaseIndents(),
        getItems(),
        getHSNList(),
        getSuppliers()
      ]);
      setPlantUnits(plantRes.data || []);
      setSalesOrders(soRes.data || []);
      setPurchaseIndents(indentRes.data || []);
      setItems(itemsRes.data || []);
      setHsnList(hsnRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchMasterData();
  }, []);

  const handleCreate = () => {
    setEditingInquiry(null);
    setShowForm(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await getPurchaseInquiryById(id);
      setEditingInquiry(response.data);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching purchase inquiry:', error);
      alert('Could not load purchase inquiry for editing.');
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await getPurchaseInquiryById(id);
      setViewInquiry(response.data);
      setShowView(true);
    } catch (error) {
      console.error('Error fetching purchase inquiry:', error);
      alert('Could not load purchase inquiry details.');
    }
  };

  const handlePrint = async (id: number) => {
    try {
      const [inquiryRes, companyRes] = await Promise.all([
        getPurchaseInquiryById(id),
        getCompanyDetails()
      ]);
      const company = companyRes?.data?.[0];
      if (!company) {
        alert('Company details not configured. Please add them under Master → Company Details.');
        return;
      }
      printPurchaseInquiry(inquiryRes.data, company, items);
    } catch (error) {
      console.error('Error printing purchase inquiry:', error);
      alert('Could not prepare purchase inquiry for printing.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this purchase inquiry?')) return;
    try {
      await deletePurchaseInquiry(id);
      await fetchInquiries();
    } catch (error) {
      console.error('Error deleting purchase inquiry:', error);
      alert('Error deleting purchase inquiry.');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingInquiry?.id) {
        await updatePurchaseInquiry(editingInquiry.id, formData);
      } else {
        await createPurchaseInquiry(formData);
      }
      setShowForm(false);
      setEditingInquiry(null);
      await fetchInquiries();
    } catch (error) {
      console.error('Error saving purchase inquiry:', error);
      alert('Error saving purchase inquiry.');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingInquiry(null);
  };

  const getItemName = (itemId: number | null) => {
    if (!itemId) return '—';
    const item = items.find(i => i.id === itemId);
    return item?.itemName || `Item #${itemId}`;
  };

  return (
    <>
      <div className="page-header-container">
        <h2>Purchase Inquiry</h2>
        <Button text="Add Purchase Inquiry" onClick={handleCreate} />
      </div>

      <div className="page-container pi-page">
        {loading ? (
          <p className="pi-loading">Loading purchase inquiries…</p>
        ) : tableData.length === 0 ? (
          <p className="pi-empty">No purchase inquiries yet. Add your first inquiry.</p>
        ) : (
          <div className="pi-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Inquiry #</th>
                  <th>Enquiry Date</th>
                  <th>Plant Unit</th>
                  <th>Ref SO</th>
                  <th>Ref Indent</th>
                  <th>Supplier</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.enquiryDateLabel}</td>
                    <td>{row.plantUnitName}</td>
                    <td>{row.refSoLabel}</td>
                    <td>{row.refIndentLabel}</td>
                    <td>{row.supplierName}</td>
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

      <PurchaseInquiryForm
        show={showForm}
        onHide={closeForm}
        onSubmit={handleSubmit}
        initialData={editingInquiry}
        plantUnits={plantUnits}
        salesOrders={salesOrders}
        purchaseIndents={purchaseIndents}
        items={items}
        hsnList={hsnList}
        suppliers={suppliers}
      />

      <Modal show={showView} onHide={() => setShowView(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Inquiry #{viewInquiry?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewInquiry && (
            <div className="pi-view">
              <div className="pi-view-grid">
                <div>
                  <span className="label">Approval Path</span>
                  <span>{viewInquiry.approvalPath ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Ref SO No.</span>
                  <span>{viewInquiry.refSalesOrderId ? `SO #${viewInquiry.refSalesOrderId}` : '—'}</span>
                </div>
                <div>
                  <span className="label">Ref Production No.</span>
                  <span>{viewInquiry.refProductionNo ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Supplier</span>
                  <span>{viewInquiry.supplier?.companyName ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Enquiry Date</span>
                  <span>{formatDate(viewInquiry.enquiryDate)}</span>
                </div>
                <div>
                  <span className="label">Required Delivery Date</span>
                  <span>{formatDate(viewInquiry.requiredDeliveryDate)}</span>
                </div>
                <div>
                  <span className="label">Valid Till Date</span>
                  <span>{formatDate(viewInquiry.validTillDate)}</span>
                </div>
                <div>
                  <span className="label">Plant Unit</span>
                  <span>{viewInquiry.plantUnit?.unit_name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Ref Purchase Indent</span>
                  <span>
                    {viewInquiry.refPurchaseIndentId
                      ? `Indent #${viewInquiry.refPurchaseIndentId}`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="label">Doc Attachment</span>
                  <span>{viewInquiry.docAttachmentRequired ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {viewInquiry.remarks && (
                <>
                  <h5 className="pi-view-heading">Remarks</h5>
                  <p className="pi-view-remarks">{viewInquiry.remarks}</p>
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
                      <th>Unit</th>
                      <th>HSN Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewInquiry.lineItems || []).map((line: any) => (
                      <tr key={line.id}>
                        <td>{getItemName(line.itemId)}</td>
                        <td>{line.description || '—'}</td>
                        <td>{line.qty}</td>
                        <td>{line.unitId ?? '—'}</td>
                        <td>{line.hsnCode || '—'}</td>
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
            onClick={() => viewInquiry?.id && handlePrint(viewInquiry.id)}
          >
            Print PDF
          </button>
          <Button text="Close" onClick={() => setShowView(false)} />
        </Modal.Footer>
      </Modal>
    </>
  );
}

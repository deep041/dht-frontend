import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import {
  getPurchaseIndents,
  getPurchaseIndentById,
  createPurchaseIndent,
  updatePurchaseIndent,
  deletePurchaseIndent
} from './PurchaseIndent.api';
import { getDepartments } from '../../masters/department/Department.api';
import { getPlantUnit } from '../../masters/store/plant-units/PlantUnits.api';
import { getSalesOrders } from '../../sales/sales-order/SalesOrder.api';
import { getItems } from '../../item-master/item/item.api';
import { getSuppliers } from '../../masters/suppliers/Suppliers.api';
import { getCompanyDetails } from '../../masters/company-details/CompanyDetails.api';
import PurchaseIndentForm from './PurchaseIndentForm';
import { printPurchaseIndent } from './purchaseIndentPrint';
import './PurchaseIndent.css';

const formatDate = (value: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN');
};

const prTypeLabel = (value: string) => {
  const map: Record<string, string> = {
    MATERIAL: 'Material',
    SERVICE: 'Service',
    CAPITAL: 'Capital',
    CONSUMABLE: 'Consumable'
  };
  return map[value] || value || '—';
};

export default function PurchaseIndentPage() {
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [plantUnits, setPlantUnits] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [editingIndent, setEditingIndent] = useState<any>(null);
  const [viewIndent, setViewIndent] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchIndents = async () => {
    try {
      setLoading(true);
      const response = await getPurchaseIndents();
      const rows = response.data || [];
      setTableData(
        rows.map((row: any) => ({
          ...row,
          departmentName: row.department ? `${row.department.code} - ${row.department.name}` : '—',
          plantUnitName: row.plantUnit?.unit_name ?? '—',
          indentDateLabel: formatDate(row.indentDate),
          typeOfPrLabel: prTypeLabel(row.typeOfPr),
          refSoLabel: row.refSalesOrderId ? `SO #${row.refSalesOrderId}` : '—'
        }))
      );
    } catch (error) {
      console.error('Error fetching purchase indents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [deptRes, plantRes, soRes, itemsRes, suppliersRes] = await Promise.all([
        getDepartments(),
        getPlantUnit(),
        getSalesOrders(),
        getItems(),
        getSuppliers()
      ]);
      setDepartments(deptRes.data || []);
      setPlantUnits(plantRes.data || []);
      setSalesOrders(soRes.data || []);
      setItems(itemsRes.data || []);
      setSuppliers(suppliersRes.data || []);
    } catch (error) {
      console.error('Error fetching master data:', error);
    }
  };

  useEffect(() => {
    fetchIndents();
    fetchMasterData();
  }, []);

  const handleCreate = () => {
    setEditingIndent(null);
    setShowForm(true);
  };

  const handleEdit = async (id: number) => {
    try {
      const response = await getPurchaseIndentById(id);
      setEditingIndent(response.data);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching purchase indent:', error);
      alert('Could not load purchase indent for editing.');
    }
  };

  const handleView = async (id: number) => {
    try {
      const response = await getPurchaseIndentById(id);
      setViewIndent(response.data);
      setShowView(true);
    } catch (error) {
      console.error('Error fetching purchase indent:', error);
      alert('Could not load purchase indent details.');
    }
  };

  const handlePrint = async (id: number) => {
    try {
      const [indentRes, companyRes] = await Promise.all([
        getPurchaseIndentById(id),
        getCompanyDetails()
      ]);
      const company = companyRes?.data?.[0];
      if (!company) {
        alert('Company details not configured. Please add them under Master → Company Details.');
        return;
      }
      printPurchaseIndent(indentRes.data, company, items);
    } catch (error) {
      console.error('Error printing purchase indent:', error);
      alert('Could not prepare purchase indent for printing.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this purchase indent?')) return;
    try {
      await deletePurchaseIndent(id);
      await fetchIndents();
    } catch (error) {
      console.error('Error deleting purchase indent:', error);
      alert('Error deleting purchase indent.');
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingIndent?.id) {
        await updatePurchaseIndent(editingIndent.id, formData);
      } else {
        await createPurchaseIndent(formData);
      }
      setShowForm(false);
      setEditingIndent(null);
      await fetchIndents();
    } catch (error) {
      console.error('Error saving purchase indent:', error);
      alert('Error saving purchase indent.');
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingIndent(null);
  };

  const getItemName = (itemId: number | null) => {
    if (!itemId) return '—';
    const item = items.find(i => i.id === itemId);
    return item?.itemName || `Item #${itemId}`;
  };

  return (
    <>
      <div className="page-header-container">
        <h2>Purchase Indent</h2>
        <Button text="Add Purchase Indent" onClick={handleCreate} />
      </div>

      <div className="page-container pi-page">
        {loading ? (
          <p className="pi-loading">Loading purchase indents…</p>
        ) : tableData.length === 0 ? (
          <p className="pi-empty">No purchase indents yet. Add your first indent.</p>
        ) : (
          <div className="pi-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Indent #</th>
                  <th>Indent Date</th>
                  <th>Department</th>
                  <th>Plant Unit</th>
                  <th>Ref SO</th>
                  <th>Type of PR</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map(row => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.indentDateLabel}</td>
                    <td>{row.departmentName}</td>
                    <td>{row.plantUnitName}</td>
                    <td>{row.refSoLabel}</td>
                    <td>{row.typeOfPrLabel}</td>
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

      <PurchaseIndentForm
        show={showForm}
        onHide={closeForm}
        onSubmit={handleSubmit}
        initialData={editingIndent}
        departments={departments}
        plantUnits={plantUnits}
        salesOrders={salesOrders}
        items={items}
        suppliers={suppliers}
      />

      <Modal show={showView} onHide={() => setShowView(false)} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Purchase Indent #{viewIndent?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewIndent && (
            <div className="pi-view">
              <div className="pi-view-grid">
                <div>
                  <span className="label">PR Approval Path</span>
                  <span>{viewIndent.prApprovalPath ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Department</span>
                  <span>
                    {viewIndent.department
                      ? `${viewIndent.department.code} - ${viewIndent.department.name}`
                      : '—'}
                  </span>
                </div>
                <div>
                  <span className="label">Ref SO No.</span>
                  <span>{viewIndent.refSalesOrderId ? `SO #${viewIndent.refSalesOrderId}` : '—'}</span>
                </div>
                <div>
                  <span className="label">Ref Prod Pln No.</span>
                  <span>{viewIndent.refProdPlnNo ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Indent Date</span>
                  <span>{formatDate(viewIndent.indentDate)}</span>
                </div>
                <div>
                  <span className="label">Plant Unit</span>
                  <span>{viewIndent.plantUnit?.unit_name ?? '—'}</span>
                </div>
                <div>
                  <span className="label">Type of PR</span>
                  <span>{prTypeLabel(viewIndent.typeOfPr)}</span>
                </div>
                <div>
                  <span className="label">Doc Attachment</span>
                  <span>{viewIndent.docAttachmentRequired ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {viewIndent.remarks && (
                <>
                  <h5 className="pi-view-heading">Remarks</h5>
                  <p className="pi-view-remarks">{viewIndent.remarks}</p>
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
                      <th>Require Date</th>
                      <th>Vendor</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewIndent.lineItems || []).map((line: any) => (
                      <tr key={line.id}>
                        <td>{getItemName(line.itemId)}</td>
                        <td>{line.description || '—'}</td>
                        <td>{line.qty}</td>
                        <td>{line.unitId ?? '—'}</td>
                        <td>{formatDate(line.requiredDate)}</td>
                        <td>{line.suggestedVendor?.companyName ?? '—'}</td>
                        <td>{line.details || '—'}</td>
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
            onClick={() => viewIndent?.id && handlePrint(viewIndent.id)}
          >
            Print PDF
          </button>
          <Button text="Close" onClick={() => setShowView(false)} />
        </Modal.Footer>
      </Modal>
    </>
  );
}


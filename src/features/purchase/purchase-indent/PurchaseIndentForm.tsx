import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import PurchaseIndentLineItems, {
  blankLineItem,
  type PurchaseIndentLineItemRow
} from './PurchaseIndentLineItems';
import './PurchaseIndent.css';

const PR_APPROVAL_PATHS = [
  { key: 'Default Path For Indent', value: 'Default Path For Indent' }
];

const PR_TYPES = [
  { key: 'Material', value: 'MATERIAL' },
  { key: 'Service', value: 'SERVICE' },
  { key: 'Capital', value: 'CAPITAL' },
  { key: 'Consumable', value: 'CONSUMABLE' }
];

interface PurchaseIndentFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  departments: any[];
  plantUnits: any[];
  salesOrders: any[];
  items: any[];
  suppliers: any[];
}

const defaultForm = () => ({
  prApprovalPath: 'Default Path For Indent',
  departmentId: '',
  refSalesOrderId: '',
  refProdPlnNo: '',
  indentDate: new Date().toISOString().split('T')[0],
  plantUnitId: '',
  typeOfPr: '',
  docAttachmentRequired: false,
  remarks: ''
});

const mapLineFromApi = (item: any): PurchaseIndentLineItemRow => ({
  itemId: item.itemId ? String(item.itemId) : '',
  description: item.description ?? '',
  qty: String(item.qty ?? ''),
  unitId: item.unitId ? String(item.unitId) : '',
  requiredDate: item.requiredDate
    ? new Date(item.requiredDate).toISOString().split('T')[0]
    : '',
  suggestedVendorId: item.suggestedVendorId ? String(item.suggestedVendorId) : '',
  details: item.details ?? ''
});

export default function PurchaseIndentForm({
  show,
  onHide,
  onSubmit,
  initialData,
  departments,
  plantUnits,
  salesOrders,
  items,
  suppliers
}: PurchaseIndentFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [lineItems, setLineItems] = useState<PurchaseIndentLineItemRow[]>([blankLineItem()]);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setForm({
        prApprovalPath: initialData.prApprovalPath ?? 'Default Path For Indent',
        departmentId: initialData.departmentId ? String(initialData.departmentId) : '',
        refSalesOrderId: initialData.refSalesOrderId ? String(initialData.refSalesOrderId) : '',
        refProdPlnNo: initialData.refProdPlnNo ?? '',
        indentDate: initialData.indentDate
          ? new Date(initialData.indentDate).toISOString().split('T')[0]
          : defaultForm().indentDate,
        plantUnitId: initialData.plantUnitId ? String(initialData.plantUnitId) : '',
        typeOfPr: initialData.typeOfPr ?? '',
        docAttachmentRequired: Boolean(initialData.docAttachmentRequired),
        remarks: initialData.remarks ?? ''
      });

      if (initialData.lineItems?.length) {
        setLineItems(initialData.lineItems.map(mapLineFromApi));
      } else {
        setLineItems([blankLineItem()]);
      }
    } else {
      setForm(defaultForm());
      setLineItems([blankLineItem()]);
    }
  }, [initialData, show]);

  const handleChange = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.indentDate) {
      alert('Please enter Indent Date.');
      return;
    }

    const validLines = lineItems.filter(row => row.itemId && Number(row.qty) > 0);
    if (!validLines.length) {
      alert('Add at least one line item with quantity.');
      return;
    }

    onSubmit({
      prApprovalPath: form.prApprovalPath,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      refSalesOrderId: form.refSalesOrderId ? Number(form.refSalesOrderId) : null,
      refProdPlnNo: form.refProdPlnNo || null,
      indentDate: form.indentDate,
      plantUnitId: form.plantUnitId ? Number(form.plantUnitId) : null,
      typeOfPr: form.typeOfPr || null,
      docAttachmentRequired: form.docAttachmentRequired,
      remarks: form.remarks || null,
      lineItems: validLines.map(item => ({
        itemId: item.itemId ? Number(item.itemId) : null,
        description: item.description,
        qty: Number(item.qty),
        unitId: item.unitId ? Number(item.unitId) : null,
        requiredDate: item.requiredDate || null,
        suggestedVendorId: item.suggestedVendorId ? Number(item.suggestedVendorId) : null,
        details: item.details || null
      }))
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Purchase Indent' : 'Add Purchase Indent'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <section className="pi-form-section">
          <h5>Indent Details</h5>
          <div className="form-controller">
            <Select
              placeholder="PR Approval Path"
              value={form.prApprovalPath}
              options={PR_APPROVAL_PATHS}
              onChange={value => handleChange('prApprovalPath', String(value))}
            />
            <Select
              placeholder="Department"
              value={form.departmentId}
              options={departments.map(d => ({
                key: `${d.code} - ${d.name}`,
                value: d.id
              }))}
              onChange={value => handleChange('departmentId', String(value))}
            />
            <Select
              placeholder="Ref SO No."
              value={form.refSalesOrderId}
              options={salesOrders.map(so => ({
                key: `SO #${so.id}${so.customer?.companyName ? ` - ${so.customer.companyName}` : ''}`,
                value: so.id
              }))}
              onChange={value => handleChange('refSalesOrderId', String(value))}
            />
            <Input
              placeholder="Ref Prod Pln No."
              value={form.refProdPlnNo}
              onChange={value => handleChange('refProdPlnNo', value)}
            />
          </div>

          <div className="form-controller form-controller-compact">
            <label className="pi-date-label">
              Indent Date
              <input
                type="date"
                className="input input-date"
                value={form.indentDate}
                onChange={e => handleChange('indentDate', e.target.value)}
              />
            </label>
            <Select
              placeholder="Plant Unit"
              value={form.plantUnitId}
              options={plantUnits.map(pu => ({
                key: pu.unit_name || pu.company_name,
                value: pu.id
              }))}
              onChange={value => handleChange('plantUnitId', String(value))}
            />
            <Select
              placeholder="Type of PR"
              value={form.typeOfPr}
              options={PR_TYPES}
              onChange={value => handleChange('typeOfPr', String(value))}
            />
            <label className="pi-checkbox-label">
              <input
                type="checkbox"
                checked={form.docAttachmentRequired}
                onChange={e => handleChange('docAttachmentRequired', e.target.checked)}
              />
              Any Doc Has to Attached it.
            </label>
          </div>

          <div className="form-controller pi-remarks-row">
            <label className="pi-remarks-label">Remarks</label>
            <textarea
              className="pi-textarea"
              rows={3}
              placeholder="Enter remarks"
              value={form.remarks}
              onChange={e => handleChange('remarks', e.target.value)}
            />
          </div>
        </section>

        <section className="pi-form-section">
          <h5>Item Details</h5>
          <PurchaseIndentLineItems
            rows={lineItems}
            items={items}
            suppliers={suppliers}
            onChange={setLineItems}
          />
        </section>
      </Modal.Body>

      <Modal.Footer className="pi-modal-footer">
        <button type="button" className="cancel-button" onClick={onHide}>
          Cancel
        </button>
        <Button text={initialData ? 'Update Indent' : 'Submit Data'} onClick={handleSubmit} />
      </Modal.Footer>
    </Modal>
  );
}

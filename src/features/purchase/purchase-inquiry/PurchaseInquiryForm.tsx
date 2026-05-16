import { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import { getPurchaseIndentById } from '../purchase-indent/PurchaseIndent.api';
import PurchaseInquiryLineItems, {
  blankLineItem,
  type PurchaseInquiryLineItemRow
} from './PurchaseInquiryLineItems';
import '../purchase-indent/PurchaseIndent.css';
import './PurchaseInquiry.css';

const APPROVAL_PATHS = [
  { key: 'Default Path For Purchase Enquiry', value: 'Default Path For Purchase Enquiry' }
];

interface PurchaseInquiryFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  plantUnits: any[];
  salesOrders: any[];
  purchaseIndents: any[];
  items: any[];
  hsnList: any[];
  suppliers: any[];
}

const defaultForm = () => ({
  approvalPath: 'Default Path For Purchase Enquiry',
  refSalesOrderId: '',
  refProductionNo: '',
  supplierId: '',
  enquiryDate: new Date().toISOString().split('T')[0],
  requiredDeliveryDate: '',
  validTillDate: '',
  plantUnitId: '',
  refPurchaseIndentId: '',
  docAttachmentRequired: false,
  remarks: ''
});

const mapLineFromApi = (item: any): PurchaseInquiryLineItemRow => ({
  itemId: item.itemId ? String(item.itemId) : '',
  description: item.description ?? '',
  qty: String(item.qty ?? ''),
  unitId: item.unitId ? String(item.unitId) : '',
  hsnCode: item.hsnCode ?? ''
});

export default function PurchaseInquiryForm({
  show,
  onHide,
  onSubmit,
  initialData,
  plantUnits,
  salesOrders,
  purchaseIndents,
  items,
  hsnList,
  suppliers
}: PurchaseInquiryFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [lineItems, setLineItems] = useState<PurchaseInquiryLineItemRow[]>([blankLineItem()]);

  const resolveHsnCode = (hsnId?: number | null) => {
    if (!hsnId) return '';
    const hsn = hsnList.find(h => h.id === hsnId);
    return hsn?.hsnCode ?? '';
  };

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setForm({
        approvalPath: initialData.approvalPath ?? 'Default Path For Purchase Enquiry',
        refSalesOrderId: initialData.refSalesOrderId ? String(initialData.refSalesOrderId) : '',
        refProductionNo: initialData.refProductionNo ?? '',
        supplierId: initialData.supplierId ? String(initialData.supplierId) : '',
        enquiryDate: initialData.enquiryDate
          ? new Date(initialData.enquiryDate).toISOString().split('T')[0]
          : defaultForm().enquiryDate,
        requiredDeliveryDate: initialData.requiredDeliveryDate
          ? new Date(initialData.requiredDeliveryDate).toISOString().split('T')[0]
          : '',
        validTillDate: initialData.validTillDate
          ? new Date(initialData.validTillDate).toISOString().split('T')[0]
          : '',
        plantUnitId: initialData.plantUnitId ? String(initialData.plantUnitId) : '',
        refPurchaseIndentId: initialData.refPurchaseIndentId
          ? String(initialData.refPurchaseIndentId)
          : '',
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

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find(item => String(item.id) === String(itemId));
    setLineItems(prev =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              itemId,
              description: selected?.description || selected?.itemName || '',
              unitId: selected?.unitId ? String(selected.unitId) : '',
              hsnCode: resolveHsnCode(selected?.hsnId)
            }
          : row
      )
    );
  };

  const handleCopyIndentItems = async () => {
    if (!form.refPurchaseIndentId) {
      alert('Select a purchase indent first.');
      return;
    }

    try {
      const response = await getPurchaseIndentById(form.refPurchaseIndentId);
      const indent = response.data;
      const rows = (indent?.lineItems || []).map((line: any) => {
        const item = items.find(i => i.id === line.itemId);
        return {
          itemId: line.itemId ? String(line.itemId) : '',
          description: line.description ?? '',
          qty: String(line.qty ?? ''),
          unitId: line.unitId ? String(line.unitId) : item?.unitId ? String(item.unitId) : '',
          hsnCode: item ? resolveHsnCode(item.hsnId) : ''
        };
      });

      if (!rows.length) {
        alert('Selected indent has no line items.');
        return;
      }

      setLineItems(rows);
    } catch (error) {
      console.error('Error copying indent items:', error);
      alert('Could not copy indent items.');
    }
  };

  const handleSubmit = () => {
    if (!form.enquiryDate) {
      alert('Please enter Purchase Enquiry Date.');
      return;
    }

    const validLines = lineItems.filter(row => row.itemId && Number(row.qty) > 0);
    if (!validLines.length) {
      alert('Add at least one line item with quantity.');
      return;
    }

    onSubmit({
      approvalPath: form.approvalPath,
      refSalesOrderId: form.refSalesOrderId ? Number(form.refSalesOrderId) : null,
      refProductionNo: form.refProductionNo || null,
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      enquiryDate: form.enquiryDate,
      requiredDeliveryDate: form.requiredDeliveryDate || null,
      validTillDate: form.validTillDate || null,
      plantUnitId: form.plantUnitId ? Number(form.plantUnitId) : null,
      refPurchaseIndentId: form.refPurchaseIndentId ? Number(form.refPurchaseIndentId) : null,
      docAttachmentRequired: form.docAttachmentRequired,
      remarks: form.remarks || null,
      lineItems: validLines.map(item => ({
        itemId: item.itemId ? Number(item.itemId) : null,
        description: item.description,
        qty: Number(item.qty),
        unitId: item.unitId ? Number(item.unitId) : null,
        hsnCode: item.hsnCode || null
      }))
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {initialData ? 'Edit Purchase Inquiry' : 'Add Purchase Inquiry'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <section className="pi-form-section">
          <h5>Inquiry Details</h5>
          <div className="form-controller">
            <Select
              placeholder="Approval Path"
              value={form.approvalPath}
              options={APPROVAL_PATHS}
              onChange={value => handleChange('approvalPath', String(value))}
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
              placeholder="Ref Production No."
              value={form.refProductionNo}
              onChange={value => handleChange('refProductionNo', value)}
            />
            <Select
              placeholder="Supplier"
              value={form.supplierId}
              options={suppliers.map(s => ({
                key: s.companyName || s.legalName || `Supplier ${s.id}`,
                value: s.id
              }))}
              onChange={value => handleChange('supplierId', String(value))}
            />
          </div>

          <div className="form-controller form-controller-compact">
            <label className="pi-date-label">
              Purchase Enquiry Date
              <input
                type="date"
                className="input input-date"
                value={form.enquiryDate}
                onChange={e => handleChange('enquiryDate', e.target.value)}
              />
            </label>
            <label className="pi-date-label">
              Required Delivery Date
              <input
                type="date"
                className="input input-date"
                value={form.requiredDeliveryDate}
                onChange={e => handleChange('requiredDeliveryDate', e.target.value)}
              />
            </label>
            <label className="pi-date-label">
              Valid Till Date
              <input
                type="date"
                className="input input-date"
                value={form.validTillDate}
                onChange={e => handleChange('validTillDate', e.target.value)}
              />
            </label>
            <Select
              placeholder="Unit Plant"
              value={form.plantUnitId}
              options={plantUnits.map(pu => ({
                key: pu.unit_name || pu.company_name,
                value: pu.id
              }))}
              onChange={value => handleChange('plantUnitId', String(value))}
            />
          </div>

          <div className="form-controller pi-copy-indent-row">
            <Select
              placeholder="Ref Purchase Indent"
              value={form.refPurchaseIndentId}
              options={purchaseIndents.map(indent => ({
                key: `Indent #${indent.id}`,
                value: indent.id
              }))}
              onChange={value => handleChange('refPurchaseIndentId', String(value))}
            />
            <button type="button" className="pi-copy-indent-btn" onClick={handleCopyIndentItems}>
              Copy Indent Items
            </button>
          </div>

          {/* <div className="form-controller form-controller-compact">
            <label className="pi-checkbox-label">
              <input
                type="checkbox"
                checked={form.docAttachmentRequired}
                onChange={e => handleChange('docAttachmentRequired', e.target.checked)}
              />
              Any Doc Has to Attached it.
            </label>
          </div> */}
        </section>

        <section className="pi-form-section">
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
          <PurchaseInquiryLineItems
            rows={lineItems}
            items={items}
            onChange={setLineItems}
            onItemSelect={handleItemSelect}
          />
        </section>
      </Modal.Body>

      <Modal.Footer className="pi-modal-footer">
        <button type="button" className="cancel-button" onClick={onHide}>
          Cancel
        </button>
        <Button
          text={initialData ? 'Update Inquiry' : 'Submit Data'}
          onClick={handleSubmit}
        />
      </Modal.Footer>
    </Modal>
  );
}

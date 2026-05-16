import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import { getPurchaseIndentById } from '../purchase-indent/PurchaseIndent.api';
import { getSupplierContactPersons } from '../../masters/suppliers/Suppliers.api';
import PurchaseOrderLineItems, {
  blankLineItem,
  type PurchaseOrderLineItemRow
} from './PurchaseOrderLineItems';
import '../purchase-indent/PurchaseIndent.css';
import '../../sales/quotation/Quotation.css';
import './PurchaseOrder.css';

const PO_TYPES = [{ key: 'PO ADMINISTRATION', value: 'PO ADMINISTRATION' }];
const CURRENCIES = [
  { key: 'INR', value: 'INR' },
  { key: 'USD', value: 'USD' },
  { key: 'EUR', value: 'EUR' }
];

const DEFAULT_TERMS = `• P&F INCLUDED
• FREIGHT INCLUDED
• PAYMENT : WITHIN 15 DAYS FROM THE DATE OF INVOICE
• DELIVERY : WITH IN 2 - 3 DAYS FROM THE DATE OF PO`;

interface PurchaseOrderFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  suppliers: any[];
  paymentTerms: any[];
  plantUnits: any[];
  salesOrders: any[];
  purchaseIndents: any[];
  items: any[];
  hsnList: any[];
}

const defaultForm = () => ({
  poType: 'PO ADMINISTRATION',
  supplierId: '',
  contactPersonId: '',
  gstNo: '',
  supplierBranch: '',
  orderDate: new Date().toISOString().split('T')[0],
  refSuppQuoteNo: '',
  suppQuoteDate: '',
  refSalesOrderId: '',
  refProductionNo: '',
  plantUnitId: '',
  shipToAddress: '',
  paymentTermId: '',
  currency: 'INR',
  fcnrValue: '1',
  refPurchaseIndentId: '',
  docAttachmentRequired: false,
  remarks: '',
  shippingCharge: '0',
  roundOffEnabled: false,
  termsAndConditions: DEFAULT_TERMS
});

const formatSupplierAddress = (supplier: any) => {
  if (!supplier) return '';
  return [supplier.addressLine1, supplier.place, supplier.pinCode].filter(Boolean).join(', ');
};

const formatContactPersonLabel = (cp: { name: string; designation?: string | null; mobileNo?: string | null }) => {
  const extras = [cp.designation, cp.mobileNo].filter(Boolean);
  return extras.length ? `${cp.name} (${extras.join(' · ')})` : cp.name;
};

const mapLineFromApi = (item: any): PurchaseOrderLineItemRow => {
  const row: PurchaseOrderLineItemRow = {
    itemId: item.itemId ? String(item.itemId) : '',
    description: item.description ?? '',
    unitId: item.unitId ? String(item.unitId) : '',
    hsnCode: item.hsnCode ?? '',
    requiredBy: item.requiredBy ? new Date(item.requiredBy).toISOString().split('T')[0] : '',
    committedDate: item.committedDate ? new Date(item.committedDate).toISOString().split('T')[0] : '',
    qty: String(item.qty ?? ''),
    rate: String(item.rate ?? ''),
    discountPercentage: String(item.discountPercentage ?? 0),
    discountAmount: item.discountAmount ?? 0,
    taxableAmount: item.taxableAmount ?? 0,
    cgstRate: String(item.cgstRate ?? 0),
    cgstAmount: item.cgstAmount ?? 0,
    sgstRate: String(item.sgstRate ?? 0),
    sgstAmount: item.sgstAmount ?? 0,
    igstRate: String(item.igstRate ?? 0),
    igstAmount: item.igstAmount ?? 0,
    lineTotal: item.lineTotal ?? 0
  };

  const qty = Number(row.qty) || 0;
  const rate = Number(row.rate) || 0;
  const discountPercentage = Number(row.discountPercentage) || 0;
  const cgstRate = Number(row.cgstRate) || 0;
  const sgstRate = Number(row.sgstRate) || 0;
  const igstRate = Number(row.igstRate) || 0;
  const baseAmount = qty * rate;
  const discountAmount = (baseAmount * discountPercentage) / 100;
  const taxableAmount = baseAmount - discountAmount;
  const cgstAmount = (taxableAmount * cgstRate) / 100;
  const sgstAmount = (taxableAmount * sgstRate) / 100;
  const igstAmount = (taxableAmount * igstRate) / 100;
  const lineTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;
  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    ...row,
    discountAmount: round(discountAmount),
    taxableAmount: round(taxableAmount),
    cgstAmount: round(cgstAmount),
    sgstAmount: round(sgstAmount),
    igstAmount: round(igstAmount),
    lineTotal: round(lineTotal)
  };
};

export default function PurchaseOrderForm({
  show,
  onHide,
  onSubmit,
  initialData,
  suppliers,
  paymentTerms,
  plantUnits,
  salesOrders,
  purchaseIndents,
  items,
  hsnList
}: PurchaseOrderFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [lineItems, setLineItems] = useState<PurchaseOrderLineItemRow[]>([blankLineItem()]);
  const [contactPersons, setContactPersons] = useState<any[]>([]);
  const [loadingContactPersons, setLoadingContactPersons] = useState(false);

  const selectedSupplier = useMemo(
    () => suppliers.find(s => String(s.id) === String(form.supplierId)),
    [suppliers, form.supplierId]
  );

  const contactPersonOptions = useMemo(
    () =>
      contactPersons.map((cp: any) => ({
        key: formatContactPersonLabel(cp),
        value: cp.id
      })),
    [contactPersons]
  );

  const supplierBranchOptions = useMemo(() => {
    if (!selectedSupplier) return [];
    const options: { key: string; value: string }[] = [];
    const mainAddr = formatSupplierAddress(selectedSupplier);
    if (mainAddr) options.push({ key: mainAddr, value: mainAddr });
    (selectedSupplier.bankAccounts ?? []).forEach((ba: any) => {
      const branch = [ba.branchName, ba.branchAddress].filter(Boolean).join(' — ');
      if (branch) options.push({ key: branch, value: branch });
    });
    return options;
  }, [selectedSupplier]);

  const totals = useMemo(() => {
    let grossAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    lineItems.forEach(item => {
      grossAmount += item.taxableAmount || 0;
      cgstAmount += item.cgstAmount || 0;
      sgstAmount += item.sgstAmount || 0;
      igstAmount += item.igstAmount || 0;
    });

    const shipping = Number(form.shippingCharge) || 0;
    let subtotal = grossAmount + cgstAmount + sgstAmount + igstAmount + shipping;
    let roundOff = 0;
    let grandTotal = subtotal;
    const round = (n: number) => Math.round(n * 100) / 100;

    if (form.roundOffEnabled) {
      grandTotal = Math.round(subtotal);
      roundOff = round(grandTotal - subtotal);
    } else {
      grandTotal = round(subtotal);
    }

    return {
      grossAmount: round(grossAmount),
      cgstAmount: round(cgstAmount),
      sgstAmount: round(sgstAmount),
      igstAmount: round(igstAmount),
      roundOff,
      grandTotal
    };
  }, [lineItems, form.shippingCharge, form.roundOffEnabled]);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setForm({
        poType: initialData.poType ?? 'PO ADMINISTRATION',
        supplierId: initialData.supplierId ? String(initialData.supplierId) : '',
        contactPersonId: initialData.contactPersonId ? String(initialData.contactPersonId) : '',
        gstNo: initialData.gstNo ?? '',
        supplierBranch: initialData.supplierBranch ?? '',
        orderDate: initialData.orderDate
          ? new Date(initialData.orderDate).toISOString().split('T')[0]
          : defaultForm().orderDate,
        refSuppQuoteNo: initialData.refSuppQuoteNo ?? '',
        suppQuoteDate: initialData.suppQuoteDate
          ? new Date(initialData.suppQuoteDate).toISOString().split('T')[0]
          : '',
        refSalesOrderId: initialData.refSalesOrderId ? String(initialData.refSalesOrderId) : '',
        refProductionNo: initialData.refProductionNo ?? '',
        plantUnitId: initialData.plantUnitId ? String(initialData.plantUnitId) : '',
        shipToAddress: initialData.shipToAddress ?? '',
        paymentTermId: initialData.paymentTermId ? String(initialData.paymentTermId) : '',
        currency: initialData.currency ?? 'INR',
        fcnrValue: String(initialData.fcnrValue ?? 1),
        refPurchaseIndentId: initialData.refPurchaseIndentId
          ? String(initialData.refPurchaseIndentId)
          : '',
        docAttachmentRequired: Boolean(initialData.docAttachmentRequired),
        remarks: initialData.remarks ?? '',
        shippingCharge: String(initialData.shippingCharge ?? 0),
        roundOffEnabled: Boolean(initialData.roundOffEnabled),
        termsAndConditions: initialData.termsAndConditions ?? DEFAULT_TERMS
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

  useEffect(() => {
    if (!show || !form.supplierId) {
      setContactPersons([]);
      return;
    }

    let cancelled = false;

    const fetchContactPersons = async () => {
      setLoadingContactPersons(true);
      try {
        const response = await getSupplierContactPersons(form.supplierId);
        if (!cancelled) {
          setContactPersons(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching supplier contact persons:', error);
        if (!cancelled) setContactPersons([]);
      } finally {
        if (!cancelled) setLoadingContactPersons(false);
      }
    };

    fetchContactPersons();

    return () => {
      cancelled = true;
    };
  }, [form.supplierId, show]);

  const handleChange = (key: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => String(s.id) === String(supplierId));
    setForm(prev => ({
      ...prev,
      supplierId,
      contactPersonId: '',
      gstNo: supplier?.gstNo ?? '',
      supplierBranch: formatSupplierAddress(supplier) || prev.supplierBranch,
      paymentTermId: supplier?.paymentTermId ? String(supplier.paymentTermId) : prev.paymentTermId
    }));
  };

  const resolveHsnCode = (hsnId?: number | null) => {
    if (!hsnId) return '';
    const hsn = hsnList.find(h => h.id === hsnId);
    return hsn?.hsnCode ?? '';
  };

  const handleSelectIndentItems = async () => {
    if (!form.refPurchaseIndentId) {
      alert('Select a purchase indent (Ref PR No.) first.');
      return;
    }

    try {
      const response = await getPurchaseIndentById(form.refPurchaseIndentId);
      const indent = response.data;
      const rows = (indent?.lineItems || []).map((line: any) => {
        const item = items.find(i => i.id === line.itemId);
        const gstHalf = item?.gstSlab ? String(item.gstSlab / 2) : '0';
        return {
          itemId: line.itemId ? String(line.itemId) : '',
          description: line.description ?? '',
          unitId: line.unitId ? String(line.unitId) : item?.unitId ? String(item.unitId) : '',
          hsnCode: item ? resolveHsnCode(item.hsnId) : '',
          requiredBy: line.requiredDate
            ? new Date(line.requiredDate).toISOString().split('T')[0]
            : '',
          committedDate: '',
          qty: String(line.qty ?? ''),
          rate: item?.purchaseRate != null ? String(item.purchaseRate) : '',
          discountPercentage: '0',
          discountAmount: 0,
          taxableAmount: 0,
          cgstRate: gstHalf,
          sgstRate: gstHalf,
          igstRate: '0',
          igstAmount: 0,
          lineTotal: 0
        };
      }).map(mapLineFromApi);

      if (!rows.length) {
        alert('Selected indent has no line items.');
        return;
      }

      setLineItems(rows);
    } catch (error) {
      console.error('Error loading indent items:', error);
      alert('Could not load indent items.');
    }
  };

  const handleSubmit = () => {
    if (!form.orderDate) {
      alert('Please enter Purchase Order Date.');
      return;
    }

    const validLines = lineItems.filter(row => row.itemId && Number(row.qty) > 0);
    if (!validLines.length) {
      alert('Add at least one line item with quantity.');
      return;
    }

    onSubmit({
      poType: form.poType,
      supplierId: form.supplierId ? Number(form.supplierId) : null,
      contactPersonId: form.contactPersonId ? Number(form.contactPersonId) : null,
      gstNo: form.gstNo || null,
      supplierBranch: form.supplierBranch || null,
      orderDate: form.orderDate,
      refSuppQuoteNo: form.refSuppQuoteNo || null,
      suppQuoteDate: form.suppQuoteDate || null,
      refSalesOrderId: form.refSalesOrderId ? Number(form.refSalesOrderId) : null,
      refProductionNo: form.refProductionNo || null,
      plantUnitId: form.plantUnitId ? Number(form.plantUnitId) : null,
      shipToAddress: form.shipToAddress || null,
      paymentTermId: form.paymentTermId ? Number(form.paymentTermId) : null,
      currency: form.currency,
      fcnrValue: Number(form.fcnrValue) || 1,
      refPurchaseIndentId: form.refPurchaseIndentId ? Number(form.refPurchaseIndentId) : null,
      docAttachmentRequired: form.docAttachmentRequired,
      remarks: form.remarks || null,
      shippingCharge: Number(form.shippingCharge) || 0,
      roundOffEnabled: form.roundOffEnabled,
      termsAndConditions: form.termsAndConditions || null,
      lineItems: validLines.map(item => ({
        itemId: item.itemId ? Number(item.itemId) : null,
        description: item.description,
        unitId: item.unitId ? Number(item.unitId) : null,
        hsnCode: item.hsnCode || null,
        requiredBy: item.requiredBy || null,
        committedDate: item.committedDate || null,
        qty: Number(item.qty),
        rate: Number(item.rate),
        discountPercentage: Number(item.discountPercentage) || 0,
        discountAmount: item.discountAmount,
        taxableAmount: item.taxableAmount,
        cgstRate: Number(item.cgstRate) || 0,
        cgstAmount: item.cgstAmount,
        sgstRate: Number(item.sgstRate) || 0,
        sgstAmount: item.sgstAmount,
        igstRate: Number(item.igstRate) || 0,
        igstAmount: item.igstAmount,
        lineTotal: item.lineTotal
      }))
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Purchase Order' : 'Add Purchase Order'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <section className="pi-form-section">
          <h5>Order Details</h5>
          <div className="form-controller">
            <Select
              placeholder="PO Type"
              value={form.poType}
              options={PO_TYPES}
              onChange={value => handleChange('poType', String(value))}
            />
            <Select
              placeholder="Supplier"
              value={form.supplierId}
              options={suppliers.map(s => ({
                key: s.companyName || s.legalName || `Supplier ${s.id}`,
                value: s.id
              }))}
              onChange={value => handleSupplierChange(String(value))}
            />
            <Select
              placeholder={
                !form.supplierId
                  ? 'Select supplier first'
                  : loadingContactPersons
                    ? 'Loading contacts…'
                    : contactPersonOptions.length
                      ? 'Contact Person'
                      : 'No contact persons for supplier'
              }
              value={form.contactPersonId}
              options={contactPersonOptions}
              onChange={value => handleChange('contactPersonId', String(value))}
            />
            <div className="po-form-readonly" title="GST No.">
              {form.gstNo || 'GST No.'}
            </div>
          </div>

          <div className="form-controller">
            <Select
              placeholder="Supplier Branch"
              value={form.supplierBranch}
              options={supplierBranchOptions}
              onChange={value => handleChange('supplierBranch', String(value))}
            />
            <label className="pi-date-label">
              Purchase Order Date
              <input
                type="date"
                className="input input-date"
                value={form.orderDate}
                onChange={e => handleChange('orderDate', e.target.value)}
              />
            </label>
            <Input
              placeholder="Ref. Supp Quote No."
              value={form.refSuppQuoteNo}
              onChange={value => handleChange('refSuppQuoteNo', value)}
            />
          </div>

          <div className="form-controller">
            <label className="pi-date-label">
              Supp Quote Date
              <input
                type="date"
                className="input input-date"
                value={form.suppQuoteDate}
                onChange={e => handleChange('suppQuoteDate', e.target.value)}
              />
            </label>
            <Select
              placeholder="Ref. SO No."
              value={form.refSalesOrderId}
              options={salesOrders.map(so => ({
                key: `SO #${so.id}${so.customer?.companyName ? ` - ${so.customer.companyName}` : ''}`,
                value: so.id
              }))}
              onChange={value => handleChange('refSalesOrderId', String(value))}
            />
            <Input
              placeholder="Ref Prod. No."
              value={form.refProductionNo}
              onChange={value => handleChange('refProductionNo', value)}
            />
            <Select
              placeholder="Plant"
              value={form.plantUnitId}
              options={plantUnits.map(pu => ({
                key: pu.unit_name || pu.company_name,
                value: pu.id
              }))}
              onChange={value => handleChange('plantUnitId', String(value))}
            />
          </div>

          <div className="form-controller">
            <textarea
              className="pi-textarea"
              rows={2}
              placeholder="Ship To Address"
              value={form.shipToAddress}
              onChange={e => handleChange('shipToAddress', e.target.value)}
            />
            <Select
              placeholder="Payment Terms"
              value={form.paymentTermId}
              options={paymentTerms.map(pt => ({ key: pt.term_name, value: pt.id }))}
              onChange={value => handleChange('paymentTermId', String(value))}
            />
            <Select
              placeholder="Currency"
              value={form.currency}
              options={CURRENCIES}
              onChange={value => handleChange('currency', String(value))}
            />
          </div>

          <div className="form-controller form-controller-compact">
            <Input
              placeholder="Fcnr Value"
              value={form.fcnrValue}
              onChange={value => handleChange('fcnrValue', value)}
            />
            <div className="po-form-readonly" title="Ref PR No.">
              {form.refPurchaseIndentId ? `Indent #${form.refPurchaseIndentId}` : 'Ref PR No.'}
            </div>
            <Select
              placeholder="Ref Purchase Indent"
              value={form.refPurchaseIndentId}
              options={purchaseIndents.map(indent => ({
                key: `Indent #${indent.id}`,
                value: indent.id
              }))}
              onChange={value => handleChange('refPurchaseIndentId', String(value))}
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
        </section>

        <section className="pi-form-section">
          <h5>Item Details</h5>
          <div className="po-indent-actions">
            <button type="button" className="po-select-indent-btn" onClick={handleSelectIndentItems}>
              Select Indent Items
            </button>
          </div>
          <PurchaseOrderLineItems
            rows={lineItems}
            items={items}
            hsnList={hsnList}
            onChange={setLineItems}
          />
        </section>

        <section className="quotation-form-section po-remarks-totals">
          <div>
            <h5>Remarks</h5>
            <textarea
              className="pi-textarea"
              rows={4}
              placeholder="Enter remarks"
              value={form.remarks}
              onChange={e => handleChange('remarks', e.target.value)}
            />
          </div>
          <div className="quotation-totals-col">
            <h5>Summary</h5>
            <div className="quotation-totals">
              <div className="quotation-totals-row">
                <span>Gross Amount</span>
                <strong>₹{totals.grossAmount.toFixed(2)}</strong>
              </div>
              <div className="quotation-totals-row">
                <span>CGST</span>
                <strong>₹{totals.cgstAmount.toFixed(2)}</strong>
              </div>
              <div className="quotation-totals-row">
                <span>SGST</span>
                <strong>₹{totals.sgstAmount.toFixed(2)}</strong>
              </div>
              <div className="quotation-totals-row">
                <span>IGST</span>
                <strong>₹{totals.igstAmount.toFixed(2)}</strong>
              </div>
              <div className="quotation-totals-row">
                <span>Shipping Charge</span>
                <Input
                  placeholder="0"
                  value={form.shippingCharge}
                  onChange={value => handleChange('shippingCharge', value)}
                />
              </div>
              <div className="quotation-totals-row">
                <span>Round Off</span>
                <label className="pi-checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.roundOffEnabled}
                    onChange={e => handleChange('roundOffEnabled', e.target.checked)}
                  />
                </label>
                <strong>{form.roundOffEnabled ? `₹${totals.roundOff.toFixed(2)}` : '—'}</strong>
              </div>
              <div className="quotation-totals-row grand-total">
                <span>Grand Total</span>
                <strong>₹{totals.grandTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="quotation-form-section">
          <h5>Terms & Conditions</h5>
          <textarea
            className="quotation-textarea"
            rows={6}
            value={form.termsAndConditions}
            onChange={e => handleChange('termsAndConditions', e.target.value)}
          />
        </section>
      </Modal.Body>

      <Modal.Footer className="pi-modal-footer">
        <button type="button" className="cancel-button" onClick={onHide}>
          Cancel
        </button>
        <Button text={initialData ? 'Update Order' : 'Save'} onClick={handleSubmit} />
      </Modal.Footer>
    </Modal>
  );
}

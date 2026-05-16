import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import { getCustomerContactPersons } from '../../masters/customer/Customer.api';
import SalesOrderLineItems, {
  blankLineItem,
  type SalesOrderLineItemRow
} from './SalesOrderLineItems';
import '../quotation/Quotation.css';
import './SalesOrder.css';

interface SalesOrderFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  customers: any[];
  paymentTerms: any[];
  plantUnits: any[];
  items: any[];
  quotations: any[];
}

const defaultForm = () => ({
  customerId: '',
  contactPersonId: '',
  shippingAddressId: '',
  shippingAddressText: '',
  gstNo: '',
  plantUnitId: '',
  orderDate: new Date().toISOString().split('T')[0],
  poNo: '',
  poDate: '',
  refQuotationId: '',
  paymentTermId: '',
  termsAndConditions: '',
  shippingCharge: '0'
});

const formatAddress = (addr: any) => {
  if (!addr) return '';
  const parts = [addr.addressLine, addr.place, addr.pinCode].filter(Boolean);
  return parts.join(', ');
};

const mapLineItemFromApi = (item: any): SalesOrderLineItemRow => {
  const row: SalesOrderLineItemRow = {
    itemId: String(item.itemId ?? ''),
    itemDetails: item.itemDetails ?? '',
    description: item.description ?? '',
    poLineNo: item.poLineNo ?? '',
    unitId: item.unitId ? String(item.unitId) : '',
    hsnCode: item.hsnCode ?? '',
    deliveryDate: item.deliveryDate
      ? new Date(item.deliveryDate).toISOString().split('T')[0]
      : '',
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

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function SalesOrderForm({
  show,
  onHide,
  onSubmit,
  initialData,
  customers,
  paymentTerms,
  plantUnits,
  items,
  quotations
}: SalesOrderFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [lineItems, setLineItems] = useState<SalesOrderLineItemRow[]>([blankLineItem()]);
  const [contactPersons, setContactPersons] = useState<any[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [loadingContactPersons, setLoadingContactPersons] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [existingDocument, setExistingDocument] = useState<string | null>(null);

  const contactPersonOptions = useMemo(
    () => contactPersons.map((c: any) => ({ key: c.name, value: c.id })),
    [contactPersons]
  );

  const shippingAddressOptions = useMemo(
    () =>
      shippingAddresses.map((a: any) => ({
        key: formatAddress(a) || `Address #${a.id}`,
        value: a.id
      })),
    [shippingAddresses]
  );

  const customerQuotations = useMemo(() => {
    if (!form.customerId) return [];
    return quotations.filter(q => String(q.customerId) === String(form.customerId));
  }, [quotations, form.customerId]);

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
    const grandTotal = grossAmount + cgstAmount + sgstAmount + igstAmount + shipping;

    const round = (n: number) => Math.round(n * 100) / 100;

    return {
      grossAmount: round(grossAmount),
      cgstAmount: round(cgstAmount),
      sgstAmount: round(sgstAmount),
      igstAmount: round(igstAmount),
      grandTotal: round(grandTotal)
    };
  }, [lineItems, form.shippingCharge]);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setForm({
        customerId: String(initialData.customerId ?? ''),
        contactPersonId: initialData.contactPersonId ? String(initialData.contactPersonId) : '',
        shippingAddressId: initialData.shippingAddressId ? String(initialData.shippingAddressId) : '',
        shippingAddressText: initialData.shippingAddressText ?? '',
        gstNo: initialData.gstNo ?? '',
        plantUnitId: initialData.plantUnitId ? String(initialData.plantUnitId) : '',
        orderDate: initialData.orderDate
          ? new Date(initialData.orderDate).toISOString().split('T')[0]
          : defaultForm().orderDate,
        poNo: initialData.poNo ?? '',
        poDate: initialData.poDate ? new Date(initialData.poDate).toISOString().split('T')[0] : '',
        refQuotationId: initialData.refQuotationId ? String(initialData.refQuotationId) : '',
        paymentTermId: initialData.paymentTermId ? String(initialData.paymentTermId) : '',
        termsAndConditions: initialData.termsAndConditions ?? '',
        shippingCharge: String(initialData.shippingCharge ?? 0)
      });
      setExistingDocument(initialData.clientPoDocument ?? null);
      setDocumentFile(null);

      if (initialData.lineItems?.length) {
        setLineItems(initialData.lineItems.map(mapLineItemFromApi));
      } else {
        setLineItems([blankLineItem()]);
      }
    } else {
      setForm(defaultForm());
      setLineItems([blankLineItem()]);
      setExistingDocument(null);
      setDocumentFile(null);
    }
  }, [initialData, show]);

  useEffect(() => {
    if (!show || !form.customerId) {
      setContactPersons([]);
      setShippingAddresses([]);
      return;
    }

    let cancelled = false;

    const fetchCustomerData = async () => {
      setLoadingContactPersons(true);
      try {
        const response = await getCustomerContactPersons(form.customerId);
        if (!cancelled) {
          setContactPersons(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching contact persons:', error);
        if (!cancelled) setContactPersons([]);
      } finally {
        if (!cancelled) setLoadingContactPersons(false);
      }
    };

    const customer = customers.find(c => String(c.id) === String(form.customerId));
    const addresses = (customer?.addresses || []).filter((a: any) => a.type === 'SHIPPING');
    setShippingAddresses(addresses.length ? addresses : customer?.addresses || []);

    fetchCustomerData();

    return () => {
      cancelled = true;
    };
  }, [form.customerId, show, customers]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };

      if (key === 'customerId') {
        const customer = customers.find(c => String(c.id) === String(value));
        const billingGst =
          customer?.addresses?.find((a: any) => a.type === 'BILLING')?.gstNo ||
          customer?.addresses?.[0]?.gstNo ||
          '';
        next.contactPersonId = '';
        next.shippingAddressId = '';
        next.shippingAddressText = '';
        next.refQuotationId = '';
        next.gstNo = billingGst || '';
      }

      if (key === 'shippingAddressId' && value) {
        const addr = shippingAddresses.find(a => String(a.id) === String(value));
        if (addr) {
          next.shippingAddressText = formatAddress(addr);
          if (addr.gstNo) next.gstNo = addr.gstNo;
        }
      }

      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.customerId || !form.orderDate) {
      alert('Please fill required fields: Customer and Order Date.');
      return;
    }

    const validLines = lineItems.filter(row => row.itemId && Number(row.qty) > 0);
    if (!validLines.length) {
      alert('Add at least one line item with quantity.');
      return;
    }

    let documentBase64: string | undefined;
    let documentFileName: string | undefined;

    if (documentFile) {
      documentBase64 = await readFileAsBase64(documentFile);
      documentFileName = documentFile.name;
    }

    onSubmit({
      customerId: Number(form.customerId),
      contactPersonId: form.contactPersonId ? Number(form.contactPersonId) : null,
      shippingAddressId: form.shippingAddressId ? Number(form.shippingAddressId) : null,
      shippingAddressText: form.shippingAddressText || null,
      gstNo: form.gstNo || null,
      plantUnitId: form.plantUnitId ? Number(form.plantUnitId) : null,
      orderDate: form.orderDate,
      poNo: form.poNo || null,
      poDate: form.poDate || null,
      refQuotationId: form.refQuotationId ? Number(form.refQuotationId) : null,
      paymentTermId: form.paymentTermId ? Number(form.paymentTermId) : null,
      termsAndConditions: form.termsAndConditions || null,
      shippingCharge: Number(form.shippingCharge) || 0,
      documentBase64,
      documentFileName,
      lineItems: validLines.map(item => ({
        itemId: Number(item.itemId),
        itemDetails: item.itemDetails || null,
        description: item.description,
        poLineNo: item.poLineNo || null,
        unitId: item.unitId ? Number(item.unitId) : null,
        hsnCode: item.hsnCode || null,
        deliveryDate: item.deliveryDate || null,
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
    <Modal show={show} onHide={onHide} size="xl" scrollable className="sales-order-modal">
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Sales Order' : 'Add Sales Order'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <section className="quotation-form-section">
          <h5>Order Details</h5>
          <div className="form-controller">
            <Select
              placeholder="Customer *"
              value={form.customerId}
              options={customers.map(c => ({ key: c.companyName, value: c.id }))}
              onChange={value => handleChange('customerId', String(value))}
            />
            <Select
              placeholder={loadingContactPersons ? 'Loading contacts…' : 'Contact Person *'}
              value={form.contactPersonId}
              options={contactPersonOptions}
              onChange={value => handleChange('contactPersonId', String(value))}
            />
            <Select
              placeholder="Shipping Address"
              value={form.shippingAddressId}
              options={shippingAddressOptions}
              onChange={value => handleChange('shippingAddressId', String(value))}
            />
          </div>

          <div className="form-controller">
            <textarea
              className="quotation-textarea sales-order-address-textarea"
              rows={2}
              placeholder="Shipping Address"
              value={form.shippingAddressText}
              onChange={e => handleChange('shippingAddressText', e.target.value)}
            />
            <Input placeholder="GST No." value={form.gstNo} onChange={value => handleChange('gstNo', value)} />
            <Select
              placeholder="Plant Unit"
              value={form.plantUnitId}
              options={plantUnits.map(p => ({ key: p.unit_name, value: p.id }))}
              onChange={value => handleChange('plantUnitId', String(value))}
            />
            <input
              type="date"
              className="input input-date"
              title="Order Date *"
              value={form.orderDate}
              onChange={e => handleChange('orderDate', e.target.value)}
            />
          </div>

          <div className="form-controller">
            <Input placeholder="PO No." value={form.poNo} onChange={value => handleChange('poNo', value)} />
            <input
              type="date"
              className="input input-date"
              title="PO Date"
              value={form.poDate}
              onChange={e => handleChange('poDate', e.target.value)}
            />
            <Select
              placeholder="Ref Quote No"
              value={form.refQuotationId}
              options={customerQuotations.map(q => ({
                key: `Quote #${q.id} — ${new Date(q.quoteDate).toLocaleDateString('en-IN')}`,
                value: q.id
              }))}
              onChange={value => handleChange('refQuotationId', String(value))}
            />
          </div>

          <div className="form-controller">
            <Select
              placeholder="Payment Terms"
              value={form.paymentTermId}
              options={paymentTerms.map(pt => ({ key: pt.term_name, value: pt.id }))}
              onChange={value => handleChange('paymentTermId', String(value))}
            />
            <div className="sales-order-file-field">
              <label className="sales-order-file-label">Document File (Ref. Client PO)</label>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={e => setDocumentFile(e.target.files?.[0] || null)}
              />
              {existingDocument && !documentFile && (
                <span className="sales-order-file-hint">Current: {existingDocument.split('/').pop()}</span>
              )}
              {documentFile && <span className="sales-order-file-hint">Selected: {documentFile.name}</span>}
            </div>
          </div>
        </section>

        <section className="quotation-form-section">
          <h5>Line Items</h5>
          <SalesOrderLineItems rows={lineItems} items={items} onChange={setLineItems} />
        </section>

        <section className="quotation-form-section quotation-terms-totals-row">
          <div className="quotation-terms-col">
            <h5>Terms & Conditions</h5>
            <textarea
              className="quotation-textarea"
              rows={6}
              placeholder="Enter terms and conditions"
              value={form.termsAndConditions}
              onChange={e => handleChange('termsAndConditions', e.target.value)}
            />
          </div>
          <div className="quotation-totals-col">
            <h5>Totals</h5>
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
                  type="number"
                  value={form.shippingCharge}
                  onChange={value => handleChange('shippingCharge', value)}
                />
              </div>
              <div className="quotation-totals-row grand-total">
                <span>Grand Total</span>
                <strong>₹{totals.grandTotal.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </section>
      </Modal.Body>

      <Modal.Footer className="quotation-modal-footer">
        <button type="button" className="cancel-button" onClick={onHide}>
          Cancel
        </button>
        <Button text={initialData ? 'Update Sales Order' : 'Save'} onClick={handleSubmit} />
      </Modal.Footer>
    </Modal>
  );
}

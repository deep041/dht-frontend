import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import QuotationLineItems, {
  blankLineItem,
  type QuotationLineItemRow
} from './QuotationLineItems';
import './Quotation.css';

interface QuotationFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  customers: any[];
  paymentTerms: any[];
  bankAccounts: any[];
  items: any[];
}

const defaultForm = () => ({
  customerId: '',
  contactPersonId: '',
  gstNo: '',
  quoteDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  paymentTermId: '',
  bankAccountId: '',
  quoteType: 'GOODS',
  termsAndConditions: '',
  shippingCharge: '0'
});

const mapLineItemFromApi = (item: any): QuotationLineItemRow => {
  const row: QuotationLineItemRow = {
    itemId: String(item.itemId ?? ''),
    description: item.description ?? '',
    unitId: item.unitId ? String(item.unitId) : '',
    hsnCode: item.hsnCode ?? '',
    qty: String(item.qty ?? ''),
    rate: String(item.rate ?? ''),
    discountPercentage: String(item.discountPercentage ?? 0),
    discountAmount: item.discountAmount ?? 0,
    taxableAmount: item.taxableAmount ?? 0,
    cgstRate: String(item.cgstRate ?? 0),
    cgstAmount: item.cgstAmount ?? 0,
    sgstRate: String(item.sgstRate ?? 0),
    sgstAmount: item.sgstAmount ?? 0,
    lineTotal: item.lineTotal ?? 0
  };

  const qty = Number(row.qty) || 0;
  const rate = Number(row.rate) || 0;
  const discountPercentage = Number(row.discountPercentage) || 0;
  const cgstRate = Number(row.cgstRate) || 0;
  const sgstRate = Number(row.sgstRate) || 0;
  const baseAmount = qty * rate;
  const discountAmount = (baseAmount * discountPercentage) / 100;
  const taxableAmount = baseAmount - discountAmount;
  const cgstAmount = (taxableAmount * cgstRate) / 100;
  const sgstAmount = (taxableAmount * sgstRate) / 100;
  const lineTotal = taxableAmount + cgstAmount + sgstAmount;
  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    ...row,
    discountAmount: round(discountAmount),
    taxableAmount: round(taxableAmount),
    cgstAmount: round(cgstAmount),
    sgstAmount: round(sgstAmount),
    lineTotal: round(lineTotal)
  };
};

export default function QuotationForm({
  show,
  onHide,
  onSubmit,
  initialData,
  customers,
  paymentTerms,
  bankAccounts,
  items
}: QuotationFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [lineItems, setLineItems] = useState<QuotationLineItemRow[]>([blankLineItem()]);

  const selectedCustomer = useMemo(
    () => customers.find(c => String(c.id) === String(form.customerId)),
    [customers, form.customerId]
  );

  const contactPersonOptions = useMemo(() => {
    const list = selectedCustomer?.contactPersons ?? [];
    return list.map((c: any) => ({ key: c.name, value: c.id }));
  }, [selectedCustomer]);

  const totals = useMemo(() => {
    let cgstAmount = 0;
    let sgstAmount = 0;
    let grossAmount = 0;

    lineItems.forEach(item => {
      grossAmount += item.lineTotal || 0;
      cgstAmount += item.cgstAmount || 0;
      sgstAmount += item.sgstAmount || 0;
    });

    const shipping = Number(form.shippingCharge) || 0;
    const grandTotal = grossAmount + shipping;

    return {
      grossAmount: Math.round(grossAmount * 100) / 100,
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100
    };
  }, [lineItems, form.shippingCharge]);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setForm({
        customerId: String(initialData.customerId ?? ''),
        contactPersonId: initialData.contactPersonId ? String(initialData.contactPersonId) : '',
        gstNo: initialData.gstNo ?? '',
        quoteDate: initialData.quoteDate
          ? new Date(initialData.quoteDate).toISOString().split('T')[0]
          : defaultForm().quoteDate,
        expiryDate: initialData.expiryDate
          ? new Date(initialData.expiryDate).toISOString().split('T')[0]
          : '',
        paymentTermId: initialData.paymentTermId ? String(initialData.paymentTermId) : '',
        bankAccountId: initialData.bankAccountId ? String(initialData.bankAccountId) : '',
        quoteType: initialData.quoteType ?? 'GOODS',
        termsAndConditions: initialData.termsAndConditions ?? '',
        shippingCharge: String(initialData.shippingCharge ?? 0)
      });

      if (initialData.lineItems?.length) {
        setLineItems(initialData.lineItems.map(mapLineItemFromApi));
      } else {
        setLineItems([blankLineItem()]);
      }
    } else {
      setForm(defaultForm());
      setLineItems([blankLineItem()]);
    }
  }, [initialData, show]);

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
        next.gstNo = billingGst || next.gstNo;
      }

      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.customerId || !form.quoteDate || !form.expiryDate) {
      alert('Please fill required fields: Customer, Quote Date, and Expiry Date.');
      return;
    }

    const validLines = lineItems.filter(row => row.itemId && Number(row.qty) > 0);
    if (!validLines.length) {
      alert('Add at least one line item with quantity.');
      return;
    }

    onSubmit({
      customerId: Number(form.customerId),
      contactPersonId: form.contactPersonId ? Number(form.contactPersonId) : null,
      gstNo: form.gstNo || null,
      quoteDate: form.quoteDate,
      expiryDate: form.expiryDate,
      paymentTermId: form.paymentTermId ? Number(form.paymentTermId) : null,
      bankAccountId: form.bankAccountId ? Number(form.bankAccountId) : null,
      quoteType: form.quoteType,
      termsAndConditions: form.termsAndConditions || null,
      shippingCharge: Number(form.shippingCharge) || 0,
      lineItems: validLines.map(item => ({
        itemId: Number(item.itemId),
        description: item.description,
        unitId: item.unitId ? Number(item.unitId) : null,
        hsnCode: item.hsnCode || null,
        qty: Number(item.qty),
        rate: Number(item.rate),
        discountPercentage: Number(item.discountPercentage) || 0,
        discountAmount: item.discountAmount,
        taxableAmount: item.taxableAmount,
        cgstRate: Number(item.cgstRate) || 0,
        cgstAmount: item.cgstAmount,
        sgstRate: Number(item.sgstRate) || 0,
        sgstAmount: item.sgstAmount,
        lineTotal: item.lineTotal
      }))
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Quotation' : 'Create Quotation'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <section className="quotation-form-section">
          <h5>Quotation Details</h5>
          <div className="form-controller">
            <Select
              placeholder="Customer *"
              value={form.customerId}
              options={customers.map(c => ({ key: c.companyName, value: c.id }))}
              onChange={value => handleChange('customerId', String(value))}
            />
            <Select
              placeholder="Contact Person"
              value={form.contactPersonId}
              options={contactPersonOptions}
              onChange={value => handleChange('contactPersonId', String(value))}
            />
            <Input placeholder="GST No." value={form.gstNo} onChange={value => handleChange('gstNo', value)} />
          </div>

          <div className="form-controller">
            <Select
              placeholder="Quote Type *"
              value={form.quoteType}
              options={[
                { key: 'Goods', value: 'GOODS' },
                { key: 'Service', value: 'SERVICE' }
              ]}
              onChange={value => handleChange('quoteType', String(value))}
            />
            <label className="date-field">
              <span>Quote Date *</span>
              <input
                type="date"
                className="input"
                value={form.quoteDate}
                onChange={e => handleChange('quoteDate', e.target.value)}
              />
            </label>
            <label className="date-field">
              <span>Expiry Date *</span>
              <input
                type="date"
                className="input"
                value={form.expiryDate}
                onChange={e => handleChange('expiryDate', e.target.value)}
              />
            </label>
          </div>

          <div className="form-controller">
            <Select
              placeholder="Payment Terms"
              value={form.paymentTermId}
              options={paymentTerms.map(pt => ({ key: pt.term_name, value: pt.id }))}
              onChange={value => handleChange('paymentTermId', String(value))}
            />
            <Select
              placeholder="Bank Account"
              value={form.bankAccountId}
              options={bankAccounts.map(ba => ({
                key: `${ba.bank_name} - ${ba.account_number}`,
                value: ba.id
              }))}
              onChange={value => handleChange('bankAccountId', String(value))}
            />
          </div>
        </section>

        <section className="quotation-form-section">
          <h5>Line Items</h5>
          <QuotationLineItems rows={lineItems} items={items} onChange={setLineItems} />
        </section>

        <section className="quotation-form-section">
          <h5>Totals</h5>
          <div className="quotation-totals">
            <div className="quotation-totals-row">
              <span>Subtotal (incl. tax)</span>
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
        </section>

        <section className="quotation-form-section">
          <h5>Terms & Conditions</h5>
          <textarea
            className="quotation-textarea"
            rows={4}
            placeholder="Enter terms and conditions"
            value={form.termsAndConditions}
            onChange={e => handleChange('termsAndConditions', e.target.value)}
          />
        </section>
      </Modal.Body>

      <Modal.Footer className="quotation-modal-footer">
        <button type="button" className="cancel-button" onClick={onHide}>
          Cancel
        </button>
        <Button text={initialData ? 'Update Quotation' : 'Save Quotation'} onClick={handleSubmit} />
      </Modal.Footer>
    </Modal>
  );
}

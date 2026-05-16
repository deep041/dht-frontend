import { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import Button from '../../../components/Button/Button';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import { getCustomerContactPersons } from '../../masters/customer/Customer.api';
import { getSalesOrderById } from '../sales-order/SalesOrder.api';
import TaxInvoiceLineItems, {
  blankLineItem,
  type TaxInvoiceLineItemRow
} from './TaxInvoiceLineItems';
import '../quotation/Quotation.css';
import './TaxInvoice.css';

const DEFAULT_TERMS = `We declare that this invoice shows the actual price of goods described and that all particulars are true and correct.
Terms:
1. Goods once sold shall not be taken back.
2. Our responsibility Ceases as the goods leaves our godown.
3. If Payment not received in stipulated time interest @18% shall be charged.
4. Cheques dishonoured may attract a penalty plus GST.`;

interface TaxInvoiceFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  customers: any[];
  paymentTerms: any[];
  plantUnits: any[];
  warehouses: any[];
  bankAccounts: any[];
  items: any[];
  salesOrders: any[];
}

const defaultForm = () => ({
  supplyType: '',
  plantUnitId: '',
  warehouseId: '',
  customerId: '',
  contactPersonId: '',
  billingAddressText: '',
  gstNo: '',
  shippingAddressId: '',
  shippingAddressText: '',
  invoiceNo: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  customerPoNo: '',
  customerPoDate: '',
  refSalesOrderId: '',
  salesOrderNo: '',
  salesOrderDate: '',
  despatchDocNo: '',
  paymentTermId: '',
  despatchThrough: '',
  destination: '',
  bankAccountId: '',
  dueDate: '',
  remarks: '',
  termsAndConditions: DEFAULT_TERMS,
  shippingCharge: '0',
  tcsAmount: '0',
  roundOffEnabled: false
});

const formatAddress = (addr: any) => {
  if (!addr) return '';
  const parts = [addr.addressLine, addr.place, addr.pinCode].filter(Boolean);
  return parts.join(', ');
};

const mapLineItemFromApi = (item: any): TaxInvoiceLineItemRow => {
  const row: TaxInvoiceLineItemRow = {
    itemId: String(item.itemId ?? ''),
    itemDetails: item.itemDetails ?? '',
    description: item.description ?? '',
    customerItemCode: item.customerItemCode ?? '',
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
    igstRate: String(item.igstRate ?? 0),
    igstAmount: item.igstAmount ?? 0,
    lineTotal: item.lineTotal ?? 0,
    refSalesOrderNo: item.refSalesOrderNo ?? '',
    refJwoinNo: item.refJwoinNo ?? '',
    refChallanNo: item.refChallanNo ?? ''
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

const mapSalesOrderLine = (item: any): TaxInvoiceLineItemRow =>
  mapLineItemFromApi({
    ...item,
    refSalesOrderNo: item.refSalesOrderNo ?? ''
  });

export default function TaxInvoiceForm({
  show,
  onHide,
  onSubmit,
  initialData,
  customers,
  paymentTerms,
  plantUnits,
  warehouses,
  bankAccounts,
  items,
  salesOrders
}: TaxInvoiceFormProps) {
  const [form, setForm] = useState(defaultForm);
  const [lineItems, setLineItems] = useState<TaxInvoiceLineItemRow[]>([blankLineItem()]);
  const [contactPersons, setContactPersons] = useState<any[]>([]);
  const [shippingAddresses, setShippingAddresses] = useState<any[]>([]);
  const [loadingContactPersons, setLoadingContactPersons] = useState(false);
  const [showEwayModal, setShowEwayModal] = useState(false);
  const [ewayBill, setEwayBill] = useState({
    ewayBillNo: '',
    vehicleNo: '',
    transporterName: '',
    lrNo: '',
    lrDate: ''
  });

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

  const plantWarehouses = useMemo(() => {
    if (!form.plantUnitId) return [];
    return warehouses.filter(w => String(w.plant_unit_id) === String(form.plantUnitId));
  }, [warehouses, form.plantUnitId]);

  const customerSalesOrders = useMemo(() => {
    if (!form.customerId) return [];
    return salesOrders.filter(o => String(o.customerId) === String(form.customerId));
  }, [salesOrders, form.customerId]);

  const bankLabel = (bank: any) =>
    bank.bank_name && bank.account_number
      ? `${bank.bank_name} — ${bank.account_number}`
      : bank.bank_name || `Bank #${bank.id}`;

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
    const tcs = Number(form.tcsAmount) || 0;
    const subtotal = grossAmount + cgstAmount + sgstAmount + igstAmount + shipping + tcs;

    const round = (n: number) => Math.round(n * 100) / 100;
    let roundOff = 0;
    let grandTotal = subtotal;

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
  }, [lineItems, form.shippingCharge, form.tcsAmount, form.roundOffEnabled]);

  useEffect(() => {
    if (!show) return;

    if (initialData) {
      setForm({
        supplyType: initialData.supplyType ?? '',
        plantUnitId: initialData.plantUnitId ? String(initialData.plantUnitId) : '',
        warehouseId: initialData.warehouseId ? String(initialData.warehouseId) : '',
        customerId: String(initialData.customerId ?? ''),
        contactPersonId: initialData.contactPersonId ? String(initialData.contactPersonId) : '',
        billingAddressText: initialData.billingAddressText ?? '',
        gstNo: initialData.gstNo ?? '',
        shippingAddressId: initialData.shippingAddressId ? String(initialData.shippingAddressId) : '',
        shippingAddressText: initialData.shippingAddressText ?? '',
        invoiceNo: initialData.invoiceNo ?? '',
        invoiceDate: initialData.invoiceDate
          ? new Date(initialData.invoiceDate).toISOString().split('T')[0]
          : defaultForm().invoiceDate,
        customerPoNo: initialData.customerPoNo ?? '',
        customerPoDate: initialData.customerPoDate
          ? new Date(initialData.customerPoDate).toISOString().split('T')[0]
          : '',
        refSalesOrderId: initialData.refSalesOrderId ? String(initialData.refSalesOrderId) : '',
        salesOrderNo: initialData.salesOrderNo ?? '',
        salesOrderDate: initialData.salesOrderDate
          ? new Date(initialData.salesOrderDate).toISOString().split('T')[0]
          : '',
        despatchDocNo: initialData.despatchDocNo ?? '',
        paymentTermId: initialData.paymentTermId ? String(initialData.paymentTermId) : '',
        despatchThrough: initialData.despatchThrough ?? '',
        destination: initialData.destination ?? '',
        bankAccountId: initialData.bankAccountId ? String(initialData.bankAccountId) : '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        remarks: initialData.remarks ?? '',
        termsAndConditions: initialData.termsAndConditions ?? DEFAULT_TERMS,
        shippingCharge: String(initialData.shippingCharge ?? 0),
        tcsAmount: String(initialData.tcsAmount ?? 0),
        roundOffEnabled: Boolean(initialData.roundOffEnabled)
      });

      if (initialData.ewayBillDetails) {
        try {
          setEwayBill(JSON.parse(initialData.ewayBillDetails));
        } catch {
          setEwayBill({ ewayBillNo: '', vehicleNo: '', transporterName: '', lrNo: '', lrDate: '' });
        }
      }

      if (initialData.lineItems?.length) {
        setLineItems(initialData.lineItems.map(mapLineItemFromApi));
      } else {
        setLineItems([blankLineItem()]);
      }
    } else {
      const defaultBank = bankAccounts[0];
      setForm({
        ...defaultForm(),
        bankAccountId: defaultBank ? String(defaultBank.id) : ''
      });
      setLineItems([blankLineItem()]);
      setEwayBill({ ewayBillNo: '', vehicleNo: '', transporterName: '', lrNo: '', lrDate: '' });
    }
  }, [initialData, show, bankAccounts]);

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
        if (!cancelled) setContactPersons(response.data || []);
      } catch (error) {
        console.error('Error fetching contact persons:', error);
        if (!cancelled) setContactPersons([]);
      } finally {
        if (!cancelled) setLoadingContactPersons(false);
      }
    };

    const customer = customers.find(c => String(c.id) === String(form.customerId));
    const billing = customer?.addresses?.find((a: any) => a.type === 'BILLING');
    const addresses = (customer?.addresses || []).filter((a: any) => a.type === 'SHIPPING');
    setShippingAddresses(addresses.length ? addresses : customer?.addresses || []);

    if (!initialData && billing && !form.billingAddressText) {
      setForm(prev => ({
        ...prev,
        billingAddressText: formatAddress(billing),
        gstNo: billing.gstNo || prev.gstNo
      }));
    }

    fetchCustomerData();

    return () => {
      cancelled = true;
    };
  }, [form.customerId, show, customers]);

  const handleChange = (key: string, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };

      if (key === 'customerId') {
        const customer = customers.find(c => String(c.id) === String(value));
        const billing = customer?.addresses?.find((a: any) => a.type === 'BILLING');
        const billingGst = billing?.gstNo || customer?.addresses?.[0]?.gstNo || '';
        next.contactPersonId = '';
        next.shippingAddressId = '';
        next.shippingAddressText = '';
        next.refSalesOrderId = '';
        next.billingAddressText = billing ? formatAddress(billing) : '';
        next.gstNo = billingGst || '';
      }

      if (key === 'plantUnitId') {
        next.warehouseId = '';
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

  const loadSalesOrder = async (orderId: string) => {
    if (!orderId) return;
    try {
      const response = await getSalesOrderById(orderId);
      const order = response.data;
      if (!order) return;

      setForm(prev => ({
        ...prev,
        refSalesOrderId: orderId,
        salesOrderNo: String(order.id),
        salesOrderDate: order.orderDate
          ? new Date(order.orderDate).toISOString().split('T')[0]
          : '',
        customerPoNo: order.poNo || prev.customerPoNo,
        customerPoDate: order.poDate ? new Date(order.poDate).toISOString().split('T')[0] : prev.customerPoDate,
        paymentTermId: order.paymentTermId ? String(order.paymentTermId) : prev.paymentTermId,
        plantUnitId: order.plantUnitId ? String(order.plantUnitId) : prev.plantUnitId,
        shippingAddressText: order.shippingAddressText || prev.shippingAddressText,
        gstNo: order.gstNo || prev.gstNo,
        shippingCharge: String(order.shippingCharge ?? prev.shippingCharge),
        termsAndConditions: order.termsAndConditions || prev.termsAndConditions
      }));

      if (order.lineItems?.length) {
        setLineItems(
          order.lineItems.map((line: any) =>
            mapSalesOrderLine({
              ...line,
              refSalesOrderNo: String(order.id)
            })
          )
        );
      }
    } catch (error) {
      console.error('Error loading sales order:', error);
    }
  };

  const handleSubmit = () => {
    if (!form.customerId || !form.invoiceNo || !form.invoiceDate) {
      alert('Please fill required fields: Customer, Invoice No., and Invoice Date.');
      return;
    }

    const validLines = lineItems.filter(row => row.itemId && Number(row.qty) > 0);
    if (!validLines.length) {
      alert('Add at least one line item with quantity.');
      return;
    }

    const ewayPayload = Object.values(ewayBill).some(Boolean) ? JSON.stringify(ewayBill) : null;

    onSubmit({
      supplyType: form.supplyType || null,
      plantUnitId: form.plantUnitId ? Number(form.plantUnitId) : null,
      warehouseId: form.warehouseId ? Number(form.warehouseId) : null,
      customerId: Number(form.customerId),
      contactPersonId: form.contactPersonId ? Number(form.contactPersonId) : null,
      billingAddressText: form.billingAddressText || null,
      gstNo: form.gstNo || null,
      shippingAddressId: form.shippingAddressId ? Number(form.shippingAddressId) : null,
      shippingAddressText: form.shippingAddressText || null,
      invoiceNo: form.invoiceNo,
      invoiceDate: form.invoiceDate,
      customerPoNo: form.customerPoNo || null,
      customerPoDate: form.customerPoDate || null,
      refSalesOrderId: form.refSalesOrderId ? Number(form.refSalesOrderId) : null,
      salesOrderNo: form.salesOrderNo || null,
      salesOrderDate: form.salesOrderDate || null,
      despatchDocNo: form.despatchDocNo || null,
      paymentTermId: form.paymentTermId ? Number(form.paymentTermId) : null,
      despatchThrough: form.despatchThrough || null,
      destination: form.destination || null,
      bankAccountId: form.bankAccountId ? Number(form.bankAccountId) : null,
      dueDate: form.dueDate || null,
      remarks: form.remarks || null,
      ewayBillDetails: ewayPayload,
      termsAndConditions: form.termsAndConditions || null,
      shippingCharge: Number(form.shippingCharge) || 0,
      tcsAmount: Number(form.tcsAmount) || 0,
      roundOffEnabled: form.roundOffEnabled,
      lineItems: validLines.map(item => ({
        itemId: Number(item.itemId),
        itemDetails: item.itemDetails || null,
        description: item.description,
        customerItemCode: item.customerItemCode || null,
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
        igstRate: Number(item.igstRate) || 0,
        igstAmount: item.igstAmount,
        lineTotal: item.lineTotal,
        refSalesOrderNo: item.refSalesOrderNo || null,
        refJwoinNo: item.refJwoinNo || null,
        refChallanNo: item.refChallanNo || null
      }))
    });
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="xl" scrollable className="tax-invoice-modal">
        <Modal.Header closeButton>
          <Modal.Title>{initialData ? 'Edit Tax Invoice' : 'Add Tax Invoice'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <section className="quotation-form-section">
            <h5>General Information</h5>
            <div className="form-controller">
              <Input
                placeholder="Supply Type"
                value={form.supplyType}
                onChange={value => handleChange('supplyType', value)}
              />
              <Select
                placeholder="Unit / Plant"
                value={form.plantUnitId}
                options={plantUnits.map(p => ({ key: p.unit_name, value: p.id }))}
                onChange={value => handleChange('plantUnitId', String(value))}
              />
              <Select
                placeholder={form.plantUnitId ? 'Warehouse' : 'Select Plant First'}
                value={form.warehouseId}
                options={plantWarehouses.map(w => ({ key: w.name, value: w.id }))}
                onChange={value => handleChange('warehouseId', String(value))}
              />
            </div>
            <div className="form-controller">
              <Select
                placeholder="Customer *"
                value={form.customerId}
                options={customers.map(c => ({ key: c.companyName, value: c.id }))}
                onChange={value => handleChange('customerId', String(value))}
              />
              <Select
                placeholder={loadingContactPersons ? 'Loading contacts…' : 'Contact Person'}
                value={form.contactPersonId}
                options={contactPersonOptions}
                onChange={value => handleChange('contactPersonId', String(value))}
              />
              <textarea
                className="quotation-textarea tax-invoice-address-textarea"
                rows={2}
                placeholder="Billing Address"
                value={form.billingAddressText}
                onChange={e => handleChange('billingAddressText', e.target.value)}
              />
            </div>
            <div className="form-controller">
              <Input placeholder="GST No." value={form.gstNo} onChange={value => handleChange('gstNo', value)} />
              <Select
                placeholder="Shipping Address"
                value={form.shippingAddressId}
                options={shippingAddressOptions}
                onChange={value => handleChange('shippingAddressId', String(value))}
              />
              <textarea
                className="quotation-textarea tax-invoice-address-textarea"
                rows={2}
                placeholder="Shipping Address"
                value={form.shippingAddressText}
                onChange={e => handleChange('shippingAddressText', e.target.value)}
              />
            </div>
          </section>

          <section className="quotation-form-section">
            <h5>Invoice Data</h5>
            <div className="form-controller form-controller-compact">
              <Input
                placeholder="Invoice No. *"
                value={form.invoiceNo}
                onChange={value => handleChange('invoiceNo', value)}
              />
              <input
                type="date"
                className="input input-date"
                title="Invoice Date *"
                value={form.invoiceDate}
                onChange={e => handleChange('invoiceDate', e.target.value)}
              />
              <Input
                placeholder="Customer PO No."
                value={form.customerPoNo}
                onChange={value => handleChange('customerPoNo', value)}
              />
              <input
                type="date"
                className="input input-date"
                title="Customer PO Date"
                value={form.customerPoDate}
                onChange={e => handleChange('customerPoDate', e.target.value)}
              />
              <Select
                placeholder="Sales Order"
                value={form.refSalesOrderId}
                options={customerSalesOrders.map(o => ({
                  key: `SO #${o.id} — ${new Date(o.orderDate).toLocaleDateString('en-IN')}`,
                  value: o.id
                }))}
                onChange={value => {
                  handleChange('refSalesOrderId', String(value));
                  loadSalesOrder(String(value));
                }}
              />
              <input
                type="date"
                className="input input-date"
                title="Sales Order Date"
                value={form.salesOrderDate}
                onChange={e => handleChange('salesOrderDate', e.target.value)}
              />
            </div>
            <div className="form-controller">
              <Input
                placeholder="Despatch Doc. No."
                value={form.despatchDocNo}
                onChange={value => handleChange('despatchDocNo', value)}
              />
              <Select
                placeholder="Payment Terms"
                value={form.paymentTermId}
                options={paymentTerms.map(pt => ({ key: pt.term_name, value: pt.id }))}
                onChange={value => handleChange('paymentTermId', String(value))}
              />
              <Input
                placeholder="Despatch Through"
                value={form.despatchThrough}
                onChange={value => handleChange('despatchThrough', value)}
              />
              <Input
                placeholder="Destination"
                value={form.destination}
                onChange={value => handleChange('destination', value)}
              />
              <Select
                placeholder="Bank Detail"
                value={form.bankAccountId}
                options={bankAccounts.map(b => ({ key: bankLabel(b), value: b.id }))}
                onChange={value => handleChange('bankAccountId', String(value))}
              />
            </div>
            <div className="form-controller">
              <input
                type="date"
                className="input input-date"
                title="Due Date"
                value={form.dueDate}
                onChange={e => handleChange('dueDate', e.target.value)}
              />
            </div>
          </section>

          <section className="quotation-form-section">
            <div className="form-controller">
              <button type="button" className="tax-invoice-eway-btn" onClick={() => setShowEwayModal(true)}>
                Eway Bill / Dispatch Details
              </button>
              <Input placeholder="Remarks" value={form.remarks} onChange={value => handleChange('remarks', value)} />
            </div>
          </section>

          <section className="quotation-form-section">
            <h5>Item Details</h5>
            <TaxInvoiceLineItems rows={lineItems} items={items} onChange={setLineItems} />
          </section>

          <section className="quotation-form-section quotation-terms-totals-row">
            <div className="quotation-terms-col">
              <h5>Terms & Conditions</h5>
              <textarea
                className="quotation-textarea"
                rows={8}
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
                <div className="quotation-totals-row">
                  <span>TCS</span>
                  <Input
                    placeholder="0"
                    type="number"
                    value={form.tcsAmount}
                    onChange={value => handleChange('tcsAmount', value)}
                  />
                </div>
                <div className="quotation-totals-row tax-invoice-roundoff-row">
                  <span>Round Off</span>
                  <label>
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
        </Modal.Body>

        <Modal.Footer className="quotation-modal-footer">
          <button type="button" className="cancel-button" onClick={onHide}>
            Cancel
          </button>
          <Button text={initialData ? 'Update Invoice' : 'Save Invoice'} onClick={handleSubmit} />
        </Modal.Footer>
      </Modal>

      <Modal show={showEwayModal} onHide={() => setShowEwayModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Eway Bill / Dispatch Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-controller" style={{ flexDirection: 'column' }}>
            <Input
              placeholder="Eway Bill No."
              value={ewayBill.ewayBillNo}
              onChange={value => setEwayBill(prev => ({ ...prev, ewayBillNo: value }))}
            />
            <Input
              placeholder="Vehicle No."
              value={ewayBill.vehicleNo}
              onChange={value => setEwayBill(prev => ({ ...prev, vehicleNo: value }))}
            />
            <Input
              placeholder="Transporter Name"
              value={ewayBill.transporterName}
              onChange={value => setEwayBill(prev => ({ ...prev, transporterName: value }))}
            />
            <Input
              placeholder="LR No."
              value={ewayBill.lrNo}
              onChange={value => setEwayBill(prev => ({ ...prev, lrNo: value }))}
            />
            <input
              type="date"
              className="input input-date"
              title="LR Date"
              value={ewayBill.lrDate}
              onChange={e => setEwayBill(prev => ({ ...prev, lrDate: e.target.value }))}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button text="Done" onClick={() => setShowEwayModal(false)} />
        </Modal.Footer>
      </Modal>
    </>
  );
}


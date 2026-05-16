import { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button as BootstrapButton, Table } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import './Quotation.css';

interface LineItem {
  itemId: string;
  description: string;
  unitId: string;
  hsnCode: string;
  qty: number;
  rate: number;
  discountPercentage: number;
  discountAmount: number;
  taxableAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  lineTotal: number;
}

interface QuotationFormProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
  customers: any[];
  contactPersons: any[];
  paymentTerms: any[];
  bankAccounts: any[];
  items: any[];
}

const blankLineItem: LineItem = {
  itemId: '',
  description: '',
  unitId: '',
  hsnCode: '',
  qty: 0,
  rate: 0,
  discountPercentage: 0,
  discountAmount: 0,
  taxableAmount: 0,
  cgstRate: 0,
  cgstAmount: 0,
  sgstRate: 0,
  sgstAmount: 0,
  lineTotal: 0
};

export default function QuotationForm({
  show,
  onHide,
  onSubmit,
  initialData,
  customers,
  contactPersons,
  paymentTerms,
  bankAccounts,
  items
}: QuotationFormProps) {
  const [form, setForm] = useState({
    customerId: '',
    contactPersonId: '',
    gstNo: '',
    quoteDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    paymentTermId: '',
    bankAccountId: '',
    quoteType: 'GOODS',
    termsAndConditions: '',
    shippingCharge: 0
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([{ ...blankLineItem }]);
  const [totals, setTotals] = useState({
    grossAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    grandTotal: 0
  });

  // Calculate line item totals
  const calculateLineItem = (item: LineItem) => {
    const qty = item.qty || 0;
    const rate = item.rate || 0;
    const discountPercentage = item.discountPercentage || 0;

    let baseAmount = qty * rate;
    let discountAmount = (baseAmount * discountPercentage) / 100;
    let taxableAmount = baseAmount - discountAmount;

    let cgstRate = item.cgstRate || 0;
    let sgstRate = item.sgstRate || 0;

    let cgstAmount = (taxableAmount * cgstRate) / 100;
    let sgstAmount = (taxableAmount * sgstRate) / 100;

    let lineTotal = taxableAmount + cgstAmount + sgstAmount;

    return {
      discountAmount: Math.round(discountAmount * 100) / 100,
      taxableAmount: Math.round(taxableAmount * 100) / 100,
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      lineTotal: Math.round(lineTotal * 100) / 100
    };
  };

  // Calculate totals when line items change
  useEffect(() => {
    let grossAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;

    lineItems.forEach(item => {
      grossAmount += item.lineTotal || 0;
      cgstAmount += item.cgstAmount || 0;
      sgstAmount += item.sgstAmount || 0;
    });

    const grandTotal = grossAmount + (form.shippingCharge || 0);

    setTotals({
      grossAmount: Math.round(grossAmount * 100) / 100,
      cgstAmount: Math.round(cgstAmount * 100) / 100,
      sgstAmount: Math.round(sgstAmount * 100) / 100,
      igstAmount: 0,
      grandTotal: Math.round(grandTotal * 100) / 100
    });
  }, [lineItems, form.shippingCharge]);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setForm({
        customerId: initialData.customerId || '',
        contactPersonId: initialData.contactPersonId || '',
        gstNo: initialData.gstNo || '',
        quoteDate: initialData.quoteDate ? new Date(initialData.quoteDate).toISOString().split('T')[0] : '',
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
        paymentTermId: initialData.paymentTermId || '',
        bankAccountId: initialData.bankAccountId || '',
        quoteType: initialData.quoteType || 'GOODS',
        termsAndConditions: initialData.termsAndConditions || '',
        shippingCharge: initialData.shippingCharge || 0
      });

      if (initialData.lineItems && initialData.lineItems.length > 0) {
        setLineItems(initialData.lineItems);
      }
    }
  }, [initialData, show]);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const newLineItems = [...lineItems];
    let item: any = { ...newLineItems[index], [field]: value };

    // If qty, rate, or discount changed, recalculate
    if (['qty', 'rate', 'discountPercentage', 'cgstRate', 'sgstRate'].includes(field)) {
      const calculations = calculateLineItem(item);
      item = { ...item, ...calculations };
    }

    newLineItems[index] = item;
    setLineItems(newLineItems);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { ...blankLineItem }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      customerId: Number(form.customerId),
      contactPersonId: form.contactPersonId ? Number(form.contactPersonId) : null,
      paymentTermId: form.paymentTermId ? Number(form.paymentTermId) : null,
      bankAccountId: form.bankAccountId ? Number(form.bankAccountId) : null,
      shippingCharge: Number(form.shippingCharge),
      lineItems: lineItems.map(item => ({
        ...item,
        itemId: Number(item.itemId),
        unitId: item.unitId ? Number(item.unitId) : null,
        qty: Number(item.qty),
        rate: Number(item.rate),
        discountPercentage: Number(item.discountPercentage),
        cgstRate: Number(item.cgstRate),
        sgstRate: Number(item.sgstRate)
      }))
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{initialData ? 'Edit Quotation' : 'Create New Quotation'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Header Section */}
          <div className="quotation-section">
            <h5>Quotation Details</h5>
            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Customer *</label>
                <Select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleFormChange}
                  options={customers.map(c => ({ value: c.id, label: c.companyName }))}
                  required
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Contact Person</label>
                <Select
                  name="contactPersonId"
                  value={form.contactPersonId}
                  onChange={handleFormChange}
                  options={contactPersons.map(c => ({ value: c.id, label: c.name }))}
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">GST No.</label>
                <Input
                  type="text"
                  name="gstNo"
                  value={form.gstNo}
                  onChange={handleFormChange}
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Quote Type *</label>
                <Select
                  name="quoteType"
                  value={form.quoteType}
                  onChange={handleFormChange}
                  options={[
                    { value: 'GOODS', label: 'Goods' },
                    { value: 'SERVICE', label: 'Service' }
                  ]}
                  required
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Quote Date *</label>
                <Input
                  type="date"
                  name="quoteDate"
                  value={form.quoteDate}
                  onChange={handleFormChange}
                  required
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Expiry Date *</label>
                <Input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleFormChange}
                  required
                />
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <label className="form-label">Payment Terms</label>
                <Select
                  name="paymentTermId"
                  value={form.paymentTermId}
                  onChange={handleFormChange}
                  options={paymentTerms.map(pt => ({ value: pt.id, label: pt.term_name }))}
                />
              </Col>
              <Col md={6}>
                <label className="form-label">Bank Details</label>
                <Select
                  name="bankAccountId"
                  value={form.bankAccountId}
                  onChange={handleFormChange}
                  options={bankAccounts.map(ba => ({
                    value: ba.id,
                    label: `${ba.bank_name} - ${ba.account_number}`
                  }))}
                />
              </Col>
            </Row>
          </div>

          {/* Line Items Section */}
          <div className="quotation-section mt-4">
            <h5>Line Items</h5>
            <div className="table-responsive">
              <Table striped bordered hover size="sm" className="quotation-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>HSN</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Disc %</th>
                    <th>CGST %</th>
                    <th>SGST %</th>
                    <th>Line Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Select
                          value={item.itemId}
                          onChange={(e) => {
                            const selectedItem = items.find(i => i.id === Number(e.target.value));
                            handleLineItemChange(index, 'itemId', e.target.value);
                            if (selectedItem) {
                              handleLineItemChange(index, 'hsnCode', selectedItem.hsn?.hsnCode || '');
                              handleLineItemChange(index, 'cgstRate', selectedItem.gstSlab || 0);
                              handleLineItemChange(index, 'sgstRate', selectedItem.gstSlab || 0);
                            }
                          }}
                          options={items.map(i => ({
                            value: i.id,
                            label: `${i.itemName} (${i.id})`
                          }))}
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                          placeholder="Description"
                        />
                      </td>
                      <td>
                        <Input
                          type="text"
                          value={item.unitId}
                          onChange={(e) => handleLineItemChange(index, 'unitId', e.target.value)}
                          placeholder="Unit"
                        />
                      </td>
                      <td>
                        <span>{item.hsnCode}</span>
                      </td>
                      <td>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleLineItemChange(index, 'qty', e.target.value)}
                          placeholder="Qty"
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                          placeholder="Rate"
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.discountPercentage}
                          onChange={(e) => handleLineItemChange(index, 'discountPercentage', e.target.value)}
                          placeholder="Disc %"
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.cgstRate}
                          onChange={(e) => handleLineItemChange(index, 'cgstRate', e.target.value)}
                          placeholder="CGST %"
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.sgstRate}
                          onChange={(e) => handleLineItemChange(index, 'sgstRate', e.target.value)}
                          placeholder="SGST %"
                        />
                      </td>
                      <td className="fw-bold">{item.lineTotal.toFixed(2)}</td>
                      <td>
                        <BootstrapButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveLineItem(index)}
                          disabled={lineItems.length === 1}
                        >
                          Remove
                        </BootstrapButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
            <BootstrapButton variant="primary" size="sm" onClick={handleAddLineItem} className="mt-2">
              + Add Line Item
            </BootstrapButton>
          </div>

          {/* Totals Section */}
          <div className="quotation-section mt-4">
            <h5>Totals</h5>
            <Row>
              <Col md={6}>
                <Row className="mb-2">
                  <Col xs={8}><strong>Gross Amount:</strong></Col>
                  <Col xs={4} className="text-end">{totals.grossAmount.toFixed(2)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col xs={8}><strong>CGST (18%):</strong></Col>
                  <Col xs={4} className="text-end">{totals.cgstAmount.toFixed(2)}</Col>
                </Row>
                <Row className="mb-2">
                  <Col xs={8}><strong>SGST (18%):</strong></Col>
                  <Col xs={4} className="text-end">{totals.sgstAmount.toFixed(2)}</Col>
                </Row>
              </Col>
              <Col md={6}>
                <Row className="mb-2">
                  <Col xs={8}><strong>Shipping Charge:</strong></Col>
                  <Col xs={4}>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.shippingCharge}
                      onChange={(e) => handleFormChange({ target: { name: 'shippingCharge', value: e.target.value } })}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className="mt-3 border-top pt-2">
              <Col xs={8}><h5>Grand Total:</h5></Col>
              <Col xs={4} className="text-end"><h5>{totals.grandTotal.toFixed(2)}</h5></Col>
            </Row>
          </div>

          {/* Terms & Conditions Section */}
          <div className="quotation-section mt-4">
            <h5>Terms & Conditions</h5>
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={3}
                name="termsAndConditions"
                value={form.termsAndConditions}
                onChange={handleFormChange}
                placeholder="Enter terms and conditions"
              />
            </Form.Group>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <BootstrapButton variant="secondary" onClick={onHide}>
          Close
        </BootstrapButton>
        <BootstrapButton variant="primary" onClick={handleSubmit}>
          {initialData ? 'Update' : 'Create'} Quotation
        </BootstrapButton>
      </Modal.Footer>
    </Modal>
  );
}

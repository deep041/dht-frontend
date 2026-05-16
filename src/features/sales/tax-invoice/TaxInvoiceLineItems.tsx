import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import './TaxInvoice.css';

export interface TaxInvoiceLineItemRow {
  itemId: string;
  itemDetails: string;
  description: string;
  customerItemCode: string;
  unitId: string;
  hsnCode: string;
  qty: string;
  rate: string;
  discountPercentage: string;
  discountAmount: number;
  taxableAmount: number;
  cgstRate: string;
  cgstAmount: number;
  sgstRate: string;
  sgstAmount: number;
  igstRate: string;
  igstAmount: number;
  lineTotal: number;
  refSalesOrderNo: string;
  refJwoinNo: string;
  refChallanNo: string;
}

export const blankLineItem = (): TaxInvoiceLineItemRow => ({
  itemId: '',
  itemDetails: '',
  description: '',
  customerItemCode: '',
  unitId: '',
  hsnCode: '',
  qty: '',
  rate: '',
  discountPercentage: '0',
  discountAmount: 0,
  taxableAmount: 0,
  cgstRate: '0',
  cgstAmount: 0,
  sgstRate: '0',
  sgstAmount: 0,
  igstRate: '0',
  igstAmount: 0,
  lineTotal: 0,
  refSalesOrderNo: '',
  refJwoinNo: '',
  refChallanNo: ''
});

const round = (n: number) => Math.round(n * 100) / 100;

const calculateLineItem = (item: TaxInvoiceLineItemRow): TaxInvoiceLineItemRow => {
  const qty = Number(item.qty) || 0;
  const rate = Number(item.rate) || 0;
  const discountPercentage = Number(item.discountPercentage) || 0;
  const cgstRate = Number(item.cgstRate) || 0;
  const sgstRate = Number(item.sgstRate) || 0;
  const igstRate = Number(item.igstRate) || 0;

  const baseAmount = qty * rate;
  const discountAmount = (baseAmount * discountPercentage) / 100;
  const taxableAmount = baseAmount - discountAmount;
  const cgstAmount = (taxableAmount * cgstRate) / 100;
  const sgstAmount = (taxableAmount * sgstRate) / 100;
  const igstAmount = (taxableAmount * igstRate) / 100;
  const lineTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;

  return {
    ...item,
    discountAmount: round(discountAmount),
    taxableAmount: round(taxableAmount),
    cgstAmount: round(cgstAmount),
    sgstAmount: round(sgstAmount),
    igstAmount: round(igstAmount),
    lineTotal: round(lineTotal)
  };
};

interface TaxInvoiceLineItemsProps {
  rows: TaxInvoiceLineItemRow[];
  items: any[];
  onChange: (rows: TaxInvoiceLineItemRow[]) => void;
}

export default function TaxInvoiceLineItems({ rows, items, onChange }: TaxInvoiceLineItemsProps) {
  const itemOptions = items.map(item => ({
    key: item.itemName || item.name || `Item ${item.id}`,
    value: item.id
  }));

  const updateRow = (index: number, patch: Partial<TaxInvoiceLineItemRow>) => {
    onChange(rows.map((row, i) => (i === index ? calculateLineItem({ ...row, ...patch }) : row)));
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find(item => String(item.id) === String(itemId));
    const gstHalf = selected?.gstSlab ? String(selected.gstSlab / 2) : '0';

    updateRow(index, {
      itemId,
      itemDetails: selected?.partDescription || selected?.customerItemCode || '',
      description: selected?.description || selected?.itemName || '',
      customerItemCode: selected?.customerItemCode || '',
      unitId: selected?.unitId ? String(selected.unitId) : '',
      rate: selected?.sellingRate != null ? String(selected.sellingRate) : '',
      hsnCode: selected?.hsnCode || '',
      cgstRate: gstHalf,
      sgstRate: gstHalf,
      igstRate: '0'
    });
  };

  const addRow = () => onChange([...rows, blankLineItem()]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="tax-invoice-line-items">
      <div className="tax-invoice-line-items-scroll">
        <div className="tax-invoice-line-items-header">
          <span>Item</span>
          <span>Item Details</span>
          <span>Description</span>
          <span>Cust. Item Code</span>
          <span>HSN</span>
          <span>Qty</span>
          <span>Rate</span>
          <span>Disc %</span>
          <span>Disc Amt</span>
          <span>Taxable</span>
          <span>CGST %</span>
          <span>CGST Amt</span>
          <span>SGST %</span>
          <span>SGST Amt</span>
          <span>IGST %</span>
          <span>IGST Amt</span>
          <span>Total</span>
          <span>Ref SO</span>
          <span>Ref JWOIN</span>
          <span>Ref Challan</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div className="tax-invoice-line-items-row" key={index}>
            <Select
              placeholder="Item"
              value={row.itemId}
              options={itemOptions}
              onChange={value => handleItemSelect(index, String(value))}
            />
            <Input
              placeholder="Item details"
              value={row.itemDetails}
              onChange={value => updateRow(index, { itemDetails: value })}
            />
            <Input
              placeholder="Description"
              value={row.description}
              onChange={value => updateRow(index, { description: value })}
            />
            <Input
              placeholder="Cust. code"
              value={row.customerItemCode}
              onChange={value => updateRow(index, { customerItemCode: value })}
            />
            <Input placeholder="HSN" value={row.hsnCode} onChange={value => updateRow(index, { hsnCode: value })} />
            <Input placeholder="Qty" type="number" value={row.qty} onChange={value => updateRow(index, { qty: value })} />
            <Input placeholder="Rate" type="number" value={row.rate} onChange={value => updateRow(index, { rate: value })} />
            <Input
              placeholder="Disc %"
              type="number"
              value={row.discountPercentage}
              onChange={value => updateRow(index, { discountPercentage: value })}
            />
            <span className="line-readonly">₹{row.discountAmount.toFixed(2)}</span>
            <span className="line-readonly">₹{row.taxableAmount.toFixed(2)}</span>
            <Input
              placeholder="CGST %"
              type="number"
              value={row.cgstRate}
              onChange={value => updateRow(index, { cgstRate: value })}
            />
            <span className="line-readonly">₹{row.cgstAmount.toFixed(2)}</span>
            <Input
              placeholder="SGST %"
              type="number"
              value={row.sgstRate}
              onChange={value => updateRow(index, { sgstRate: value })}
            />
            <span className="line-readonly">₹{row.sgstAmount.toFixed(2)}</span>
            <Input
              placeholder="IGST %"
              type="number"
              value={row.igstRate}
              onChange={value => updateRow(index, { igstRate: value })}
            />
            <span className="line-readonly">₹{row.igstAmount.toFixed(2)}</span>
            <span className="line-total">₹{row.lineTotal.toFixed(2)}</span>
            <Input
              placeholder="Ref SO"
              value={row.refSalesOrderNo}
              onChange={value => updateRow(index, { refSalesOrderNo: value })}
            />
            <Input
              placeholder="Ref JWOIN"
              value={row.refJwoinNo}
              onChange={value => updateRow(index, { refJwoinNo: value })}
            />
            <Input
              placeholder="Ref Challan"
              value={row.refChallanNo}
              onChange={value => updateRow(index, { refChallanNo: value })}
            />
            <button type="button" className="remove-button" onClick={() => removeRow(index)} disabled={rows.length <= 1}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="tax-invoice-line-items-add">
        <button type="button" className="add-row-button" onClick={addRow}>
          + Add Item
        </button>
      </div>
    </div>
  );
}

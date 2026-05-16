import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import './SalesOrder.css';

export interface SalesOrderLineItemRow {
  itemId: string;
  itemDetails: string;
  description: string;
  poLineNo: string;
  unitId: string;
  hsnCode: string;
  deliveryDate: string;
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
}

export const blankLineItem = (): SalesOrderLineItemRow => ({
  itemId: '',
  itemDetails: '',
  description: '',
  poLineNo: '',
  unitId: '',
  hsnCode: '',
  deliveryDate: '',
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
  lineTotal: 0
});

const round = (n: number) => Math.round(n * 100) / 100;

const calculateLineItem = (item: SalesOrderLineItemRow): SalesOrderLineItemRow => {
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

interface SalesOrderLineItemsProps {
  rows: SalesOrderLineItemRow[];
  items: any[];
  onChange: (rows: SalesOrderLineItemRow[]) => void;
}

export default function SalesOrderLineItems({ rows, items, onChange }: SalesOrderLineItemsProps) {
  const itemOptions = items.map(item => ({
    key: item.itemName || item.name || `Item ${item.id}`,
    value: item.id
  }));

  const updateRow = (index: number, patch: Partial<SalesOrderLineItemRow>) => {
    onChange(rows.map((row, i) => (i === index ? calculateLineItem({ ...row, ...patch }) : row)));
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find(item => String(item.id) === String(itemId));
    const gstHalf = selected?.gstSlab ? String(selected.gstSlab / 2) : '0';

    updateRow(index, {
      itemId,
      itemDetails: selected?.partDescription || selected?.customerItemCode || '',
      description: selected?.description || selected?.itemName || '',
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
    <div className="sales-order-line-items">
      <div className="sales-order-line-items-scroll">
        <div className="sales-order-line-items-header">
          <span>Item</span>
          <span>Item Details</span>
          <span>Description</span>
          <span>PO Line</span>
          <span>HSN</span>
          <span>Delivery</span>
          <span>Qty</span>
          <span>Rate</span>
          <span>Disc %</span>
          <span>Taxable</span>
          <span>CGST %</span>
          <span>SGST %</span>
          <span>IGST %</span>
          <span>Total</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div className="sales-order-line-items-row" key={index}>
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
              placeholder="PO line"
              value={row.poLineNo}
              onChange={value => updateRow(index, { poLineNo: value })}
            />
            <Input placeholder="HSN" value={row.hsnCode} onChange={value => updateRow(index, { hsnCode: value })} />
            <input
              type="date"
              className="input input-date"
              title="Delivery date"
              value={row.deliveryDate}
              onChange={e => updateRow(index, { deliveryDate: e.target.value })}
            />
            <Input placeholder="Qty" type="number" value={row.qty} onChange={value => updateRow(index, { qty: value })} />
            <Input placeholder="Rate" type="number" value={row.rate} onChange={value => updateRow(index, { rate: value })} />
            <Input
              placeholder="Disc %"
              type="number"
              value={row.discountPercentage}
              onChange={value => updateRow(index, { discountPercentage: value })}
            />
            <span className="line-readonly">₹{row.taxableAmount.toFixed(2)}</span>
            <Input
              placeholder="CGST %"
              type="number"
              value={row.cgstRate}
              onChange={value => updateRow(index, { cgstRate: value })}
            />
            <Input
              placeholder="SGST %"
              type="number"
              value={row.sgstRate}
              onChange={value => updateRow(index, { sgstRate: value })}
            />
            <Input
              placeholder="IGST %"
              type="number"
              value={row.igstRate}
              onChange={value => updateRow(index, { igstRate: value })}
            />
            <span className="line-total">₹{row.lineTotal.toFixed(2)}</span>
            <button type="button" className="remove-button" onClick={() => removeRow(index)} disabled={rows.length <= 1}>
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="sales-order-line-items-add">
        <button type="button" className="add-row-button" onClick={addRow}>
          + Add Item
        </button>
      </div>
    </div>
  );
}

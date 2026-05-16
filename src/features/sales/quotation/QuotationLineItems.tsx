import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import './Quotation.css';

export interface QuotationLineItemRow {
  itemId: string;
  description: string;
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
  lineTotal: number;
}

export const blankLineItem = (): QuotationLineItemRow => ({
  itemId: '',
  description: '',
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
  lineTotal: 0
});

const calculateLineItem = (item: QuotationLineItemRow): QuotationLineItemRow => {
  const qty = Number(item.qty) || 0;
  const rate = Number(item.rate) || 0;
  const discountPercentage = Number(item.discountPercentage) || 0;
  const cgstRate = Number(item.cgstRate) || 0;
  const sgstRate = Number(item.sgstRate) || 0;

  const baseAmount = qty * rate;
  const discountAmount = (baseAmount * discountPercentage) / 100;
  const taxableAmount = baseAmount - discountAmount;
  const cgstAmount = (taxableAmount * cgstRate) / 100;
  const sgstAmount = (taxableAmount * sgstRate) / 100;
  const lineTotal = taxableAmount + cgstAmount + sgstAmount;

  const round = (n: number) => Math.round(n * 100) / 100;

  return {
    ...item,
    discountAmount: round(discountAmount),
    taxableAmount: round(taxableAmount),
    cgstAmount: round(cgstAmount),
    sgstAmount: round(sgstAmount),
    lineTotal: round(lineTotal)
  };
};

interface QuotationLineItemsProps {
  rows: QuotationLineItemRow[];
  items: any[];
  onChange: (rows: QuotationLineItemRow[]) => void;
}

export default function QuotationLineItems({ rows, items, onChange }: QuotationLineItemsProps) {
  const itemOptions = items.map(item => ({
    key: item.itemName || item.name || `Item ${item.id}`,
    value: item.id
  }));

  const updateRow = (index: number, patch: Partial<QuotationLineItemRow>) => {
    const updated = rows.map((row, i) => {
      if (i !== index) return row;
      return calculateLineItem({ ...row, ...patch });
    });
    onChange(updated);
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find(item => String(item.id) === String(itemId));
    const gstHalf = selected?.gstSlab ? String(selected.gstSlab / 2) : '0';

    updateRow(index, {
      itemId,
      description: selected?.description || selected?.itemName || '',
      unitId: selected?.unitId ? String(selected.unitId) : '',
      rate: selected?.sellingRate != null ? String(selected.sellingRate) : '',
      hsnCode: selected?.hsnCode || '',
      cgstRate: gstHalf,
      sgstRate: gstHalf
    });
  };

  const addRow = () => onChange([...rows, blankLineItem()]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="quotation-line-items">
      <div className="quotation-line-items-header">
        <span>Item</span>
        <span>Description</span>
        <span>HSN</span>
        <span>Qty</span>
        <span>Rate</span>
        <span>Disc %</span>
        <span>CGST %</span>
        <span>SGST %</span>
        <span>Total</span>
        <span />
      </div>

      {rows.map((row, index) => (
        <div className="quotation-line-items-row" key={index}>
          <Select
            placeholder="Select item"
            value={row.itemId}
            options={itemOptions}
            onChange={(value) => handleItemSelect(index, String(value))}
          />
          <Input
            placeholder="Description"
            value={row.description}
            onChange={(value) => updateRow(index, { description: value })}
          />
          <Input placeholder="HSN" value={row.hsnCode} onChange={(value) => updateRow(index, { hsnCode: value })} />
          <Input
            placeholder="Qty"
            type="number"
            value={row.qty}
            onChange={(value) => updateRow(index, { qty: value })}
          />
          <Input
            placeholder="Rate"
            type="number"
            value={row.rate}
            onChange={(value) => updateRow(index, { rate: value })}
          />
          <Input
            placeholder="Disc %"
            type="number"
            value={row.discountPercentage}
            onChange={(value) => updateRow(index, { discountPercentage: value })}
          />
          <Input
            placeholder="CGST %"
            type="number"
            value={row.cgstRate}
            onChange={(value) => updateRow(index, { cgstRate: value })}
          />
          <Input
            placeholder="SGST %"
            type="number"
            value={row.sgstRate}
            onChange={(value) => updateRow(index, { sgstRate: value })}
          />
          <span className="line-total">₹{row.lineTotal.toFixed(2)}</span>
          <button type="button" className="remove-button" onClick={() => removeRow(index)} disabled={rows.length <= 1}>
            Remove
          </button>
        </div>
      ))}

      <div className="quotation-line-items-add">
        <button type="button" className="add-row-button" onClick={addRow}>
          Add Line Item
        </button>
      </div>
    </div>
  );
}

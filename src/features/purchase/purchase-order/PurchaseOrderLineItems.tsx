import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import './PurchaseOrder.css';

export interface PurchaseOrderLineItemRow {
  itemId: string;
  description: string;
  unitId: string;
  hsnCode: string;
  requiredBy: string;
  committedDate: string;
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

export const blankLineItem = (): PurchaseOrderLineItemRow => ({
  itemId: '',
  description: '',
  unitId: '',
  hsnCode: '',
  requiredBy: '',
  committedDate: '',
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

const calculateLineItem = (item: PurchaseOrderLineItemRow): PurchaseOrderLineItemRow => {
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

interface PurchaseOrderLineItemsProps {
  rows: PurchaseOrderLineItemRow[];
  items: any[];
  hsnList: any[];
  onChange: (rows: PurchaseOrderLineItemRow[]) => void;
}

export default function PurchaseOrderLineItems({
  rows,
  items,
  hsnList,
  onChange
}: PurchaseOrderLineItemsProps) {
  const itemOptions = items.map(item => ({
    key: item.itemName || `Item ${item.id}`,
    value: item.id
  }));

  const resolveHsnCode = (hsnId?: number | null) => {
    if (!hsnId) return '';
    const hsn = hsnList.find(h => h.id === hsnId);
    return hsn?.hsnCode ?? '';
  };

  const updateRow = (index: number, patch: Partial<PurchaseOrderLineItemRow>) => {
    onChange(rows.map((row, i) => (i === index ? calculateLineItem({ ...row, ...patch }) : row)));
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find(item => String(item.id) === String(itemId));
    const gstHalf = selected?.gstSlab ? String(selected.gstSlab / 2) : '0';

    updateRow(index, {
      itemId,
      description: selected?.description || selected?.itemName || '',
      unitId: selected?.unitId ? String(selected.unitId) : '',
      hsnCode: resolveHsnCode(selected?.hsnId) || selected?.hsnCode || '',
      rate: selected?.purchaseRate != null ? String(selected.purchaseRate) : '',
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
    <div className="po-line-items">
      <div className="po-line-items-scroll">
        <div className="po-line-items-header">
          <span>Item</span>
          <span>Description</span>
          <span>Unit</span>
          <span>HSN</span>
          <span>Require By</span>
          <span>Committed Dt</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Disc %</span>
          <span>Taxable</span>
          <span>CGST %</span>
          <span>SGST %</span>
          <span>IGST %</span>
          <span>Total</span>
          <span />
        </div>
        {rows.map((row, index) => (
          <div className="po-line-items-row" key={index}>
            <Select
              placeholder="Item"
              value={row.itemId}
              options={itemOptions}
              onChange={value => handleItemSelect(index, String(value))}
            />
            <Input
              placeholder="Description"
              value={row.description}
              onChange={value => updateRow(index, { description: value })}
            />
            <Input
              placeholder="Unit"
              value={row.unitId}
              onChange={value => updateRow(index, { unitId: value })}
            />
            <Input
              placeholder="HSN"
              value={row.hsnCode}
              onChange={value => updateRow(index, { hsnCode: value })}
            />
            <input
              type="date"
              className="input input-date"
              value={row.requiredBy}
              onChange={e => updateRow(index, { requiredBy: e.target.value })}
            />
            <input
              type="date"
              className="input input-date"
              value={row.committedDate}
              onChange={e => updateRow(index, { committedDate: e.target.value })}
            />
            <Input placeholder="Qty" value={row.qty} onChange={value => updateRow(index, { qty: value })} />
            <Input placeholder="Price" value={row.rate} onChange={value => updateRow(index, { rate: value })} />
            <Input
              placeholder="Disc %"
              value={row.discountPercentage}
              onChange={value => updateRow(index, { discountPercentage: value })}
            />
            <span className="po-line-readonly">{row.taxableAmount.toFixed(2)}</span>
            <Input
              placeholder="CGST %"
              value={row.cgstRate}
              onChange={value => updateRow(index, { cgstRate: value })}
            />
            <Input
              placeholder="SGST %"
              value={row.sgstRate}
              onChange={value => updateRow(index, { sgstRate: value })}
            />
            <Input
              placeholder="IGST %"
              value={row.igstRate}
              onChange={value => updateRow(index, { igstRate: value })}
            />
            <span className="po-line-readonly">{row.lineTotal.toFixed(2)}</span>
            <button
              type="button"
              className="remove-button"
              onClick={() => removeRow(index)}
              disabled={rows.length <= 1}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="add-row-button po-line-items-add" onClick={addRow}>
        + Add Item
      </button>
    </div>
  );
}

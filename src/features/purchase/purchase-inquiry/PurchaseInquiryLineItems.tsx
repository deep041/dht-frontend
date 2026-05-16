import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import '../purchase-indent/PurchaseIndent.css';
import './PurchaseInquiry.css';

export interface PurchaseInquiryLineItemRow {
  itemId: string;
  description: string;
  qty: string;
  unitId: string;
  hsnCode: string;
}

export const blankLineItem = (): PurchaseInquiryLineItemRow => ({
  itemId: '',
  description: '',
  qty: '',
  unitId: '',
  hsnCode: ''
});

interface PurchaseInquiryLineItemsProps {
  rows: PurchaseInquiryLineItemRow[];
  items: any[];
  onChange: (rows: PurchaseInquiryLineItemRow[]) => void;
  onItemSelect: (index: number, itemId: string) => void;
}

export default function PurchaseInquiryLineItems({
  rows,
  items,
  onChange,
  onItemSelect
}: PurchaseInquiryLineItemsProps) {
  const itemOptions = items.map(item => ({
    key: item.itemName || item.name || `Item ${item.id}`,
    value: item.id
  }));

  const updateRow = (index: number, patch: Partial<PurchaseInquiryLineItemRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const addRow = () => onChange([...rows, blankLineItem()]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="pi-line-items">
      <div className="pi-line-items-header pqi-line-items-header">
        <span>Item Code/Name</span>
        <span>Description</span>
        <span>Qty</span>
        <span>Unit</span>
        <span>HSN Code</span>
        <span />
      </div>

      {rows.map((row, index) => (
        <div className="pi-line-items-row pqi-line-items-row" key={index}>
          <Select
            placeholder="Select item"
            value={row.itemId}
            options={itemOptions}
            onChange={value => onItemSelect(index, String(value))}
          />
          <Input
            placeholder="Description"
            value={row.description}
            onChange={value => updateRow(index, { description: value })}
          />
          <Input
            placeholder="Qty"
            type="number"
            value={row.qty}
            onChange={value => updateRow(index, { qty: value })}
          />
          <Input
            placeholder="Unit"
            value={row.unitId}
            onChange={value => updateRow(index, { unitId: value })}
          />
          <Input
            placeholder="HSN Code"
            value={row.hsnCode}
            onChange={value => updateRow(index, { hsnCode: value })}
          />
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

      <div className="pi-line-items-add">
        <button type="button" className="add-row-button" onClick={addRow}>
          + Add Row
        </button>
      </div>
    </div>
  );
}

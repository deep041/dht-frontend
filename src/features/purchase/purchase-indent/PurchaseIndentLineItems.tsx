import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import './PurchaseIndent.css';

export interface PurchaseIndentLineItemRow {
  itemId: string;
  description: string;
  qty: string;
  unitId: string;
  requiredDate: string;
  suggestedVendorId: string;
  details: string;
}

export const blankLineItem = (): PurchaseIndentLineItemRow => ({
  itemId: '',
  description: '',
  qty: '',
  unitId: '',
  requiredDate: '',
  suggestedVendorId: '',
  details: ''
});

interface PurchaseIndentLineItemsProps {
  rows: PurchaseIndentLineItemRow[];
  items: any[];
  suppliers: any[];
  onChange: (rows: PurchaseIndentLineItemRow[]) => void;
}

export default function PurchaseIndentLineItems({
  rows,
  items,
  suppliers,
  onChange
}: PurchaseIndentLineItemsProps) {
  const itemOptions = items.map(item => ({
    key: item.itemName || item.name || `Item ${item.id}`,
    value: item.id
  }));

  const supplierOptions = suppliers.map(s => ({
    key: s.companyName || s.legalName || `Supplier ${s.id}`,
    value: s.id
  }));

  const updateRow = (index: number, patch: Partial<PurchaseIndentLineItemRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selected = items.find(item => String(item.id) === String(itemId));
    updateRow(index, {
      itemId,
      description: selected?.description || selected?.itemName || '',
      unitId: selected?.unitId ? String(selected.unitId) : ''
    });
  };

  const addRow = () => onChange([...rows, blankLineItem()]);

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="pi-line-items">
      <div className="pi-line-items-header">
        <span>Item Code/Name</span>
        <span>Description</span>
        <span>Qty</span>
        <span>Unit</span>
        <span>Require Date</span>
        <span>Suggested Vendor</span>
        <span>Details</span>
        <span />
      </div>

      {rows.map((row, index) => (
        <div className="pi-line-items-row" key={index}>
          <Select
            placeholder="Select item"
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
          <input
            type="date"
            className="input input-date"
            title="Require Date"
            value={row.requiredDate}
            onChange={e => updateRow(index, { requiredDate: e.target.value })}
          />
          <Select
            placeholder="Vendor"
            value={row.suggestedVendorId}
            options={supplierOptions}
            onChange={value => updateRow(index, { suggestedVendorId: String(value) })}
          />
          <Input
            placeholder="Details"
            value={row.details}
            onChange={value => updateRow(index, { details: value })}
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

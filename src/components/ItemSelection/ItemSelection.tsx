import Input from '../Input/Input';
import Select from '../Select/Select';
import './ItemSelection.css';

const blankRow = {
  itemId: '',
  description: '',
  unit: '',
  qty: ''
};

export default function ItemSelection({ rows, items, onChange }: { rows: any[]; items: any[]; onChange: (rows: any[]) => void }) {
  const itemOptions = items.map(item => {
    const label = item.itemCode
      ? `${item.itemCode} / ${item.itemName || item.name || item.item_name}`
      : item.itemName || item.name || item.item_name || `Item ${item.id}`;
    return { key: label, value: item.id };
  });

  const updateRow = (index: number, key: string, value: string) => {
    const updatedRows = rows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;

      if (key === 'itemId') {
        const selectedItem = items.find(item => String(item.id) === String(value));
        return {
          ...row,
          itemId: value,
          description: selectedItem?.description || selectedItem?.itemDescription || selectedItem?.desc || '',
          unit: selectedItem?.unitName || selectedItem?.unit_name || selectedItem?.unit || ''
        };
      }

      return {
        ...row,
        [key]: value
      };
    });

    onChange(updatedRows);
  };

  const addRow = () => {
    onChange([...rows, { ...blankRow }]);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className='item-selection-container'>
      {rows.map((row, index) => (
        <div className='item-selection-row' key={index}>
          <Select
            placeholder='Item Code / Name'
            value={row.itemId}
            options={itemOptions}
            onChange={(value) => updateRow(index, 'itemId', value)}
          />
          <Input placeholder='Description' value={row.description} disabled />
          <Input placeholder='Unit' value={row.unit} disabled />
          <Input placeholder='Qty' type='number' value={row.qty} onChange={(value) => updateRow(index, 'qty', value)} />
          <button type='button' className='remove-button' onClick={() => removeRow(index)}>
            Remove
          </button>
        </div>
      ))}
      <div className='item-selection-add-row'>
        <button type='button' className='add-row-button' onClick={addRow}>
          Add Item
        </button>
      </div>
    </div>
  );
}

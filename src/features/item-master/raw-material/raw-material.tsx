import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import {
  getRawMaterials,
  createRawMaterial
} from './raw-material.api';
import { getHSNList } from '../hsn/HSN.api';
import { set } from 'nprogress';

export default function RawMaterialPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [hsnList, setHsnList] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const shapes = [{ id: 1, name: 'Round' }, { id: 2, name: 'Square' }];
  const materials = [{ id: 1, name: 'Steel' }, { id: 2, name: 'Aluminium' }];
  const units = [{ id: 1, name: 'Kg' }, { id: 2, name: 'Meter' }];

  const [form, setForm] = useState({
    shapeId: '',
    materialId: '',
    itemName: '',
    description: '',
    grade: '',
    unitId: '',
    purchaseRate: '',
    sellingRate: '',
    hsnId: '',
    gstSlab: 0,
    scrapItemId: '',
    type: 'Inventory',
    allowedExcessQty: '',
    thickness: '',
    leadTimeDays: '',
    minStockQty: '',
    minOrderQty: '',
    valuationMethod: 'AVG',
    isDimensional: false,
    isScrap: false,
    allowNegativeStock: false,
    inspectionRequired: false
  });

  const tableConfig = [
    { title: 'Item Name', key: 'itemName' },
    { title: 'Material', key: 'materialName' },
    { title: 'Unit', key: 'unitName' },
    { title: 'Purchase Rate', key: 'purchaseRate' },
    { title: 'Selling Rate', key: 'sellingRate' }
  ];

  // 🔹 Fetch data
  const fetchAll = async () => {
    const [items, hsn] = await Promise.all([
      getRawMaterials(),
      getHSNList()
    ]);

    setRawMaterials(items.data);
    setTableData(items.data);
    setHsnList(hsn.data);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // 🔹 change handler
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  // 🔥 HSN → GST auto
  const handleHsnChange = (hsnId) => {
    const selected = hsnList.find(h => h.id === Number(hsnId));

    setForm(prev => ({
      ...prev,
      hsnId,
      gstSlab: selected?.gstSlab || 0
    }));
  };

  // 🔹 Save
  const handleSave = async () => {
    await createRawMaterial(form);
    await fetchAll();
    setShow(false);
  };

  return (
    <>
      {/* Header */}
      <div className='page-header-container'>
        <h2>Raw Materials</h2>
        <Button text='Add Raw Material' onClick={() => setShow(true)} />
      </div>

      {/* Table */}
      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg">

        <Modal.Header closeButton>
          <Modal.Title>Add Raw Material</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {/* BASIC */}
          <div className='form-controller'>
            <Select
              placeholder='Shape'
              options={shapes.map(s => ({ key: s.name, value: s.id }))}
              onChange={(v) => handleChange('shapeId', v)}
            />

            <Select
              placeholder='Material'
              options={materials.map(m => ({ key: m.name, value: m.id }))}
              onChange={(v) => handleChange('materialId', v)}
            />
          </div>

          <div className='form-controller'>
            <Input placeholder='Item Name' onChange={(v) => handleChange('itemName', v)} />
            <Input placeholder='Description' onChange={(v) => handleChange('description', v)} />
          </div>

          <div className='form-controller'>
            <Input placeholder='Grade' onChange={(v) => handleChange('grade', v)} />

            <Select
              placeholder='Unit'
              options={units.map(u => ({ key: u.name, value: u.id }))}
              onChange={(v) => handleChange('unitId', v)}
            />

            <Input placeholder='Purchase Rate' onChange={(v) => handleChange('purchaseRate', v)} />
            <Input placeholder='Selling Rate' onChange={(v) => handleChange('sellingRate', v)} />
          </div>

          {/* TAX */}
          <div className='form-controller'>
            <Select
              placeholder='HSN'
              options={hsnList.map(h => ({ key: h.hsnCode, value: h.id }))}
              onChange={handleHsnChange}
            />
            <Input value={form.gstSlab} disabled />
          </div>

          {/* OTHER */}
          <h5>Other Details</h5>

          <div className='form-controller'>
            <Select
              placeholder='Type'
              options={[
                { key: 'Inventory', value: 'Inventory' },
                { key: 'Service', value: 'Service' }
              ]}
              onChange={(v) => handleChange('type', v)}
            />

            <Select
              placeholder='Select Scrap Material'
              options={rawMaterials.map(r => ({
                key: r.itemName,
                value: r.id
              }))}
              onChange={(v) => handleChange('scrapItemId', v)}
            />

            <Input placeholder='Allowed Excess %' onChange={(v) => handleChange('allowedExcessQty', v)} />
            <Input placeholder='Thickness' onChange={(v) => handleChange('thickness', v)} />
            <Input placeholder='Lead Time' onChange={(v) => handleChange('leadTimeDays', v)} />
            <Input placeholder='Min Stock Qty' onChange={(v) => handleChange('minStockQty', v)} />
          </div>

          <div className='form-controller'>
            <Input placeholder='Min Order Qty' onChange={(v) => handleChange('minOrderQty', v)} />

            <Select
              placeholder='Valuation Method'
              options={[
                { key: 'AVG', value: 'AVG' },
                { key: 'FIFO', value: 'FIFO' }
              ]}
              onChange={(v) => handleChange('valuationMethod', v)}
            />
          </div>

          {/* FLAGS */}
          <div className='form-controller'>
            <label><input type='checkbox' onChange={(e) => handleChange('isDimensional', e.target.checked)} /> Dimensional</label>
            <label><input type='checkbox' onChange={(e) => handleChange('isScrap', e.target.checked)} /> Scrap</label>
            <label><input type='checkbox' onChange={(e) => handleChange('allowNegativeStock', e.target.checked)} /> Allow Negative</label>
            <label><input type='checkbox' onChange={(e) => handleChange('inspectionRequired', e.target.checked)} /> Inspection</label>
          </div>

        </Modal.Body>

        <Modal.Footer>
          <Button text='Save' onClick={handleSave} />
        </Modal.Footer>

      </Modal>
    </>
  );
}
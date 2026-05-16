import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';

import {
    getItems,
    createItem
} from './item.api';
import { getCategories, getClassifications, getGroups, getHsnList, getSubGroups } from '../../../services/common';

export default function ItemPage() {

    const [show, setShow] = useState(false);

    const [tableData, setTableData] = useState([]);

    const [classifications, setClassifications] = useState([]);
    const [categories, setCategories] = useState([]);
    const [groups, setGroups] = useState([]);
    const [subGroups, setSubGroups] = useState([]);

    const [hsnList, setHsnList] = useState([]);
    const units = [{ id: 1, name: 'Nos' }, { id: 2, name: 'Kg' }, { id: 3, name: 'Meter' }, { id: 4, name: 'Liter' }];

    const [items, setItems] = useState([]);

    const [form, setForm] = useState({
        classificationId: '',
        categoryId: '',
        groupId: '',
        subGroupId: '',

        itemName: '',
        description: '',
        grade: '',
        partDescription: '',

        unitId: '',

        purchaseRate: '',
        sellingRate: '',

        hsnId: '',
        gstSlab: '0',

        drawingNo: '',
        drawingRevision: '',
        customerItemCode: '',

        allowedExcessQty: '',

        thickness: '',
        length: '',
        width: '',

        netWeight: '',
        grossWeight: '',

        weightUomId: '',
        density: '',
        densityUomId: '',

        surfaceArea: '',
        surfaceAreaUomId: '',

        rawMaterialItemId: '',
        scrapItemId: '',

        leadTimeDays: '',
        minStockQty: '',
        minOrderQty: '',

        valuationMethod: 'AVG',

        allowNegativeStock: false,
        inspectionRequired: false,

        isDimensional: false,
        isScrap: false,

        itemType: 'Inventory'
    });

    const tableConfig = [
        { title: 'Item Name', key: 'itemName' },
        { title: 'Grade', key: 'grade' },
        { title: 'Purchase Rate', key: 'purchaseRate' },
        { title: 'Selling Rate', key: 'sellingRate' },
        { title: 'GST', key: 'gstSlab' }
    ];

    const fetchData = async () => {

        const [
            itemRes,
            classifications,
            categories,
            groups,
            hsnList
        ] = await Promise.all([
            getItems(),
            getClassifications(),
            getCategories(),
            getGroups(),
            getHsnList()
        ]);

        setTableData(itemRes.data);
        setItems(itemRes.data);
        setClassifications(classifications.data);
        setCategories(categories.data);
        setGroups(groups.data);
        setHsnList(hsnList.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getSubGroupsData = async (groupId: any) => {
      const subGroups = await getSubGroups(groupId);
      setSubGroups(subGroups.data);
    }

    useEffect(() => {
      if (form.groupId) {
        getSubGroupsData(form.groupId);
      }
    }, [form.groupId]);

    const handleChange = (key, value) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {

        await createItem(form);

        await fetchData();

        setShow(false);
    };

    return (
        <>
            {/* Header */}
            <div className='page-header-container'>
                <h2>Items</h2>

                <Button
                    text='Add Item'
                    onClick={() => setShow(true)}
                />
            </div>

            {/* Table */}
            <div className='page-container'>
                <Table
                    tableConfig={tableConfig}
                    tableData={tableData}
                />
            </div>

            {/* Modal */}
            <Modal
                show={show}
                onHide={() => setShow(false)}
                size='xl'
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Add Item
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>

                    {/* 🔹 Hierarchy */}
                    <div className='form-controller'>

                        <Select
                            placeholder='Classification'
                            onChange={(v) =>
                                handleChange('classificationId', v)
                            } 
                            options={classifications.map(c => ({ key: c.name, value: c.id }))}
                        />

                        <Select
                            placeholder='Category'
                            options={categories.map(c => ({ key: c.name, value: c.id }))}
                            onChange={(v) =>
                                handleChange('categoryId', v)
                            }
                        />

                        <Select
                            placeholder='Group'
                            options={groups.map(g => ({ key: g.name, value: g.id }))}
                            onChange={(v) =>
                                handleChange('groupId', v)
                            }
                        />

                        <Select
                            placeholder='Sub Group'
                            options={subGroups.map(s => ({ key: s.name, value: s.id }))}
                            onChange={(v) =>
                                handleChange('subGroupId', v)
                            }
                        />
                    </div>

                    {/* 🔹 Basic */}
                    <div className='form-controller'>

                        <Input
                            placeholder='Item Name'
                            onChange={(v) =>
                                handleChange('itemName', v)
                            }
                        />

                        <Input
                            placeholder='Description'
                            onChange={(v) =>
                                handleChange('description', v)
                            }
                        />
                    </div>

                    <div className='form-controller'>

                        <Input
                            placeholder='Grade'
                            onChange={(v) =>
                                handleChange('grade', v)
                            }
                        />

                        <Input
                            placeholder='Part Description'
                            onChange={(v) =>
                                handleChange('partDescription', v)
                            }
                        />

                        <Select
                            placeholder='Unit'
                            options={units.map(u => ({ key: u.name, value: u.id }))}
                            onChange={(v) =>
                                handleChange('unitId', v)
                            }
                        />

                        <Input
                            placeholder='Purchase Rate'
                            onChange={(v) =>
                                handleChange('purchaseRate', v)
                            }
                        />

                        <Input
                            placeholder='Selling Rate'
                            onChange={(v) =>
                                handleChange('sellingRate', v)
                            }
                        />
                    </div>

                    {/* 🔹 GST */}
                    <div className='form-controller'>

                        <Select
                            placeholder='HSN'
                            options={hsnList.map(h => ({ key: h.name, value: h.id }))}
                            onChange={(v) => {
                                handleChange('hsnId', v);
                                const selectedHsn = hsnList.find(h => h.id === v);
                                handleChange('gstSlab', selectedHsn ? selectedHsn.gstSlab : '0');
                            }}
                        />

                        <Input
                            placeholder='GST Slab %'
                            value={form.gstSlab}
                            disabled
                        />
                    </div>

                    {/* 🔹 Other */}
                    <h5>Other Details</h5>

                    <div className='form-controller'>

                        <Select
                            placeholder='Item Type'
                            options={[
                                {
                                    key: 'Inventory',
                                    value: 'Inventory'
                                },
                                {
                                    key: 'Service',
                                    value: 'Service'
                                }
                            ]}
                            onChange={(v) =>
                                handleChange('itemType', v)
                            }
                        />

                        <Input
                            placeholder='Drawing No'
                            onChange={(v) =>
                                handleChange('drawingNo', v)
                            }
                        />

                        <Input
                            placeholder='Drawing Revision'
                            onChange={(v) =>
                                handleChange('drawingRevision', v)
                            }
                        />

                        <Input
                            placeholder='Customer Item Code'
                            onChange={(v) =>
                                handleChange('customerItemCode', v)
                            }
                        />

                        <Input
                            placeholder='Allowed Excess Qty'
                            onChange={(v) =>
                                handleChange('allowedExcessQty', v)
                            }
                        />
                    </div>

                    <div className='form-controller'>

                        <Input
                            placeholder='Thickness'
                            onChange={(v) =>
                                handleChange('thickness', v)
                            }
                        />

                        <Input
                            placeholder='Length'
                            onChange={(v) =>
                                handleChange('length', v)
                            }
                        />

                        <Input
                            placeholder='Width'
                            onChange={(v) =>
                                handleChange('width', v)
                            }
                        />

                        <Input
                            placeholder='Net Weight'
                            onChange={(v) =>
                                handleChange('netWeight', v)
                            }
                        />

                        <Input
                            placeholder='Gross Weight'
                            onChange={(v) =>
                                handleChange('grossWeight', v)
                            }
                        />
                    </div>

                    <div className='form-controller'>

                        <Select
                            placeholder='Raw Material'
                            options={items.map(r => ({ key: r.name, value: r.id }))}
                            onChange={(v) =>
                                handleChange('rawMaterialItemId', v)
                            }
                        />

                        <Select
                            placeholder='Scrap Item'
                            options={items.map(s => ({ key: s.name, value: s.id }))}
                            onChange={(v) =>
                                handleChange('scrapItemId', v)
                            }
                        />

                        <Input
                            placeholder='Lead Time Days'
                            onChange={(v) =>
                                handleChange('leadTimeDays', v)
                            }
                        />

                        <Input
                            placeholder='Min Stock Qty'
                            onChange={(v) =>
                                handleChange('minStockQty', v)
                            }
                        />

                        <Input
                            placeholder='Min Order Qty'
                            onChange={(v) =>
                                handleChange('minOrderQty', v)
                            }
                        />
                    </div>

                    <div className='form-controller'>

                        <Select
                            placeholder='Valuation Method'
                            options={[
                                {
                                    key: 'AVG',
                                    value: 'AVG'
                                },
                                {
                                    key: 'FIFO',
                                    value: 'FIFO'
                                }
                            ]}
                            onChange={(v) =>
                                handleChange('valuationMethod', v)
                            }
                        />
                    </div>

                    {/* 🔹 Flags */}
                    <div className='form-controller'>

                        <label>
                            <input
                                type='checkbox'
                                onChange={(e) =>
                                    handleChange(
                                        'allowNegativeStock',
                                        e.target.checked
                                    )
                                }
                            />
                            Allow Negative Stock
                        </label>

                        <label>
                            <input
                                type='checkbox'
                                onChange={(e) =>
                                    handleChange(
                                        'inspectionRequired',
                                        e.target.checked
                                    )
                                }
                            />
                            Inspection Required
                        </label>

                        <label>
                            <input
                                type='checkbox'
                                onChange={(e) =>
                                    handleChange(
                                        'isDimensional',
                                        e.target.checked
                                    )
                                }
                            />
                            Is Dimensional
                        </label>

                        <label>
                            <input
                                type='checkbox'
                                onChange={(e) =>
                                    handleChange(
                                        'isScrap',
                                        e.target.checked
                                    )
                                }
                            />
                            Is Scrap
                        </label>
                    </div>

                </Modal.Body>

                <Modal.Footer>
                    <Button
                        text='Save'
                        onClick={handleSave}
                    />
                </Modal.Footer>

            </Modal>
        </>
    );
}
import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import {
  getGroups,
  createGroup
} from './group.api';
import { getCategories } from '../category/category.api';

export default function GroupPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [categories, setCategories] = useState([]);

  // 🔹 Form state
  const [isUsed, setIsUsed] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // 🔹 Table config
  const tableConfig = [
    { title: 'Used In Item Name', key: 'isUsedInItemName' },
    { title: 'Group Name', key: 'name' },
    { title: 'Short Name', key: 'shortName' },
    { title: 'Category', key: 'categoryName' }
  ];

  // 🔹 Fetch data
  const fetchData = async () => {
    const res = await getGroups();

    const formatted = res.data.map(item => ({
      ...item,
      categoryName: item.category?.name || '',
      isUsedInItemName: item.isUsedInItemName ? 'Yes' : 'No'
    }));

    setTableData(formatted);
  };

  const fetchCategories = async () => {
    const res = await getCategories();
    setCategories(res.data);
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  // 🔹 Save
  const handleSave = async () => {
    if (!name || !shortName || !categoryId) {
      alert('All fields are required');
      return;
    }

    const payload = {
      isUsedInItemName: isUsed,
      name,
      shortName,
      categoryId
    };

    await createGroup(payload);

    await fetchData();

    // reset
    setIsUsed(false);
    setName('');
    setShortName('');
    setCategoryId('');

    setShow(false);
  };

  return (
    <>
      {/* Header */}
      <div className='page-header-container'>
        <h2>Group</h2>
        <Button text='Add Group' onClick={() => setShow(true)} />
      </div>

      {/* Table */}
      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Group</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {/* Checkbox */}
          <div className='form-controller'>
            <label>
              <input
                type="checkbox"
                checked={isUsed}
                onChange={(e) => setIsUsed(e.target.checked)}
              />
              {' '}Is Used In Item Name
            </label>
          </div>

          {/* Inputs */}
          <div className='form-controller'>
            <Input
              placeholder='Group Name'
              value={name}
              onChange={setName}
            />

            <Input
              placeholder='Group Short Name'
              value={shortName}
              onChange={setShortName}
            />
          </div>

          {/* Category Dropdown */}
          <div className='form-controller'>
            <Select
              placeholder='Category'
              options={categories.map(c => ({
                key: c.name,
                value: c.id
              }))}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>

        </Modal.Body>

        <Modal.Footer>
          <Button text='Save' onClick={handleSave} />
        </Modal.Footer>
      </Modal>
    </>
  );
}
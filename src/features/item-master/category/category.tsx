import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import {
  getCategories,
  createCategory
} from './category.api';
import { getClassifications } from '../classification/classification.api';

export default function CategoryPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [classifications, setClassifications] = useState([]);

  // 🔹 Form state
  const [isUsed, setIsUsed] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [classificationId, setClassificationId] = useState('');

  // 🔹 Table config
  const tableConfig = [
    { title: 'Used In Item Name', key: 'isUsedInItemName' },
    { title: 'Category Name', key: 'name' },
    { title: 'Short Name', key: 'shortName' },
    { title: 'Classification', key: 'classificationName' }
  ];

  // 🔹 Fetch data
  const fetchData = async () => {
    const res = await getCategories();

    const formatted = res.data.map(item => ({
      ...item,
      classificationName: item.classification?.name || '',
      isUsedInItemName: item.isUsedInItemName ? 'Yes' : 'No'
    }));

    setTableData(formatted);
  };

  const fetchClassifications = async () => {
    const res = await getClassifications();
    setClassifications(res.data);
  };

  useEffect(() => {
    fetchData();
    fetchClassifications();
  }, []);

  // 🔹 Save
  const handleSave = async () => {
    if (!name || !shortName || !classificationId) {
      alert('All fields are required');
      return;
    }

    const payload = {
      isUsedInItemName: isUsed,
      name,
      shortName,
      classificationId
    };

    await createCategory(payload);

    await fetchData();

    // reset
    setIsUsed(false);
    setName('');
    setShortName('');
    setClassificationId('');

    setShow(false);
  };

  return (
    <>
      {/* Header */}
      <div className='page-header-container'>
        <h2>Category</h2>
        <Button text='Add Category' onClick={() => setShow(true)} />
      </div>

      {/* Table */}
      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
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
              placeholder='Category Name'
              value={name}
              onChange={setName}
            />

            <Input
              placeholder='Category Short Name'
              value={shortName}
              onChange={setShortName}
            />
          </div>

          {/* Classification Dropdown */}
          <div className='form-controller'>
            <Select
              placeholder='Classification'
              options={classifications.map(c => ({
                key: c.name,
                value: c.id
              }))}
              value={classificationId}
              onChange={setClassificationId}
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
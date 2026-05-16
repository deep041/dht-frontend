import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import {
  getClassifications,
  createClassification
} from './classification.api';

export default function ClassificationPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);

  // 🔹 Form state
  const [isUsed, setIsUsed] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [accountId, setAccountId] = useState('');

  // 🔹 Table config
  const tableConfig = [
    { title: 'Name', key: 'name' },
    { title: 'Short Name', key: 'shortName' },
    { title: 'Account', key: 'accountName' }
  ];

  // 🔹 Fetch data
  const fetchData = async () => {
    const res = await getClassifications();

    // flatten account name for table
    const formatted = res.data.map(item => ({
      ...item,
      accountName: item.account?.name || ''
    }));

    setTableData(formatted);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Save
  const handleSave = async () => {
    if (!name || !shortName || !accountId) {
      alert('All fields are required');
      return;
    }

    const payload = {
      isUsedInItemName: isUsed,
      name,
      shortName,
      accountId
    };

    await createClassification(payload);

    await fetchData();

    // reset form
    setIsUsed(false);
    setName('');
    setShortName('');
    setAccountId('');

    setShow(false);
  };

  return (
    <>
      {/* Header */}
      <div className='page-header-container'>
        <h2>Classification</h2>
        <Button text='Add Classification' onClick={() => setShow(true)} />
      </div>

      {/* Table */}
      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Classification</Modal.Title>
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

          {/* Name Fields */}
          <div className='form-controller'>
            <Input
              placeholder='Classification Name'
              value={name}
              onChange={setName}
            />

            <Input
              placeholder='Short Name'
              value={shortName}
              onChange={setShortName}
            />
          </div>

          {/* Account Dropdown */}
          <div className='form-controller'>
            <Input
              placeholder='Account ID'
              value={accountId}
              onChange={setAccountId}
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
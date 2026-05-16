import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import {
  getSubGroups,
  createSubGroup
} from './sub-group.api';
import { getGroups } from '../group/group.api';

export default function SubGroupPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [groups, setGroups] = useState([]);

  // 🔹 Form state
  const [isUsed, setIsUsed] = useState(false);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [groupId, setGroupId] = useState('');

  // 🔹 Table config
  const tableConfig = [
    { title: 'Used In Item Name', key: 'isUsedInItemName' },
    { title: 'Sub Group Name', key: 'name' },
    { title: 'Short Name', key: 'shortName' },
    { title: 'Group', key: 'groupName' }
  ];

  // 🔹 Fetch
  const fetchData = async () => {
    const res = await getSubGroups();

    const formatted = res.data.map(item => ({
      ...item,
      groupName: item.group?.name || '',
      isUsedInItemName: item.isUsedInItemName ? 'Yes' : 'No'
    }));

    setTableData(formatted);
  };

  const fetchGroups = async () => {
    const res = await getGroups();
    setGroups(res.data);
  };

  useEffect(() => {
    fetchData();
    fetchGroups();
  }, []);

  // 🔹 Save
  const handleSave = async () => {
    if (!name || !shortName || !groupId) {
      alert('All fields are required');
      return;
    }

    const payload = {
      isUsedInItemName: isUsed,
      name,
      shortName,
      groupId
    };

    await createSubGroup(payload);

    await fetchData();

    // reset
    setIsUsed(false);
    setName('');
    setShortName('');
    setGroupId('');

    setShow(false);
  };

  return (
    <>
      {/* Header */}
      <div className='page-header-container'>
        <h2>Sub Group</h2>
        <Button text='Add Sub Group' onClick={() => setShow(true)} />
      </div>

      {/* Table */}
      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Sub Group</Modal.Title>
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
              placeholder='Sub Group Name'
              value={name}
              onChange={setName}
            />

            <Input
              placeholder='Sub Group Short Name'
              value={shortName}
              onChange={setShortName}
            />
          </div>

          {/* Group Dropdown */}
          <div className='form-controller'>
            <Select
              placeholder='Group'
              options={groups.map(g => ({
                key: g.name,
                value: g.id
              }))}
              value={groupId}
              onChange={setGroupId}
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
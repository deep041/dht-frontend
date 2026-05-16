import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import { getHSNList, createHSN } from './HSN.api';

export default function HSNPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [hsnCode, setHsnCode] = useState('');
  const [gstSlab, setGstSlab] = useState('');
  const [description, setDescription] = useState('');

  const gstOptions = [
    { key: '0%', value: 0 },
    { key: '5%', value: 5 },
    { key: '12%', value: 12 },
    { key: '18%', value: 18 },
    { key: '28%', value: 28 }
  ];

  const tableConfig = [
    { title: 'HSN Code', key: 'hsnCode' },
    { title: 'GST Slab', key: 'gstSlab' },
    { title: 'Description', key: 'description' }
  ];

  const fetchData = async () => {
    const res = await getHSNList();
    setTableData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    const payload = {
      hsnCode,
      gstSlab,
      description
    };

    await createHSN(payload);
    await fetchData();

    // reset
    setHsnCode('');
    setGstSlab('');
    setDescription('');
    setShow(false);
  };

  return (
    <>
      <div className='page-header-container'>
        <h2>HSN Master</h2>
        <Button text='Add HSN' onClick={() => setShow(true)} />
      </div>

      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add HSN</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          <div className='form-controller'>
            <Input
              placeholder='HSN Code'
              value={hsnCode}
              onChange={setHsnCode}
            />

            <Select
              placeholder='GST Slab'
              options={gstOptions}
              onChange={(value) => setGstSlab(value)}
            />
          </div>

          <div className='form-controller'>
            <Input
              placeholder='HSN Description'
              value={description}
              onChange={setDescription}
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
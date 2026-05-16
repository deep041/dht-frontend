import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './Suppliers.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import { getSuppliers, createSupplier } from './Suppliers.api';
import { getCountries, getStates } from '../../../services/common';

export default function SuppliersPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  // 🔹 Main form
  const [form, setForm] = useState({
    companyName: '',
    legalName: '',
    vendorCode: '',
    gstNo: '',
    panNo: '',
    contactNo: '',
    email: '',
    website: '',
    addressLine1: '',
    place: '',
    pinCode: '',
    stateId: '',
    stateCode: '',
    countryId: '',
    partyGroupId: '',
    creditPeriodDays: '',
    creditLimit: '',
    paymentTermId: '',
    note: '',
    openingAmount: ''
  });

  const [typeOfConcern, setTypeOfConcern] = useState('PROPRIETORY');
  const [gstType, setGstType] = useState('REGULAR');
  const [balanceType, setBalanceType] = useState('CREDIT');

  const [contacts, setContacts] = useState([
    { name: '', mobileNo: '', email: '', designation: '' }
  ]);

  const [banks, setBanks] = useState([
    { bankName: '', accountNo: '', accountType: 'CURRENT', ifscCode: '' }
  ]);

  const tableConfig = [
    { title: 'Company Name', key: 'companyName' },
    { title: 'GST No', key: 'gstNo' },
    { title: 'Contact', key: 'contactNo' },
    { title: 'Email', key: 'email' }
  ];

  // 🔹 Fetch data
  const getSupplierList = async () => {
    const res = await getSuppliers();
    setTableData(res.data);
  };

  const fetchCountries = async () => {
    const res = await getCountries();
    setCountries(res.data);
  };

  const fetchStates = async (countryID) => {
    const res = await getStates(countryID);
    setStates(res.data);
  };

  useEffect(() => {
    getSupplierList();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (form.countryId) {
      fetchStates(form.countryId);
    }
  }, [form.countryId]);

  // 🔹 Handlers
  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleStateChange = (stateId) => {
    const selected = states.find(s => s.id === Number(stateId));

    setForm(prev => ({
      ...prev,
      stateId,
      stateCode: selected?.code || ''
    }));
  };

  // 🔥 Dynamic rows
  const addContact = () => {
    setContacts([...contacts, { name: '', mobileNo: '', email: '', designation: '' }]);
  };

  const addBank = () => {
    setBanks([...banks, { bankName: '', accountNo: '', accountType: 'CURRENT', ifscCode: '' }]);
  };

  // 🔹 Save
  const saveSupplier = async () => {
    const payload = {
      ...form,
      typeOfConcern,
      gstRegistrationType: gstType,
      balanceType,

      partyGroupId: Number(form.partyGroupId),
      countryId: Number(form.countryId),
      stateId: Number(form.stateId),
      paymentTermId: Number(form.paymentTermId),

      creditPeriodDays: Number(form.creditPeriodDays),
      creditLimit: Number(form.creditLimit),
      openingAmount: Number(form.openingAmount),

      contactPersons: contacts,
      bankAccounts: banks
    };

    await createSupplier(payload);
    await getSupplierList();
    setShow(false);
  };

  return (
    <>
      <div className='page-header-container'>
        <h2>Suppliers</h2>
        <Button text='Add Supplier' onClick={() => setShow(true)} />
      </div>

      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      {/* 🔥 Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add Supplier</Modal.Title>
        </Modal.Header>

        <Modal.Body>

          {/* Basic */}
          <h5>Basic Details</h5>
          <div className='form-controller'>
            <Input placeholder='Company Name' onChange={(v) => handleChange('companyName', v)} />
            <Input placeholder='Legal Name' onChange={(v) => handleChange('legalName', v)} />
            <Input placeholder='Vendor Code' onChange={(v) => handleChange('vendorCode', v)} />
          </div>

          <div className='form-controller'>
            <Input placeholder='GST No' onChange={(v) => handleChange('gstNo', v)} />
            <Input placeholder='PAN No' onChange={(v) => handleChange('panNo', v)} />
          </div>

          <div className='form-controller'>
            <Select
              placeholder='Type Of Concern'
              options={[
                { key: 'Proprietory', value: 'PROPRIETORY' },
                { key: 'Partnership', value: 'PARTNERSHIP' },
                { key: 'Pvt Ltd', value: 'PVT_LTD' },
                { key: 'Ltd', value: 'LTD' }
              ]}
              onChange={(value) => setTypeOfConcern(value)}
            />

            <Select
              placeholder='GST Type'
              options={[
                { key: 'Regular', value: 'REGULAR' },
                { key: 'Unregistered', value: 'UNREGISTERED' },
                { key: 'Composition', value: 'COMPOSITION' },
                { key: 'Consumer', value: 'CONSUMER' }
              ]}
              onChange={(value) => setGstType(value)}
            />
          </div>

          {/* Contact */}
          <h5>Contact</h5>
          <div className='form-controller'>
            <Input placeholder='Contact No' onChange={(v) => handleChange('contactNo', v)} />
            <Input placeholder='Email' onChange={(v) => handleChange('email', v)} />
            <Input placeholder='Website' onChange={(v) => handleChange('website', v)} />
          </div>

          {/* Address */}
          <h5>Address</h5>
          <div className='form-controller'>
            <Input placeholder='Address Line 1' onChange={(v) => handleChange('addressLine1', v)} />
            <Input placeholder='Place' onChange={(v) => handleChange('place', v)} />
            <Input placeholder='PIN Code' onChange={(v) => handleChange('pinCode', v)} />
          </div>

          <div className='form-controller'>
            <Select placeholder='Country ID' options={countries.map(s => ({ key: s.name, value: s.id }))} onChange={(v) => handleChange('countryId', v)} />

            <Select
              placeholder='State'
              options={states.map(s => ({ key: s.name, value: s.id }))}
              onChange={handleStateChange}
            />

            <Input
              placeholder='State Code'
              value={form.stateCode}
              disabled
            />
          </div>

          <div className='form-controller'>
            <Input placeholder='Party Group ID' onChange={(v) => handleChange('partyGroupId', v)} />
          </div>

          {/* Credit */}
          <h5>Credit Details</h5>
          <div className='form-controller'>
            <Input placeholder='Credit Period (Days)' onChange={(v) => handleChange('creditPeriodDays', v)} />
            <Input placeholder='Credit Limit' onChange={(v) => handleChange('creditLimit', v)} />
          </div>

          <div className='form-controller'>
            <Input placeholder='Payment Term ID' onChange={(v) => handleChange('paymentTermId', v)} />
          </div>

          {/* Contacts */}
          <h5>Contact Persons</h5>
          {contacts.map((c, i) => (
            <div className='form-controller' key={i}>
              <Input placeholder='Name' onChange={(v) => {
                const arr = [...contacts];
                arr[i].name = v;
                setContacts(arr);
              }} />
              <Input placeholder='Mobile' onChange={(v) => {
                const arr = [...contacts];
                arr[i].mobileNo = v;
                setContacts(arr);
              }} />
            </div>
          ))}
          <Button text='Add Contact' onClick={addContact} />

          {/* Banks */}
          <h5>Bank Accounts</h5>
          {banks.map((b, i) => (
            <div className='form-controller' key={i}>
              <Input placeholder='Bank Name' onChange={(v) => {
                const arr = [...banks];
                arr[i].bankName = v;
                setBanks(arr);
              }} />
              <Input placeholder='Account No' onChange={(v) => {
                const arr = [...banks];
                arr[i].accountNo = v;
                setBanks(arr);
              }} />
              <Input placeholder='IFSC Code' onChange={(v) => {
                const arr = [...banks];
                arr[i].ifscCode = v;
                setBanks(arr);
              }} />
            </div>
          ))}
          <Button text='Add Bank' onClick={addBank} />

          {/* Opening */}
          <h5>Opening Balance</h5>
          <div className='form-controller'>
            <Input placeholder='Opening Amount' onChange={(v) => handleChange('openingAmount', v)} />
            <Select
              placeholder='Cr/Dr'
              options={[
                { key: 'Credit', value: 'CREDIT' },
                { key: 'Debit', value: 'DEBIT' }
              ]}
              onChange={(value) => setBalanceType(value)}
            />
          </div>

        </Modal.Body>

        <Modal.Footer>
          <Button text='Save' onClick={saveSupplier} />
        </Modal.Footer>
      </Modal>
    </>
  );
}
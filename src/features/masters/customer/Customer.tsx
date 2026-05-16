import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import { getCustomers, createCustomer } from './Customer.api';
import { getCountries, getStates } from '../../../services/common';

export default function CustomerPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  // 🔹 Form
  const [form, setForm] = useState({
    basic: {
      supplyType: '',
      partyGroupId: '',
      companyName: '',
      legalName: '',
      panNo: '',
      contactNo: '',
      email: ''
    },
    billing: {
      attentionName: '',
      gstNo: '',
      addressLine: '',
      place: '',
      pinCode: '',
      stateId: '',
      stateCode: '',
      countryId: ''
    },
    shipping: {
      sameAsBilling: false,
      attentionName: '',
      gstNo: '',
      addressLine: '',
      place: '',
      pinCode: '',
      stateId: '',
      stateCode: '',
      countryId: ''
    },
    finance: {
      vendorCode: '',
      creditPeriodDays: '',
      creditLimit: '',
      paymentTermId: '',
      note: ''
    }
  });

  const [contacts, setContacts] = useState([
    { name: '', mobileNo: '', email: '', designation: '' }
  ]);

  const tableConfig = [
    { title: 'Company Name', key: 'companyName' },
    { title: 'Contact', key: 'contactNo' },
    { title: 'Email', key: 'email' }
  ];

  // 🔹 Fetch
  const fetchData = async () => {
    const res = await getCustomers();
    setTableData(res.data);
  };

  const fetchCountries = async () => {
    const res = await getCountries();
    setCountries(res.data);
  }

  const fetchStates = async (countryID) => {
    const res = await getStates(countryID);
    setStates(res.data);
  };

  useEffect(() => {
    fetchData();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (form.billing.countryId) {
      fetchStates(form.billing.countryId);
    }
  }, [form.billing.countryId]);

  // 🔹 Handlers
  const handleChange = (section, key, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleStateChange = (type, stateId) => {
    const selected = states.find(s => s.id === Number(stateId));

    setForm(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        stateId,
        stateCode: selected?.code || ''
      }
    }));
  };

  const handleSameAsBilling = (checked) => {
    setForm(prev => ({
      ...prev,
      shipping: checked
        ? { ...prev.billing, sameAsBilling: true }
        : { ...prev.shipping, sameAsBilling: false }
    }));
  };

  // 🔥 Contacts
  const addContact = () => {
    setContacts([...contacts, { name: '', mobileNo: '', email: '', designation: '' }]);
  };

  const updateContact = (i, key, value) => {
    const arr = [...contacts];
    arr[i][key] = value;
    setContacts(arr);
  };

  const deleteContact = (i) => {
    setContacts(contacts.filter((_, index) => index !== i));
  };

  // 🔹 Save
  const handleSave = async () => {
    const payload = {
      ...form,
      contactPersons: contacts
    };

    await createCustomer(payload);
    await fetchData();
    setShow(false);
  };

  return (
    <>
      {/* Header */}
      <div className='page-header-container'>
        <h2>Customers</h2>
        <Button text='Add Customer' onClick={() => setShow(true)} />
      </div>

      {/* Table */}
      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      {/* Modal */}
      <Modal show={show} onHide={() => setShow(false)} size="xl">

        <Modal.Header closeButton>
          <Modal.Title>Add Customer</Modal.Title>
        </Modal.Header>

        <Modal.Body>

            {/* 🔹 BASIC */}
            <h5>Basic Details</h5>
            <div className='form-controller'>
                <Select
                placeholder='Supply Type'
                options={[
                    { key: 'B2B', value: 'B2B' },
                    { key: 'B2C', value: 'B2C' }
                ]}
                onChange={(v) => handleChange('basic', 'supplyType', v)}
                />

                <Input placeholder='Party Group ID' onChange={(v) => handleChange('basic', 'partyGroupId', v)} />
                <Input placeholder='Company Name' onChange={(v) => handleChange('basic', 'companyName', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Legal Name' onChange={(v) => handleChange('basic', 'legalName', v)} />
                <Input placeholder='PAN No' onChange={(v) => handleChange('basic', 'panNo', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Contact No' onChange={(v) => handleChange('basic', 'contactNo', v)} />
                <Input placeholder='Email' onChange={(v) => handleChange('basic', 'email', v)} />
            </div>

            {/* 🔹 BILLING */}
            <h5>Billing Address</h5>
            <div className='form-controller'>
                <Input placeholder='Attention Name' onChange={(v) => handleChange('billing', 'attentionName', v)} />
                <Input placeholder='GST No' onChange={(v) => handleChange('billing', 'gstNo', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Address Line' onChange={(v) => handleChange('billing', 'addressLine', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Place' onChange={(v) => handleChange('billing', 'place', v)} />
                <Input placeholder='PIN Code' onChange={(v) => handleChange('billing', 'pinCode', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Country ID' onChange={(v) => handleChange('billing', 'countryId', v)} />

                <Select
                placeholder='State'
                options={states.map(s => ({ key: s.name, value: s.id }))}
                onChange={(v) => handleStateChange('billing', v)}
                />

                <Input value={form.billing.stateCode} disabled placeholder='State Code' />
            </div>

            {/* 🔹 SHIPPING */}
            <h5>Shipping Address</h5>

            <label>
                <input
                type="checkbox"
                checked={form.shipping.sameAsBilling}
                onChange={(e) => handleSameAsBilling(e.target.checked)}
                />
                Same as Billing
            </label>

            <div className='form-controller'>
                <Input placeholder='Attention Name' onChange={(v) => handleChange('shipping', 'attentionName', v)} />
                <Input placeholder='GST No' onChange={(v) => handleChange('shipping', 'gstNo', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Address Line' onChange={(v) => handleChange('shipping', 'addressLine', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Place' onChange={(v) => handleChange('shipping', 'place', v)} />
                <Input placeholder='PIN Code' onChange={(v) => handleChange('shipping', 'pinCode', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Country ID' onChange={(v) => handleChange('shipping', 'countryId', v)} />

                <Select
                placeholder='State'
                options={states.map(s => ({ key: s.name, value: s.id }))}
                onChange={(v) => handleStateChange('shipping', v)}
                />

                <Input value={form.shipping.stateCode} disabled placeholder='State Code' />
            </div>

            {/* 🔹 FINANCE */}
            <h5>Finance</h5>
            <div className='form-controller'>
                <Input placeholder='Vendor Code' onChange={(v) => handleChange('finance', 'vendorCode', v)} />
                <Input placeholder='Credit Period (Days)' onChange={(v) => handleChange('finance', 'creditPeriodDays', v)} />
                <Input placeholder='Credit Limit' onChange={(v) => handleChange('finance', 'creditLimit', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Payment Term ID' onChange={(v) => handleChange('finance', 'paymentTermId', v)} />
            </div>

            <div className='form-controller'>
                <Input placeholder='Note / Service Offered' onChange={(v) => handleChange('finance', 'note', v)} />
            </div>

            {/* 🔥 CONTACT PERSONS */}
            <h5>Contact Persons</h5>
            {contacts.map((c, i) => (
                <div className='form-controller' key={i}>
                <Input placeholder='Name' onChange={(v) => updateContact(i, 'name', v)} />
                <Input placeholder='Mobile' onChange={(v) => updateContact(i, 'mobileNo', v)} />
                <Input placeholder='Email' onChange={(v) => updateContact(i, 'email', v)} />
                <Input placeholder='Designation' onChange={(v) => updateContact(i, 'designation', v)} />
                <Button text='Delete' onClick={() => deleteContact(i)} />
                </div>
            ))}
            <Button text='Add Contact' onClick={addContact} />

            </Modal.Body>

        <Modal.Footer>
          <Button text='Save' onClick={handleSave} />
        </Modal.Footer>

      </Modal>
    </>
  );
}
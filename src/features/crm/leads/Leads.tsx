import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import Table from '../../../components/Table/Table';
import ItemSelection from '../../../components/ItemSelection/ItemSelection';
import { getLeads, createLead } from './Leads.api';
import { getCountries, getStates, getRegions, getZones, getSubZones } from '../../../services/common';
import { getItems } from '../../item-master/item/item.api';
import { getUsers } from '../../masters/users/Users.api';
import './Leads.css';

const blankItemRow = {
  itemId: '',
  description: '',
  unit: '',
  qty: ''
};

export default function LeadsPage() {
  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [subZones, setSubZones] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [itemRows, setItemRows] = useState<any[]>([ { ...blankItemRow } ]);

  const [form, setForm] = useState({
    name: '',
    company: '',
    position: '',
    gstNo: '',
    email: '',
    contactNo: '',
    website: '',
    industry: '',
    countryId: '',
    stateId: '',
    city: '',
    pinCode: '',
    addressLine1: '',
    addressLine2: '',
    regionId: '',
    zoneId: '',
    subZoneId: '',
    assignedEmployeeId: ''
  });

  const tableConfig = [
    { title: 'Name', key: 'name' },
    { title: 'Company', key: 'company' },
    { title: 'Position', key: 'position' },
    { title: 'GST No.', key: 'gstNo' },
    { title: 'Email', key: 'email' },
    { title: 'Contact No', key: 'contactNo' },
    { title: 'Industry', key: 'industry' },
    { title: 'Assigned Employee', key: 'assignedEmployeeName' }
  ];

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      setTableData(data.data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await getCountries();
      setCountries(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchStates = async (countryId: string) => {
    try {
      const response = await getStates(countryId);
      setStates(response.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await getRegions();
      setRegions(response.data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchZones = async (regionId: string) => {
    try {
      const response = await getZones(regionId);
      setZones(response.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchSubZones = async (zoneId: string) => {
    try {
      const response = await getSubZones(zoneId);
      setSubZones(response.data);
    } catch (error) {
      console.error('Error fetching sub-zones:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getUsers();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchCountries();
    fetchRegions();
    fetchEmployees();
    fetchItems();
  }, []);

  useEffect(() => {
    if (form.countryId) {
      fetchStates(form.countryId);
    } else {
      setStates([]);
    }
  }, [form.countryId]);

  useEffect(() => {
    if (form.regionId) {
      fetchZones(form.regionId);
    } else {
      setZones([]);
      setSubZones([]);
    }
  }, [form.regionId]);

  useEffect(() => {
    if (form.zoneId) {
      fetchSubZones(form.zoneId);
    } else {
      setSubZones([]);
    }
  }, [form.zoneId]);

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleItemRowsChange = (rows: any[]) => {
    setItemRows(rows);
  };

  const resetForm = () => {
    setForm({
      name: '',
      company: '',
      position: '',
      gstNo: '',
      email: '',
      contactNo: '',
      website: '',
      industry: '',
      countryId: '',
      stateId: '',
      city: '',
      pinCode: '',
      addressLine1: '',
      addressLine2: '',
      regionId: '',
      zoneId: '',
      subZoneId: '',
      assignedEmployeeId: ''
    });
    setItemRows([ { ...blankItemRow } ]);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        countryId: form.countryId ? Number(form.countryId) : null,
        stateId: form.stateId ? Number(form.stateId) : null,
        regionId: form.regionId ? Number(form.regionId) : null,
        zoneId: form.zoneId ? Number(form.zoneId) : null,
        subZoneId: form.subZoneId ? Number(form.subZoneId) : null,
        assignedEmployeeId: form.assignedEmployeeId ? Number(form.assignedEmployeeId) : null,
        items: itemRows
          .filter(row => row.itemId)
          .map(row => ({
            itemId: Number(row.itemId),
            description: row.description,
            unit: row.unit,
            qty: row.qty ? Number(row.qty) : 0
          }))
      };

      await createLead(payload);
      await fetchLeads();
      setShow(false);
      resetForm();
    } catch (error) {
      console.error('Error saving lead:', error);
    }
  };

  return (
    <>
      <div className='page-header-container'>
        <h2>Leads</h2>
        <Button text='Add Lead' onClick={() => setShow(true)} />
      </div>

      <div className='page-container'>
        <Table tableConfig={tableConfig} tableData={tableData} />
      </div>

      <Modal show={show} onHide={() => setShow(false)} size='xl'>
        <Modal.Header closeButton>
          <Modal.Title>Add Lead</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className='lead-form-section'>
            <h5>Lead Details</h5>
            <div className='form-controller'>
              <Input placeholder='Name' value={form.name} onChange={(value) => handleChange('name', value)} />
              <Input placeholder='Company' value={form.company} onChange={(value) => handleChange('company', value)} />
            </div>
            <div className='form-controller'>
              <Input placeholder='Position' value={form.position} onChange={(value) => handleChange('position', value)} />
              <Input placeholder='GST No.' value={form.gstNo} onChange={(value) => handleChange('gstNo', value)} />
            </div>
            <div className='form-controller'>
              <Input placeholder='Email' value={form.email} onChange={(value) => handleChange('email', value)} />
              <Input placeholder='Contact No' value={form.contactNo} onChange={(value) => handleChange('contactNo', value)} />
            </div>
            <div className='form-controller'>
              <Input placeholder='Website' value={form.website} onChange={(value) => handleChange('website', value)} />
              <Input placeholder='Industry' value={form.industry} onChange={(value) => handleChange('industry', value)} />
            </div>
          </div>

          <div className='lead-form-section'>
            <h5>Address</h5>
            <div className='form-controller'>
              <Select
                placeholder='Country'
                value={form.countryId}
                options={countries.map(c => ({ key: c.name, value: c.id }))}
                onChange={(value) => handleChange('countryId', value)}
              />
              <Select
                placeholder='State'
                value={form.stateId}
                options={states.map(s => ({ key: s.name, value: s.id }))}
                onChange={(value) => handleChange('stateId', value)}
              />
            </div>
            <div className='form-controller'>
              <Input placeholder='City' value={form.city} onChange={(value) => handleChange('city', value)} />
              <Input placeholder='Pin Code' type='number' value={form.pinCode} onChange={(value) => handleChange('pinCode', value)} />
            </div>
            <div className='form-controller'>
              <Input placeholder='Address Line 1' value={form.addressLine1} onChange={(value) => handleChange('addressLine1', value)} />
              <Input placeholder='Address Line 2' value={form.addressLine2} onChange={(value) => handleChange('addressLine2', value)} />
            </div>
            <div className='form-controller'>
              <Select
                placeholder='Region'
                value={form.regionId}
                options={regions.map(r => ({ key: r.region_name || r.name, value: r.id }))}
                onChange={(value) => handleChange('regionId', value)}
              />
              <Select
                placeholder='Zone'
                value={form.zoneId}
                options={zones.map(z => ({ key: z.zone_name || z.name, value: z.id }))}
                onChange={(value) => handleChange('zoneId', value)}
              />
            </div>
            <div className='form-controller'>
              <Select
                placeholder='Sub-Zone'
                value={form.subZoneId}
                options={subZones.map(s => ({ key: s.sub_zone_name || s.name, value: s.id }))}
                onChange={(value) => handleChange('subZoneId', value)}
              />
              <Select
                placeholder='Assigned Employee'
                value={form.assignedEmployeeId}
                options={employees.map(u => ({ key: u.name || u.fullName || u.email, value: u.id }))}
                onChange={(value) => handleChange('assignedEmployeeId', value)}
              />
            </div>
          </div>

          <div className='lead-form-section'>
            <h5>Items</h5>
            <ItemSelection rows={itemRows} items={items} onChange={handleItemRowsChange} />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button text='Save' onClick={handleSave} />
        </Modal.Footer>
      </Modal>
    </>
  );
}

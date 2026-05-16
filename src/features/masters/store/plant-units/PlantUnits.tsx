import { useEffect, useState } from 'react';
import Button from '../../../../components/Button/Button';
import './PlantUnits.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../../components/Input/Input';
import { getCountries, getPlantUnit, getStates, savePlantUnit } from './PlantUnits.api';
import type { TableConfig } from '../../../../components/Table/Table.interface';
import Table from '../../../../components/Table/Table';
import Select from '../../../../components/Select/Select';

export default function PlantUnitPage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [name, setName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [place, setPlace] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [stateCode, setStateCode] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [gstNo, setGstNo] = useState('');
    const [panNo, setPanNo] = useState('');
    const [cinNo, setCinNo] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [emailID, setEmailID] = useState('');

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);

    const tableConfig: TableConfig[] = [
        { title: 'Unit Name', key: 'unit_name' },
        { title: 'Company Name', key: 'company_name' },
        { title: 'GSTIN', key: 'gst_no' },
        { title: 'Contact', key: 'contact_no' },
        { title: 'Address', key: 'address_line_1' }
    ];

    const getPlantUnits = async () => {
        const data = await getPlantUnit();
        setTableData(data.data);
        console.log('data', data);
    }

    const getCountry = async () => {
        const data = await getCountries();
        setCountries(data.data.map((country: any) => ({ key: country.name, value: country.id })));
    }

    const getState = async (country: any) => {
        const statesRes = await getStates(country);
        const statesData = statesRes.data.map((state: any) => ({ key: state.name, value: state.id, code: state.code }));
        setStates(statesData);
    }

    useEffect(() => {
        const fetchPlantUnits = async () => {
            try {
                getPlantUnits();
            } catch (error) {
                console.error("Error fetching plant units:", error);
            }
        }

        const fetchCountries = async () => {
            try {
                getCountry();
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        }

        fetchPlantUnits();
        fetchCountries();
    }, []);

    useEffect(() => {
        if (country) {
            getState(country);
        }
    }, [country]);

    useEffect(() => {
        if (state) {
            const selectedCode = states.find((stateData: any) => stateData.value === Number(state))?.code || '';
            setStateCode(selectedCode);
            console.log('state code', stateCode);
        }
    }, [state])

    const savePlantUnitData = async () => {
        const payload = {
            unit_name: name, 
            company_name: companyName, 
            address_line_1: addressLine1, 
            address_line_2: addressLine2, 
            place: place, 
            stateId: Number(state), 
            countryId: Number(country), 
            state_code: Number(stateCode), 
            pin_code: Number(pinCode), 
            gst_no: gstNo, 
            pan_no: panNo, 
            cin_no: cinNo, 
            contact_no: contactNo, 
            email_id: emailID
        }

        await savePlantUnit(payload);
        await getPlantUnits();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Plant Units</h2>
                <Button text='Create Department' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Create Plant Unit</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <div className="form-group">
                            <Input placeholder='Unit Name' onChange={(value) => setName(value)}></Input>
                            <Input placeholder='Company Name' onChange={(value) => setCompanyName(value)}></Input>
                        </div>
                        <div className="form-group">
                            <Input placeholder='Address Line 1' onChange={(value) => setAddressLine1(value)}></Input>
                            <Input placeholder='Address Line 2' onChange={(value) => setAddressLine2(value)}></Input>
                        </div>
                        <div className="form-group">
                            <Input placeholder='Place' onChange={(value) => setPlace(value)}></Input>
                            <Select placeholder='Country' options={countries} onChange={(value) => setCountry(value)}></Select>
                        </div>
                        <div className="form-group">
                            <Select placeholder='State' options={states} onChange={(value) => setState(value)}></Select>
                            <Input placeholder='State Code' value={stateCode} onChange={(value) => setStateCode(value)} disabled={true}></Input>
                        </div>
                        <div className="form-group">
                            <Input placeholder='Pin Code' onChange={(value) => setPinCode(value)}></Input>
                            <Input placeholder='GST No' onChange={(value) => setGstNo(value)}></Input>
                        </div>
                        <div className="form-group">
                            <Input placeholder='PAN No' onChange={(value) => setPanNo(value)}></Input>
                            <Input placeholder='CIN No' onChange={(value) => setCinNo(value)}></Input>
                        </div>
                        <div className="form-group">
                            <Input placeholder='Contact No' onChange={(value) => setContactNo(value)}></Input>
                            <Input placeholder='Email ID' onChange={(value) => setEmailID(value)}></Input>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => savePlantUnitData()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
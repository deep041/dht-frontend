import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './CompanyDetails.css';
import Input from '../../../components/Input/Input';
import { getCompanyDetails, saveCompanyDetails } from './CompanyDetails.api';
import { getCountries, getStates } from '../../../services/common';
import Select from '../../../components/Select/Select';
import { ToastContainer, toast } from "react-toastify";

export default function CompanyDetailsPage() {

    const [id, setId] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyShortName, setCompanyShortName] = useState('');
    const [proprietor, setProprietor] = useState('');
    const [phone, setPhone] = useState('');
    const [phone2, setPhone2] = useState('');
    const [email, setEmail] = useState('');
    const [email2, setEmail2] = useState('');
    const [country, setCountry] = useState('');
    const [state, setState] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [place, setPlace] = useState('');
    const [stateCode, setStateCode] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [gstApplicable, setGstApplicable] = useState('yes');
    const [gstNo, setGstNo] = useState('');
    const [panNo, setPanNo] = useState('');
    const [cinNo, setCinNo] = useState('');
    const [llpinNo, setLlpinNo] = useState('');
    const [website, setWebsite] = useState('');
    // const [logo, setLogo] = useState('');
    const [aspId, setAspId] = useState('');
    const [aspPassword, setAspPassword] = useState('');
    const [portalClientUserName, setPortalClientUserName] = useState('');
    const [portalClientPassword, setPortalClientPassword] = useState('');

    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);

    const getCompanyDetail = async () => {
        const data = await getCompanyDetails();
        const companyData = data.data[0];
        console.log('companyData', companyData);
        setId(companyData.id);
        setCompanyName(companyData.company_name);
        setCompanyShortName(companyData.company_short_name);
        setProprietor(companyData.proprietor);
        setPhone(companyData.phone);
        setPhone2(companyData.phone_2);
        setEmail(companyData.email_id);
        setEmail2(companyData.email_id_2);
        setCountry(companyData.country_id);
        setState(companyData.state_id);
        setPinCode(companyData.pin_code);
        setPlace(companyData.place);
        setStateCode(companyData.state_code);
        setAddressLine1(companyData.address_line_1);
        setAddressLine2(companyData.address_line_2);
        setGstApplicable(companyData.gst_applicable ? 'yes' : 'no');
        setGstNo(companyData.gst_no);
        setPanNo(companyData.pan_no);
        setCinNo(companyData.cin_no);
        setLlpinNo(companyData.llpin_no);
        setWebsite(companyData.website);
        setAspId(companyData.asp_id);
        setAspPassword(companyData.asp_password);
        setPortalClientUserName(companyData.portal_client_user_name);
        setPortalClientPassword(companyData.portal_client_password);
    }

    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                getCompanyDetail();
            } catch (error) {
                console.error("Error fetching Company Details:", error);
            }
        }

        const fetchCountries = async () => {
            try {
                const countriesRes = await getCountries();
                setCountries(countriesRes.data.map((country: any) => ({ key: country.name, value: country.id })));
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        }

        fetchCountries();
        fetchCompanyDetails();
    }, []);

    useEffect(() => {
        const fetchState = async (country: any) => {
            try {
                const statesRes = await getStates(country);
                const statesData = statesRes.data.map((state: any) => ({ key: state.name, value: state.id, code: state.code }));
                setStates(statesData);
            } catch (error) {
                console.error("Error fetching states:", error);
            }
        }

        if (country) {
            fetchState(country);
        }
    }, [country]);

    useEffect(() => {
        const selectedState: any = states.find((stateData: any) => stateData.value === Number(state));
        console.log('selectedState', selectedState, states, state);
        if (selectedState) {
            setStateCode(selectedState.code);
        }
    }, [state]);

    const saveCompanyDetail = async () => {
        const payload = {
            id,
            company_name: companyName,
            company_short_name: companyShortName,
            proprietor,
            phone,
            phone_2: phone2,
            email_id: email,
            email_id_2: email2,
            country_id: Number(country),
            state_id: Number(state),
            pin_code: Number(pinCode),
            place,
            state_code: Number(stateCode),
            address_line_1: addressLine1,
            address_line_2: addressLine2,
            gst_applicable: gstApplicable === 'yes' ? true : false,
            gst_no: gstNo,
            pan_no: panNo,
            cin_no: cinNo,
            llpin_no: llpinNo,
            website,
            asp_id: Number(aspId),
            asp_password: aspPassword,
            portal_client_user_name: portalClientUserName,
            portal_client_password: portalClientPassword
        }

        await saveCompanyDetails(payload);
        toast.success("Company details saved successfully!");
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Company Details</h2>
            </div>

            <div className='page-container company-details'>
                <div className='form-controller'>
                    <Input placeholder='Company Full Name' value={companyName} onChange={(value) => setCompanyName(value)}></Input>
                    <Input placeholder='Company Short Name(3 letter)' value={companyShortName} onChange={(value) => setCompanyShortName(value)}></Input>
                    <Input placeholder='Proprietor' value={proprietor} onChange={(value) => setProprietor(value)}></Input>
                    <Input placeholder='Phone' value={phone} onChange={(value) => setPhone(value)}></Input>
                </div>
                <div className='form-controller'>
                    <Input placeholder='Phone 2(optional)' value={phone2} onChange={(value) => setPhone2(value)}></Input>
                    <Input placeholder='Email ID' value={email} onChange={(value) => setEmail(value)}></Input>
                    <Input placeholder='Email ID(optional)' value={email2} onChange={(value) => setEmail2(value)}></Input>
                    <Select placeholder='Country' value={country} options={countries} onChange={(value) => setCountry(value)}></Select>
                </div>
                <div className='form-controller'>
                    <Select placeholder='State' value={state} options={states} onChange={(value) => setState(value)}></Select>
                    <Input placeholder='PIN Code' value={pinCode} onChange={(value) => setPinCode(value)}></Input>
                    <Input placeholder='Place' value={place} onChange={(value) => setPlace(value)}></Input>
                    <Input placeholder='State Code' value={stateCode} onChange={(value) => setStateCode(value)} disabled={true}></Input>
                </div>
                <div className='form-controller'>
                    <Input placeholder='Address Line 1' value={addressLine1} onChange={(value) => setAddressLine1(value)}></Input>
                    <Input placeholder='Address Line 2' value={addressLine2} onChange={(value) => setAddressLine2(value)}></Input>
                    <Select placeholder='GST Applicable' value={gstApplicable} options={[{ key: 'Yes', value: 'yes' }, { key: 'No', value: 'no' }]} onChange={(value) => setGstApplicable(value)}></Select>
                    <Input placeholder='GST No.' value={gstNo} onChange={(value) => setGstNo(value)}></Input>
                </div>
                <div className='form-controller'>
                    <Input placeholder='PAN No.' value={panNo} onChange={(value) => setPanNo(value)}></Input>
                    <Input placeholder='CIN No.' value={cinNo} onChange={(value) => setCinNo(value)}></Input>
                    <Input placeholder='LLPIN No.' value={llpinNo} onChange={(value) => setLlpinNo(value)}></Input>
                    <Input placeholder='Website' value={website} onChange={(value) => setWebsite(value)}></Input>
                </div>
                <h5>E-invoice configuration</h5>
                <div className='form-controller'>
                    <Input placeholder='ASP ID' value={aspId} onChange={(value) => setAspId(value)}></Input>
                    <Input placeholder='ASP Password' value={aspPassword} onChange={(value) => setAspPassword(value)} type='password'></Input>
                    <Input placeholder='Portal Client User Name' value={portalClientUserName} onChange={(value) => setPortalClientUserName(value)}></Input>
                    <Input placeholder='Portal Client Password' value={portalClientPassword} onChange={(value) => setPortalClientPassword(value)} type='password'></Input>
                </div>
            </div>

            <div className='save-button-container'>
                <Button text='Save' onClick={() => saveCompanyDetail()}></Button>
            </div>
        </>
    )
}
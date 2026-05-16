import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './Banks.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import { getBanks, saveBanks } from './Banks.api';
import type { TableConfig } from '../../../components/Table/Table.interface';
import Table from '../../../components/Table/Table';
import Select from '../../../components/Select/Select';

export default function BanksPage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [IFSCCode, setIFSCCode] = useState('');
    const [bankName, setBankName] = useState('');
    const [branchCode, setBranchCode] = useState('');
    const [branch, setBranch] = useState('');
    const [MICR, setMICR] = useState('');
    const [bankAddress, setBankAddress] = useState('');
    const [accountNo, setAccountNo] = useState('');
    const [accountName, setAccountName] = useState('');
    const [details, setDetails] = useState('');
    const [openingAmount, setOpeningAmount] = useState('');
    const [isCreditorDebit, setIsCreditorDebit] = useState('credit');

    const statuses = [{ key: 'Credit', value: 'credit' }, { key: 'Debit', value: 'debit' }];

    const tableConfig: TableConfig[] = [
        { title: 'Bank Name', key: 'bank_name' },
        { title: 'IFSC Code', key: 'ifsc_code' },
        { title: 'Acc No.', key: 'account_number' },
        { title: 'Acc Name', key: 'account_name' },
        { title: 'Address', key: 'bank_address' }
    ];

    const getBankDetails = async () => {
        const data = await getBanks();
        setTableData(data.data);
        console.log('data', data);
    }

    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                getBankDetails();
            } catch (error) {
                console.error("Error fetching banks:", error);
            }
        }

        fetchBankDetails();
    }, []);

    const saveDepartmentValue = async () => {
        const payload = {
            account_number: accountNo,
            bank_name: bankName, 
            ifsc_code: IFSCCode, 
            branch_name: branch, 
            branch_code: branchCode, 
            micr_code: MICR, 
            bank_address: bankAddress, 
            account_name: accountName, 
            details, 
            opening_balance: Number(openingAmount), 
            credit_or_debit: isCreditorDebit
        }

        await saveBanks(payload);
        await getBankDetails();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Banks</h2>
                <Button text='Add New Bank' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Add New Bank</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <div className='form-controller'>
                            <Input placeholder='Enter IFSC code' onChange={(value) => setIFSCCode(value)}></Input>
                            <Input placeholder='Enter bank name' onChange={(value) => setBankName(value)}></Input>
                            <Input placeholder='Enter branch code' onChange={(value) => setBranchCode(value)}></Input>
                        </div>
                        <div className='form-controller'>
                            <Input placeholder='Enter branch name' onChange={(value) => setBankName(value)}></Input>
                            <Input placeholder='Enter MICR' onChange={(value) => setMICR(value)}></Input>
                            <Input placeholder='Enter bank address' onChange={(value) => setBankAddress(value)}></Input>
                        </div>
                        <div className='form-controller'>
                            <Input placeholder='Enter Account No' onChange={(value) => setAccountNo(value)}></Input>
                            <Input placeholder='Enter Account Name' onChange={(value) => setAccountName(value)}></Input>
                            <Input placeholder='Enter details' onChange={(value) => setDetails(value)}></Input>
                        </div>
                        <div className='form-controller'>
                            <Input placeholder='Enter Opening Amount' onChange={(value) => setOpeningAmount(value)}></Input>
                            <Select placeholder='Cr/Dr' options={statuses} onChange={(value) => setIsCreditorDebit(value)}></Select>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => saveDepartmentValue()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './PaymentTerms.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import { getPaymentTerms, savePaymentTerms } from './PaymentTerms.api';
import type { TableConfig } from '../../../components/Table/Table.interface';
import Table from '../../../components/Table/Table';

export default function PaymentTermsPage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [termName, setTermName] = useState('');


    const tableConfig: TableConfig[] = [
        { title: 'Term Name', key: 'term_name' }
    ];

    const getPaymentTermDetails = async () => {
        const data = await getPaymentTerms();
        setTableData(data.data);
        console.log('data', data);
    }

    useEffect(() => {
        const fetchPaymentTerms = async () => {
            try {
                getPaymentTermDetails();
            } catch (error) {
                console.error("Error fetching payment terms:", error);
            }
        }

        fetchPaymentTerms();
    }, []);

    const savePaymentTermDetails = async () => {
        const payload = {
            term_name: termName,
        }

        await savePaymentTerms(payload);
        await getPaymentTermDetails();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Payment Terms</h2>
                <Button text='Add Payment Term' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Create Payment Term</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <Input placeholder='Enter term name' onChange={(value) => setTermName(value)}></Input>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => savePaymentTermDetails()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
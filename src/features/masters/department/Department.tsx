import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './Department.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import { getDepartments, saveDepartment } from './Department.api';
import type { TableConfig } from '../../../components/Table/Table.interface';
import Table from '../../../components/Table/Table';

export default function DepartmentPage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [code, setCode] = useState('');
    const [name, setName] = useState('');


    const tableConfig: TableConfig[] = [
        { title: 'Department Code', key: 'code' },
        { title: 'Department Name', key: 'name' }
    ];

    const getDepartment = async () => {
        const data = await getDepartments();
        setTableData(data.data);
        console.log('data', data);
    }

    useEffect(() => {
        const fetchDepartment = async () => {
            try {
                getDepartment();
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        }

        fetchDepartment();
    }, []);

    const saveDepartmentValue = async () => {
        const payload = {
            name,
            code
        }

        await saveDepartment(payload);
        await getDepartment();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Department</h2>
                <Button text='Create Department' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Create Department</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <Input placeholder='Enter department code' onChange={(value) => setCode(value)}></Input>
                        <Input placeholder='Enter department name' onChange={(value) => setName(value)}></Input>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => saveDepartmentValue()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
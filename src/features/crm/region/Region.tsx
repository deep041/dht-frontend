import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './Region.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import { getRegions, saveRegions } from './Region.api';
import type { TableConfig } from '../../../components/Table/Table.interface';
import Table from '../../../components/Table/Table';

export default function RegionPage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [name, setName] = useState('');
    const [status, setStatus] = useState('active');

    const statuses = [{ key: 'Active', value: 'active' }, { key: 'Inactive', value: 'inactive' }];

    const tableConfig: TableConfig[] = [
        { title: 'Region', key: 'region_name' },
        { title: 'Status', key: 'status' }
    ];

    const getRegion = async () => {
        const data = await getRegions();
        setTableData(data.data);
        console.log('data', data);
    }

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                getRegion();
            } catch (error) {
                console.error("Error fetching regions:", error);
            }
        }

        fetchRegions();
    }, []);

    const saveRegion = async () => {
        const payload = {
            region_name: name,
            status
        }

        await saveRegions(payload);
        await getRegion();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Region</h2>
                <Button text='Create Region' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Create Region</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <Input placeholder='Enter region name' onChange={(value) => setName(value)}></Input>
                        <Select options={statuses} placeholder='Status' onChange={(value) => setStatus(value)}></Select>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => saveRegion()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
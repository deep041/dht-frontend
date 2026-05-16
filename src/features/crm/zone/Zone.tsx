import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './Zone.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import Select from '../../../components/Select/Select';
import { getRegions, getZones, saveZones } from './Zone.api';
import type { TableConfig } from '../../../components/Table/Table.interface';
import Table from '../../../components/Table/Table';

export default function ZonePage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [regions, setRegions] = useState([]);

    const [name, setName] = useState('');
    const [region, setRegion] = useState('');
    const [status, setStatus] = useState('active');

    const statuses = [{ key: 'Active', value: 'active' }, { key: 'Inactive', value: 'inactive' }];

    const tableConfig: TableConfig[] = [
        { title: 'Zone', key: 'zone' },
        { title: 'Region', key: 'region_name' },
        { title: 'Status', key: 'status' }
    ];

    const getRegion = async () => {
        const data = await getRegions();
        const regionsData: any = [];
        data.data.forEach((region: any) => {
            regionsData.push({ key: region.region_name, value: region.id });
        });
        setRegions(regionsData);
    }

    const getZone = async () => {
        const data = await getZones();
        setTableData(data.data);
    }

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                getRegion();
            } catch (error) {
                console.error("Error fetching regions:", error);
            }
        }

        const fetchZones = async () => {
            try {
                getZone();
            } catch (error) {
                console.error("Error fetching zones:", error);
            }
        }

        fetchRegions();
        fetchZones();
    }, []);

    const saveRegion = async () => {
        const payload = {
            zone: name,
            regionId: Number(region),
            status
        }

        await saveZones(payload);
        await getZone();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Zone</h2>
                <Button text='Create Zone' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Create Zone</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <Input placeholder='Enter Zone name' onChange={(value) => setName(value)}></Input>
                        <Select options={regions} placeholder='Region' onChange={(value) => setRegion(value)}></Select>
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
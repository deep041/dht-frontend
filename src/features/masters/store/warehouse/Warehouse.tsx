import { useEffect, useState } from 'react';
import Button from '../../../../components/Button/Button';
import './Warehouse.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../../components/Input/Input';
import Select from '../../../../components/Select/Select';
import { getPlantUnits, getWarehouses, saveWarehouses } from './Warehouse.api';
import type { TableConfig } from '../../../../components/Table/Table.interface';
import Table from '../../../../components/Table/Table';

export default function WarehousePage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [plantUnit, setPlantUnit] = useState('');

    const [plantUnits, setPlantUnits] = useState([]);

    const tableConfig: TableConfig[] = [
        { title: 'Plant Unit', key: 'plant_unit_name' },
        { title: 'Name', key: 'name' },
        { title: 'Description', key: 'description' }
    ];

    const getPlantUnit = async () => {
        const data = await getPlantUnits();
        setPlantUnits(data.data.map((res: any) => { return { key: res.unit_name, value: res.id }}))
    }

    const getWarehouse = async () => {
        const data = await getWarehouses();
        setTableData(data.data);
    }

    useEffect(() => {
        const fetchPlantUnits = async () => {
            try {
                getPlantUnit();
            } catch (error) {
                console.error("Error fetching regions:", error);
            }
        }

        const fetchWarehouses = async () => {
            try {
                getWarehouse();
            } catch (error) {
                console.error("Error fetching zones:", error);
            }
        }

        fetchPlantUnits();
        fetchWarehouses();
    }, []);

    const saveWarehouse = async () => {
        const payload = {
            name,
            description,
            plant_unit_id: Number(plantUnit)
        }

        await saveWarehouses(payload);
        await getWarehouse();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Store Warehouse</h2>
                <Button text='Create Warehouse' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Create Warehouse</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <Select placeholder='Select Unit' options={plantUnits} onChange={(value) => setPlantUnit(value)}></Select>
                        <Input placeholder='Enter Warehouse Name' onChange={(value) => setName(value)}></Input>
                        <Input placeholder='Enter Warehouse Description' onChange={(value) => setDescription(value)}></Input>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => saveWarehouse()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
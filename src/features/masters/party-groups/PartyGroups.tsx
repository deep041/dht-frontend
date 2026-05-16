import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './PartyGroups.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import { getPartyGroup, savePartyGroup } from './PartyGroups.api';
import type { TableConfig } from '../../../components/Table/Table.interface';
import Table from '../../../components/Table/Table';

export default function PartyGroupPage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [name, setName] = useState('');

    const tableConfig: TableConfig[] = [
        { title: 'Name', key: 'name' }
    ];

    const getPartyGroups = async () => {
        const data = await getPartyGroup();
        setTableData(data.data);
    }

    useEffect(() => {
        const fetchPartyGroups = async () => {
            try {
                getPartyGroups();
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        }

        fetchPartyGroups();
    }, []);

    const savePartyGroupsValue = async () => {
        const payload = {
            name
        }

        await savePartyGroup(payload);
        await getPartyGroups();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Party Group</h2>
                <Button text='Create Party Group' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Create Party Group</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <Input placeholder='Enter party group name' onChange={(value) => setName(value)}></Input>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => savePartyGroupsValue()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
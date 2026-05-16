import { useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './Menu.css';
import { Modal } from 'react-bootstrap';
import Input from '../../../components/Input/Input';
import { getMenus, saveMenus } from './Menus.api';
import Table from '../../../components/Table/Table';
import type { TableConfig } from '../../../components/Table/Table.interface';
import Select from '../../../components/Select/Select';

export default function Menu() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [name, setName] = useState('');
    const [icon, setIcon] = useState('');
    const [path, setPath] = useState('');
    const [parent, setParent] = useState(null);
    const [status, setStatus] = useState('active');
    const [sequence, setSequence] = useState(null);

    const [menus, setMenus] = useState([]);

    const tableConfig: TableConfig[] = [
        { title: 'Menu', key: 'menu_name' },
        { title: 'Parent Menu', key: 'parent_menu' },
        { title: 'Menu URL', key: 'menu_url' },
        { title: 'Sequence', key: 'sequence' },
        { title: 'Status', key: 'status' },
    ];

    const statuses = [{ key: 'Active', value: 'active' }, { key: 'Inactive', value: 'inactive' }];

    const setMenuData = async () => {
        const menusData = await getMenus();
        setTableData(menusData.data);
        const parentMenus: any = [];

        menusData.data.forEach((menu: any) => {
            if (menu) {
                if (!menu.parent_menu_id) {
                    parentMenus.push({ key: menu.menu_name, value: menu.id });
                }
            }
        });
        setMenus(parentMenus);
    }

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                setMenuData();
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        }

        fetchMenus();
    }, [])

    const saveMenu = async () => {
        let payload = {
            name,
            icon,
            path,
            parent: Number(parent),
            status,
            sequence: sequence ? Number(sequence) : 0
        };

        await saveMenus(payload);
        await setMenuData();
        setShow(false);
    }

    return (
        <>
            <div className='page-header-container'>
                <h4>Menu</h4>
                <Button text='Create Menu' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>


            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                <Modal.Title>Create Menu</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <Input placeholder='Enter menu name' onChange={(value) => setName(value)}></Input>
                        <Input placeholder='Enter menu url' onChange={(value) => setPath(value)}></Input>
                        <Input placeholder='Enter menu icon name' onChange={(value) => setIcon(value)}></Input>
                        <Select options={menus} placeholder='Parent' onChange={(value) => setParent(value)}></Select>
                        <Select options={statuses} placeholder='Status' onChange={(value) => setStatus(value)}></Select>
                        <Input placeholder='Sequence' onChange={(value) => setSequence(value)}></Input>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => saveMenu()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
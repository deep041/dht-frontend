import './Roles.css'
import Table from '../../../components/Table/Table';
import type { TableConfig } from '../../../components/Table/Table.interface';
import Button from '../../../components/Button/Button';
import { Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import Input from '../../../components/Input/Input';
import { createRole, getRoles } from './api';

export default function RolesPage() {

  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);

  const [roleName, setRoleName] = useState('');

  const getRoleDetails = async () => {
    try {
      const rolesData = await getRoles();
      setTableData(rolesData.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        getRoleDetails();
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    }

    fetchRoles();
  }, [])

  const tableConfig: TableConfig[] = [
      { title: 'Role Name', key: 'role_name' },
      { title: 'Assigned', key: 'assignedUsers', type: 'multipleUsers' }
  ];

  const saveRoleDetails = async () => {
    await createRole(roleName);
    setShow(false);
    getRoleDetails();
  }
  
  return (
    <>
      <div className='page-header-container'>
        <h4>User Roles</h4>
        <Button text='Create Role' onClick={() => setShow(true)}></Button>
      </div>
      <div className='page-container'>
        <div className="roles-table">
          <Table tableConfig={tableConfig} tableData={tableData}></Table>
        </div>
      </div>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Role</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Input placeholder='Enter role name' onChange={(value) => setRoleName(value)}></Input>
        </Modal.Body>

        <Modal.Footer>
          <Button text='Save' onClick={() => saveRoleDetails()}></Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
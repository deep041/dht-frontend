import { use, useEffect, useState } from 'react';
import Button from '../../../components/Button/Button';
import './Users.css';
import Input from '../../../components/Input/Input';
import { getUsers, saveUsers } from './Users.api';
import { toast } from "react-toastify";
import Table from '../../../components/Table/Table';
import type { TableConfig } from '../../../components/Table/Table.interface';
import { Modal } from 'react-bootstrap';
import { getDepartments, getRegions, getRoles, getSubZones } from '../../../services/common';
import { set } from 'nprogress';
import Select from '../../../components/Select/Select';
import { getZones } from '../../crm/zone/Zone.api';

export default function UsersPage() {

    const [show, setShow] = useState(false);
    const [tableData, setTableData] = useState([]);

    const [id, setId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userName, setUserName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [role, setRole] = useState('');
    const [reportingPerson, setReportingPerson] = useState('');

    const [region, setRegion] = useState('');
    const [zone, setZone] = useState('');
    const [subZone, setSubZone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [isReportingPerson, setIsReportingPerson] = useState(false);

    const [departments, setDepartments] = useState([]);
    const [roles, setRoles] = useState([]);
    const [regions, setRegions] = useState([]);
    const [zones, setZones] = useState([]);
    const [subZones, setSubZones] = useState([]);
    const [reportingPersons, setReportingPersons] = useState([]);

    const tableConfig: TableConfig[] = [
        { title: 'Username', key: 'username' },
        { title: 'Name', key: 'first_name' },
        { title: 'Email', key: 'email' },
        { title: 'Contact No.', key: 'contact_no' },
        { title: 'Department', key: 'department_name' },
        { title: 'User Role', key: 'role_name' }
    ];

    const getUsersDetails = async () => {
        const data = await getUsers();
        setTableData(data?.data || []);
        console.log('data', data);
    }

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                getUsersDetails();
            } catch (error) {
                console.error("Error fetching Company Details:", error);
            }
        }

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const department: any = await getDepartments();
                setDepartments(department?.data?.map((dept: any) => ({ value: dept.id, key: dept.name })));
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        }

        const fetchRoles = async () => {
            try {
                const role: any = await getRoles();
                setRoles(role?.data?.map((role: any) => ({ value: role.id, key: role.role_name })));
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        }

        const fetchRegions = async () => {
            try {
                const region: any = await getRegions();
                setRegions(region?.data?.map((region: any) => ({ value: region.id, key: region.region_name })));
            } catch (error) {
                console.error("Error fetching regions:", error);
            }
        }

        const fetchAuthUsers = async () => {
            try {
                const authUsers: any = await getUsers();
                setReportingPersons(authUsers?.data?.map((user: any) => ({ value: user.id, key: user.username })));
            } catch (error) {
                console.error("Error fetching reporting persons:", error);
            }
        }

        fetchDepartments();
        fetchRoles();
        fetchRegions();
        fetchAuthUsers();
    }, []);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const zone: any = await getZones(region);
                setZones(zone?.data?.map((zone: any) => ({ value: zone.id, key: zone.zone })));
            } catch (error) {
                console.error("Error fetching zones:", error);
            }
        }

        if(region) {
            fetchZones();
        }
    }, [region]);

    useEffect(() => {
        const fetchSubZones = async () => {
            try {
                const subZone: any = await getSubZones(zone);
                setSubZones(subZone?.data?.map((subZone: any) => ({ value: subZone.id, key: subZone.subZoneTitle })));
            } catch (error) {
                console.error("Error fetching sub-zones:", error);
            }
        }

        if(zone) {
            fetchSubZones();
        }
    }, [zone]);

    const saveUser = async () => {
        const payload = {
            first_name: firstName, 
            last_name: lastName, 
            username: userName, 
            contact_no: contactNo, 
            email, 
            department_id: Number(department), 
            role_id: Number(role), 
            reporting_to: Number(reportingPerson), 
            region_id: Number(region), 
            zone_id: Number(zone), 
            sub_zone_id: Number(subZone), 
            password: password, 
            profile_picture: profilePicture, 
            is_auth_person: isReportingPerson
        }

        await saveUsers(payload);
        toast.success("User saved successfully!");
    }

    return (
        <>
            <div className='page-header-container'>
                <h2>Users</h2>
                <Button text='Add User' onClick={() => setShow(true)}></Button>
            </div>

            <div className='page-container'>
                <Table tableConfig={tableConfig} tableData={tableData}></Table>
            </div>

            <Modal show={show} onHide={() => setShow(false)} size='xl'>
                <Modal.Header closeButton>
                <Modal.Title>Add User</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className='create-menu-container'>
                        <div className='form-controller'>
                            <Input placeholder='Enter first name' onChange={(value) => setFirstName(value)}></Input>
                            <Input placeholder='Enter last name' onChange={(value) => setLastName(value)}></Input>
                            <Input placeholder='Enter username' onChange={(value) => setUserName(value)}></Input>
                            <Input placeholder='Enter contact number' onChange={(value) => setContactNo(value)}></Input>
                        </div>
                        <div className='form-controller'>
                            <Input placeholder='Enter email address' onChange={(value) => setEmail(value)}></Input>
                            <Select placeholder='Enter department' options={departments} onChange={(value) => setDepartment(value)}></Select>
                            <Select placeholder='Enter role' options={roles} onChange={(value) => setRole(value)}></Select>
                            <Select placeholder='Enter reporting person' options={reportingPersons} onChange={(value) => setReportingPerson(value)}></Select>
                        </div>
                        <div className='form-controller'>
                            <Select placeholder='Enter region' options={regions} onChange={(value) => setRegion(value)}></Select>
                            <Select placeholder='Enter zone' options={zones} onChange={(value) => setZone(value)}></Select>
                            <Select placeholder='Enter sub-zone' options={subZones} onChange={(value) => setSubZone(value)}></Select>
                        </div>
                        <div className='form-controller'>
                            <Input placeholder='Enter password' onChange={(value) => setPassword(value)}></Input>
                            <Input placeholder='Enter confirm password' onChange={(value) => setConfirmPassword(value)}></Input>
                            <Input placeholder='Enter profile picture URL' onChange={(value) => setProfilePicture(value)}></Input>
                        </div>
                        <div className='form-controller'>
                            <input type='checkbox' onChange={(e) => setIsReportingPerson(e.target.checked)}></input>
                            <label>Is Reporting Person</label>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                <Button text='Save' onClick={() => saveUser()}></Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
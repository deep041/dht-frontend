import { faPencil } from '@fortawesome/free-solid-svg-icons';
import MultipleUsers from '../MultipleUsers/MultipleUsers';
import './Table.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { TableConfig } from './Table.interface';


export default function Table({ tableConfig, tableData }: { tableConfig: TableConfig[], tableData: any[] }) {
    return (
        <>
            <table>
            <thead>
              <tr>
                {tableConfig?.map((column) => (
                    <th key={column.key}>{column.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
                {tableData?.map((row, index) => (
                    <tr key={index}>
                    {tableConfig.map((column) => {
                        if (column.type === 'multipleUsers') {
                            return (
                                <td key={column.key}>
                                    <MultipleUsers users={row.assignedUsers}></MultipleUsers>
                                </td>
                            );
                        } else if (column.type === 'icon') {
                            return (
                                <td key={column.key}>
                                    <FontAwesomeIcon className='icon' icon={faPencil} />
                                </td>
                            );
                        } else {
                            return <td key={column.key}>{row[column.key]}</td>;
                        }
                    })}
                    </tr>
                ))}
            </tbody>
          </table>
        </>
    );
}
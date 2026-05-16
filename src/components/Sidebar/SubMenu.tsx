import './Sidebar.css';
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';

export interface MenuItems {
  menu_name: string;
  menu_url: string;
  children?: MenuItems[];
}

export default function SubMenu({ item, level }: { item: MenuItems[], level: number }) {

    console.log('SubMenu item:', item, level);
    const location = useLocation();
    const currentPath = location.pathname;

    return (
        <>
            <div className='second-level-menu' style={{ position: 'absolute', left: '200px' }}>
                {item && item.map((child: MenuItems) => (
                    <div key={child.menu_url} className='menu-item-container'>
                        <Link key={child.menu_name} className={'menu-item ' + (currentPath === child.menu_url ? 'active' : '')} to={child.menu_url}>
                            <span>{child.menu_name}</span>
                            {(child.children && (child.children.length > 0)) &&
                                <FontAwesomeIcon className='sidebar-icon' icon={faAngleRight} />
                            }
                        </Link>
                        {(child?.children && (child.children.length > 0)) && <SubMenu item={child.children} level={level + 1} />}
                    </div>
                ))}
            </div>
        </>
    );
}
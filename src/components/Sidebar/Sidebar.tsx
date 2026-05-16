import './Sidebar.css';
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import SubMenu from './SubMenu';
import { useEffect, useState } from 'react';
import { getMenus } from './Sidebar.api';
import { useAuth } from '../../context/AuthContext';

export interface MenuItems {
  menu_name: string;
  menu_url: string;
  children?: MenuItems[];
}

function getUserInitials(firstName?: string, lastName?: string) {
  const first = firstName?.charAt(0) ?? '';
  const last = lastName?.charAt(0) ?? '';
  return `${first}${last}`.toUpperCase() || 'U';
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const [menus, setMenus] = useState([]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
        const fetchMenus = async () => {
            try {
                const menusData = await getMenus();
                menusData.data.forEach((menu: any) => {
                  if (menu) {
                    // if (!menu.parent_menu_id) {
                    //   formattedMenus.push({ name: menu.menu_name, id: menu.id, path: menu.menu_url, children: [] });
                    // } else {
                    //   const parentMenu = formattedMenus.find((m: any) => m.id === menu.parent_menu_id);
                    //   if (parentMenu) {
                    //     parentMenu.children.push({ name: menu.menu_name, id: menu.id, path: menu.menu_url, children: [] });
                    //   }
                    // }


                  }
                });
                console.log('menu', menusData.data);
                setMenus(menusData.data);
                console.log("Fetched roles data:", menus);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        }

        fetchMenus();
    }, [])

  function activeMenuClass(menu: MenuItems): string {
    if (currentPath === menu.menu_url) {
      return 'active';
    }
    if (menu.children) {
      return menu.children.some(child => activeMenuClass(child) === 'active') ? 'active' : '';
    }
    return '';
  }

  return (
    <>
      <div className='sidebar-container'>
        <div className='logo-container'>
          <img className='logo' src={logo}></img>
        </div>
        <div className='sidebar'>
            {menus.map((item: MenuItems) => (
              <div key={item.menu_url} className='menu-item-container'>
                <Link className={'menu-item ' + (activeMenuClass(item))} to={item.menu_url}>
                  <span>{item.menu_name}</span>
                  {(item.children && (item.children.length > 0)) &&
                    <FontAwesomeIcon className='sidebar-icon' icon={faAngleRight} />
                  }
                </Link>
                {(item.children && (item.children.length > 0)) && <SubMenu item={item.children} level={1} />}
              </div>
            ))}
        </div>
        <div className='sidebar-footer'>
          <div className='notification-container'>
            <div className='notification'>
              <FontAwesomeIcon className='sidebar-icon' icon={faBell} />
              <span>Notification</span> 
            </div>
            <div className='notification-count'>10</div>
          </div>
          <div className='login-user-details'>
            <div className='login-user-icon'>
              {getUserInitials(user?.first_name, user?.last_name)}
            </div>
            <div className='login-user'>
              <div className='login-user-name'>
                {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
              </div>
              <div className='login-user-role'>{user?.role_name ?? ''}</div>
            </div>
          </div>
          <button type='button' className='logout-btn' onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
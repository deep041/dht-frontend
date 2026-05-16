import './Header.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';

export default function Header() {

  return (
    <>
      <div className='header-container'>
        <div className='left-header'></div>
        <div className='right-header'>
          <FontAwesomeIcon icon={faBell} />
          <div className='login-user-icon'>DP</div>
        </div>
      </div>
    </>
  );
}
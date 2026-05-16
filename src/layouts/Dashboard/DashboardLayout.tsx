import './DashboardLayout.css';
import { Outlet} from "react-router-dom";
import Sidebar from '../../components/Sidebar/Sidebar';
// import Header from '../../components/Header/Header';

export default function DashboardLayout() {

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      <Sidebar />

      <div style={{ flex: 1 }}>
        {/* <Header /> */}
        <Outlet />
      </div>

    </div>
  );
}
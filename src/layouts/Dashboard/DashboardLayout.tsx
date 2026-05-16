import './DashboardLayout.css';
import { Outlet} from "react-router-dom";
import Sidebar from '../../components/Sidebar/Sidebar';
// import Header from '../../components/Header/Header';

export default function DashboardLayout() {

  return (
    <div style={{ display: "flex", minHeight: "100vh", maxHeight: "100vh", overflow: "hidden" }}>
      
      <Sidebar />

      <div style={{ flex: 1, overflow: "auto" }}>
        {/* <Header /> */}
        <Outlet />
      </div>

    </div>
  );
}
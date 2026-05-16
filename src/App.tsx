import { ToastContainer } from 'react-toastify';
import './App.css'
import AppRoutes from './app/routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


function App() {

  return (
    <>
      <AppRoutes></AppRoutes>
      <ToastContainer />
    </>
  )
}

export default App

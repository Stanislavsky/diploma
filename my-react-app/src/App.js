import './App.css';
import './apps/auth/pages/Inlet.css'
import Header from './components/Header';
import AppRoutes from './routes/AppRoutes';
import { useLocation } from 'react-router-dom';


export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="App">
      {!isLoginPage && <Header />}
      <AppRoutes />
    </div>
  );
}

import './App.css';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CustomersPage from './pages/CustomersPage';
import ItemsPage from './pages/ItemsPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-amber-100 to-purple-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#2D1B3D',
            color: '#F5F0EA',
            border: '1px solid #D4AF37',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '500',
          },
          success: {
            duration: 2000,
            iconTheme: {
              primary: '#6B9B7B',
              secondary: '#F5F0EA',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#C96B6B',
              secondary: '#F5F0EA',
            },
          },
        }}
      />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

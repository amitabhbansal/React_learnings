import './App.css';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CustomerSearch from './pages/CustomerSearch';
import AddCustomer from './pages/AddCustomer';
import ItemsPage from './pages/ItemsPage';

function App() {
  return (
    <div className="min-h-screen bg-amber-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customers" element={<CustomerSearch />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/items" element={<ItemsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

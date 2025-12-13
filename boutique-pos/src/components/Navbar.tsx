import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="navbar bg-base-100 shadow-lg mb-6">
      <div className="navbar-start">
        <Link to="/" className="btn btn-ghost text-xl font-bold">
          Boutique POS
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-2">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/customers" className={isActive('/customers') ? 'active' : ''}>
              Customers
            </Link>
          </li>
          <li>
            <Link to="/items" className={isActive('/items') ? 'active' : ''}>
              Items
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <span className="text-sm mr-4 text-gray-600">Welcome, Madhu</span>
      </div>
    </div>
  );
};

export default Navbar;

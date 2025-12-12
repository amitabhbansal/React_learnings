import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="navbar bg-base-100 shadow-lg mb-6">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/customers">Search Customer</Link>
            </li>
            <li>
              <Link to="/add-customer">Add Customer</Link>
            </li>
            <li>
              <Link to="/items">View Items</Link>
            </li>
          </ul>
        </div>
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
              Search Customer
            </Link>
          </li>
          <li>
            <Link to="/add-customer" className={isActive('/add-customer') ? 'active' : ''}>
              Add Customer
            </Link>
          </li>
          <li>
            <Link to="/items" className={isActive('/items') ? 'active' : ''}>
              View Items
            </Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <span className="text-sm text-gray-600">Welcome</span>
      </div>
    </div>
  );
};

export default Navbar;

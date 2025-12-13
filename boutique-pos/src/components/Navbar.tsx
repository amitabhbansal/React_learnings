import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-gradient-to-r from-boutique-primary via-boutique-dark to-boutique-primary shadow-2xl mb-8 border-b-2 border-boutique-secondary/70">
      <div className="navbar max-w-7xl mx-auto">
        <div className="navbar-start">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 hover:bg-boutique-dark/30 rounded-lg transition-all duration-300"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-boutique-secondary to-boutique-accent rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-boutique-primary font-bold text-xl font-serif">BB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-serif text-2xl font-bold tracking-tight drop-shadow-lg">
                Bansal Boutique
              </span>
              <span className="text-boutique-secondary text-xs font-semibold tracking-widest uppercase drop-shadow">
                Point of Sale
              </span>
            </div>
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li>
              <Link
                to="/"
                className={`font-medium transition-all duration-300 ${
                  isActive('/')
                    ? 'bg-boutique-secondary text-boutique-primary font-semibold'
                    : 'text-boutique-light hover:bg-boutique-dark/50 hover:text-boutique-secondary'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/customers"
                className={`font-medium transition-all duration-300 ${
                  isActive('/customers')
                    ? 'bg-boutique-secondary text-boutique-primary font-semibold'
                    : 'text-boutique-light hover:bg-boutique-dark/50 hover:text-boutique-secondary'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Customers
              </Link>
            </li>
            <li>
              <Link
                to="/items"
                className={`font-medium transition-all duration-300 ${
                  isActive('/items')
                    ? 'bg-boutique-secondary text-boutique-primary font-semibold'
                    : 'text-boutique-light hover:bg-boutique-dark/50 hover:text-boutique-secondary'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Items
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <div className="flex items-center gap-2 bg-boutique-dark/30 px-4 py-2 rounded-full border border-boutique-secondary/30">
            <div className="w-8 h-8 bg-gradient-to-br from-boutique-secondary to-boutique-accent rounded-full flex items-center justify-center">
              <span className="text-boutique-primary font-bold text-sm">M</span>
            </div>
            <span className="text-boutique-light font-medium text-sm">Madhu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { privacyMode, togglePrivacyMode } = useApp();

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (paths: string[]) => paths.some((path) => location.pathname === path);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 shadow-xl mb-8 border-b-2 border-boutique-secondary">
      <div className="navbar max-w-7xl mx-auto">
        <div className="navbar-start">
          {/* Mobile Menu Button */}
          <div className="dropdown lg:hidden">
            <button
              onClick={toggleMobileMenu}
              className="btn btn-ghost btn-circle text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2 hover:bg-white/10 rounded-xl transition-all duration-300 group"
            onClick={closeMobileMenu}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300">
              <span className="text-boutique-dark font-bold text-xl font-serif">BB</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-serif text-2xl font-bold tracking-tight drop-shadow-lg">
                Bansal Boutique
              </span>
              <span className="text-amber-200 text-xs font-semibold tracking-widest uppercase drop-shadow">
                Point of Sale
              </span>
            </div>
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            {/* Home */}
            <li>
              <Link
                to="/"
                className={`font-semibold transition-all duration-300 rounded-xl ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
              >
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
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </Link>
            </li>

            {/* Dashboard */}
            {!privacyMode && (
              <li>
                <Link
                  to="/dashboard"
                  className={`font-semibold transition-all duration-300 rounded-xl ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                      : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                  }`}
                >
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
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </Link>
              </li>
            )}

            {/* Customers */}
            <li>
              <Link
                to="/customers"
                className={`font-semibold transition-all duration-300 rounded-xl ${
                  isActive('/customers')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
              >
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
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Customers
              </Link>
            </li>

            {/* Retail Dropdown */}
            <li className="dropdown">
              <label
                tabIndex={0}
                className={`font-semibold transition-all duration-300 rounded-xl cursor-pointer ${
                  isGroupActive(['/items', '/orders'])
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
              >
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
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Retail
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-xl bg-purple-950 rounded-xl w-52 mt-2 border-2 border-boutique-secondary/30"
              >
                <li>
                  <Link
                    to="/items"
                    className={`font-semibold transition-all duration-300 ${
                      isActive('/items')
                        ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark'
                        : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                    }`}
                  >
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
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Items
                  </Link>
                </li>
                <li>
                  <Link
                    to="/orders"
                    className={`font-semibold transition-all duration-300 ${
                      isActive('/orders')
                        ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark'
                        : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                    }`}
                  >
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
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Orders
                  </Link>
                </li>
              </ul>
            </li>

            {/* Stitching Dropdown */}
            <li className="dropdown">
              <label
                tabIndex={0}
                className={`font-semibold transition-all duration-300 rounded-xl cursor-pointer ${
                  isGroupActive([
                    '/stitching-overview',
                    '/stitching',
                    '/fabric-inventory',
                    '/accessory-inventory',
                  ])
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
              >
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
                    strokeWidth={2}
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                  />
                </svg>
                Stitching
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-2 shadow-xl bg-purple-950 rounded-xl w-52 mt-2 border-2 border-boutique-secondary/30"
              >
                <li>
                  <Link
                    to="/stitching-overview"
                    className={`font-semibold transition-all duration-300 ${
                      isActive('/stitching-overview')
                        ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark'
                        : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                    }`}
                  >
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
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/stitching"
                    className={`font-semibold transition-all duration-300 ${
                      isActive('/stitching')
                        ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark'
                        : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                    }`}
                  >
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
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Orders
                  </Link>
                </li>
                <li>
                  <Link
                    to="/fabric-inventory"
                    className={`font-semibold transition-all duration-300 ${
                      isActive('/fabric-inventory')
                        ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark'
                        : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                    }`}
                  >
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
                        strokeWidth={2}
                        d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M4 7l2-4h12l2 4"
                      />
                    </svg>
                    Fabrics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/accessory-inventory"
                    className={`font-semibold transition-all duration-300 ${
                      isActive('/accessory-inventory')
                        ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark'
                        : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                    }`}
                  >
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
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    Accessories
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <div className="flex items-center gap-3">
            {/* Privacy Mode Toggle */}
            <button
              onClick={togglePrivacyMode}
              className={`btn btn-sm gap-2 transition-all duration-300 ${
                privacyMode
                  ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark hover:from-amber-400 hover:to-boutique-secondary border-none'
                  : 'bg-white/10 text-white hover:bg-white/20 border-boutique-secondary/50'
              }`}
              title={privacyMode ? 'Privacy Mode ON' : 'Privacy Mode OFF'}
            >
              {privacyMode ? (
                <>
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  <span className="hidden sm:inline">Privacy ON</span>
                </>
              ) : (
                <>
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Privacy OFF</span>
                </>
              )}
            </button>

            {/* User Badge */}
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-boutique-secondary/50 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm">
              <div className="w-8 h-8 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-boutique-dark font-bold text-sm">M</span>
              </div>
              <span className="text-white font-semibold text-sm">Madhu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-purple-950 border-t-2 border-boutique-secondary/30">
          <ul className="menu menu-vertical p-4 gap-2">
            {/* Home */}
            <li>
              <Link
                to="/"
                className={`font-semibold transition-all duration-300 rounded-xl ${
                  isActive('/')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
                onClick={closeMobileMenu}
              >
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
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </Link>
            </li>

            {/* Dashboard */}
            {!privacyMode && (
              <li>
                <Link
                  to="/dashboard"
                  className={`font-semibold transition-all duration-300 rounded-xl ${
                    isActive('/dashboard')
                      ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                      : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                  }`}
                  onClick={closeMobileMenu}
                >
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
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Dashboard
                </Link>
              </li>
            )}

            {/* Customers */}
            <li>
              <Link
                to="/customers"
                className={`font-semibold transition-all duration-300 rounded-xl ${
                  isActive('/customers')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
                onClick={closeMobileMenu}
              >
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
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Customers
              </Link>
            </li>

            {/* Retail Section */}
            <li className="menu-title text-boutique-secondary font-bold mt-2">
              <span className="flex items-center gap-2">
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                RETAIL
              </span>
            </li>
            <li>
              <Link
                to="/items"
                className={`font-semibold transition-all duration-300 rounded-xl pl-8 ${
                  isActive('/items')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
                onClick={closeMobileMenu}
              >
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
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Items
              </Link>
            </li>
            <li>
              <Link
                to="/orders"
                className={`font-semibold transition-all duration-300 rounded-xl pl-8 ${
                  isActive('/orders')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
                onClick={closeMobileMenu}
              >
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
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Orders
              </Link>
            </li>

            {/* Stitching Section */}
            <li className="menu-title text-boutique-secondary font-bold mt-2">
              <span className="flex items-center gap-2">
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
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                  />
                </svg>
                STITCHING
              </span>
            </li>
            <li>
              <Link
                to="/stitching-overview"
                className={`font-semibold transition-all duration-300 rounded-xl pl-8 ${
                  isActive('/stitching-overview')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
                onClick={closeMobileMenu}
              >
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
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Overview
              </Link>
            </li>
            <li>
              <Link
                to="/stitching"
                className={`font-semibold transition-all duration-300 rounded-xl pl-8 ${
                  isActive('/stitching')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
                onClick={closeMobileMenu}
              >
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
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Orders
              </Link>
            </li>
            <li>
              <Link
                to="/fabric-inventory"
                className={`font-semibold transition-all duration-300 rounded-xl pl-8 ${
                  isActive('/fabric-inventory')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
                onClick={closeMobileMenu}
              >
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
                    strokeWidth={2}
                    d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7h16M4 7l2-4h12l2 4"
                  />
                </svg>
                Fabrics
              </Link>
            </li>
            <li>
              <Link
                to="/accessory-inventory"
                className={`font-semibold transition-all duration-300 rounded-xl pl-8 ${
                  isActive('/accessory-inventory')
                    ? 'bg-gradient-to-r from-boutique-secondary to-amber-400 text-boutique-dark shadow-lg'
                    : 'text-white hover:bg-white/10 hover:text-boutique-secondary'
                }`}
                onClick={closeMobileMenu}
              >
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
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
                Accessories
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;

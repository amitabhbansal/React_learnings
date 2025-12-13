const Home = () => {
  return (
    <div className="min-h-[75vh]">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-boutique-primary via-boutique-dark to-purple-900 shadow-2xl border-2 border-boutique-secondary/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNEMEFGMzciIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bS0yIDB2Mmgydi0yaC0yem0tMiAwdjJoMnYtMmgtMnptLTIgMHYyaDJ2LTJoLTJ6bS0yIDB2Mmgydi0yaC0yem0tMiAwdjJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative hero min-h-[60vh]">
          <div className="hero-content text-center py-16">
            <div className="max-w-3xl">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-boutique-secondary via-amber-300 to-boutique-secondary rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 border-4 border-white/30 backdrop-blur-sm">
                  <span className="text-boutique-dark font-bold text-5xl font-serif drop-shadow-lg">
                    BB
                  </span>
                </div>
              </div>

              <h1 className="text-6xl md:text-7xl font-serif font-bold mb-4 tracking-tight">
                <span className="text-white drop-shadow-2xl">Welcome to </span>
                <span
                  className="inline-block bg-gradient-to-r from-amber-200 via-boutique-secondary to-amber-200 bg-clip-text text-transparent font-extrabold drop-shadow-2xl"
                  style={{
                    backgroundSize: '200% auto',
                    animation: 'shimmer 4s ease-in-out infinite',
                    filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))',
                  }}
                >
                  Bansal Boutique
                </span>
              </h1>
              <p className="text-xl text-amber-100 mb-3 font-light tracking-wide drop-shadow-lg">
                Elegant Point of Sale System
              </p>

              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-boutique-secondary to-transparent mx-auto mb-8"></div>

              <p className="text-lg text-slate-100 mb-10 leading-relaxed max-w-2xl mx-auto font-light drop-shadow">
                Streamline your boutique operations with our sophisticated inventory management
                system. Effortlessly manage customers, track items, and elevate your business to new
                heights.
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href="/customers"
                  className="btn btn-lg bg-gradient-to-r from-boutique-secondary via-amber-400 to-boutique-secondary hover:from-amber-400 hover:via-boutique-secondary hover:to-amber-400 text-boutique-dark border-none shadow-2xl hover:shadow-boutique-secondary/50 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-bold"
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Manage Customers
                </a>
                <a
                  href="/items"
                  className="btn btn-lg bg-white/10 hover:bg-white/20 text-white border-2 border-white/50 hover:border-boutique-secondary backdrop-blur-sm shadow-2xl hover:shadow-white/30 transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 font-bold"
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
                  Browse Items
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="card bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 border-boutique-secondary">
          <div className="card-body items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-boutique-secondary"
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
            </div>
            <h3 className="card-title text-white font-serif drop-shadow-lg">Customer Management</h3>
            <p className="text-amber-100">
              Search, add, and manage your valued customers with ease
            </p>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 border-boutique-secondary">
          <div className="card-body items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-boutique-dark"
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
            </div>
            <h3 className="card-title text-white font-serif drop-shadow-lg">Inventory Control</h3>
            <p className="text-amber-100">Track items, prices, and availability in real-time</p>
          </div>
        </div>

        <div className="card bg-gradient-to-r from-purple-900 via-purple-950 to-purple-900 shadow-xl hover:shadow-2xl transition-shadow duration-300 border-2 border-boutique-secondary">
          <div className="card-body items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-boutique-secondary to-amber-300 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-boutique-dark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="card-title text-white font-serif drop-shadow-lg">Smart Analytics</h3>
            <p className="text-amber-100">Gain insights with elegant data visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

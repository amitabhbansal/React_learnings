const Home = () => {
  return (
    <div className="hero min-h-[60vh] bg-base-200 rounded-lg">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Welcome to Boutique POS</h1>
          <p className="py-6">
            Manage your boutique inventory, customers, and sales efficiently. Use the navigation
            above to get started.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/add-customer" className="btn btn-primary">
              Add Customer
            </a>
            <a href="/items" className="btn btn-outline">
              View Items
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

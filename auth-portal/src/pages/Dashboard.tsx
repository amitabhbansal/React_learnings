import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  return (
    <div className="container mt-5">
      <div className="text-center mb-4">
        <h1>
          Welcome, <span className="text-primary">{currentUser.username}</span>!
        </h1>
        <p className="lead">
          You are logged in as <strong>{currentUser.role.toUpperCase()}</strong>
        </p>
      </div>

      <div className="row">
        {/* Feature Cards */}
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">User Profile</h5>
              <p className="card-text">
                Manage your personal info and password.
              </p>
              <button className="btn btn-outline-primary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Notifications</h5>
              <p className="card-text">View alerts and system updates.</p>
              <button className="btn btn-outline-primary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Role-based Actions</h5>
              <p className="card-text">Access features based on your role.</p>
              <button className="btn btn-outline-primary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for growth */}
      <div className="mt-5 text-center">
        <p className="text-muted">🚀 More features will be added soon!</p>
      </div>
    </div>
  );
};

export default DashboardPage;

import { useAuth } from "../context/AuthContext";
import { Role } from "../types/User";

const AdminPage = () => {
  const { currentUser, users, changeUserRole } = useAuth();

  const canEdit = currentUser?.role === Role.SUPERADMIN;

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">User Management</h2>

      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            <th>Username</th>
            <th>Role</th>
            {canEdit && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) =>
            user.username === "superadmin" ? null : (
              <tr key={user.username}>
                <td>{user.username}</td>
                <td>{user.role}</td>
                {canEdit && (
                  <td>
                    <select
                      value={user.role}
                      className="form-select"
                      onChange={(e) =>
                        changeUserRole(user.username, e.target.value as Role)
                      }
                    >
                      <option value={Role.USER}>User</option>
                      <option value={Role.ADMIN}>Admin</option>
                    </select>
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>

      <div className="text-muted text-center mt-4">
        {canEdit ? (
          <p>
            🛡️ You are logged in as <strong>Superadmin</strong>. You can
            promote/demote users.
          </p>
        ) : (
          <p>
            👁️ You are logged in as <strong>Admin</strong>. You can view all
            users.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

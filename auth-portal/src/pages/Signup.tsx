// src/pages/SignUp.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Role, type User } from "../types/User";

const SignUpPage = () => {
  const { login, users } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!username.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }

    // Check for duplicate
    const existingUser = users.find((u) => u.username === username.trim());
    if (existingUser) {
      setError("Username already taken.");
      return;
    }

    // Create new user
    const newUser: User = {
      username: username.trim(),
      role: Role.USER, // default role
    };

    // Get users from localStorage
    const storedUsers = localStorage.getItem("users");
    const parsedUsers: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    const updatedUsers = [...parsedUsers, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    // Add to login-only memory store (optional — you can skip this)
    // Then auto-login
    const success = login(newUser.username, password);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Something went wrong during login.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="card-title text-center mb-4">Sign Up</h3>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    placeholder="Choose username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Choose password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                  />
                </div>

                {error && <div className="text-danger mb-3">{error}</div>}

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary">
                    Register
                  </button>
                </div>
              </form>

              <p className="mt-3 text-center">
                Already have an account? <a href="/">Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

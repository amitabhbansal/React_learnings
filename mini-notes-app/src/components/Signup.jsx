import { useState } from "react";
import appwrite from "../appwrite/config";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const user = await appwrite.createAccount(email, password, name);
      alert("✅ Account created! You can now log in.");
      console.log(user);
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div className="min-vh-100 bg-dark text-light d-flex justify-content-center align-items-center">
      <form
        onSubmit={handleSignup}
        className="p-4 rounded shadow-lg bg-secondary"
        style={{ minWidth: "350px" }}
      >
        <h2 className="text-center mb-4">Create Account</h2>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-control bg-dark text-light border-secondary"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-control bg-dark text-light border-secondary"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control bg-dark text-light border-secondary"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-outline-light w-100">
          Sign Up
        </button>
      </form>
    </div>
  );
}

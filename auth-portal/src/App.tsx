import { Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import AdminPage from "./pages/Admin";
import NotFoundPage from "./pages/NotFound";
import RequireAuth from "./authentication/RequireAuth";
import RequireRole from "./authentication/RequireRole";
import { Role } from "./types/User";
import Navbar from "./components/Navbar";
import SignUpPage from "./pages/Signup";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <AuthProvider>
      <Navbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireRole allowedRoles={[Role.ADMIN, Role.SUPERADMIN]}>
                <AdminPage />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

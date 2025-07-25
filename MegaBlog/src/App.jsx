import { useState, useEffect } from "react";
import "./App.css";
import { useDispatch } from "react-redux";
import { Header, Footer } from "./components";
import authService from "./appwrite/auth";
import { login, logout } from "./store/authSlice";
import { Outlet } from "react-router-dom";
function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((userData) => {
        if (userData) {
          dispatch(login({ userData }));
        } else {
          dispatch(logout());
        }
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="min-h-screen flex flex-wrap content-between bg-gray-400">
        <div className="w-full block">
          <Header />
          <main>{/* <Outlet/> */}</main>
          <Footer />
        </div>
      </div>
    );
  }
}

export default App;

import "./App.css";
import Signup from "./components/Signup";
import { ToastContainer } from "react-toastify";
function App() {
  return (
    <>
      <Signup />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        theme="dark"
      />
    </>
  );
}

export default App;

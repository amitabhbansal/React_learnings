import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./pages/about";
import Home from "./pages/home";
import Contact from "./pages/Contact";
import Team from "./pages/Team";
import Mission from "./pages/Mission";
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />}>
            <Route path="team" element={<Team />} />
            <Route path="mission" element={<Mission />} />
          </Route>
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

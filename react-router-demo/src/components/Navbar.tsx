import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkStyle = ({ isActive }: { isActive: boolean }) => ({
    marginRight: "1rem",
    textDecoration: isActive ? "underline" : "none",
    color: isActive ? "blue" : "black",
  });

  return (
    <nav style={{ background: "#eee", padding: "1rem" }}>
      <NavLink to="/" style={linkStyle} end>
        Home
      </NavLink>
      <NavLink to="/about" style={linkStyle}>
        About
      </NavLink>
      <NavLink to="/contact" style={linkStyle}>
        Contact
      </NavLink>
    </nav>
  );
};

export default Navbar;

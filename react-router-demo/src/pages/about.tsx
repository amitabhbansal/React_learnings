import { Outlet, NavLink } from "react-router-dom";

const About = () => {
  const subLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    marginRight: "1rem",
    fontWeight: isActive ? "bold" : "normal",
  });

  return (
    <div>
      <h2>About Page</h2>
      <nav>
        <NavLink to="team" style={subLinkStyle}>
          Team
        </NavLink>
        <NavLink to="mission" style={subLinkStyle}>
          Mission
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
};

export default About;

import { Link } from "react-router-dom";
import { FaUser, FaTools, FaHome } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="d-flex flex-column bg-dark text-white p-3 vh-100" style={{ width: "250px" }}>
      <h3 className="text-center">Admin Panel</h3>
      <ul className="nav flex-column mt-3">
        <li className="nav-item">
          <Link to="/employees" className="nav-link text-white">
            <FaUser className="me-2" /> Angajați
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/tools" className="nav-link text-white">
            <FaTools className="me-2" /> Scule
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

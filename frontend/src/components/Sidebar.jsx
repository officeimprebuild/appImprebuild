import { Link } from "react-router-dom";
import { FaUser, FaTools, FaHome } from "react-icons/fa";
import "../styles/Sidebar.css"; // New CSS file

const Sidebar = () => {
  return (
    <div className="sidebar d-flex flex-column text-white p-3">
      <h3 className="text-center mb-4">Admin Panel</h3>
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link to="/" className="nav-link text-white d-flex align-items-center">
            <FaHome className="me-2" /> Acasă
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/employees" className="nav-link text-white d-flex align-items-center">
            <FaUser className="me-2" /> Angajați
          </Link>
        </li>
        <li className="nav-item">
          <Link to="/tools" className="nav-link text-white d-flex align-items-center">
            <FaTools className="me-2" /> Scule
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "../styles/DashboardLayout.css"; // Updated path

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="dashboard-layout">
      {/* Hamburger Menu for Mobile */}
      <button
        className="sidebar-toggle d-md-none"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`sidebar-container ${isSidebarOpen ? "open" : ""}`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="content-container flex-grow-1 p-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
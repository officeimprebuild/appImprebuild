import Sidebar from "./Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4" style={{ minHeight: "100vh", width: "100%" }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;

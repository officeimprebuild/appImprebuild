import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Employees from "./pages/Employees";
import Tools from "./pages/Tools";

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/tools" element={<Tools />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;

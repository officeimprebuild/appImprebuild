import { useState } from "react";
import EmployeeList from "../components/EmployeeList";
import AddEmployeeForm from "../components/AddEmployeeForm";

const Employees = () => {
  const [refresh, setRefresh] = useState(false);

  // 📌 Funcție pentru reîmprospătarea listei de angajați după adăugare
  const handleEmployeeAdded = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="container mt-4">
      <h2>Gestionare Angajați</h2>
      <AddEmployeeForm onEmployeeAdded={handleEmployeeAdded} />
      <EmployeeList key={refresh} />
    </div>
  );
};

export default Employees;

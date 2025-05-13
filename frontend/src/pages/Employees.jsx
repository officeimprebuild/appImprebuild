import { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import EmployeeList from "../components/EmployeeList";
import AddEmployeeForm from "../components/AddEmployeeForm";
import axios from "axios";
import "../styles/Employees.css";

const Employees = () => {
  const [refresh, setRefresh] = useState(false);

  const handleEmployeeAdded = () => {
    setRefresh(!refresh);
  };

  const handleDownloadSizes = () => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/export/employees/clothes-sizes`, {
        responseType: "blob",
      })
      .then((response) => {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "marimi_angajati.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("❌ Eroare la descărcarea fișierului:", err);
      });
  };

  return (
    <Container fluid className="employees-container mt-2 p-2">
      <h2 className="mb-4 text-center">Gestionare Angajați</h2>

      {/* Adaugă + Export Buttons */}
      <Row className="justify-content-center mb-3">
        <Col xs={12} md={8} lg={6}>
          <div className="button-pair-wrapper">
            <div>
              <AddEmployeeForm onEmployeeAdded={handleEmployeeAdded} />
            </div>
            <Button className="employee-button" onClick={handleDownloadSizes}>
              📥 Descarcă Mărimi
            </Button>
          </div>
        </Col>
      </Row>

      {/* Lista angajați */}
      <Row className="justify-content-center">
        <Col xs={12} md={10}>
          <EmployeeList key={refresh} />
        </Col>
      </Row>
    </Container>
  );
};

export default Employees;

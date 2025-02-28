import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import EmployeeList from "../components/EmployeeList";
import AddEmployeeForm from "../components/AddEmployeeForm";
import "../styles/Employees.css"; // New CSS file

const Employees = () => {
  const [refresh, setRefresh] = useState(false);

  const handleEmployeeAdded = () => {
    setRefresh(!refresh);
  };

  return (
    <Container fluid className="employees-container mt-2 p-2">
      <h2 className="mb-4 text-center">Gestionare Angajați</h2>
      <Row>
        <Col xs={12} className="mb-4">
          <AddEmployeeForm onEmployeeAdded={handleEmployeeAdded} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <EmployeeList key={refresh} />
        </Col>
      </Row>
    </Container>
  );
};

export default Employees;
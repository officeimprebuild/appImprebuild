import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ToolList from "../components/ToolList";
import AddToolForm from "../components/AddToolForm";
import AddAssignedToolForm from "../components/AddAssignedToolForm";
import "../styles/Tools.css"; // New CSS file

const Tools = () => {
  const [refresh, setRefresh] = useState(false);

  const handleToolAdded = () => setRefresh(!refresh);
  const handleToolAssigned = () => setRefresh(!refresh);

  return (
    <Container fluid className="tools-container mt-2 p-2">
      <h2 className="mb-4 text-center">Gestionare Scule</h2>

      {/* Forms in a responsive grid */}
      <Row className="mb-4">
        <Col md={6} className="mb-3 mb-md-0">
          <AddToolForm onToolAdded={handleToolAdded} buttonColor="success" />
        </Col>
        <Col md={6}>
          <AddAssignedToolForm onToolAssigned={handleToolAssigned} buttonColor="primary" />
        </Col>
      </Row>

      {/* Tool List */}
      <ToolList key={refresh} onToolUpdated={handleToolAdded} />
    </Container>
  );
};

export default Tools;
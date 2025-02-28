import { Container, Row, Col, Card } from "react-bootstrap";
import { FaUser, FaTools } from "react-icons/fa";
import { Link } from "react-router-dom"; // Optional for navigation
import "../styles/DashboardHome.css"; // New CSS file

const DashboardHome = () => {
  return (
    <Container fluid className="dashboard-home-container mt-2 p-2">
      <h2 className="mb-4 text-center">Bine ai venit în Admin Dashboard</h2>
      <p className="text-center mb-4">Alege o secțiune pentru a începe:</p>
      <Row className="justify-content-center">
        <Col md={4} sm={6} xs={12} className="mb-4">
          <Link to="/employees" className="text-decoration-none">
            <Card className="dashboard-card">
              <Card.Body className="text-center">
                <FaUser size={50} className="mb-3 text-purple" />
                <Card.Title>Angajați</Card.Title>
                <Card.Text>Gestionare angajați</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
        <Col md={4} sm={6} xs={12} className="mb-4">
          <Link to="/tools" className="text-decoration-none">
            <Card className="dashboard-card">
              <Card.Body className="text-center">
                <FaTools size={50} className="mb-3 text-primary" />
                <Card.Title>Scule</Card.Title>
                <Card.Text>Gestionare scule</Card.Text>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardHome;
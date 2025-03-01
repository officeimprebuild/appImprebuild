import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Col, Row } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import EditToolForm from "./EditToolForm";
import "../styles/ToolList.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ToolList = ({ onToolUpdated }) => {
  const [tools, setTools] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState({});
  const [editTool, setEditTool] = useState(null); // For modal

  useEffect(() => {
    fetchTools();
  }, [onToolUpdated]);

  const fetchTools = () => {
    axios
      .get(`${API_URL}/api/tools`)
      .then((response) => {
        setTools(response.data);
        fetchAssignedEmployees();
      })
      .catch((error) => console.error("Eroare la preluarea sculelor:", error));
  };

  const fetchAssignedEmployees = () => {
    axios
      .get(`${API_URL}/api/assigned-tools`)
      .then((response) => {
        const employeesByTool = {};
        response.data.forEach((assignment) => {
          if (assignment.id_scula && assignment.id_angajat) {
            if (!employeesByTool[assignment.id_scula._id]) {
              employeesByTool[assignment.id_scula._id] = [];
            }
            employeesByTool[assignment.id_scula._id].push(assignment.id_angajat.nume);
          }
        });
        setAssignedEmployees(employeesByTool);
      })
      .catch((error) => console.error("Eroare la preluarea angajaților atribuiți:", error));
  };

  const handleDelete = (id) => {
    if (window.confirm("Sigur vrei să ștergi această sculă?")) {
      axios
        .delete(`${API_URL}/api/tools/${id}`)
        .then(() => {
          fetchTools();
          onToolUpdated();
        })
        .catch((error) => console.error("Eroare la ștergerea sculei:", error));
    }
  };

  const handleExportExcel = () => {
    try {
      window.location.href = `${API_URL}/api/tools/export/excel`;
    } catch (error) {
      console.error("Eroare la exportul în Excel:", error);
    }
  };

  return (
    <div className="tool-list-container mt-3">
      <h2 className="mb-4">Inventar</h2>
      <Button variant="success" onClick={handleExportExcel} className="mb-4">
        Exportă în Excel
      </Button>

      <Row>
        {tools.length > 0 ? (
          tools.map((tool) => (
            <Col key={tool._id} md={4} sm={6} xs={12} className="mb-4">
              <Card className="tool-card">
                <Card.Body>
                  <Card.Title>{tool.nume}</Card.Title>
                  <Card.Text>
                    <strong>Serie:</strong> {tool.serie || "N/A"}<br />
                    <strong>Cantitate:</strong> {tool.cantitate}<br />
                    <strong>Data Achiziției:</strong> {new Date(tool.data_achizicie).toLocaleDateString()}<br />
                    <strong>Garanție Expiră:</strong> {tool.garantie_expira ? new Date(tool.garantie_expira).toLocaleDateString() : "N/A"}<br />
                    <strong>Preț Achiziție:</strong> {tool.pret_achizicie} RON<br />
                    <strong>Atribuită la:</strong>{" "}
                    {assignedEmployees[tool._id]?.length > 0 ? (
                      assignedEmployees[tool._id].join(", ")
                    ) : (
                      <span className="text-muted">Neatribuită</span>
                    )}
                  </Card.Text>
                  <div className="d-flex gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => setEditTool(tool)}
                      title="Editează"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(tool._id)}
                      title="Șterge"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
              {editTool && editTool._id === tool._id && (
                <EditToolForm
                  tool={editTool}
                  onToolUpdated={() => {
                    fetchTools();
                    setEditTool(null);
                  }}
                  show={editTool && editTool._id === tool._id}
                  onHide={() => setEditTool(null)}
                />
              )}
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-center">Nicio sculă găsită.</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default ToolList;
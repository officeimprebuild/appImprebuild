import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Col, Row } from "react-bootstrap";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";
import EditEmployeeForm from "./EditEmployeeForm";
import "../styles/EmployeeList.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const EmployeeList = ({ onEmployeeUpdated }) => {
  const [employees, setEmployees] = useState([]);
  const [assignedTools, setAssignedTools] = useState({});
  const [editEmployee, setEditEmployee] = useState(null); // For modal
  const currentDate = new Date().toLocaleDateString("ro-RO").replace(/\//g, "-");

  useEffect(() => {
    fetchEmployees();
  }, [onEmployeeUpdated]);

  const fetchEmployees = () => {
    axios
      .get(`${API_URL}/api/employees`)
      .then((response) => {
        setEmployees(response.data);
        fetchAssignedTools();
      })
      .catch((error) => console.error("Eroare la preluarea angajaților:", error));
  };

  const fetchAssignedTools = () => {
    axios
      .get(`${API_URL}/api/assigned-tools`)
      .then((response) => {
        const toolsByEmployee = {};
        response.data.forEach((assignment) => {
          if (assignment.id_angajat && assignment.id_scula) {
            if (!toolsByEmployee[assignment.id_angajat._id]) {
              toolsByEmployee[assignment.id_angajat._id] = [];
            }
            toolsByEmployee[assignment.id_angajat._id].push(`${assignment.id_scula.nume}, ${assignment.id_scula.serie || "Fără serie"}`);
          }
        });
        setAssignedTools(toolsByEmployee);
      })
      .catch((error) => console.error("Eroare la preluarea sculelor atribuite:", error));
  };

  const handleDelete = (id) => {
    if (window.confirm("Sigur vrei să ștergi acest angajat?")) {
      axios
        .delete(`${API_URL}/api/employees/${id}`)
        .then(() => {
          fetchEmployees();
          if (onEmployeeUpdated) onEmployeeUpdated();
        })
        .catch((error) => console.error("Eroare la ștergere:", error));
    }
  };

  const handleExport = (employee) => {
    axios
      .get(`${API_URL}/api/export/employee/${employee._id}`, {
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Proces_Verbal_${employee.nume}_${currentDate}.docx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => console.error("Eroare la export:", error));
  };

  return (
    <div className="employee-list-container mt-3">
      <h2 className="mb-4">Lista Angajaților</h2>
      <Row>
        {employees.length > 0 ? (
          employees.map((employee) => (
            <Col key={employee._id} md={4} sm={6} xs={12} className="mb-4">
              <Card className="employee-card">
                <Card.Body>
                  <Card.Title>{employee.nume}</Card.Title>
                  <Card.Text>
                    <strong>Telefon:</strong> {employee.telefon}<br />
                    <strong>Companie:</strong> {employee.companie || "N/A"}<br />
                    <strong>Status:</strong> {employee.status ? "Activ" : "Inactiv"}<br />
                    <strong>Scule Atribuite:</strong>{" "}
                    {assignedTools[employee._id]?.length > 0 ? (
                      assignedTools[employee._id].join(" | ")
                    ) : (
                      <span className="text-muted">Nicio sculă atribuită</span>
                    )}
                  </Card.Text>
                  <div className="d-flex gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => setEditEmployee(employee)}
                      title="Editează"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(employee._id)}
                      title="Șterge"
                    >
                      <FaTrash />
                    </Button>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleExport(employee)}
                      title="Exportă"
                    >
                      <FaDownload />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
              {editEmployee && editEmployee._id === employee._id && (
                <EditEmployeeForm
                  employee={editEmployee}
                  onEmployeeUpdated={() => {
                    fetchEmployees();
                    setEditEmployee(null);
                  }}
                  show={editEmployee && editEmployee._id === employee._id}
                  onHide={() => setEditEmployee(null)}
                />
              )}
            </Col>
          ))
        ) : (
          <Col>
            <p className="text-center">Niciun angajat găsit.</p>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default EmployeeList;
import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Button, Col, Alert, Modal } from "react-bootstrap";

const ReturnToolForm = ({ onToolReturned }) => {
  const [show, setShow] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [assignedTools, setAssignedTools] = useState([]);
  const [selectedAssignedTool, setSelectedAssignedTool] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  console.log("Rendering ReturnToolForm:", { show, selectedEmployee, selectedAssignedTool, returnQuantity });

  useEffect(() => {
    fetchEmployees();
    console.log("Effect triggered for employees");
  }, []); // Only run once on mount, like AddToolForm

  useEffect(() => {
    if (selectedEmployee && show) {
      fetchAssignedTools(selectedEmployee);
    } else {
      resetForm();
    }
    console.log("Effect triggered for tools:", { selectedEmployee, show });
  }, [selectedEmployee, show]); // Ensure these dependencies trigger re-renders

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
      console.log("Employees fetched:", res.data);
    } catch (error) {
      console.error("❌ Eroare la preluarea angajaților:", error);
      setErrorMessage("Eroare la preluarea angajaților");
    }
  };

  const fetchAssignedTools = async (employeeId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/assigned-tools/employee/${employeeId}`);
      console.log("📢 Scule atribuite primite:", res.data);
      setAssignedTools(res.data);
      setSelectedAssignedTool("");
      setReturnQuantity(0);
      setErrorMessage("");
    } catch (error) {
      console.error("❌ Eroare la preluarea sculelor atribuite:", error);
      setErrorMessage("Eroare la preluarea sculelor atribuite");
    }
  };

  const getSelectedToolDetails = () => {
    return assignedTools.find((assign) => assign.id_scula._id === selectedAssignedTool) || {};
  };

  const handleToolSelection = (e) => {
    const toolId = e.target.value;
    setSelectedAssignedTool(toolId);
    const toolDetails = assignedTools.find((assign) => assign.id_scula._id === toolId);
    if (toolId && toolDetails?.cantitate_atribuita) {
      setReturnQuantity(toolDetails.cantitate_atribuita);
    } else {
      setReturnQuantity(0);
    }
    setErrorMessage("");
    console.log("Tool selected:", { toolId, returnQuantity });
  };

  const resetForm = () => {
    setAssignedTools([]);
    setSelectedAssignedTool("");
    setReturnQuantity(0);
    setErrorMessage("");
    console.log("Form reset");
  };

  const handleReturnTool = async (action = "return") => {
    if (!selectedEmployee || !selectedAssignedTool) {
      setErrorMessage("Te rog selectează un angajat și o sculă de returnat!");
      return;
    }

    const toolDetails = getSelectedToolDetails();
    const toolType = toolDetails.id_scula?.tip;

    let finalReturnQuantity;
    if (toolType === "scula-cu-serie") {
      finalReturnQuantity = 1;
    } else if (toolType === "scula-primara") {
      finalReturnQuantity = returnQuantity;
      const maxReturnable = toolDetails.cantitate_atribuita || 0;

      if (finalReturnQuantity <= 0) {
        setErrorMessage("Cantitatea de returnat trebuie să fie mai mare decât 0!");
        return;
      }

      if (finalReturnQuantity > maxReturnable) {
        setErrorMessage(`Nu poți returna mai mult decât ai atribuit! Disponibil: ${maxReturnable}`);
        return;
      }
    } else {
      setErrorMessage("Tipul sculei nu este valid!");
      return;
    }

    try {
      console.log(`📤 Trimitere cerere ${action}:`, {
        angajatId: selectedEmployee,
        sculaId: selectedAssignedTool,
        cantitate_atribuita: finalReturnQuantity,
        action,
      });
      const response = await axios.post("http://localhost:5000/api/assigned-tools/return", {
        angajatId: selectedEmployee,
        sculaId: selectedAssignedTool,
        cantitate_atribuita: finalReturnQuantity,
        action,
      });
      console.log(`✅ Răspuns server ${action}:`, response.data);
      await fetchAssignedTools(selectedEmployee);
      onToolReturned();
      setShow(false);
      resetForm();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || `Eroare la ${action}-ul sculei`);
      console.error("❌ Eroare:", error);
    }
  };

  return (
    <Container fluid className="p-2">
      <Col xs={12} className="d-flex justify-content-center mb-3">
        <Button
          variant="primary"
          onClick={() => setShow(true)}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Returnează Sculă
        </Button>
      </Col>

      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          resetForm();
        }}
        size="sm"
        centered
        dialogClassName="mobile-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Returnare Scule</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {errorMessage && (
            <Alert variant="danger" className="text-center">
              {errorMessage}
            </Alert>
          )}
          <Form.Group className="mb-2">
            <Form.Label>Angajat</Form.Label>
            <Form.Select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{ fontSize: "14px", padding: "10px" }}
            >
              <option value="">Selectează un angajat</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.nume}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Sculă</Form.Label>
            <Form.Select
              value={selectedAssignedTool}
              onChange={handleToolSelection}
              style={{ fontSize: "14px", padding: "10px" }}
            >
              <option value="">Selectează o sculă de returnat</option>
              {assignedTools.length > 0 ? (
                assignedTools.map((assign) => (
                  <option key={`${assign._id}-${assign.id_scula._id}`} value={assign.id_scula._id}>
                    {`${assign.id_scula.nume} - ${assign.id_scula.serie || "Fără serie"} (${assign.cantitate_atribuita} atribuite)`}
                  </option>
                ))
              ) : (
                <option disabled>
                  {selectedEmployee ? "Nicio sculă atribuită" : "Selectează un angajat mai întâi"}
                </option>
              )}
            </Form.Select>
          </Form.Group>

          {selectedAssignedTool && (
            <>
              {getSelectedToolDetails().id_scula?.tip === "scula-primara" && (
                <Form.Group className="mb-2">
                  <Form.Label>Cantitate Returnată</Form.Label>
                  <Form.Select
                    value={returnQuantity}
                    onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 0)}
                    style={{ fontSize: "14px", padding: "10px" }}
                  >
                    {Array.from(
                      { length: getSelectedToolDetails().cantitate_atribuita || 1 },
                      (_, i) => i + 1
                    ).map((qty) => (
                      <option key={qty} value={qty}>
                        {qty}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              {getSelectedToolDetails().id_scula?.tip === "scula-cu-serie" && (
                <div className="mb-2">
                  <Form.Label>Cantitate Returnată: </Form.Label>
                  <span className="ms-2">1 (fix pentru scule cu serie)</span>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setShow(false);
              resetForm();
            }}
            className="w-100"
            style={{ padding: "10px", fontSize: "16px" }}
          >
            Anulează
          </Button>
          <Button
            variant="primary"
            onClick={() => handleReturnTool("return")}
            className="w-100"
            style={{ padding: "10px", fontSize: "16px" }}
          >
            Returnează
          </Button>
          <Button
            variant="danger"
            onClick={() => handleReturnTool("delete")}
            className="w-100"
            style={{ padding: "10px", fontSize: "16px" }}
          >
            Șterge Tool
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        @media (max-width: 576px) {
          h3 {
            font-size: 1.2rem;
          }
          .form-select {
            font-size: 0.9rem;
            padding: 8px;
          }
          .form-label {
            font-size: 0.9rem;
          }
          .btn {
            font-size: 0.9rem;
            padding: 8px;
          }
          .gap-2 {
            gap: 1rem;
          }
          .alert {
            font-size: 0.9rem;
            padding: 0.5rem;
          }
          .mobile-modal {
            width: 90vw !important;
            margin: 0 auto;
          }
          .modal-title {
            font-size: 1rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default ReturnToolForm;
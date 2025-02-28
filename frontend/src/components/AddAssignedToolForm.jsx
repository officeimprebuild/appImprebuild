import { useState, useEffect } from "react";
import { Button, Modal, Form, Container, Col, Alert } from "react-bootstrap";
import axios from "axios";

const AddAssignedToolForm = ({ onToolAssigned }) => {
  const [show, setShow] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [tools, setTools] = useState([]);
  const [assignedTools, setAssignedTools] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1); // For assigning quantity
  const [returnEmployee, setReturnEmployee] = useState("");
  const [returnTool, setReturnTool] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(1); // For returning/deleting quantity
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchEmployees();
    fetchTools();
    fetchAssignedTools();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (err) {
      console.error("❌ Eroare la preluarea angajaților:", err);
    }
  };

  const fetchTools = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tools/unassigned");
      setTools(res.data);
    } catch (err) {
      console.error("❌ Eroare la preluarea sculelor:", err);
    }
  };

  const fetchAssignedTools = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/assigned-tools");
      const toolsByEmployee = {};
      res.data.forEach((assign) => {
        if (assign.id_angajat && assign.id_scula) {
          if (!toolsByEmployee[assign.id_angajat._id]) {
            toolsByEmployee[assign.id_angajat._id] = [];
          }
          toolsByEmployee[assign.id_angajat._id].push({
            _id: assign.id_scula._id,
            nume: assign.id_scula.nume || "Nume indisponibil",
            serie: assign.id_scula.serie || "Serie indisponibilă",
            cantitate_atribuita: assign.cantitate_atribuita || 1,
            tip: assign.id_scula.tip,
          });
        }
      });
      setAssignedTools(toolsByEmployee);
    } catch (err) {
      console.error("❌ Eroare la preluarea sculelor atribuite:", err);
    }
  };

  const getSelectedToolType = (toolId) => {
    const tool = tools.find((t) => t._id === toolId) || assignedTools[returnEmployee]?.find((t) => t._id === toolId);
    return tool ? tool.tip : null;
  };

  const handleAssignTool = async () => {
    if (!selectedEmployee || !selectedTool) {
      setErrorMessage("Te rog selectează un angajat și o sculă!");
      return;
    }

    const toolType = getSelectedToolType(selectedTool);
    const finalQuantity = toolType === "scula-cu-serie" ? 1 : selectedQuantity;

    try {
      await axios.post("http://localhost:5000/api/assigned-tools", {
        id_angajat: selectedEmployee,
        id_scula: selectedTool,
        cantitate_atribuita: finalQuantity,
      });
      await fetchTools();
      await fetchAssignedTools();
      onToolAssigned();
      setShow(false);
      setSelectedEmployee("");
      setSelectedTool("");
      setSelectedQuantity(1);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Eroare la atribuire");
      console.error(err);
    }
  };

  const handleReturnTool = async (action = "return") => {
    if (!returnEmployee || !returnTool) {
      setErrorMessage("Te rog selectează un angajat și o sculă de returnat!");
      return;
    }

    const toolDetails = assignedTools[returnEmployee]?.find((t) => t._id === returnTool) || {};
    const toolType = toolDetails.tip;
    let finalReturnQuantity = toolType === "scula-cu-serie" ? 1 : returnQuantity;

    if (toolType === "scula-primara") {
      const maxReturnable = toolDetails.cantitate_atribuita || 0;
      if (finalReturnQuantity <= 0) {
        setErrorMessage("Cantitatea de returnat/șters trebuie să fie mai mare decât 0!");
        return;
      }
      if (finalReturnQuantity > maxReturnable) {
        setErrorMessage(`Nu poți returna/șterge mai mult decât ai atribuit! Disponibil: ${maxReturnable}`);
        return;
      }
    }

    try {
      console.log(`📤 Trimitere cerere ${action}:`, {
        angajatId: returnEmployee,
        sculaId: returnTool,
        cantitate_atribuita: finalReturnQuantity,
        action,
      });
      const response = await axios.post("http://localhost:5000/api/assigned-tools/return", {
        angajatId: returnEmployee,
        sculaId: returnTool,
        cantitate_atribuita: finalReturnQuantity,
        action,
      });
      console.log(`✅ Răspuns server ${action}:`, response.data);
      await fetchTools();
      await fetchAssignedTools();
      onToolAssigned();
      setShowReturnModal(false);
      setReturnEmployee("");
      setReturnTool("");
      setReturnQuantity(1);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || `Eroare la ${action}-ul sculei`);
      console.error("❌ Eroare:", error);
    }
  };

  return (
    <Container fluid className="p-2">
      <Col xs={12} className="d-flex flex-column flex-md-row justify-content-center gap-2 mb-3">
        <Button
          variant="primary"
          onClick={() => setShow(true)}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Atribuie o Sculă
        </Button>
        <Button
          variant="primary"
          onClick={() => setShowReturnModal(true)}
          style={{ padding: "10px 20px", fontSize: "16px", backgroundColor: "orange" }}
        >
          Returnează/Șterge o Sculă
        </Button>
      </Col>

      {/* Assign Tool Modal */}
      <Modal
        show={show}
        onHide={() => {
          setShow(false);
          setErrorMessage("");
        }}
        size="sm"
        centered
        dialogClassName="mobile-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Atribuie o Sculă</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form.Group className="mb-2">
            <Form.Label>Angajat</Form.Label>
            <Form.Control
              as="select"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              style={{ fontSize: "14px", padding: "10px" }}
            >
              <option value="">Selectează un angajat</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.nume}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Sculă</Form.Label>
            <Form.Control
              as="select"
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              style={{ fontSize: "14px", padding: "10px" }}
            >
              <option value="">Selectează o sculă</option>
              {tools.map((tool) => (
                <option key={tool._id} value={tool._id}>
                  {`${tool.nume}, ${tool.serie || "N/A"} (${tool.cantitate} disponibile)`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          {getSelectedToolType(selectedTool) === "scula-primara" && (
            <Form.Group className="mb-2">
              <Form.Label>Cantitate</Form.Label>
              <Form.Control
                type="number"
                value={selectedQuantity}
                min="1"
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                style={{ fontSize: "14px", padding: "10px" }}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column gap-2">
         
          <Button
            variant="primary"
            onClick={handleAssignTool}
            className="w-100"
            style={{ padding: "10px", fontSize: "16px" }}
          >
            Atribuie
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Return Tool Modal */}
      <Modal
        show={showReturnModal}
        onHide={() => {
          setShowReturnModal(false);
          setErrorMessage("");
        }}
        size="sm"
        centered
        dialogClassName="mobile-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Returnează/Șterge o Sculă</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form.Group className="mb-2">
            <Form.Label>Angajat</Form.Label>
            <Form.Control
              as="select"
              value={returnEmployee}
              onChange={(e) => setReturnEmployee(e.target.value)}
              style={{ fontSize: "14px", padding: "10px" }}
            >
              <option value="">Selectează un angajat</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.nume}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Sculă</Form.Label>
            <Form.Control
              as="select"
              value={returnTool}
              onChange={(e) => setReturnTool(e.target.value)}
              style={{ fontSize: "14px", padding: "10px" }}
            >
              <option value="">Selectează o sculă</option>
              {(assignedTools[returnEmployee] || []).map((tool) => (
                <option key={tool._id} value={tool._id}>
                  {`${tool.nume}, ${tool.serie || "N/A"} (${tool.cantitate_atribuita} atribuite)`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          {getSelectedToolType(returnTool) === "scula-primara" && (
            <Form.Group className="mb-2">
              <Form.Label>Cantitate Returnată/Ștersă</Form.Label>
              <Form.Select
                value={returnQuantity}
                onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
                style={{ fontSize: "14px", padding: "10px" }}
              >
                {Array.from({ length: (assignedTools[returnEmployee]?.find((t) => t._id === returnTool)?.cantitate_atribuita) || 1 }, (_, i) => i + 1).map((qty) => (
                  <option key={qty} value={qty}>
                    {qty}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex flex-column gap-2">
          
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
            Șterge Tool (Cantitate Specifică)
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        @media (max-width: 576px) {
          .mobile-modal {
            width: 90vw !important;
            margin: 0 auto;
          }
          .modal-title {
            font-size: 1rem;
          }
          .form-label {
            font-size: 0.9rem;
          }
          .form-control, .form-select {
            font-size: 0.9rem;
            padding: 8px;
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
        }
      `}</style>
    </Container>
  );
};

export default AddAssignedToolForm;
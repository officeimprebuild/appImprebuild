import { useState, useEffect } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import axios from "axios";

const AddAssignedToolForm = ({ onToolAssigned }) => {
  const [show, setShow] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [tools, setTools] = useState([]);
  const [assignedTools, setAssignedTools] = useState({});
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [returnEmployee, setReturnEmployee] = useState("");
  const [returnTool, setReturnTool] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(1);
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
            _id: assign.id_scula._id, // Use id_scula._id as a unique key
            nume: assign.id_scula.nume || "Nume indisponibil",
            serie: assign.id_scula.serie || "Serie indisponibilă",
            cantitate_atribuita: assign.cantitate_atribuita,
            tip: assign.id_scula.tip,
          });
        }
      });
      setAssignedTools(toolsByEmployee);
    } catch (err) {
      console.error("❌ Eroare la preluarea sculelor atribuite:", err);
    }
  };

  const getSelectedToolType = () => {
    const tool = tools.find((t) => t._id === selectedTool);
    return tool ? tool.tip : null;
  };

  const getReturnToolDetails = () => {
    const toolsForEmployee = assignedTools[returnEmployee] || [];
    return toolsForEmployee.find((t) => t._id === returnTool) || {};
  };

  const handleReturnToolChange = (e) => {
    const toolId = e.target.value;
    setReturnTool(toolId);
    const toolDetails = getReturnToolDetails();
    if (toolId && toolDetails.cantitate_atribuita) {
      setReturnQuantity(toolDetails.cantitate_atribuita);
    } else {
      setReturnQuantity(1);
    }
    setErrorMessage("");
  };

  const handleAssignTool = async () => {
    const toolType = getSelectedToolType();
    const finalQuantity = toolType === "scula-cu-serie" ? 1 : selectedQuantity;

    try {
      await axios.post("http://localhost:5000/api/assigned-tools", {
        id_angajat: selectedEmployee,
        id_scula: selectedTool,
        cantitate_atribuita: finalQuantity,
      });
      onToolAssigned();
      setShow(false);
      setSelectedEmployee("");
      setSelectedTool("");
      setSelectedQuantity(1);
      await fetchTools();
      await fetchAssignedTools();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Eroare la atribuire");
      console.error(err);
    }
  };

  const handleReturnTool = async () => {
    const toolDetails = getReturnToolDetails();
    const maxReturnable = toolDetails.cantitate_atribuita || 0;

    if (returnQuantity > maxReturnable) {
      setErrorMessage(`Nu poți returna mai mult decât ai atribuit! Disponibil: ${maxReturnable}`);
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/assigned-tools/return", {
        angajatId: returnEmployee,
        sculaId: returnTool,
        cantitate_atribuita: returnQuantity,
      });
      onToolAssigned();
      setShowReturnModal(false);
      setReturnEmployee("");
      setReturnTool("");
      setReturnQuantity(1);
      setErrorMessage("");
      await fetchTools();
      await fetchAssignedTools();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Eroare la returnare");
      console.error(err);
    }
  };

  return (
    <>
      <div className="mb-3">
        <Button variant="primary" onClick={() => setShow(true)}>
          Atribuie o Sculă
        </Button>{" "}
        <Button variant="warning" onClick={() => setShowReturnModal(true)}>
          Returnează o Sculă
        </Button>
      </div>

      {/* Assign Modal */}
      <Modal show={show} onHide={() => { setShow(false); setErrorMessage(""); }}>
        <Modal.Header closeButton><Modal.Title>Atribuie o Sculă</Modal.Title></Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form.Group>
            <Form.Label>Angajat</Form.Label>
            <Form.Control as="select" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
              <option value="">Selectează un angajat</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.nume}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Sculă</Form.Label>
            <Form.Control as="select" value={selectedTool} onChange={(e) => setSelectedTool(e.target.value)}>
              <option value="">Selectează o sculă</option>
              {tools.map((tool) => (
                <option key={tool._id} value={tool._id}>
                  {`${tool.nume}, ${tool.serie || "N/A"} (${tool.cantitate} disponibile)`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          {getSelectedToolType() === "scula-primara" && (
            <Form.Group>
              <Form.Label>Cantitate</Form.Label>
              <Form.Control
                type="number"
                value={selectedQuantity}
                min="1"
                onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShow(false); setErrorMessage(""); }}>Anulează</Button>
          <Button variant="primary" onClick={handleAssignTool}>Atribuie</Button>
        </Modal.Footer>
      </Modal>

      {/* Return Modal */}
      <Modal show={showReturnModal} onHide={() => { setShowReturnModal(false); setErrorMessage(""); }}>
        <Modal.Header closeButton><Modal.Title>Returnează o Sculă</Modal.Title></Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form.Group>
            <Form.Label>Angajat</Form.Label>
            <Form.Control as="select" value={returnEmployee} onChange={(e) => setReturnEmployee(e.target.value)}>
              <option value="">Selectează un angajat</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.nume}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Form.Group>
            <Form.Label>Sculă</Form.Label>
            <Form.Control as="select" value={returnTool} onChange={handleReturnToolChange}>
              <option value="">Selectează o sculă</option>
              {(assignedTools[returnEmployee] || []).map((tool) => (
                <option key={tool._id} value={tool._id}>
                  {`${tool.nume}, ${tool.serie || "N/A"} (${tool.cantitate_atribuita} atribuite)`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          {getReturnToolDetails().tip === "scula-primara" && (
            <Form.Group>
              <Form.Label>Cantitate Returnată</Form.Label>
              <Form.Control
                type="number"
                value={returnQuantity}
                min="1"
                max={getReturnToolDetails().cantitate_atribuita || 1}
                onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
              />
            </Form.Group>
          )}
          {getReturnToolDetails().tip === "scula-cu-serie" && (
            <div style={{ marginTop: "10px" }}>
              <label>Cantitate Returnată: </label>
              <span style={{ marginLeft: "10px" }}>1 (fix pentru scule cu serie)</span>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setShowReturnModal(false); setErrorMessage(""); }}>Anulează</Button>
          <Button variant="primary" onClick={handleReturnTool}>Returnează</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AddAssignedToolForm;
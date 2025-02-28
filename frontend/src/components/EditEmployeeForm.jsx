import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Modal } from "react-bootstrap";
import "../styles/EditEmployeeForm.css"; // New CSS file

const EditEmployeeForm = ({ employee, onEmployeeUpdated, show, onHide }) => {
  const [formData, setFormData] = useState(employee);

  useEffect(() => {
    if (employee) {
      setFormData({
        nume: employee.nume || "",
        telefon: employee.telefon || "",
        companie: employee.companie || "",
        marime_tricou: employee.marime_tricou || "",
        marime_pantaloni: employee.marime_pantaloni || "",
        masura_bocanci: employee.masura_bocanci || "",
        status: employee.status !== undefined ? employee.status : true,
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:5000/api/employees/${employee._id}`, formData)
      .then(() => {
        onEmployeeUpdated();
        onHide(); // Close modal via EmployeeList
      })
      .catch((error) => console.error("Eroare la editare:", error));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editează Angajat</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nume</Form.Label>
            <Form.Control
              type="text"
              name="nume"
              value={formData.nume}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Telefon</Form.Label>
            <Form.Control
              type="text"
              name="telefon"
              value={formData.telefon}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Companie</Form.Label>
            <Form.Control
              type="text"
              name="companie"
              value={formData.companie}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mărime Tricou</Form.Label>
            <Form.Control
              type="text"
              name="marime_tricou"
              value={formData.marime_tricou}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mărime Pantaloni</Form.Label>
            <Form.Control
              type="text"
              name="marime_pantaloni"
              value={formData.marime_pantaloni}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Măsură Bocanci</Form.Label>
            <Form.Control
              type="text"
              name="masura_bocanci"
              value={formData.masura_bocanci}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={formData.status} onChange={handleChange}>
              <option value={true}>Activ</option>
              <option value={false}>Inactiv</option>
            </Form.Select>
          </Form.Group>
          <Button variant="purple" type="submit" className="w-100">
            Salvează
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditEmployeeForm;
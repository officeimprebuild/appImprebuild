import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Modal } from "react-bootstrap";

const EditEmployeeForm = ({ employee, onEmployeeUpdated }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState(employee);

  useEffect(() => {
    setFormData(employee); // Actualizează datele când schimbăm angajatul
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:5000/api/employees/${employee._id}`, formData)
      .then(() => {
        onEmployeeUpdated(); // Reîmprospătează lista
        setShow(false); // Închide modalul
      })
      .catch((error) => console.error("Eroare la editare:", error));
  };

  return (
    <>
      <Button variant="warning" size="sm" onClick={() => setShow(true)}>
        Editează
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editează Angajat</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nume</Form.Label>
              <Form.Control type="text" name="nume" value={formData.nume} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Telefon</Form.Label>
              <Form.Control type="text" name="telefon" value={formData.telefon} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Companie</Form.Label>
              <Form.Control type="text" name="companie" value={formData.companie} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
                <option value={true}>Activ</option>
                <option value={false}>Inactiv</option>
              </Form.Select>
            </Form.Group>
            <Button variant="success" type="submit">
              Salvează
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default EditEmployeeForm;

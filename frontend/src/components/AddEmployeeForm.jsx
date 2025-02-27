import { useState } from "react";
import axios from "axios";
import { Form, Button, Modal } from "react-bootstrap";

const AddEmployeeForm = ({ onEmployeeAdded }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    nume: "",
    telefon: "",
    companie: "",
    marime_tricou: "",
    marime_pantaloni: "",
    masura_bocanci: "",
    status: true,
  });

  // 📌 Funcție pentru gestionarea schimbărilor în formular
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 📌 Funcție pentru trimiterea datelor la backend
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://localhost:5000/api/employees", formData)
      .then(() => {
        onEmployeeAdded(); // Reîmprospătează lista de angajați
        setShow(false); // Închide formularul
        setFormData({
          nume: "",
          telefon: "",
          companie: "",
          marime_tricou: "",
          marime_pantaloni: "",
          masura_bocanci: "",
          status: true,
        });
      })
      .catch((error) => console.error("Eroare la adăugarea angajatului:", error));
  };

  return (
    <>
      <Button variant="primary" className="mb-3" onClick={() => setShow(true)}>
        + Adaugă Angajat
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adaugă Angajat</Modal.Title>
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
              <Form.Label>Mărime Tricou</Form.Label>
              <Form.Control type="text" name="marime_tricou" value={formData.marime_tricou} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mărime Pantaloni</Form.Label>
              <Form.Control type="text" name="marime_pantaloni" value={formData.marime_pantaloni} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Măsură Bocanci</Form.Label>
              <Form.Control type="text" name="masura_bocanci" value={formData.masura_bocanci} onChange={handleChange} />
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

export default AddEmployeeForm;

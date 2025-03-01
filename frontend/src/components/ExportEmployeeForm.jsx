import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ExportEmployeeForm = () => {
  const [angajati, setAngajati] = useState([]);
  const [angajatId, setAngajatId] = useState("");

  useEffect(() => {
    // Preluăm angajații disponibili
    axios.get(`${API_URL}api/employees`)
      .then((response) => setAngajati(response.data))
      .catch((error) => console.error("Eroare la preluarea angajaților:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Se trimite ID-ul angajatului ales pentru export
    if (angajatId) {
      axios.get(`${API_URL}/api/export/employee/${angajatId}`)
        .then((response) => {
          // Logica de descărcare a fișierului Word
          const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "export_angajat.docx";
          link.click();
        })
        .catch((error) => console.error("Eroare la exportul angajatului:", error));
    } else {
      console.error("ID-ul angajatului nu este selectat");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Angajat</Form.Label>
        <Form.Select value={angajatId} onChange={(e) => setAngajatId(e.target.value)}>
          <option value="">Selectează un angajat</option>
          {angajati.map((angajat) => (
            <option key={angajat._id} value={angajat._id}>{angajat.nume}</option>
          ))}
        </Form.Select>
      </Form.Group>

      <Button variant="primary" type="submit">Exportă Angajat</Button>
    </Form>
  );
};

export default ExportEmployeeForm;

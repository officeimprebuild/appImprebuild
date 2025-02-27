import { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditToolForm = ({ tool, onToolUpdated }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    nume: "",
    tip: "scula-cu-serie",
    serie: "",
    cantitate: 1,
    data_achizicie: new Date(),
    garantie_expira: new Date(),
    pret_achizicie: 0,
  });

  // Actualizează formData când tool se schimbă
  useEffect(() => {
    if (tool) {
      setFormData({
        nume: tool.nume,
        tip: tool.tip,
        serie: tool.serie || "",
        cantitate: tool.cantitate,
        data_achizicie: new Date(tool.data_achizicie),
        garantie_expira: tool.garantie_expira ? new Date(tool.garantie_expira) : null,
        pret_achizicie: tool.pret_achizicie,
      });
    }
  }, [tool]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Dacă tipul este schimbat, ajustează câmpurile corespunzător
    if (name === "tip") {
      if (value === "scula-primara") {
        setFormData((prevData) => ({
          ...prevData,
          serie: "",
          garantie_expira: null,
          cantitate: 1,
        }));
      } else {
        setFormData((prevData) => ({
          ...prevData,
          cantitate: 1,
        }));
      }
    }
  };

  const handleDateChange = (date, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: date,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      cantitate: Number(formData.cantitate),
      pret_achizicie: Number(formData.pret_achizicie),
      data_achizicie: formData.data_achizicie.toISOString(),
      garantie_expira: formData.tip === "scula-cu-serie" ? formData.garantie_expira.toISOString() : null,
      serie: formData.tip === "scula-cu-serie" ? formData.serie : null,
    };

    axios
      .put(`http://localhost:5000/api/tools/${tool._id}`, formattedData)
      .then(() => {
        onToolUpdated(); // Reîmprospătează lista de scule
        setShow(false); // Închide modalul
      })
      .catch((error) => console.error("Eroare la editarea sculei:", error));
  };

  return (
    <>
      <Button variant="warning" size="sm" onClick={() => setShow(true)}>
        Editează
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editează Sculă</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nume</Form.Label>
              <Form.Control type="text" name="nume" value={formData.nume} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tip</Form.Label>
              <Form.Control as="select" name="tip" value={formData.tip} onChange={handleChange}>
                <option value="scula-cu-serie">Sculă cu serie</option>
                <option value="scula-primara">Sculă primară</option>
              </Form.Control>
            </Form.Group>

            {formData.tip === "scula-cu-serie" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Serie</Form.Label>
                  <Form.Control type="text" name="serie" value={formData.serie} onChange={handleChange} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Garanție Expiră</Form.Label>
                  <DatePicker
                    selected={formData.garantie_expira}
                    onChange={(date) => handleDateChange(date, "garantie_expira")}
                    dateFormat="yyyy-MM-dd"
                    className="form-control"
                  />
                </Form.Group>
              </>
            )}

            {formData.tip === "scula-primara" && (
              <Form.Group className="mb-3">
                <Form.Label>Cantitate</Form.Label>
                <Form.Control type="number" name="cantitate" value={formData.cantitate} onChange={handleChange} min="1" />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Data Achiziției</Form.Label>
              <DatePicker
                selected={formData.data_achizicie}
                onChange={(date) => handleDateChange(date, "data_achizicie")}
                dateFormat="yyyy-MM-dd"
                className="form-control"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Preț Achiziție</Form.Label>
              <Form.Control type="number" name="pret_achizicie" value={formData.pret_achizicie} onChange={handleChange} required />
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

export default EditToolForm;
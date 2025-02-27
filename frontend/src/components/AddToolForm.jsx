import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Form, Button, Modal } from "react-bootstrap";
import axios from "axios";

const AddToolForm = ({ onToolAdded }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

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
      cantitate: formData.tip === "scula-cu-serie" ? 1 : Number(formData.cantitate), // Force 1 for "scula-cu-serie"
      pret_achizicie: Number(formData.pret_achizicie),
      data_achizicie: formData.data_achizicie.toISOString(),
      garantie_expira: formData.tip === "scula-cu-serie" ? formData.garantie_expira.toISOString() : null,
      serie: formData.tip === "scula-cu-serie" ? formData.serie : null,
    };
  
    console.log("Date trimise către server:", formattedData);
  
    axios.post("http://localhost:5000/api/tools", formattedData)
      .then(() => {
        onToolAdded();
        setShow(false);
        setFormData({
          nume: "",
          tip: "scula-cu-serie",
          serie: "",
          cantitate: 1,
          data_achizicie: new Date(),
          garantie_expira: new Date(),
          pret_achizicie: 0,
        });
      })
      .catch((error) => {
        console.error("Eroare la adăugarea sculei:", error.response?.data || error.message);
      });
  };

  return (
    <>
      <Button variant="success" className="mb-3 ml-3" onClick={() => setShow(true)}>
        + Adaugă Sculă în inventar
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Adaugă Sculă</Modal.Title>
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

            <Button variant="success" type="submit">Salvează</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AddToolForm;
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button } from "react-bootstrap";
import EditToolForm from "./EditToolForm";

const ToolList = ({ onToolUpdated }) => {
  const [tools, setTools] = useState([]);
  const [assignedEmployees, setAssignedEmployees] = useState({});

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = () => {
    axios.get("http://localhost:5000/api/tools")
      .then((response) => {
        setTools(response.data);
        fetchAssignedEmployees();
      })
      .catch((error) => {
        console.error("Eroare la preluarea sculelor:", error);
      });
  };

  const fetchAssignedEmployees = () => {
    axios.get("http://localhost:5000/api/assigned-tools")
      .then((response) => {
        const employeesByTool = {};
        response.data.forEach((assignment) => {
          if (assignment.id_scula && assignment.id_angajat) {
            if (!employeesByTool[assignment.id_scula._id]) {
              employeesByTool[assignment.id_scula._id] = [];
            }
            employeesByTool[assignment.id_scula._id].push(assignment.id_angajat.nume);
          }
        });
        setAssignedEmployees(employeesByTool);
      })
      .catch((error) => {
        console.error("Eroare la preluarea angajaților atribuiți:", error);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Sigur vrei să ștergi această sculă?")) {
      axios.delete(`http://localhost:5000/api/tools/${id}`)
        .then(() => {
          fetchTools();
          onToolUpdated();
        })
        .catch((error) => console.error("Eroare la ștergerea sculei:", error));
    }
  };

  const handleExportExcel = () => {
    console.log("Attempting to export Excel...");
    try {
      window.location.href = "http://localhost:5000/api/tools/export/excel";
    } catch (error) {
      console.error("Eroare la exportul în Excel:", error);
    }
  };

  return (
    <div className="container mt-3">
      <h2 className="mb-3">Inventar</h2>
      <Button variant="success" onClick={handleExportExcel} className="mb-3">
        Exportă în Excel
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Serie</th>
            <th>Cantitate</th>
            <th>Data Achiziției</th>
            <th>Garanție Expiră</th>
            <th>Preț Achiziție</th>
            <th>Atribuită la</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {tools.length > 0 ? (
            tools.map((tool) => (
              <tr key={tool._id}>
                <td>{tool.nume}</td>
                <td>{tool.serie || "N/A"}</td>
                <td>{tool.cantitate}</td>
                <td>{new Date(tool.data_achizicie).toLocaleDateString()}</td>
                <td>{tool.garantie_expira ? new Date(tool.garantie_expira).toLocaleDateString() : "N/A"}</td>
                <td>{tool.pret_achizicie}</td>
                <td>
                  {assignedEmployees[tool._id]?.length > 0 ? (
                    assignedEmployees[tool._id].join(", ")
                  ) : (
                    <span className="text-muted">Neatribuită</span>
                  )}
                </td>
                <td>
                  <EditToolForm tool={tool} onToolUpdated={fetchTools} />
                  <Button variant="danger" size="sm" onClick={() => handleDelete(tool._id)} className="ms-2">
                    Șterge
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">Nicio sculă găsită.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ToolList;
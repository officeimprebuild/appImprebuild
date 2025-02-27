import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button } from "react-bootstrap";
import EditEmployeeForm from "./EditEmployeeForm";

const EmployeeList = ({ onEmployeeUpdated }) => {
  const [employees, setEmployees] = useState([]);
  const [assignedTools, setAssignedTools] = useState({});
  const currentDate = new Date().toLocaleDateString("ro-RO").replace(/\//g, "-");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get("http://localhost:5000/api/employees")
      .then((response) => {
        setEmployees(response.data);
        fetchAssignedTools();
      })
      .catch((error) => {
        console.error("Eroare la preluarea angajaților:", error);
      });
  };

  const fetchAssignedTools = () => {
    axios.get("http://localhost:5000/api/assigned-tools")
      .then((response) => {
        const toolsByEmployee = {};
        response.data.forEach((assignment) => {
          if (assignment.id_angajat && assignment.id_scula) {
            if (!toolsByEmployee[assignment.id_angajat._id]) {
              toolsByEmployee[assignment.id_angajat._id] = [];
            }
            toolsByEmployee[assignment.id_angajat._id].push(`${assignment.id_scula.nume}, ${assignment.id_scula.serie || "Fără serie"}`);
          }
        });
        setAssignedTools(toolsByEmployee);
      })
      .catch((error) => {
        console.error("Eroare la preluarea sculelor atribuite:", error);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Sigur vrei să ștergi acest angajat?")) {
      axios.delete(`http://localhost:5000/api/employees/${id}`)
        .then(() => {
          fetchEmployees();
          onEmployeeUpdated();
        })
        .catch((error) => console.error("Eroare la ștergere:", error));
    }
  };

  const handleExport = (employee) => {
    axios.get(`http://localhost:5000/api/export/employee/${employee._id}`, {
      responseType: "blob",
    })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Proces_Verbal_${employee.nume}_${currentDate}.docx`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => console.error("Eroare la export:", error));
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Lista Angajaților</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Telefon</th>
            <th>Companie</th>
            <th>Status</th>
            <th>Scule Atribuite</th>
            <th>Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr key={employee._id}>
                <td>{employee.nume}</td>
                <td>{employee.telefon}</td>
                <td>{employee.companie || "N/A"}</td>
                <td>{employee.status ? "Activ" : "Inactiv"}</td>
                <td>
                  {assignedTools[employee._id]?.length > 0 ? (
                    assignedTools[employee._id].join(" | ")
                  ) : (
                    <span className="text-muted">Nicio sculă atribuită</span>
                  )}
                </td>
                <td>
                  <EditEmployeeForm employee={employee} onEmployeeUpdated={fetchEmployees} />
                  <Button variant="danger" size="sm" onClick={() => handleDelete(employee._id)} className="ms-2">
                    Șterge
                  </Button>
                  <Button variant="success" size="sm" onClick={() => handleExport(employee)} className="ms-2">
                    Exportă
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">Niciun angajat găsit.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default EmployeeList;

import { useState, useEffect } from "react";
import axios from "axios";

const ReturnToolForm = ({ onToolReturned }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [assignedTools, setAssignedTools] = useState([]);
  const [selectedAssignedTool, setSelectedAssignedTool] = useState("");
  const [returnQuantity, setReturnQuantity] = useState(0); // Start at 0 to force selection for scula-primara
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAssignedTools(selectedEmployee);
    } else {
      setAssignedTools([]);
      setSelectedAssignedTool("");
      setReturnQuantity(0);
      setErrorMessage("");
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employees");
      setEmployees(res.data);
    } catch (error) {
      console.error("❌ Eroare la preluarea angajaților:", error);
      setErrorMessage("Eroare la preluarea angajaților");
    }
  };

  const fetchAssignedTools = async (employeeId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/assigned-tools/employee/${employeeId}`);
      console.log("📢 Scule atribuite primite:", res.data);
      setAssignedTools(res.data);
      setSelectedAssignedTool("");
      setReturnQuantity(0);
      setErrorMessage("");
    } catch (error) {
      console.error("❌ Eroare la preluarea sculelor atribuite:", error);
      setErrorMessage("Eroare la preluarea sculelor atribuite");
    }
  };

  const getSelectedToolDetails = () => {
    return assignedTools.find((assign) => assign.id_scula._id === selectedAssignedTool) || {};
  };

  const handleToolSelection = (e) => {
    const toolId = e.target.value;
    setSelectedAssignedTool(toolId);
    const toolDetails = assignedTools.find((assign) => assign.id_scula._id === toolId);
    if (toolId && toolDetails?.cantitate_atribuita) {
      setReturnQuantity(toolDetails.cantitate_atribuita); // Default to full assigned quantity for scula-primara
    } else {
      setReturnQuantity(0);
    }
    setErrorMessage("");
  };

  const handleReturnTool = async () => {
    if (!selectedEmployee || !selectedAssignedTool) {
      setErrorMessage("Te rog selectează un angajat și o sculă de returnat!");
      return;
    }

    const toolDetails = getSelectedToolDetails();
    const toolType = toolDetails.id_scula?.tip;

    let finalReturnQuantity;
    if (toolType === "scula-cu-serie") {
      finalReturnQuantity = 1; // Fixed quantity for serialized tools, no validation needed
    } else if (toolType === "scula-primara") {
      finalReturnQuantity = returnQuantity;
      const maxReturnable = toolDetails.cantitate_atribuita || 0;

      if (finalReturnQuantity <= 0) {
        setErrorMessage("Cantitatea de returnat trebuie să fie mai mare decât 0!");
        return;
      }

      if (finalReturnQuantity > maxReturnable) {
        setErrorMessage(`Nu poți returna mai mult decât ai atribuit! Disponibil: ${maxReturnable}`);
        return;
      }
    } else {
      setErrorMessage("Tipul sculei nu este valid!");
      return;
    }

    try {
      console.log("📤 Trimitere cerere returnare:", {
        angajatId: selectedEmployee,
        sculaId: selectedAssignedTool,
        cantitate_atribuita: finalReturnQuantity,
      });
      const response = await axios.post("http://localhost:5000/api/assigned-tools/return", {
        angajatId: selectedEmployee,
        sculaId: selectedAssignedTool,
        cantitate_atribuita: finalReturnQuantity,
      });
      console.log("✅ Răspuns server:", response.data);
      await fetchAssignedTools(selectedEmployee); // Refresh the list
      onToolReturned();
      setSelectedAssignedTool("");
      setReturnQuantity(0);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Eroare la returnarea sculei");
      console.error("❌ Eroare la returnarea sculei:", error);
    }
  };

  return (
    <div>
      <h3>Returnare Scule</h3>
      {errorMessage && <div style={{ color: "red", marginBottom: "10px" }}>{errorMessage}</div>}
      <div>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          style={{ marginRight: "10px" }}
        >
          <option value="">Selectează un angajat</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.nume}
            </option>
          ))}
        </select>

        <select
          value={selectedAssignedTool}
          onChange={handleToolSelection}
          style={{ marginRight: "10px" }}
        >
          <option value="">Selectează o sculă de returnat</option>
          {assignedTools.length > 0 ? (
            assignedTools.map((assign) => (
              <option key={`${assign._id}-${assign.id_scula._id}`} value={assign.id_scula._id}>
                {`${assign.id_scula.nume} - ${assign.id_scula.serie || "Fără serie"} (${assign.cantitate_atribuita} atribuite)`}
              </option>
            ))
          ) : (
            <option disabled>
              {selectedEmployee ? "Nicio sculă atribuită" : "Selectează un angajat mai întâi"}
            </option>
          )}
        </select>

        {selectedAssignedTool && getSelectedToolDetails().id_scula?.tip === "scula-primara" && (
          <div style={{ marginTop: "10px" }}>
            <label>Cantitate Returnată: </label>
            <select
              value={returnQuantity}
              onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 1)}
              style={{ marginLeft: "10px", width: "60px" }}
            >
              {Array.from({ length: getSelectedToolDetails().cantitate_atribuita || 1 }, (_, i) => i + 1).map((qty) => (
                <option key={qty} value={qty}>
                  {qty}
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedAssignedTool && getSelectedToolDetails().id_scula?.tip === "scula-cu-serie" && (
          <div style={{ marginTop: "10px" }}>
            <label>Cantitate Returnată: </label>
            <span style={{ marginLeft: "10px" }}>1 (fix pentru scule cu serie)</span>
          </div>
        )}

        <button onClick={handleReturnTool} style={{ marginTop: "10px" }}>
          Returnează Sculă
        </button>
      </div>
    </div>
  );
};

export default ReturnToolForm;
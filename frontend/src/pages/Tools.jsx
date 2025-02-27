import { useState } from "react";
import ToolList from "../components/ToolList";
import AddToolForm from "../components/AddToolForm";
import AddAssignedToolForm from "../components/AddAssignedToolForm";

const Tools = () => {
  const [refresh, setRefresh] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false); // Controlăm vizibilitatea formularului de atribuire

  const handleToolAdded = () => {
    setRefresh(!refresh); // Reîmprospătează lista de scule
  };

  const handleToolAssigned = () => {
    setRefresh(!refresh); // Reîmprospătează lista de scule atribuite (dacă e cazul)
  };

  return (
    <div className="container mt-4">
      <h2>Gestionare Scule</h2>

      {/* Buton pentru afișarea formularului de atribuire */}
      <button 
        className="btn btn-primary mb-3"
        onClick={() => setShowAssignForm(!showAssignForm)}
      >
        {showAssignForm ? "Ascunde Atribuirea" : "Atribuie o Sculă"}
      </button>

      {/* Formularul de atribuire scule (apare doar când showAssignForm este true) */}
      {showAssignForm && <AddAssignedToolForm onToolAssigned={handleToolAssigned} />}

      {/* Formularul pentru adăugarea sculelor */}
      <AddToolForm onToolAdded={handleToolAdded} />

      {/* Lista sculelor */}
      <ToolList key={refresh} onToolUpdated={handleToolAdded} />
    </div>
  );
};

export default Tools;

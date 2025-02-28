import { useState } from "react";
import ToolList from "../components/ToolList";
import AddToolForm from "../components/AddToolForm";
import AddAssignedToolForm from "../components/AddAssignedToolForm";
import { Container, Button } from "react-bootstrap";

const Tools = () => {
  const [refresh, setRefresh] = useState(false);

  const handleToolAdded = () => {
    setRefresh(!refresh); // Reîmprospătează lista de scule
  };

  const handleToolAssigned = () => {
    setRefresh(!refresh); // Reîmprospătează lista de scule atribuite
  };

  return (
    <Container fluid className="mt-2 p-2">
      <h2 className="mb-3 text-center">Gestionare Scule</h2>

      {/* Buttons for forms, ordered as requested */}
      

      {/* Forms rendered directly */}
      <AddToolForm onToolAdded={handleToolAdded} />
      <AddAssignedToolForm onToolAssigned={handleToolAssigned} />

      {/* Lista sculelor */}
      <ToolList key={refresh} onToolUpdated={handleToolAdded} />

      <style jsx>{`
        @media (max-width: 576px) {
          h2 {
            font-size: 1.2rem;
          }
          .btn {
            font-size: 0.9rem;
            padding: 8px 16px;
          }
          .gap-2 {
            gap: 1rem;
          }
        }
      `}</style>
    </Container>
  );
};

export default Tools;
const express = require("express");
const router = express.Router();
const AssignedTool = require("../models/AssignedTool");
const Employee = require("../models/Employee");
const Tool = require("../models/Tool");

// 📌 1️⃣ Atribuie o sculă unui angajat
router.post("/", async (req, res) => {
  try {
    const { id_angajat, id_scula, cantitate_atribuita } = req.body;

    // Validate input
    if (!id_angajat || !id_scula || !cantitate_atribuita || cantitate_atribuita <= 0) {
      return res.status(400).json({ message: "Invalid data for tool assignment. Quantity must be greater than 0." });
    }

    const employee = await Employee.findById(id_angajat);
    const tool = await Tool.findById(id_scula);

    if (!employee) return res.status(404).json({ message: "Angajatul nu a fost găsit!" });
    if (!tool) return res.status(404).json({ message: "Scula nu a fost găsită!" });

    // Force quantity to 1 for serialized tools
    const finalQuantity = tool.tip === "scula-cu-serie" ? 1 : cantitate_atribuita;

    // Check if enough quantity is available
    if (tool.cantitate < finalQuantity) {
      return res.status(400).json({ 
        message: `Cantitate insuficientă în inventar! Disponibil: ${tool.cantitate}, Cerut: ${finalQuantity}` 
      });
    }

    // Create new assignment
    const newAssignedTool = new AssignedTool({
      id_angajat,
      id_scula,
      cantitate_atribuita: finalQuantity,
      serie: tool.tip === "scula-cu-serie" ? tool.serie : null,
    });
    await newAssignedTool.save();

    // Reduce available quantity in inventory
    tool.cantitate -= finalQuantity;
    await tool.save();

    res.status(201).json(newAssignedTool);
  } catch (error) {
    console.error("Eroare la atribuirea sculei:", error);
    res.status(400).json({ error: error.message });
  }
});

// 📌 2️⃣ Obține toate sculele atribuite
router.get("/", async (req, res) => {
  try {
    const assignedTools = await AssignedTool.find()
      .populate("id_angajat", "nume telefon companie")
      .populate("id_scula", "nume serie cantitate")
      .select("id_angajat id_scula cantitate_atribuita serie data_atribuire"); // Add cantitate_atribuita
    res.json(assignedTools.filter(a => a.id_angajat && a.id_scula));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 3️⃣ Obține toate sculele atribuite unui angajat
router.get("/employee/:id", async (req, res) => {
  try {
    const assignedTools = await AssignedTool.find({ id_angajat: req.params.id })
      .populate("id_scula", "nume serie cantitate")
      .select("id_scula cantitate_atribuita serie data_atribuire"); // Add cantitate_atribuita
    res.json(assignedTools);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 4️⃣ Returnează o sculă
router.post("/return", async (req, res) => {
  try {
    const { angajatId, sculaId, cantitate_atribuita } = req.body;
    console.log("📥 Cerere returnare primită:", req.body);

    const assignedTool = await AssignedTool.findOne({ id_angajat: angajatId, id_scula: sculaId });
    if (!assignedTool) {
      return res.status(404).json({ message: "Atribuirea nu a fost găsită!" });
    }

    const tool = await Tool.findById(sculaId);
    let returnQuantity;

    if (tool.tip === "scula-cu-serie") {
      returnQuantity = 1; // Fixed quantity for serialized tools, no validation needed
    } else if (tool.tip === "scula-primara") {
      returnQuantity = cantitate_atribuita;
      if (!returnQuantity || returnQuantity <= 0) {
        return res.status(400).json({ message: "Cantitatea de returnat trebuie să fie mai mare decât 0!" });
      }
      if (returnQuantity > assignedTool.cantitate_atribuita) {
        return res.status(400).json({
          message: `Nu poți returna mai mult decât ai atribuit! Atribuit: ${assignedTool.cantitate_atribuita}, Cerut: ${returnQuantity}`,
        });
      }
    } else {
      return res.status(400).json({ message: "Tipul sculei nu este valid!" });
    }

    console.log("🔍 Calcul returnQuantity:", { returnQuantity, assignedToolCantitate: assignedTool.cantitate_atribuita });

    if (returnQuantity === assignedTool.cantitate_atribuita) {
      await AssignedTool.findOneAndDelete({ id_angajat: angajatId, id_scula: sculaId });
      console.log("🗑️ Atribuire ștearsă");
    } else if (tool.tip === "scula-primara") { // Only update for scula-primara
      assignedTool.cantitate_atribuita -= returnQuantity;
      await assignedTool.save();
      console.log("✂️ Atribuire actualizată:", assignedTool.cantitate_atribuita);
    }

    const updatedTool = await Tool.findByIdAndUpdate(sculaId, { $inc: { cantitate: returnQuantity } }, { new: true });
    console.log("📈 Inventar actualizat:", updatedTool.cantitate);

    res.status(200).json({ message: "Scula a fost returnată cu succes!" });
  } catch (error) {
    console.error("Eroare la returnarea sculei:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
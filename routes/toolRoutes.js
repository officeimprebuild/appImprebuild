const express = require('express');
const router = express.Router();
const Tool = require('../models/Tool');
const AssignedTool = require('../models/AssignedTool');
const ExcelJS = require('exceljs');

// Ruta GET pentru preluarea tuturor sculelor
router.get("/", async (req, res) => {
  try {
    const tools = await Tool.find();
    res.status(200).json(tools);
  } catch (error) {
    console.error("Eroare la preluarea sculelor:", error);
    res.status(500).json({ error: "Eroare la preluarea sculelor." });
  }
});

// Ruta POST pentru adăugarea unei scule
router.post("/", async (req, res) => {
  try {
    const { nume, tip, serie, cantitate, data_achizicie, garantie_expira, pret_achizicie } = req.body;

    if (tip === "scula-primara" && (serie || garantie_expira)) {
      return res.status(400).json({ error: "Sculele primare nu pot avea serie sau garanție." });
    }

    if (tip === "scula-cu-serie" && (!serie || !garantie_expira)) {
      return res.status(400).json({ error: "Sculele cu serie trebuie să aibă o serie și garanție." });
    }

    const newTool = new Tool({
      nume,
      tip,
      serie: tip === "scula-cu-serie" ? serie : null,
      cantitate: tip === "scula-cu-serie" ? 1 : (tip === "scula-primara" ? cantitate : 1),
      data_achizicie,
      garantie_expira: tip === "scula-cu-serie" ? garantie_expira : null,
      pret_achizicie,
    });

    await newTool.save();
    res.status(201).json(newTool);
  } catch (error) {
    console.error("Eroare la adăugarea sculei:", error);
    res.status(500).json({ error: "Eroare la adăugarea sculei." });
  }
});

// Ruta PUT pentru actualizarea unei scule
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { nume, serie, cantitate, data_achizicie, garantie_expira, pret_achizicie } = req.body;

  try {
    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      { nume, serie, cantitate, data_achizicie, garantie_expira, pret_achizicie },
      { new: true }
    );

    if (!updatedTool) {
      return res.status(404).json({ error: "Sculă nu a fost găsită." });
    }

    res.status(200).json(updatedTool);
  } catch (error) {
    console.error("Eroare la actualizarea sculei:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Ruta DELETE pentru ștergerea unei scule
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTool = await Tool.findByIdAndDelete(id);

    if (!deletedTool) {
      return res.status(404).json({ error: "Sculă nu a fost găsită." });
    }

    res.status(200).json({ message: "Sculă ștearsă cu succes." });
  } catch (error) {
    console.error("Eroare la ștergerea sculei:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Updated Excel Export Route
router.get("/export/excel", async (req, res) => {
  try {
    const tools = await Tool.find();

    if (!tools.length) {
      return res.status(404).json({ error: "Nu există scule de exportat." });
    }

    // Fetch all assignments with employee and tool details
    const assignments = await AssignedTool.find()
      .populate("id_angajat", "nume")
      .populate("id_scula", "nume");

    console.log("📋 Raw assignments:", assignments);

    // Create a map of tool IDs to their assignments
    const toolAssignments = {};
    assignments.forEach((assignment) => {
      if (assignment.id_scula && assignment.id_scula._id) {
        const toolId = assignment.id_scula._id.toString();
        if (!toolAssignments[toolId]) {
          toolAssignments[toolId] = [];
        }
        toolAssignments[toolId].push({
          employeeName: assignment.id_angajat?.nume || "N/A",
          quantityAssigned: assignment.cantitate_atribuita || 1,
          assignmentDate: assignment.data_atribuire,
        });
      } else {
        console.error("❌ Invalid assignment found:", {
          assignmentId: assignment._id,
          id_scula: assignment.id_scula,
          id_angajat: assignment.id_angajat,
        });
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventar");

    // Define updated table headers including new columns
    worksheet.columns = [
      { header: "Nume", key: "nume", width: 20 },
      { header: "Serie", key: "serie", width: 20 },
      { header: "Cantitate", key: "cantitate", width: 10 },
      { header: "Data Achiziției", key: "data_achizicie", width: 20 },
      { header: "Garanție Expiră", key: "garantie_expira", width: 20 },
      { header: "Preț Achiziție", key: "pret_achizicie", width: 15 },
      { header: "Atribuită la", key: "assignedTo", width: 30 },
      { header: "Cantitate Atribuită", key: "cantitate_atribuita", width: 15 }, // New column
      { header: "Cantitate Totală", key: "cantitate_totala", width: 15 }, // New column
      { header: "Data Atribuire", key: "data_atribuire", width: 20 }, // New column
    ];

    // Add data to the table with new fields
    tools.forEach((tool) => {
      const toolId = tool._id.toString();
      const assignmentsForTool = toolAssignments[toolId] || [];
      const assignedTo = assignmentsForTool.length > 0
        ? assignmentsForTool.map((a) => `${a.employeeName} (${a.quantityAssigned} atribuite)`).join(", ")
        : "Neatribuită";

      // Calculate total assigned quantity for this tool
      const cantitateAtribuita = assignmentsForTool.reduce(
        (sum, assignment) => sum + assignment.quantityAssigned,
        0
      );

      // Calculate total quantity (inventory + assigned)
      const cantitateTotala = (tool.cantitate || 0) + cantitateAtribuita;

      // Get the most recent assignment date (if any)
      const dataAtribuire = assignmentsForTool.length > 0
        ? new Date(Math.max(...assignmentsForTool.map(a => new Date(a.assignmentDate)))).toISOString().split("T")[0]
        : "N/A";

      worksheet.addRow({
        nume: tool.nume || "N/A",
        serie: tool.serie || "N/A",
        cantitate: tool.cantitate || 0,
        data_achizicie: tool.data_achizicie ? new Date(tool.data_achizicie).toISOString().split("T")[0] : "N/A",
        garantie_expira: tool.garantie_expira ? new Date(tool.garantie_expira).toISOString().split("T")[0] : "N/A",
        pret_achizicie: tool.pret_achizicie || 0,
        assignedTo: assignedTo,
        cantitate_atribuita: cantitateAtribuita, // New field
        cantitate_totala: cantitateTotala, // New field
        data_atribuire: dataAtribuire, // New field
      });
    });

    // Set headers and send the file
    res.setHeader("Content-Disposition", "attachment; filename=Inventar.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error("Eroare la exportul în Excel:", error);
    res.status(500).json({ error: "Eroare la generarea fișierului Excel." });
  }
});

// Ruta pentru obținerea sculelor neatribuite
router.get("/unassigned", async (req, res) => {
  try {
    const assignedTools = await AssignedTool.find({ returnat: false }).distinct("id_scula");
    const unassignedTools = await Tool.find({
      _id: { $nin: assignedTools },
      $or: [
        { tip: "scula-primara", cantitate: { $gt: 0 } },
        { tip: "scula-cu-serie" }
      ]
    });

    console.log("📢 Unassigned Tools:", unassignedTools);
    if (unassignedTools.length === 0) {
      console.log("⚠️ No unassigned tools found. Check data or logic.");
    }
    res.json(unassignedTools);
  } catch (error) {
    console.error("Eroare la preluarea sculelor neatribuite:", error);
    res.status(500).json({ error: "Eroare la preluarea sculelor neatribuite" });
  }
});

module.exports = router;
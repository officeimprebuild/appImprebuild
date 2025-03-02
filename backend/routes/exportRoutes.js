const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const AssignedTool = require("../models/AssignedTool");
const Tool = require("../models/Tool");
const PDFDocument = require("pdfkit");

// 📌 Export a Single Employee's Report as a PDF
router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Angajatul nu a fost gasit" });
    }

    const assignedTools = await AssignedTool.find({ id_angajat: employee._id }).populate("id_scula");
    const sculeValide = assignedTools.filter(assign => assign.id_scula);

    const currentDate = new Date().toLocaleDateString("ro-RO").replace(/\//g, "-");
    const fileName = `Proces_Verbal_${employee.nume}_${currentDate}.pdf`;

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Stream the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    // 🏷️ Add Title
    doc
      .fontSize(20)
      .text(`Proces Verbal - ${employee.nume} - ${currentDate}`, { align: "center" })
      .moveDown();

    // 📄 Employee Info Section
    doc.fontSize(16).text("Datele Angajatului", { underline: true });
    doc
      .fontSize(12)
      .moveDown()
      .text(`Nume: ${employee.nume}`, { continued: true, width: 250 })
      .text(`Telefon: ${employee.telefon}`, { align: "right" })
      .text(`Companie: ${employee.companie || "N/A"}`)
      .text(`Status: ${employee.status ? "Activ" : "Inactiv"}`)
      .text(`Marime Tricou: ${employee.marime_tricou || "N/A"}`)
      .text(`Marime Pantaloni: ${employee.marime_pantaloni || "N/A"}`)
      .text(`Marime Bocanci: ${employee.masura_bocanci || "N/A"}`)
      .moveDown();

    // 🔧 Tools Section
    doc.fontSize(16).text("Scule Atribuite:", { underline: true }).moveDown();

    // Table Header
    const tableTop = doc.y;
    const itemColumn = 50;
    const serieColumn = 200;
    const quantityColumn = 350;
    const dateColumn = 450;

    doc
      .fontSize(12)
      .text("Nume Scula", itemColumn, tableTop, { bold: true })
      .text("Serie", serieColumn, tableTop)
      .text("Cantitate", quantityColumn, tableTop)
      .text("Data Atribuirii", dateColumn, tableTop);

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke().moveDown();

    // Table Rows
    sculeValide.forEach((assign, i) => {
      const rowTop = doc.y + 5;

      doc
        .fontSize(10)
        .text(assign.id_scula.nume, itemColumn, rowTop)
        .text(assign.id_scula.serie || "N/A", serieColumn, rowTop)
        .text(assign.cantitate_atribuita.toString(), quantityColumn, rowTop)
        .text(
          assign.data_atribuire
            ? new Date(assign.data_atribuire).toLocaleDateString("ro-RO")
            : "N/A",
          dateColumn,
          rowTop
        );

      // Optional: Draw row separator
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).dash(1, { space: 1 }).stroke();
    });

    doc.moveDown();

    // 🎨 Finalize PDF
    doc.end();

  } catch (error) {
    console.error("Eroare la generarea documentului:", error);
    res.status(500).json({ error: "Eroare la generarea documentului" });
  }
});

module.exports = router;

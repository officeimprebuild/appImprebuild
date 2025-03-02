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
      return res.status(404).json({ error: "Angajatul nu a fost găsit" });
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
      .text(`Nume: ${employee.nume}`)
      .text(`Telefon: ${employee.telefon}`)
      .text(`Companie: ${employee.companie || "N/A"}`)
      .text(`Status: ${employee.status ? "Activ" : "Inactiv"}`)
      .text(`Mărime tricou: ${employee.marime_tricou || "N/A"}`)
      .text(`Mărime pantaloni: ${employee.marime_pantaloni || "N/A"}`)
      .text(`Mărime bocanci: ${employee.masura_bocanci || "N/A"}`)
      .moveDown();

    // 🔧 Tools Section
    doc.fontSize(16).text("Scule Atribuite:", { underline: true }).moveDown();

    // 🧾 Table Header
    doc.fontSize(12).text(`| ${"Nume Sculă".padEnd(20)} | ${"Serie".padEnd(15)} | ${"Cantitate".padEnd(10)} | ${"Data Atribuirii".padEnd(15)} |`);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

    // 🛠️ Table Data
    sculeValide.forEach(assign => {
      doc.text(
        `| ${assign.id_scula.nume.padEnd(20)} | ${assign.id_scula.serie?.padEnd(15) || "N/A".padEnd(15)} | ${assign.cantitate_atribuita.toString().padEnd(10)} | ${new Date(assign.data_atribuire).toLocaleDateString().padEnd(15)} |`
      );
    });

    // 🎨 Finalize PDF
    doc.end();

  } catch (error) {
    console.error("Eroare la generarea documentului:", error);
    res.status(500).json({ error: "Eroare la generarea documentului" });
  }
});

module.exports = router;

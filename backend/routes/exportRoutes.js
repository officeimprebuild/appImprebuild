const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const AssignedTool = require("../models/AssignedTool");
const Tool = require("../models/Tool");
const PDFDocument = require("pdfkit");
const PDFTable = require("pdfkit-table"); // For table support in PDFKit

// 📌 Export a Single Employee's Report as PDF
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
    const doc = new PDFDocument({
      margin: 50, // Default margins
      size: "A4", // Standard PDF size
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Title
    doc.fontSize(24).font("Helvetica-Bold").text(`Proces Verbal - ${employee.nume} - ${currentDate}`, {
      align: "center",
    });
    doc.moveDown(1); // Add some space after the title

    // Employee Info Section
    doc.fontSize(18).font("Helvetica-Bold").text("Datele Angajatului", { align: "left" });
    doc.moveDown(0.5);
    doc.fontSize(12).font("Helvetica").text(`Nume: ${employee.nume}`);
    doc.text(`Telefon: ${employee.telefon}`);
    doc.text(`Companie: ${employee.companie || "N/A"}`);
    doc.text(`Status: ${employee.status ? "Activ" : "Inactiv"}`);
    doc.text(`Mărime tricou: ${employee.marime_tricou || "N/A"}`);
    doc.text(`Mărime pantaloni: ${employee.marime_pantaloni || "N/A"}`);
    doc.text(`Mărime bocanci: ${employee.masura_bocanci || "N/A"}`);
    doc.moveDown(1); // Add space after employee info

    // Tools Section
    doc.fontSize(18).font("Helvetica-Bold").text("Scule Atribuite:", { align: "left" });
    doc.moveDown(0.5);

    // Create a table for assigned tools
    const tableData = [
      [
        { text: "Nume Sculă", bold: true, fontSize: 12, background: "#D3D3D3" },
        { text: "Serie", bold: true, fontSize: 12, background: "#D3D3D3" },
        { text: "Cantitate Atribuită", bold: true, fontSize: 12, background: "#D3D3D3" },
        { text: "Data Atribuirii", bold: true, fontSize: 12, background: "#D3D3D3" },
      ],
      ...sculeValide.map((assign) => [
        { text: assign.id_scula.nume, fontSize: 10 },
        { text: assign.id_scula.serie || "N/A", fontSize: 10 },
        { text: assign.cantitate_atribuita.toString(), fontSize: 10 },
        { text: assign.data_atribuire ? new Date(assign.data_atribuire).toLocaleDateString() : "N/A", fontSize: 10 },
      ]),
    ];

    // Add table using pdfkit-table
    doc.table(tableData, {
      width: 500, // Adjust width as needed
      columnsSize: [150, 100, 100, 150], // Adjust column widths
      margin: { top: 0, bottom: 10, left: 50, right: 50 },
      padding: 5,
      align: "left",
      headerRows: 1,
      fontSize: 10,
    });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Eroare la generarea PDF-ului:", error);
    res.status(500).json({ error: "Eroare la generarea PDF-ului" });
  }
});

module.exports = router;
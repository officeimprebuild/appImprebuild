const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const AssignedTool = require("../models/AssignedTool");
const PDFDocument = require("pdfkit");

// 📌 Export a Single Employee's Report as a PDF
router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Angajatul nu a fost gasit" });
    }

    const assignedTools = await AssignedTool.find({ id_angajat: employee._id }).populate("id_scula");
    let sculeValide = assignedTools.filter(assign => assign.id_scula);

    // 📅 Sort tools by assignment date in descending order
    sculeValide = sculeValide.sort((a, b) => new Date(b.data_atribuire) - new Date(a.data_atribuire));

    const currentDate = new Date().toLocaleDateString("ro-RO").replace(/\//g, "-");
    const fileName = `Proces_Verbal_${employee.nume}_${currentDate}.pdf`;

    // Create a new PDF document with margin
    const doc = new PDFDocument({ margin: 50, autoFirstPage: false });

    // Stream the response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    // Function to add a new page
    const addNewPage = () => {
        doc.addPage();
        doc
          .fontSize(20)
          .text(`Proces Verbal - ${employee.nume} - ${currentDate}`, { align: "center" })
          .moveDown();

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

        doc.fontSize(16).text("Scule Atribuite:", { underline: true }).moveDown();

        // Draw table header
        drawTableHeader();
    };

    const drawTableHeader = () => {
        const tableTop = doc.y;
        const itemColumn = 50;
        const serieColumn = 200;
        const quantityColumn = 350;
        const dateColumn = 450;

        doc
          .fontSize(12)
          .text("Nume Sculă", itemColumn, tableTop, { bold: true })
          .text("Serie", serieColumn, tableTop)
          .text("Cantitate", quantityColumn, tableTop)
          .text("Data Atribuirii", dateColumn, tableTop);

        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke().moveDown();
    };

    // Add the first page
    addNewPage();

    // Define row layout
    const itemColumn = 50;
    const serieColumn = 200;
    const quantityColumn = 350;
    const dateColumn = 450;

    // Maximum number of rows per page
    const maxRowsPerPage = 25;
    let rowCount = 0;

    // Table Rows
    sculeValide.forEach((assign) => {
        // Check if new page is needed
        if (rowCount >= maxRowsPerPage) {
            addNewPage();
            rowCount = 0;
        }

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

        doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).dash(1, { space: 1 }).stroke();
        
        rowCount++;
    });

    doc.end();

  } catch (error) {
    console.error("Eroare la generarea documentului:", error);
    res.status(500).json({ error: "Eroare la generarea documentului" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const AssignedTool = require("../models/AssignedTool");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

// 📌 Export a Single Employee's Report as a PDF
router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Angajatul nu a fost gasit" });
    }

    const assignedTools = await AssignedTool.find({ id_angajat: employee._id }).populate("id_scula");
    let sculeValide = assignedTools.filter(assign => assign.id_scula);

    sculeValide = sculeValide.sort((a, b) => new Date(b.data_atribuire) - new Date(a.data_atribuire));

    const currentDate = new Date().toLocaleDateString("ro-RO").replace(/\//g, "-");
    const fileName = `Proces_Verbal_${employee.nume}_${currentDate}.pdf`;

    const doc = new PDFDocument({ margin: 50, autoFirstPage: false });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    doc.pipe(res);

    const addFirstPage = () => {
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
        .text("Nume Scula", itemColumn, tableTop, { bold: true })
        .text("Serie", serieColumn, tableTop)
        .text("Cantitate", quantityColumn, tableTop)
        .text("Data Atribuirii", dateColumn, tableTop);

      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke().moveDown();
    };

    const addNewPage = () => {
      doc.addPage();
      drawTableHeader();
    };

    addFirstPage();

    const itemColumn = 50;
    const serieColumn = 200;
    const quantityColumn = 350;
    const dateColumn = 450;

    const maxRowsPerPage = 25;
    let rowCount = 0;

    sculeValide.forEach((assign) => {
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

// ✅ Export Excel with clothing sizes + summary in same sheet
router.get("/employees/clothes-sizes", async (req, res) => {
  try {
    const employees = await Employee.find({});

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Marimi Angajati");

    // 1. Header
    sheet.columns = [
      { header: "Nume", key: "nume", width: 30 },
      { header: "Tricou", key: "marime_tricou", width: 15 },
      { header: "Pantaloni", key: "marime_pantaloni", width: 15 },
      { header: "Bocanci", key: "masura_bocanci", width: 15 },
    ];

    // 2. Employees
    employees.forEach((emp) => {
      sheet.addRow({
        nume: emp.nume || "",
        marime_tricou: emp.marime_tricou || "",
        marime_pantaloni: emp.marime_pantaloni || "",
        masura_bocanci: emp.masura_bocanci || "",
      });
    });

    // 3. Empty rows
    sheet.addRow([]);
    sheet.addRow([]);

    // 4. Summary
    const countBy = (arr) =>
      arr.reduce((acc, val) => {
        if (!val) return acc;
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});

    const tricouCounts = countBy(employees.map((e) => e.marime_tricou));
    const pantaloniCounts = countBy(employees.map((e) => e.marime_pantaloni));
    const bocanciCounts = countBy(employees.map((e) => e.masura_bocanci));

    const writeSummary = (title, counts) => {
      sheet.addRow([`📊 Sumar Mărimi ${title}`]);
      sheet.getRow(sheet.lastRow.number).font = { bold: true };
      sheet.addRow(["Mărime", "Număr"]);
      Object.entries(counts).forEach(([size, count]) => {
        sheet.addRow([size, count]);
      });
      sheet.addRow([]);
    };

    writeSummary("Tricou", tricouCounts);
    writeSummary("Pantaloni", pantaloniCounts);
    writeSummary("Bocanci", bocanciCounts);

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=marimi_angajati.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (err) {
    console.error("❌ Eroare la exportul mărimilor:", err);
    res.status(500).send("Eroare server.");
  }
});

module.exports = router;

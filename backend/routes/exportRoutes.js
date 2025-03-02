const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const AssignedTool = require("../models/AssignedTool");
const Tool = require("../models/Tool");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType } = require("docx");

// 📌 Export a Single Employee's Reportss
router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Angajatul nu a fost găsit" });
    }

    const assignedTools = await AssignedTool.find({ id_angajat: employee._id }).populate("id_scula");

    const sculeValide = assignedTools.filter(assign => assign.id_scula);

    const currentDate = new Date().toLocaleDateString("ro-RO").replace(/\//g, "-");
    const fileName = `Proces Verbal - ${employee.nume} - ${currentDate}.docx`;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: `Proces Verbal - ${employee.nume} - ${currentDate}`,
                  bold: true,
                  size: 32,
                }),
              ],
              spacing: { after: 300 },
              alignment: AlignmentType.CENTER,
            }),

            // Employee Info Section
            new Paragraph({
              children: [
                new TextRun({
                  text: "Datele Angajatului",
                  bold: true,
                  size: 26,
                }),
              ],
              spacing: { after: 150 },
            }),

            new Paragraph(`Nume: ${employee.nume}`),
            new Paragraph(`Telefon: ${employee.telefon}`),
            new Paragraph(`Companie: ${employee.companie || "N/A"}`),
            new Paragraph(`Status: ${employee.status ? "Activ" : "Inactiv"}`),
            new Paragraph(`Mărime tricou: ${employee.marime_tricou || "N/A"}`),
            new Paragraph(`Mărime pantaloni: ${employee.marime_pantaloni || "N/A"}`),
            new Paragraph(`Mărime bocanci: ${employee.masura_bocanci || "N/A"}`),
            new Paragraph({ text: "", spacing: { after: 300 } }),

            // Tools Section
            new Paragraph({
              children: [
                new TextRun({
                  text: "Scule Atribuite:",
                  bold: true,
                  size: 26,
                }),
              ],
              spacing: { after: 150 },
            }),

            new Table({
              rows: [
                // Table Header
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Nume Sculă",
                          bold: true,
                        }),
                      ],
                      shading: { fill: "D3D3D3" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Serie",
                          bold: true,
                        }),
                      ],
                      shading: { fill: "D3D3D3" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Cantitate Atribuită",
                          bold: true,
                        }),
                      ],
                      shading: { fill: "D3D3D3" },
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: "Data Atribuirii",
                          bold: true,
                        }),
                      ],
                      shading: { fill: "D3D3D3" },
                    }),
                  ],
                }),

                // Table Data
                ...sculeValide.map((assign) =>
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph(assign.id_scula.nume)],
                        margins: { top: 100, bottom: 100, left: 200, right: 200 },
                      }),
                      new TableCell({
                        children: [new Paragraph(assign.id_scula.serie || "N/A")],
                        margins: { top: 100, bottom: 100, left: 200, right: 200 },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(assign.cantitate_atribuita.toString()),
                        ],
                        margins: { top: 100, bottom: 100, left: 200, right: 200 },
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(
                            assign.data_atribuire
                              ? new Date(assign.data_atribuire).toLocaleDateString()
                              : "N/A"
                          ),
                        ],
                        margins: { top: 100, bottom: 100, left: 200, right: 200 },
                      }),
                    ],
                  })
                ),
              ],
            }),

            new Paragraph({ text: "", spacing: { after: 300 } }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    console.error("Eroare la generarea documentului:", error);
    res.status(500).json({ error: "Eroare la generarea documentului" });
  }
});

module.exports = router;
  
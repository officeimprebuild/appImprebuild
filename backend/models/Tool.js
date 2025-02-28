const mongoose = require("mongoose");

const ToolSchema = new mongoose.Schema({
  nume: { type: String, required: true },
  tip: { type: String, enum: ["scula-cu-serie", "scula-primara"], required: true },
  serie: { type: String, default: null }, // Poate fi duplicat acum
  cantitate: { type: Number, default: 1 },
  data_achizicie: { type: Date, required: true },
  garantie_expira: { type: Date, default: null }, // Permite `null` pentru sculele primare
  pret_achizicie: { type: Number, required: true }
});



module.exports = mongoose.model("Tool", ToolSchema);

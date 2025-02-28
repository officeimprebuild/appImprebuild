const mongoose = require("mongoose");

const AssignedToolSchema = new mongoose.Schema({
    id_angajat: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    id_scula: { type: mongoose.Schema.Types.ObjectId, ref: "Tool", required: true },
    serie: { type: String, default: null },
    cantitate_atribuita: { type: Number, required: true, default: 1 }, // Already present
    data_atribuire: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model("AssignedTool", AssignedToolSchema);

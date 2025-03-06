const mongoose = require("mongoose");
const { Schema } = mongoose; // ✅ Extragem Schema din mongoose dsafa

const EmployeeSchema = new Schema({
    nume: { type: String, required: true },
    telefon: { type: String, unique: true, required: true },
    companie: { type: String },
    marime_tricou: { type: String },
    marime_pantaloni: { type: String },
    masura_bocanci: { type: String },
    status: { type: Boolean, default: true },
});

module.exports = mongoose.model("Employee", EmployeeSchema);

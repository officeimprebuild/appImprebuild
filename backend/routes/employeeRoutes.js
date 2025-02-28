const express = require("express");
const router = express.Router();
const Employee = require('../models/Employee');

// 📌 1️⃣ Adaugă un angajat nou
router.post("/", async (req, res) => {
    try {
        const newEmployee = new Employee(req.body);
        await newEmployee.save();
        res.status(201).json(newEmployee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 📌 2️⃣ Obține lista tuturor angajaților
router.get("/", async (req, res) => {
    try {
        const employees = await Employee.find();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 3️⃣ Obține un angajat după ID
router.get("/:id", async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({ message: "Angajatul nu a fost găsit!" });
        }
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 📌 4️⃣ Actualizează un angajat după ID
router.put("/:id", async (req, res) => {
    try {
        const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEmployee) {
            return res.status(404).json({ message: "Angajatul nu a fost găsit!" });
        }
        res.json(updatedEmployee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// 📌 5️⃣ Șterge un angajat după ID
router.delete("/:id", async (req, res) => {
    try {
        const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
        if (!deletedEmployee) {
            return res.status(404).json({ message: "Angajatul nu a fost găsit!" });
        }
        res.json({ message: "Angajat șters cu succes!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

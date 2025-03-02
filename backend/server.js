require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());

// Allow both the production and localhost frontend URLs
const allowedOrigins = [
    "https://appimprebuild-frontend.vercel.app",
    "http://localhost:3001"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (e.g., mobile apps, curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Conectat la MongoDB Atlas"))
    .catch(err => console.log("❌ Eroare MongoDB:", err));

// Importăm rutele
const employeeRoutes = require("./routes/employeeRoutes");
const toolRoutes = require("./routes/toolRoutes");
const assignedToolRoutes = require("./routes/assignedToolRoutes");
const exportRoutes = require("./routes/exportRoutes");

// Activăm rutele pentru angajați, scule, atribuiri și export
app.use("/api/employees", employeeRoutes);
app.use("/api/tools", toolRoutes);
app.use("/api/assigned-tools", assignedToolRoutes);
app.use("/api/export", exportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serverul rulează pe ${PORT}`);
});
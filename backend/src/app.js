const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || (error.name === "MulterError" ? 400 : 500);
  const message = error.message || "Internal server error";

  return res.status(statusCode).json({ message });
});

module.exports = app;

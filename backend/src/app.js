const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/auth.routes");
const billingRoutes = require("./routes/billing.routes");
const billingWebhookRoutes = require("./routes/billing-webhook.routes");
const quizRoutes = require("./routes/quiz.routes");
const uploadRoutes = require("./routes/upload.routes");
const cdnRoutes = require("./routes/cdn.routes");

const app = express();

function createCorsOptions() {
  const frontendOrigin = process.env.FRONTEND_ORIGIN?.trim();

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (!frontendOrigin || origin === frontendOrigin) {
        return callback(null, origin);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  };
}

app.use(cors(createCorsOptions()));
app.use(
  "/api/billing/stripe/webhook",
  express.raw({ type: "application/json" }),
  billingWebhookRoutes
);
app.use(express.json());
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/cdn", cdnRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
    if (res.headersSent) {
        return next(error);
    }

    const statusCode =
        error.statusCode || (error.name === "MulterError" ? 400 : 500);
    const message = error.message || "Internal server error";

    return res.status(statusCode).json({ message });
});

module.exports = app;

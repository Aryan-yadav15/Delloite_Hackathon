import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import manufacturersRouter from "./api/routes/manufacturers.js";
import retailersRouter from "./api/routes/retailers.js";
import productsRouter from "./api/routes/products.js";
import ordersRouter from "./api/routes/orders.js";
import orderItemsRouter from "./api/routes/orderItems.js";
import uipathRouter from "./api/routes/uipath.js";
import logsRouter from "./api/routes/logs.js";
import invoicesRouter from "./api/routes/invoices.js";
import notificationsRouter from "./api/routes/notifications.js";
import validationRouter from "./api/routes/validation.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
}));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/manufacturers", manufacturersRouter);
app.use("/api/retailers", retailersRouter);
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/order-items", orderItemsRouter);
app.use("/api/uipath", uipathRouter);
app.use("/api/logs", logsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/validation", validationRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

export default app;

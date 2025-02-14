  require("dotenv").config();
  const express = require("express");
  const cors = require("cors");
  const fileUpload = require("express-fileupload");
  const { createClient } = require("@supabase/supabase-js");
  const qrRoutes = require("./routes/qrRoutes");

  const app = express();
  const port = process.env.PORT || 5000;


  // Initialize Supabase
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(fileUpload());

  // Health Check Route
  app.get("/", (req, res) => {
    res.send("Backend Server is Running!");
  });


  // Use the updated QR Code API Routes
  app.use("/api", qrRoutes);

  // Start Server
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
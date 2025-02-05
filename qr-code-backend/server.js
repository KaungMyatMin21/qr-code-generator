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

const checkAndDeleteFiles = async (bucketName) => {
  try {
    console.log(`📂 Checking files in ${bucketName}...`);

    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list("");

    if (listError) {
      console.error(`⚠️ Error retrieving files from ${bucketName}:`, listError);
      return;
    }

    console.log(`📊 Found ${files.length} files in ${bucketName}`);

    
    const FILE_LIMIT = 45; 
    const DELETE_COUNT = 5; 

    if (files.length > FILE_LIMIT) {
      console.log(`🚨 Limit exceeded! Deleting ${DELETE_COUNT} oldest files...`);

      // Sort files by creation time using filename timestamps
      const sortedFiles = files.sort((a, b) => {
        const aTimestamp = parseInt(a.name.split("-")[0], 10) || 0;
        const bTimestamp = parseInt(b.name.split("-")[0], 10) || 0;
        return aTimestamp - bTimestamp;
      });

      // Select the first 3 files for deletion (later change to 5)
      const filesToDelete = sortedFiles.slice(0, DELETE_COUNT).map((file) => file.name);

      console.log(`🗑 Files marked for deletion:`, filesToDelete);

      // Delete the files
      const { error: deleteError } = await supabase.storage
        .from(bucketName)
        .remove(filesToDelete);

      if (deleteError) {
        console.error(`❌ Error deleting files from ${bucketName}:`, deleteError);
      } else {
        console.log(`✅ Successfully deleted ${filesToDelete.length} files from ${bucketName}`);
      }
    } else {
      console.log(`✅ ${bucketName} has not exceeded the limit. No files deleted.`);
    }
  } catch (error) {
    console.error(`❌ Error in storage check for ${bucketName}:`, error);
  }
};




// 🔹 Route: Upload Photos to the photo-gallery bucket
app.post("/api/upload-gallery", async (req, res) => {
  if (!req.files || !req.files.photos) {
    console.log("❌ No files uploaded");
    return res.status(400).json({ error: "No files uploaded" });
  }

  const files = Array.isArray(req.files.photos)
    ? req.files.photos
    : [req.files.photos];
  const uploadedUrls = [];

  console.log("📂 Files received:", files);

  try {
    await checkAndDeleteFiles("photo-gallery");

    for (const file of files) {
      console.log("📂 Processing file:", file.name, file.size, file.mimetype);
      const fileName = `${Date.now()}-${file.name}`;
      console.log("📤 Attempting to upload file to Supabase...");

      const { data, error } = await supabase.storage
        .from("photo-gallery")
        .upload(fileName, file.data, {
          contentType: file.mimetype,
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("❌ Error uploading file:", error);
        console.error("Error details:", error.message, error.stack);
        continue;
      }

      console.log("✅ File uploaded successfully:", data);

      const { data: publicUrlData } = supabase.storage
        .from("photo-gallery")
        .getPublicUrl(fileName);

      if (publicUrlData) {
        console.log("🌍 Public URL generated:", publicUrlData.publicUrl);
        uploadedUrls.push(publicUrlData.publicUrl);
      } else {
        console.error("❌ Could not generate public URL for file:", fileName);
      }
    }

    if (uploadedUrls.length === 0) {
      console.error("❌ No files were uploaded successfully.");
      return res.status(500).json({ error: "Failed to upload files" });
    }

    console.log("🎉 All files processed. Uploaded URLs:", uploadedUrls);
    res.json({ fileUrls: uploadedUrls });
  } catch (error) {
    console.error("❌ Error processing upload:", error);
    console.error("Error details:", error.message, error.stack);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 🔹 Route: Upload a PDF to the pdf-files bucket
app.post("/api/upload", async (req, res) => {
  if (!req.files || !req.files.file) {
    console.log("❌ No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const file = req.files.file;
  console.log("📂 Processing file:", file.name, file.size, file.mimetype);
  const fileName = `${Date.now()}-${file.name}`;

  try {
    await checkAndDeleteFiles("pdf-files");

    const { data, error } = await supabase.storage
      .from("pdf-files")
      .upload(fileName, file.data, {
        contentType: file.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("❌ Error uploading file:", error);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    const { data: publicUrlData } = supabase.storage
      .from("pdf-files")
      .getPublicUrl(fileName);

    if (publicUrlData) {
      console.log("🌍 Public URL generated:", publicUrlData.publicUrl);
      res.json({ fileUrl: publicUrlData.publicUrl });
    } else {
      console.error("❌ Could not generate public URL for file:", fileName);
      res.status(500).json({ error: "Failed to generate public URL" });
    }
  } catch (error) {
    console.error("❌ Error processing PDF upload:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 🔹 Route: Upload an MP3 to the mp3-files bucket
app.post("/api/upload-mp3", async (req, res) => {
  if (!req.files || !req.files.mp3) {
    console.log("❌ No MP3 file uploaded");
    return res.status(400).json({ error: "No MP3 file uploaded" });
  }

  const file = req.files.mp3;
  console.log("📂 Processing MP3 file:", {
    name: file.name,
    size: file.size,
    mimetype: file.mimetype,
  });

  if (file.mimetype !== "audio/mpeg" && file.mimetype !== "audio/mp3") {
    console.error(
      "❌ Invalid file type. Only MP3 files are allowed. Received:",
      file.mimetype
    );
    return res
      .status(400)
      .json({ error: "Invalid file type. Only MP3 files are allowed." });
  }

  const filePath = `public/${Date.now()}-${file.name}`;
  console.log("🔑 File path for upload:", filePath);

  try {
    await checkAndDeleteFiles("mp3-files");

    console.log("🚀 Attempting to upload file to Supabase bucket 'mp3-files'...");
    const { data, error } = await supabase.storage
      .from("mp3-files")
      .upload(filePath, file.data, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.mimetype,
      });

    console.log("🔍 Supabase upload response:", { data, error });
    if (error) {
      console.error("❌ Error uploading MP3 file:", error);
      return res
        .status(500)
        .json({ error: "Failed to upload MP3 file", details: error });
    }

    const { data: publicUrlData, error: urlError } = supabase.storage
      .from("mp3-files")
      .getPublicUrl(filePath);

    if (urlError) {
      console.error("❌ Error generating public URL:", urlError);
      return res
        .status(500)
        .json({ error: "Failed to generate public URL", details: urlError });
    }

    if (publicUrlData) {
      console.log("🌍 Public URL generated for MP3 file:", publicUrlData.publicUrl);
      return res.json({ fileUrl: publicUrlData.publicUrl });
    } else {
      console.error("❌ Could not generate public URL for MP3 file:", filePath);
      return res.status(500).json({ error: "Failed to generate public URL" });
    }
  } catch (error) {
    console.error("❌ Error processing MP3 upload:", error);
    return res.status(500).json({ error: "Something went wrong", details: error });
  }
});


// Use the updated QR Code API Routes (which now support customization)
app.use("/api", qrRoutes);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
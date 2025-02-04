const express = require("express");
const QRCode = require("qrcode");
const router = express.Router();

router.post("/generate-qr", async (req, res) => {
  const { text } = req.body;
  try {
    const options = {
      width: 300,   
      height: 300, 
      margin: 2     
    };

    const qrCodePNG = await QRCode.toDataURL(text, options);
    res.json({ qrCodePNG });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
});

module.exports = router;
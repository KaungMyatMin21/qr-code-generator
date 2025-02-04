const QRCode = require("qrcode");

const generateQRCode = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const qrCodePNG = await QRCode.toDataURL(text, { width: 300, margin: 2 });
    res.json({ qrCodePNG });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
};

module.exports = { generateQRCode };

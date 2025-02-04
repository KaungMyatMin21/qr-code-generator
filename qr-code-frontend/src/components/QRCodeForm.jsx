import React, { useState } from "react";
import {
  FaLink,
  FaEnvelope,
  FaComment,
  FaFilePdf,
  FaImages,
  FaTwitter,
  FaBitcoin,
  FaMusic,
  FaFacebook,
  FaWifi,
  FaApple,
  FaIdCard,
} from "react-icons/fa";
import "./QRCodeForm.css";

const QRCodeForm = () => {
  // Active type & QR code image
  const [activeType, setActiveType] = useState(null);
  const [qrCodePNG, setQrCodePNG] = useState("");

  // URL
  const [url, setUrl] = useState("");

  // Message
  const [message, setMessage] = useState("");

  // Email
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // PDF
  const [pdfURL, setPdfURL] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  // Gallery
  const [galleryFiles, setGalleryFiles] = useState([]);

  // Twitter
  const [twitterHandle, setTwitterHandle] = useState("");
  const [tweetText, setTweetText] = useState("");
  const [twitterOption, setTwitterOption] = useState(null);

  // MP3
  const [mp3File, setMp3File] = useState(null);

  // Bitcoin
  const [cryptoType, setCryptoType] = useState("");
  const [bitcoinReceiver, setBitcoinReceiver] = useState("");
  const [bitcoinAmount, setBitcoinAmount] = useState("");
  const [bitcoinMessage, setBitcoinMessage] = useState("");
  const [bitcoinAddress, setBitcoinAddress] = useState("");

  // App Store
  const [appStoreURL, setAppStoreURL] = useState("");

  // vCard
  const [vcardFirstName, setVcardFirstName] = useState("");
  const [vcardLastName, setVcardLastName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardOrganization, setVcardOrganization] = useState("");
  const [vcardTitle, setVcardTitle] = useState("");

  // Facebook
  const [facebookOption, setFacebookOption] = useState(null);
  const [facebookURL, setFacebookURL] = useState("");
  const [facebookPostText, setFacebookPostText] = useState("");

  // WiFi
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState("WPA/WPA2");
  const [wifiHidden, setWifiHidden] = useState(false);

  /** Upload PDF file to the backend */
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("https://qr-code-generator-ff72.onrender.com/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      alert("Failed to upload file.");
      return null;
    }
  };

  /** Upload multiple photos to the backend */
  const uploadGallery = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("photos", file);
    });
    try {
      const response = await fetch("https://qr-code-generator-ff72.onrender.com/api/upload-gallery", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload files");
      }
      const data = await response.json();
      return data.fileUrls;
    } catch (error) {
      alert("Failed to upload gallery files.");
      return null;
    }
  };

  /** Upload MP3 file to the backend */
  const uploadMP3 = async (file) => {
    const formData = new FormData();
    formData.append("mp3", file);
    try {
      const response = await fetch("https://qr-code-generator-ff72.onrender.com/api/upload-mp3", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      alert("Failed to upload MP3 file.");
      return null;
    }
  };

  /** Generate QR Code (PNG) */
  const handleGenerate = async () => {
    let formattedText = "";
    try {
      switch (activeType) {
        case "url":
          if (!url.trim()) {
            alert("Please enter a valid URL.");
            return;
          }
          formattedText = url;
          break;
        case "message":
          if (!message.trim()) {
            alert("Please enter a message.");
            return;
          }
          formattedText = message;
          break;
        case "email":
          if (!email.trim() || !subject.trim() || !body.trim()) {
            alert("Please fill in all email fields.");
            return;
          }
          formattedText = `mailto:${email}?subject=${encodeURIComponent(
            subject
          )}&body=${encodeURIComponent(body)}`;
          break;
        case "pdf":
          if (pdfFile) {
            const fileUrl = await uploadFile(pdfFile);
            if (!fileUrl) return;
            formattedText = fileUrl;
          } else if (pdfURL) {
            formattedText = pdfURL;
          } else {
            alert("Please upload a PDF file or provide a PDF URL.");
            return;
          }
          break;
        case "gallery":
          if (galleryFiles.length === 0) {
            alert("Please upload at least one photo.");
            return;
          }
          const urls = await uploadGallery(galleryFiles);
          if (!urls) return;
          formattedText = urls.join(", ");
          break;
        case "twitter":
          if (twitterOption === "twitter-profile") {
            if (!twitterHandle.trim()) {
              alert("Please enter a Twitter handle.");
              return;
            }
            formattedText = `https://twitter.com/${twitterHandle}`;
          } else if (twitterOption === "twitter-tweet") {
            if (!tweetText.trim()) {
              alert("Please enter a tweet.");
              return;
            }
            formattedText = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
              tweetText
            )}`;
          } else {
            alert("Please select a Twitter option.");
            return;
          }
          break;
        case "bitcoin":
          if (
            !cryptoType.trim() ||
            !bitcoinReceiver.trim() ||
            !bitcoinAmount.trim() ||
            !bitcoinAddress.trim()
          ) {
            alert("Please fill in all required Bitcoin fields.");
            return;
          }
          formattedText = `${cryptoType.toLowerCase()}:${bitcoinAddress}?amount=${bitcoinAmount}&label=${encodeURIComponent(
            bitcoinReceiver
          )}`;
          if (bitcoinMessage.trim()) {
            formattedText += `&message=${encodeURIComponent(bitcoinMessage)}`;
          }
          break;
        case "mp3":
          if (!mp3File) {
            alert("Please upload an MP3 file.");
            return;
          }
          const mp3FileUrl = await uploadMP3(mp3File);
          if (!mp3FileUrl) return;
          formattedText = mp3FileUrl;
          break;
        case "facebook":
          if (facebookOption === "facebook-url") {
            if (!facebookURL.trim()) {
              alert("Please enter a Facebook URL.");
              return;
            }
            formattedText = facebookURL;
          } else if (facebookOption === "facebook-post") {
            if (!facebookPostText.trim()) {
              alert("Please enter the text for your Facebook post.");
              return;
            }
            formattedText = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              "https://www.facebook.com"
            )}&quote=${encodeURIComponent(facebookPostText)}`;
          } else {
            alert("Please select a Facebook option.");
            return;
          }
          break;
        case "wifi":
          const ssid = wifiSSID.trim() || "SSID";
          let encryption;
          if (wifiEncryption === "without") {
            encryption = "nopass";
          } else if (wifiEncryption === "WPA/WPA2") {
            encryption = "WPA";
          } else if (wifiEncryption === "WEP") {
            encryption = "WEP";
          }
          formattedText = `WIFI:T:${encryption};S:${ssid};P:${wifiPassword};${
            wifiHidden ? "H:true;" : ""
          };`;
          break;
        case "appstore":
          if (!appStoreURL.trim()) {
            alert("Please enter an App Store URL.");
            return;
          }
          formattedText = appStoreURL;
          break;
        case "vcard":
          if (
            !vcardFirstName.trim() ||
            !vcardLastName.trim() ||
            !vcardPhone.trim() ||
            !vcardEmail.trim()
          ) {
            alert(
              "Please fill in required vCard fields (First Name, Last Name, Phone, Email)."
            );
            return;
          }
          formattedText = `BEGIN:VCARD
VERSION:3.0
N:${vcardLastName};${vcardFirstName};;;
FN:${vcardFirstName} ${vcardLastName}
TEL:${vcardPhone}
EMAIL:${vcardEmail}
${vcardOrganization.trim() ? `ORG:${vcardOrganization}` : ""}
${vcardTitle.trim() ? `TITLE:${vcardTitle}` : ""}
END:VCARD`;
          break;
        default:
          alert("Please select a type.");
          return;
      }

      // Generate PNG QR code
      const response = await fetch("https://qr-code-generator-ff72.onrender.com/api/generate-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: formattedText }),
      });
      const data = await response.json();
      setQrCodePNG(data.qrCodePNG);
    } catch (error) {
      alert("Something went wrong.");
    }
  };

  //Revised Download PNG function:
   
  const handleDownloadPNG = () => {
    if (!qrCodePNG) {
      alert("Please generate a QR code first.");
      return;
    }
    try {
      
      const parts = qrCodePNG.split(",");
      if (parts.length !== 2) {
        alert("Invalid QR code data.");
        return;
      }
      const mimeString = parts[0].match(/:(.*?);/)[1];
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const blobURL = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobURL;
      link.download = "qrcode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobURL);
    } catch (error) {
      alert("Error downloading PNG: " + error.message);
    }
  };

  return (
    <div className="QRCodeGenerator">
      <div className="top-section">
        <div className="options-container">
          <h2>Choose Type</h2>
          <div className="options">
            <button onClick={() => setActiveType("url")}>
              <FaLink size={20} />
              <span>URL</span>
            </button>
            <button onClick={() => setActiveType("message")}>
              <FaComment size={20} />
              <span>Message</span>
            </button>
            <button onClick={() => setActiveType("email")}>
              <FaEnvelope size={20} />
              <span>Email</span>
            </button>
            <button onClick={() => setActiveType("pdf")}>
              <FaFilePdf size={20} />
              <span>PDF</span>
            </button>
            <button onClick={() => setActiveType("gallery")}>
              <FaImages size={20} />
              <span>Photo Gallery</span>
            </button>
            <button onClick={() => setActiveType("twitter")}>
              <FaTwitter size={20} />
              <span>Twitter</span>
            </button>
            <button onClick={() => setActiveType("bitcoin")}>
              <FaBitcoin size={20} />
              <span>Bitcoin</span>
            </button>
            <button onClick={() => setActiveType("mp3")}>
              <FaMusic size={20} />
              <span>MP3</span>
            </button>
            <button onClick={() => setActiveType("facebook")}>
              <FaFacebook size={20} />
              <span>Facebook</span>
            </button>
            <button onClick={() => setActiveType("wifi")}>
              <FaWifi size={20} />
              <span>WiFi</span>
            </button>
            <button onClick={() => setActiveType("appstore")}>
              <FaApple size={20} />
              <span>App Store</span>
            </button>
            <button onClick={() => setActiveType("vcard")}>
              <FaIdCard size={20} />
              <span>vCard</span>
            </button>
          </div>
          <div className="form">
            {activeType === "url" && (
              <>
                <h3>Enter URL</h3>
                <input
                  type="url"
                  placeholder="Enter URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </>
            )}
            {activeType === "message" && (
              <>
                <h3>Enter Message</h3>
                <textarea
                  placeholder="Enter your message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </>
            )}
            {activeType === "email" && (
              <>
                <h3>Enter Email Details</h3>
                <input
                  type="email"
                  placeholder="Recipient Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                ></textarea>
              </>
            )}
            {activeType === "pdf" && (
              <>
                <h3>Enter PDF Details</h3>
                <input
                  type="url"
                  placeholder="Enter PDF URL (Optional)"
                  value={pdfURL}
                  onChange={(e) => setPdfURL(e.target.value)}
                />
                <h4>Or Upload a PDF</h4>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
              </>
            )}
            {activeType === "gallery" && (
              <>
                <h3>Upload Photos</h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setGalleryFiles([...e.target.files])}
                />
                <div className="gallery-preview">
                    {galleryFiles.map((file, index) => (
                      <div key={index} className="image-container">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="gallery-image"
                        />
                      </div>
                    ))}
                </div>

              </>
            )}
            {activeType === "twitter" && (
              <>
                <h3>Twitter Options</h3>
                <div className="twitter-options">
                  <button onClick={() => setTwitterOption("twitter-profile")}>
                    <FaTwitter size={20} />
                    <span>Profile</span>
                  </button>
                  <button onClick={() => setTwitterOption("twitter-tweet")}>
                    <FaTwitter size={20} />
                    <span>Tweet</span>
                  </button>
                </div>
                {twitterOption === "twitter-profile" && (
                  <>
                    <h3>Enter Twitter Handle</h3>
                    <input
                      type="text"
                      placeholder="e.g. yourhandle"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      required
                    />
                  </>
                )}
                {twitterOption === "twitter-tweet" && (
                  <>
                    <h3>Enter Tweet</h3>
                    <textarea
                      placeholder="Enter your tweet"
                      value={tweetText}
                      onChange={(e) => setTweetText(e.target.value)}
                      required
                    ></textarea>
                  </>
                )}
              </>
            )}
            {activeType === "bitcoin" && (
              <>
                <h3>Enter Bitcoin Payment Details</h3>
                <input
                  type="text"
                  placeholder="Cryptocurrency Type (e.g., Bitcoin, Ethereum)"
                  value={cryptoType}
                  onChange={(e) => setCryptoType(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Receiver (Name or Label)"
                  value={bitcoinReceiver}
                  onChange={(e) => setBitcoinReceiver(e.target.value)}
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Amount"
                  value={bitcoinAmount}
                  onChange={(e) => setBitcoinAmount(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Message (Optional)"
                  value={bitcoinMessage}
                  onChange={(e) => setBitcoinMessage(e.target.value)}
                ></textarea>
                <input
                  type="text"
                  placeholder="Address"
                  value={bitcoinAddress}
                  onChange={(e) => setBitcoinAddress(e.target.value)}
                  required
                />
              </>
            )}
            {activeType === "mp3" && (
              <>
                <h3>Upload MP3 File</h3>
                <input
                  type="file"
                  accept="audio/mpeg, audio/mp3"
                  onChange={(e) => setMp3File(e.target.files[0])}
                  required
                />
              </>
            )}
            {activeType === "facebook" && (
              <>
                <h3>Facebook Options</h3>
                <div className="facebook-options">
                  <button onClick={() => setFacebookOption("facebook-url")}>
                    <FaFacebook size={20} />
                    <span>URL</span>
                  </button>
                  <button onClick={() => setFacebookOption("facebook-post")}>
                    <FaFacebook size={20} />
                    <span>Post</span>
                  </button>
                </div>
                {facebookOption === "facebook-url" && (
                  <>
                    <h3>Enter Facebook URL</h3>
                    <input
                      type="url"
                      placeholder="Enter Facebook URL"
                      value={facebookURL}
                      onChange={(e) => setFacebookURL(e.target.value)}
                      required
                    />
                  </>
                )}
                {facebookOption === "facebook-post" && (
                  <>
                    <h3>Enter Your Post Text</h3>
                    <textarea
                      placeholder="Enter the text for your Facebook post"
                      value={facebookPostText}
                      onChange={(e) => setFacebookPostText(e.target.value)}
                      required
                    ></textarea>
                  </>
                )}
              </>
            )}
            {activeType === "wifi" && (
              <>
                <h3>WiFi Network Details</h3>
                <div
                  className="wifi-ssid-container"
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <input
                    type="text"
                    placeholder="SSID"
                    value={wifiSSID}
                    onChange={(e) => setWifiSSID(e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                    />{" "}
                    Hidden
                  </label>
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  required
                />
                <div className="wifi-encryption">
                  <label htmlFor="wifi-encryption">Encryption:</label>
                  <select
                    id="wifi-encryption"
                    value={wifiEncryption}
                    onChange={(e) => setWifiEncryption(e.target.value)}
                    required
                  >
                    <option value="without">without</option>
                    <option value="WPA/WPA2">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                  </select>
                </div>
              </>
            )}
            {activeType === "appstore" && (
              <>
                <h3>Enter App Store URL</h3>
                <input
                  type="url"
                  placeholder="Enter App Store URL"
                  value={appStoreURL}
                  onChange={(e) => setAppStoreURL(e.target.value)}
                  required
                />
              </>
            )}
            {activeType === "vcard" && (
              <>
                <h3>vCard Details</h3>
                <input
                  type="text"
                  placeholder="First Name"
                  value={vcardFirstName}
                  onChange={(e) => setVcardFirstName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={vcardLastName}
                  onChange={(e) => setVcardLastName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Organization (Optional)"
                  value={vcardOrganization}
                  onChange={(e) => setVcardOrganization(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Title (Optional)"
                  value={vcardTitle}
                  onChange={(e) => setVcardTitle(e.target.value)}
                />
              </>
            )}
            {activeType && (
              <button className="generate-button" onClick={handleGenerate}>
                Generate QR Code
              </button>
            )}
          </div>
        </div>
        <div className="qr-code-container">
          <h2>QR Code</h2>
          <div className="qr-code-display">
            {qrCodePNG ? (
              <img
                src={qrCodePNG}
                alt="Generated QR Code"
                style={{ height: "auto", objectFit: "contain", width: "100%", maxWidth: "300px", aspectRatio: "1/1" }}
              />
            ) : (
              <div className="placeholder">Your QR Code will appear here</div>
            )}
          </div>  
          {qrCodePNG && (
            <div className="download-buttons">
              <button onClick={handleDownloadPNG}>Download PNG</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeForm;

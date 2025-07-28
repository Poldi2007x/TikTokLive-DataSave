const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000; // Render benötigt diese Zeile!

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aktuelle Daten vom letzten Webhook, noch nicht bestätigt
let currentData = null;

// TikFinity → Webhook-Eingang
app.post("/webhook", (req, res) => {
  const { value1, value2, value3 } = req.body;
  if (!value1) return res.status(400).send("Kein Username (value1)");

  currentData = { username: value1, text: value2 || "", gift: value3 || "" };

  console.log("📩 Neuer Webhook erhalten:", currentData);
  res.send("Webhook OK");
});

// Roblox → Holt neue Events
app.get("/event", (req, res) => {
  if (currentData) {
    res.json({ new: true, data: currentData });
  } else {
    res.json({ new: false });
  }
});

// Roblox → Bestätigt Empfang
app.post("/confirm", (req, res) => {
  const { username } = req.body;
  if (currentData && currentData.username === username) {
    console.log("✅ Empfang bestätigt für:", username);
    currentData = null;
    res.send("Bestätigung OK");
  } else {
    res.status(400).send("Keine passende Daten zum Bestätigen");
  }
});

// Server starten – wichtig für Render:
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aktuelle Daten vom letzten Webhook, noch nicht bestätigt
let currentData = null;

app.post("/webhook", (req, res) => {
  const { value1, value2, value3 } = req.body;
  if (!value1) return res.status(400).send("Kein Username (value1)");

  currentData = { username: value1, text: value2 || "", gift: value3 || "" };

  console.log("Neuer Webhook erhalten:", currentData);

  res.send("Webhook OK");
});

// Roblox holt neue Daten, liefert nur wenn noch nicht bestätigt
app.get("/event", (req, res) => {
  if (currentData) {
    res.json({ new: true, data: currentData });
  } else {
    res.json({ new: false });
  }
});

// Roblox bestätigt den Empfang, Server leert currentData
app.post("/confirm", (req, res) => {
  const { username } = req.body;
  if (currentData && currentData.username === username) {
    console.log("Empfang bestätigt von Roblox für:", username);
    currentData = null; // Reset, damit nicht nochmal gesendet
    res.send("Bestätigung OK");
  } else {
    res.status(400).send("Keine passende Daten zum Bestätigen");
  }
});

app.listen(3000, () => {
  console.log("Server läuft auf http://localhost:3000");
});

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Warteschlange für mehrere Events
const eventQueue = [];

// TikFinity → Webhook-Eingang
app.post("/webhook", (req, res) => {
  const { value1, value2, value3 } = req.body;
  if (!value1) return res.status(400).send("Kein Username (value1)");

  const eventData = {
    id: Date.now().toString() + Math.random().toString(36).substring(2), // eindeutige ID
    username: value1,
    text: value2 || "",
    gift: value3 || ""
  };

  eventQueue.push(eventData);

  console.log("📩 Neuer Webhook erhalten:", eventData);
  res.send("Webhook OK");
});

// Roblox → Holt den nächsten Event (FIFO)
app.get("/event", (req, res) => {
  if (eventQueue.length > 0) {
    res.json({ new: true, data: eventQueue[0] }); // Zeigt nur ersten an
  } else {
    res.json({ new: false });
  }
});

// Roblox → Bestätigt Empfang → entfernt den Event aus der Queue
app.post("/confirm", (req, res) => {
  const { username } = req.body;

  if (eventQueue.length > 0 && eventQueue[0].username === username) {
    console.log("✅ Empfang bestätigt für:", username);
    eventQueue.shift(); // Entfernt den ersten
    res.send("Bestätigung OK");
  } else {
    res.status(400).send("Keine passende Daten zum Bestätigen");
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
});

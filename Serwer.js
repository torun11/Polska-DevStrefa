const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const ticketsDir = path.join(__dirname, "tickets");
if (!fs.existsSync(ticketsDir)) {
  fs.mkdirSync(ticketsDir);
}

// Utwórz nowy ticket (plik)
app.post("/tickets", (req, res) => {
  const { username, title, message } = req.body;
  const ticketId = Date.now(); // unikalne ID na podstawie czasu
  const ticketPath = path.join(ticketsDir, `ticket-${ticketId}.json`);

  const ticketData = {
    id: ticketId,
    username,
    title,
    messages: [
      { sender: username, message, created_at: new Date().toISOString() }
    ]
  };

  fs.writeFileSync(ticketPath, JSON.stringify(ticketData, null, 2));
  res.json(ticketData);
});

// Pobierz listę ticketów
app.get("/tickets", (req, res) => {
  const files = fs.readdirSync(ticketsDir);
  const tickets = files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(ticketsDir, file)));
    return { id: data.id, username: data.username, title: data.title };
  });
  res.json(tickets);
});

// Pobierz wiadomości z ticketu
app.get("/tickets/:id", (req, res) => {
  const ticketPath = path.join(ticketsDir, `ticket-${req.params.id}.json`);
  if (!fs.existsSync(ticketPath)) {
    return res.status(404).json({ error: "Ticket nie istnieje" });
  }
  const data = JSON.parse(fs.readFileSync(ticketPath));
  res.json(data);
});

// Dodaj wiadomość do ticketu
app.post("/tickets/:id/messages", (req, res) => {
  const ticketPath = path.join(ticketsDir, `ticket-${req.params.id}.json`);
  if (!fs.existsSync(ticketPath)) {
    return res.status(404).json({ error: "Ticket nie istnieje" });
  }

  const { sender, message } = req.body;
  const data = JSON.parse(fs.readFileSync(ticketPath));
  data.messages.push({
    sender,
    message,
    created_at: new Date().toISOString()
  });

  fs.writeFileSync(ticketPath, JSON.stringify(data, null, 2));
  res.json(data);
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Backend działa na http://localhost:${PORT}`));

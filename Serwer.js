  }
}

// Utwórz nowy ticket (zwraca cały obiekt ticketu)
app.post('/tickets', async (req, res) => {
  try {
    const { username, title, message } = req.body || {};
    if (!username || !title || !message) {
      return res.status(400).json({ error: 'Brakuje pola username, title lub message' });
    }

    const id = uuidv4();
    const ticket = {
      id,
      username,
      title,
      created_at: new Date().toISOString(),
      messages: [
        { id: uuidv4(), sender: username, message, created_at: new Date().toISOString() }
      ]
    };

    await fs.writeFile(ticketFilePath(id), JSON.stringify(ticket, null, 2), 'utf8');
    return res.status(201).json(ticket);
  } catch (err) {
    console.error('POST /tickets error', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Pobierz listę ticketów (podstawowe informacje)
app.get('/tickets', async (req, res) => {
  try {
    const files = await fs.readdir(ticketsDir);
    const tickets = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(async (f) => {
          const raw = await fs.readFile(path.join(ticketsDir, f), 'utf8');
          const obj = JSON.parse(raw);
          // Zwracamy tylko streszczenie
          return { id: obj.id, username: obj.username, title: obj.title, created_at: obj.created_at, last_message: obj.messages && obj.messages.length ? obj.messages[obj.messages.length-1] : null };
        })
    );
    return res.json(tickets);
  } catch (err) {
    console.error('GET /tickets error', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Pobierz pełny ticket (wraz z wiadomościami)
app.get('/tickets/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const ticket = await readTicket(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket nie znaleziony' });
    return res.json(ticket);
  } catch (err) {
    console.error('GET /tickets/:id error', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Dodaj wiadomość do ticketu
app.post('/tickets/:id/messages', async (req, res) => {
  try {
    const id = req.params.id;
    const { sender, message } = req.body || {};
    if (!sender || !message) return res.status(400).json({ error: 'Brakuje pola sender lub message' });

    const ticket = await readTicket(id);
    if (!ticket) return res.status(404).json({ error: 'Ticket nie istnieje' });

    const msg = { id: uuidv4(), sender, message, created_at: new Date().toISOString() };
    ticket.messages.push(msg);

    await fs.writeFile(ticketFilePath(id), JSON.stringify(ticket, null, 2), 'utf8');
    return res.json(ticket);
  } catch (err) {
    console.error('POST /tickets/:id/messages error', err);
    return res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
  }
});

// Opcjonalnie: serwuj statyczny frontend z katalogu /public (jeśli umieścisz tam build React)
const publicDir = path.join(__dirname, 'public');
if (fsSync.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend działa na http://localhost:${PORT} (port ${PORT})`));

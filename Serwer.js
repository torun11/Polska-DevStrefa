const apiBase = "http://localhost:4000"; // Twój backend Node.js

const ticketListEl = document.getElementById("ticketList");
const chatSection = document.getElementById("chat");
const ticketsSection = document.getElementById("tickets");
const ticketTitleEl = document.getElementById("ticketTitle");
const messagesEl = document.getElementById("messages");
let currentTicketId = null;

// Utwórz nowy ticket
document.getElementById("createTicket").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const title = document.getElementById("title").value;
  const message = document.getElementById("message").value;

  if (!username || !title || !message) return alert("Wypełnij wszystkie pola!");

  const res = await fetch(`${apiBase}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, title, message })
  });
  const data = await res.json();
  loadTickets();
});

// Załaduj listę ticketów
async function loadTickets() {
  const res = await fetch(`${apiBase}/tickets`);
  const tickets = await res.json();

  ticketListEl.innerHTML = "";
  tickets.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (autor: ${t.username})`;
    li.style.cursor = "pointer";
    li.onclick = () => openTicket(t.id, t.title);
    ticketListEl.appendChild(li);
  });
}
loadTickets();

// Otwórz ticket (czat)
async function openTicket(id, title) {
  currentTicketId = id;
  ticketTitleEl.textContent = title;
  ticketsSection.style.display = "none";
  chatSection.style.display = "block";
  loadMessages();
}

// Załaduj wiadomości z ticketu
async function loadMessages() {
  const res = await fetch(`${apiBase}/tickets/${currentTicketId}`);
  const ticket = await res.json();

  messagesEl.innerHTML = "";
  ticket.messages.forEach(msg => {
    const li = document.createElement("li");
    li.textContent = `[${msg.sender}] ${msg.message}`;
    messagesEl.appendChild(li);
  });
}

// Wyślij wiadomość
document.getElementById("sendMessage").addEventListener("click", async () => {
  const sender = document.getElementById("replySender").value;
  const message = document.getElementById("replyMessage").value;

  if (!sender || !message) return alert("Wypełnij pola!");

  await fetch(`${apiBase}/tickets/${currentTicketId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, message })
  });

  document.getElementById("replyMessage").value = "";
  loadMessages();
});

// Powrót do listy ticketów
document.getElementById("backTickets").addEventListener("click", () => {
  chatSection.style.display = "none";
  ticketsSection.style.display = "block";
});

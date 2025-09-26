// System ticketów w LocalStorage
let tickets = JSON.parse(localStorage.getItem('tickets') || '[]');
let currentTicketId = null;

const ticketListEl = document.getElementById("ticketList");
const chatSection = document.getElementById("chat");
const ticketsSection = document.getElementById("tickets");
const ticketTitleEl = document.getElementById("ticketTitle");
const messagesEl = document.getElementById("messages");

// Utwórz nowy ticket
document.getElementById("createTicket").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const title = document.getElementById("title").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!username || !title || !message) return alert("Wypełnij wszystkie pola!");

  const ticket = {
    id: Date.now(),
    username,
    title,
    messages: [{ sender: username, message }]
  };

  tickets.push(ticket);
  localStorage.setItem('tickets', JSON.stringify(tickets));

  document.getElementById("username").value = '';
  document.getElementById("title").value = '';
  document.getElementById("message").value = '';

  loadTickets();
});

// Załaduj listę ticketów
function loadTickets() {
  ticketListEl.innerHTML = '';
  tickets.forEach(t => {
    const li = document.createElement("li");
    li.textContent = `${t.title} (autor: ${t.username})`;
    li.style.cursor = "pointer";
    li.onclick = () => openTicket(t.id);
    ticketListEl.appendChild(li);
  });
}
loadTickets();

// Otwórz ticket
function openTicket(id) {
  currentTicketId = id;
  const ticket = tickets.find(t => t.id === id);
  ticketTitleEl.textContent = ticket.title;

  ticketsSection.style.display = "none";
  chatSection.style.display = "block";

  loadMessages();
}

// Załaduj wiadomości
function loadMessages() {
  const ticket = tickets.find(t => t.id === currentTicketId);
  messagesEl.innerHTML = '';
  ticket.messages.forEach(m => {
    const li = document.createElement("li");
    li.textContent = `[${m.sender}] ${m.message}`;
    messagesEl.appendChild(li);
  });
}

// Wyślij wiadomość
document.getElementById("sendMessage").addEventListener("click", () => {
  const sender = document.getElementById("replySender").value.trim();
  const message = document.getElementById("replyMessage").value.trim();
  if (!sender || !message) return alert("Wypełnij pola!");

  const ticket = tickets.find(t => t.id === currentTicketId);
  ticket.messages.push({ sender, message });
  localStorage.setItem('tickets', JSON.stringify(tickets));

  document.getElementById("replyMessage").value = '';
  loadMessages();
});

// Powrót do listy ticketów
document.getElementById("backTickets").addEventListener("click", () => {
  chatSection.style.display = "none";
  ticketsSection.style.display = "block";
});

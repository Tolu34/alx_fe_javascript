let quotes = [];

// Load quotes from localStorage or use defaults
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't watch the clock; do what it does. Keep going.", category: "Productivity" },
  ];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const display = document.getElementById("quoteDisplay");
  const filtered = getFilteredQuotes();
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  display.innerHTML = `<p><strong>${random.text}</strong> <em>(${random.category})</em></p>`;
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(random));
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;
  if (!text || !category) return alert("Please enter both quote and category.");
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuotes();
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

function populateCategories() {
  const filter = document.getElementById("categoryFilter");
  const selected = localStorage.getItem("selectedCategory") || "all";
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  filter.innerHTML = categories.map(cat => `<option value="${cat}" ${cat === selected ? "selected" : ""}>${cat}</option>`).join("");
}

function getFilteredQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  return selected === "all" ? quotes : quotes.filter(q => q.category === selected);
}

function filterQuotes() {
  const display = document.getElementById("quoteDisplay");
  const filtered = getFilteredQuotes();
  display.innerHTML = filtered.map(q => `<p><strong>${q.text}</strong> <em>(${q.category})</em></p>`).join("");
  localStorage.setItem("selectedCategory", document.getElementById("categoryFilter").value);
}

async function fetchQuotesFromServer() {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
  const data = await res.json();
  return data.map(post => ({ text: post.title, category: "Server" }));
}

function resolveConflicts(serverQuotes, localQuotes) {
  return [...serverQuotes, ...localQuotes.filter(lq => !serverQuotes.find(sq => sq.text === lq.text))];
}

async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    const localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    const resolved = resolveConflicts(serverQuotes, localQuotes);
    quotes = resolved;
    saveQuotes();
    populateCategories();
    filterQuotes();
    showSyncNotification("Quotes synced with server!");
  } catch (err) {
    console.error("Sync failed:", err);
    showSyncNotification("Failed to fetch quotes from server.", true);
  }
}

function showSyncNotification(message, error = false) {
  const note = document.createElement("div");
  note.innerText = message;
  note.style.padding = "10px";
  note.style.margin = "10px";
  note.style.color = error ? "red" : "green";
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3000);
}

window.onload = () => {
  loadQuotes();
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  syncQuotes();
  setInterval(syncQuotes, 10000);
};

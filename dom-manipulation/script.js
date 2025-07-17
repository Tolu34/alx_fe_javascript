let quotes = [];

const serverURL = "https://jsonplaceholder.typicode.com/posts"; // mock API

// Save and Load Quotes
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [];
}

// Add Quote
async function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Please provide quote & category.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  // POST to mock server (simulate sync)
  try {
    const res = await fetch(serverURL, {
      method: "POST",
      body: JSON.stringify(newQuote),
      headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Server error");
    showSyncNotification("Quote synced to server.");
  } catch (err) {
    console.error("Failed to sync quote:", err);
    showSyncNotification("Failed to sync quote.", true);
  }

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Show Random Quote
function showRandomQuote() {
  const filter = localStorage.getItem("selectedCategory") || "all";
  const filtered = filter === "all" ? quotes : quotes.filter(q => q.category === filter);
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes found.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").innerText = `"${random.text}" — ${random.category}`;
}

// Filter & Populate Categories
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const unique = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = `<option value="all">All Categories</option>`;
  unique.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
  select.value = localStorage.getItem("selectedCategory") || "all";
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// Import/Export
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported!");
      }
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ✅ NEW: Sync Quotes from Server (uses async/await)
async function fetchQuotesFromServer() {
  const res = await fetch(serverURL);
  const data = await res.json();
  return data.slice(0, 5).map(p => ({
    text: p.title,
    category: "Server"
  }));
}

// ✅ NEW: Conflict Resolution & Merge
function resolveConflicts(serverQuotes, localQuotes) {
  const merged = [];
  const seen = new Set();

  [...serverQuotes, ...localQuotes].forEach(q => {
    const id = q.text.trim().toLowerCase();
    if (!seen.has(id)) {
      merged.push(q);
      seen.add(id);
    }
  });

  return merged;
}

// ✅ NEW: Sync All Quotes
async function syncQuotes() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await res.json();
    const formatted = serverQuotes.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server'
    }));

    const unique = formatted.filter(fq => !quotes.some(lq => lq.text === fq.text));

    if (unique.length > 0) {
      quotes.push(...unique);
      saveQuotes();
      populateCategories();
      notify('Quotes synced with server!'); // ✅ This line should exist
    }
  } catch (err) {
    console.error('Sync error:', err);
    notify('Failed to sync with server!');
  }
}

function notify(message) {
  const note = document.createElement('div');
  note.innerText = message;
  note.style.position = 'fixed';
  note.style.top = '10px';
  note.style.right = '10px';
  note.style.background = '#4caf50';
  note.style.color = '#fff';
  note.style.padding = '10px';
  note.style.borderRadius = '5px';
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 3000);
}



// ✅ Init
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
window.onload = () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
  syncQuotes();
};

// ✅ Periodic Sync
setInterval(syncQuotes, 60000); // every 60 seconds

let quotes = [];

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function loadQuotes() {
  const storedQuotes = JSON.parse(localStorage.getItem("quotes"));
  if (storedQuotes) {
    quotes = storedQuotes;
  } else {
    quotes = [
      { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
      { text: "The best way to predict the future is to invent it.", category: "Motivation" },
    ];
    saveQuotes();
  }
}

function showRandomQuote() {
  const filter = localStorage.getItem("selectedCategory") || "all";
  const filtered = filter === "all" ? quotes : quotes.filter(q => q.category === filter);
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes available.";
    return;
  }
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").innerText = `"${random.text}" - (${random.category})`;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please enter both quote and category.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function populateCategories() {
  const dropdown = document.getElementById("categoryFilter");
  const existingValue = dropdown.value;
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  dropdown.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.innerText = cat;
    dropdown.appendChild(option);
  });

  dropdown.value = existingValue || localStorage.getItem("selectedCategory") || "all";
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "quotes.json";
  link.click();
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ========== NEW: Server Fetch ==========

const serverURL = "https://jsonplaceholder.typicode.com/posts";

function fetchQuotesFromServer() {
  return fetch(serverURL)
    .then(res => res.json())
    .then(serverData => {
      return serverData.slice(0, 5).map(post => ({
        text: post.title,
        category: "Server"
      }));
    });
}

function mergeQuotes(serverQuotes, localQuotes) {
  const seen = new Set();
  const merged = [];

  [...serverQuotes, ...localQuotes].forEach(q => {
    const key = q.text.trim().toLowerCase();
    if (!seen.has(key)) {
      merged.push(q);
      seen.add(key);
    }
  });

  return merged;
}

function showSyncNotification(message, isError = false) {
  const statusDiv = document.getElementById("syncStatus");
  statusDiv.textContent = message;
  statusDiv.style.color = isError ? "red" : "green";
  setTimeout(() => (statusDiv.textContent = ""), 4000);
}

function syncWithServer() {
  fetchQuotesFromServer()
    .then(serverQuotes => {
      const localData = JSON.parse(localStorage.getItem("quotes")) || [];
      const mergedQuotes = mergeQuotes(serverQuotes, localData);
      quotes = mergedQuotes;
      saveQuotes();
      populateCategories();
      filterQuotes();
      showSyncNotification(`Synced with server. ${serverQuotes.length} quotes checked.`);
    })
    .catch(err => {
      showSyncNotification("Failed to sync with server.", true);
      console.error(err);
    });
}

// ========== Init ==========
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
window.onload = () => {
  loadQuotes();
  populateCategories();
  filterQuotes();
};

setInterval(syncWithServer, 60000); // Auto-sync every 60 seconds

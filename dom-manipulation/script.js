let quotes = [];

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) quotes = JSON.parse(stored);
  const lastFilter = localStorage.getItem('selectedCategory');
  if (lastFilter) document.getElementById('categoryFilter').value = lastFilter;
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  const category = document.getElementById('categoryFilter').value;
  const filtered = category === 'all' ? quotes : quotes.filter(q => q.category === category);
  if (filtered.length === 0) {
    document.getElementById('quoteDisplay').innerHTML = `<p>No quotes found for this category.</p>`;
    return;
  }
  const index = Math.floor(Math.random() * filtered.length);
  document.getElementById('quoteDisplay').innerHTML = `<p>${filtered[index].text} <em>(${filtered[index].category})</em></p>`;
  sessionStorage.setItem('lastQuote', JSON.stringify(filtered[index]));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert('Both fields are required.');
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  showRandomQuote();
}

// Populate unique categories into filter dropdown
function populateCategories() {
  const select = document.getElementById('categoryFilter');
  const categories = ['all', ...new Set(quotes.map(q => q.category))];

  select.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

// Filter quotes based on selected category
function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', category);
  showRandomQuote();
}

// Export quotes as JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      quotes.push(...imported);
      saveQuotes();
      populateCategories();
      showRandomQuote();
      alert('Quotes imported successfully!');
    } catch (error) {
      alert('Invalid JSON format.');
    }
  };
  reader.readAsText(event.target.files[0]);
}

// UI notification
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

// Sync quotes from mock server
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
      notify('Quotes synced with server!');
    }
  } catch (err) {
    console.error('Sync error:', err);
    notify('Failed to sync with server!');
  }
}

// On page load
window.onload = () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();

  const last = sessionStorage.getItem('lastQuote');
  if (last) {
    const q = JSON.parse(last);
    document.getElementById('quoteDisplay').innerHTML = `<p>${q.text} <em>(${q.category})</em></p>`;
  }

  // Periodically sync quotes
  setInterval(syncQuotes, 30000);
};

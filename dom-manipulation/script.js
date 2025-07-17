let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');

// Load quotes from localStorage or initialize
function loadQuotes() {
  const savedQuotes = localStorage.getItem('quotes');
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  } else {
    quotes = [
      { text: "Be yourself; everyone else is already taken.", category: "Inspiration" },
      { text: "So many books, so little time.", category: "Books" }
    ];
    saveQuotes();
  }
}

// Save to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.innerHTML = `<p>${random.text}</p><small>Category: ${random.category}</small>`;
  sessionStorage.setItem('lastQuote', JSON.stringify(random));
}

// Add a quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) return alert('Please fill all fields.');

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  showRandomQuote();
  postQuoteToServer(newQuote);
}

// Populate dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) categoryFilter.value = savedFilter;
}

// Filter quotes
function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  showRandomQuote();
}

// Import JSON
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
}

// Export JSON
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Post new quote to mock API
async function postQuoteToServer(quote) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
    console.log('Quote posted to server.');
  } catch (err) {
    console.error('Failed to post quote:', err);
  }
}

// Sync quotes from server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverQuotes = await res.json();
    const formatted = serverQuotes.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server'
    }));
    // Conflict resolution: server overrides duplicates
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

// UI notification
function notify(message) {
  const div = document.createElement('div');
  div.textContent = message;
  div.style.background = '#222';
  div.style.color = '#fff';
  div.style.padding = '10px';
  div.style.margin = '10px 0';
  document.body.prepend(div);
  setTimeout(() => div.remove(), 3000);
}

// Run on page load
window.onload = () => {
  loadQuotes();
  populateCategories();
  showRandomQuote();
  // Periodic sync every 30 seconds
  setInterval(fetchQuotesFromServer, 30000);
};

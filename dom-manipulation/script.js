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
    alert('Quote

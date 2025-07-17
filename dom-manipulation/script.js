const quotes = [
  { text: "Success is not final; failure is not fatal.", category: "Motivation" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');

// Show a random quote from filtered category or all
function showRandomQuote() {
  let selectedCategory = categoryFilter.value;
  let filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerText = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  quoteDisplay.innerText = `"${filteredQuotes[randomIndex].text}" — ${filteredQuotes[randomIndex].category}`;
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });

    // Add new category to filter dropdown if not already there
    if (![...categoryFilter.options].some(option => option.value === newCategory)) {
      const newOption = document.createElement('option');
      newOption.value = newCategory;
      newOption.text = newCategory;
      categoryFilter.appendChild(newOption);
    }

    textInput.value = '';
    categoryInput.value = '';
    alert('Quote added!');
  } else {
    alert('Please enter both quote text and category.');
  }
}

// Event listeners
newQuoteButton.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', showRandomQuote);

// Initial population
showRandomQuote();
function showRandomQuote() {
  let selectedCategory = categoryFilter.value;
  let filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<em>No quotes available for this category.</em>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p><strong>— ${quote.category}</strong></p>`;
}

updateCategoryDropdown();

function updateCategoryDropdown() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  uniqueCategories.forEach(category => {
    if (![...categoryFilter.options].some(option => option.value === category)) {
      const option = document.createElement('option');
      option.value = category;
      option.text = category;
      categoryFilter.appendChild(option);
    }
  });
}

const searchInput   = document.getElementById('searchInput');
const clearBtn      = document.getElementById('clearBtn');
const spinnerWrap   = document.getElementById('spinnerWrap');
const errorBox      = document.getElementById('errorBox');
const errorMsg      = document.getElementById('errorMsg');
const retryBtn      = document.getElementById('retryBtn');
const noResults     = document.getElementById('noResults');
const countriesGrid = document.getElementById('countriesGrid');
const resultCount   = document.getElementById('resultCount');

let allCountries = []; 

const API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,population,region,capital';

const MUSLIM_MAJORITY_COUNTRIES = new Set([
  'Afghanistan', 'Albania', 'Algeria', 'Azerbaijan', 'Bahrain',
  'Bangladesh', 'Brunei', 'Burkina Faso', 'Chad', 'Comoros',
  'Djibouti', 'Egypt', 'Gambia', 'Guinea', 'Guinea-Bissau',
  'Indonesia', 'Iran', 'Iraq', 'Jordan', 'Kazakhstan',
  'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Lebanon', 'Libya',
  'Malaysia', 'Maldives', 'Mali', 'Mauritania', 'Morocco',
  'Niger', 'Nigeria', 'Oman', 'Pakistan', 'Palestine',
  'Qatar', 'Saudi Arabia', 'Senegal', 'Sierra Leone', 'Somalia',
  'Sudan', 'Syria', 'Tajikistan', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Uganda', 'United Arab Emirates', 'Uzbekistan',
  'Western Sahara', 'Yemen'
]);

async function fetchCountries() {
  showSpinner();
  hideError();
  hideNoResults();
  clearGrid();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const sorted = data.sort((a, b) =>
      a.name.common.localeCompare(b.name.common)
    );

    const muslimCountries = sorted.filter(c =>
      MUSLIM_MAJORITY_COUNTRIES.has(c.name.common)
    );
    const otherCountries = sorted.filter(c =>
      !MUSLIM_MAJORITY_COUNTRIES.has(c.name.common)
    );

    const remaining = Math.max(0, 100 - muslimCountries.length);
    const combined = [...muslimCountries, ...otherCountries.slice(0, remaining)];

    allCountries = combined.sort((a, b) =>
      a.name.common.localeCompare(b.name.common)
    );

    hideSpinner();
    renderCountries(allCountries);

  } catch (error) {
    hideSpinner();
    const message = error.message.includes('fetch')
      ? 'Unable to connect. Please check your internet connection and try again.'
      : `Something went wrong: ${error.message}`;
    showError(message);
    console.error('Fetch error:', error);
  }
}

function renderCountries(countries) {
  clearGrid();

  if (countries.length === 0) {
    showNoResults();
    updateResultCount(0);
    return;
  }

  hideNoResults();
  updateResultCount(countries.length);

  countries.forEach((country, index) => {
    const card = createCard(country, index);
    countriesGrid.appendChild(card);
  });
}

function createCard(country, index) {
  const card = document.createElement('div');
  card.className = 'country-card';
  card.style.animationDelay = `${index * 0.05}s`;

  const name       = country.name?.common || 'Unknown';
  const flagUrl    = country.flags?.png || country.flags?.svg || '';
  const flagAlt    = country.flags?.alt || `Flag of ${name}`;
  const population = country.population
    ? country.population.toLocaleString()
    : 'N/A';
  const region  = country.region  || 'Unknown';
  const capital = country.capital ? country.capital[0] : 'N/A';

  card.innerHTML = `
    <img
      class="card-flag"
      src="${flagUrl}"
      alt="${flagAlt}"
      loading="lazy"
      onerror="this.src=''; this.style.background='#1d2535'; this.alt='Flag unavailable';"
    />
    <div class="card-body">
      <div class="card-name" title="${name}">${name}</div>
      <div class="card-detail">
        <span class="detail-label">👥</span>
        <span class="detail-value">${population}</span>
      </div>
      <div class="card-detail">
        <span class="detail-label">🏙️</span>
        <span class="detail-value">${capital}</span>
      </div>
      <span class="card-region-badge">${region}</span>
    </div>
  `;

  return card;
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();

  if (query.length > 0) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }

  filterCountries(query);
});

function filterCountries(query) {
  if (!query) {
    renderCountries(allCountries);
    return;
  }

  const filtered = allCountries.filter((country) =>
    country.name.common.toLowerCase().includes(query)
  );

  renderCountries(filtered);
}

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.remove('visible');
  searchInput.focus();
  renderCountries(allCountries);
});

retryBtn.addEventListener('click', fetchCountries);

function showSpinner() {
  spinnerWrap.classList.remove('hidden');
}

function hideSpinner() {
  spinnerWrap.classList.add('hidden');
}

function showError(message) {
  errorBox.classList.add('visible');
  if (message) errorMsg.textContent = message;
}

function hideError() {
  errorBox.classList.remove('visible');
}

function showNoResults() {
  noResults.classList.add('visible');
}

function hideNoResults() {
  noResults.classList.remove('visible');
}

function clearGrid() {
  countriesGrid.innerHTML = '';
}

function updateResultCount(count) {
  const query = searchInput.value.trim();
  if (query) {
    resultCount.textContent = `Found ${count} countr${count === 1 ? 'y' : 'ies'} matching "${query}"`;
  } else {
    resultCount.textContent = `Showing ${count} countries (includes all Muslim-majority countries)`;
  }
}

fetchCountries();

// Real-time Currency Exchange API integration
class CurrencyExchange {
  constructor() {
    this.apiUrl = 'https://open.er-api.com/v6/latest/INR';
    this.container = document.getElementById('currency-rates');
    this.searchInput = document.getElementById('currency-search');
    this.amountInput = document.getElementById('convert-amount');
    this.convertBtn = document.getElementById('convert-btn');
    this.resultDiv = document.getElementById('conversion-result');
    this.refreshInterval = 30000; // Update every 30 seconds (free tier limit)
    this.previousRates = {};
    this.allRates = {};
    
    // Event listeners
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.filterCurrencies(e.target.value));
    }
    if (this.convertBtn) {
      this.convertBtn.addEventListener('click', () => this.convertCurrency());
    }
    if (this.amountInput) {
      this.amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.convertCurrency();
      });
    }
    
    this.startRealTimeUpdates();
  }

  startRealTimeUpdates() {
    // Initial fetch
    this.fetchExchangeRates();
    
    // Auto-update every 30 seconds
    setInterval(() => {
      this.fetchExchangeRates();
    }, this.refreshInterval);
  }

  async fetchExchangeRates() {
    try {
      const response = await fetch(this.apiUrl);
      const data = await response.json();
      
      if (data.rates) {
        this.allRates = data.rates; // Store all rates for conversion
        this.displayRates(data.rates);
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      this.displayError();
    }
  }

  filterCurrencies(searchTerm) {
    const cards = document.querySelectorAll('.currency-card');
    const term = searchTerm.toLowerCase();
    
    cards.forEach(card => {
      const code = card.querySelector('.currency-code')?.textContent.toLowerCase() || '';
      const name = card.querySelector('.currency-name')?.textContent.toLowerCase() || '';
      
      if (code.includes(term) || name.includes(term) || term === '') {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  convertCurrency() {
    const amount = parseFloat(this.amountInput.value);
    const currency = this.searchInput.value.toUpperCase();
    
    if (!amount || amount <= 0) {
      this.resultDiv.innerHTML = '<div style="color: var(--red);">Please enter a valid amount</div>';
      return;
    }
    
    if (!currency) {
      this.resultDiv.innerHTML = '<div style="color: var(--red);">Please select a currency</div>';
      return;
    }
    
    if (!this.allRates[currency]) {
      this.resultDiv.innerHTML = '<div style="color: var(--red);">Currency not found</div>';
      return;
    }
    
    const rate = this.allRates[currency];
    const converted = (amount * rate).toFixed(2);
    
    this.resultDiv.innerHTML = `
      <div style="
        background: var(--green-dim);
        border: 1px solid var(--green);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
      ">
        <div style="color: var(--text-2); font-size: 0.8rem;">Conversion Result</div>
        <div style="
          color: var(--green);
          font-size: 1.4rem;
          font-weight: 800;
          font-family: 'Geist Mono', monospace;
          margin: 8px 0;
        ">
          ₹${amount} = ${converted} ${currency}
        </div>
        <div style="color: var(--text-2); font-size: 0.75rem;">
          Exchange Rate: 1 INR = ${rate.toFixed(4)} ${currency}
        </div>
      </div>
    `;
  }

  displayRates(rates) {
    // Show major currencies relevant to GST/international trade
    const majorCurrencies = [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
    ];
    
    let html = '';
    
    majorCurrencies.forEach(currency => {
      if (rates[currency.code]) {
        const currentRate = rates[currency.code];
        const previousRate = this.previousRates[currency.code];
        
        // Calculate change
        let change = 0;
        let changePercent = 0;
        let direction = '→';
        let directionClass = 'neutral';
        
        if (previousRate) {
          change = currentRate - previousRate;
          changePercent = ((change / previousRate) * 100).toFixed(2);
          
          if (change > 0) {
            direction = '↑';
            directionClass = 'up';
          } else if (change < 0) {
            direction = '↓';
            directionClass = 'down';
          }
        }
        
        // Store current rate for next comparison
        this.previousRates[currency.code] = currentRate;
        
        const formattedRate = currentRate.toFixed(4);
        const formattedChange = Math.abs(change).toFixed(4);
        
        html += `
          <div class="currency-card ${directionClass}">
            <div class="currency-header">
              <div class="currency-code">${currency.code}</div>
              <div class="currency-symbol">${currency.symbol}</div>
            </div>
            
            <div class="currency-rate-section">
              <div class="currency-price">
                <span class="rate-label">1 INR =</span>
                <span class="rate-value">${formattedRate}</span>
              </div>
              <div class="currency-name">${currency.name}</div>
            </div>
            
            <div class="currency-change ${directionClass}">
              <span class="change-direction">${direction}</span>
              <span class="change-value">${formattedChange}</span>
              <span class="change-percent">(${changePercent}%)</span>
            </div>
            
            <div class="currency-timestamp">
              <small class="update-time">Updated now</small>
            </div>
          </div>
        `;
      }
    });
    
    this.container.innerHTML = html;
  }

  displayError() {
    this.container.innerHTML = `
      <div style="
        color: var(--red);
        padding: 20px;
        text-align: center;
        background: var(--red-dim);
        border: 1px solid var(--red);
        border-radius: 8px;
      ">
        ⚠️ Unable to load exchange rates. Retrying in 30 seconds...
      </div>
    `;
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const exchange = new CurrencyExchange();
});

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/public/login.html';
}

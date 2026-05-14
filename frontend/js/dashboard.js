// Dashboard Controller with Dynamic Charts & Exchange Rates
class DashboardController {
  constructor() {
    this.apiUrl = 'https://open.er-api.com/v6/latest/INR';
    this.container = document.getElementById('currency-rates');
    this.searchInput = document.getElementById('currency-search');
    this.amountInput = document.getElementById('convert-amount');
    this.convertBtn = document.getElementById('convert-btn');
    this.resultDiv = document.getElementById('conversion-result');
    this.refreshInterval = 30000; // Update every 30 seconds
    this.previousRates = {};
    this.allRates = {};
    
    this.severityChart = null;
    this.trendChart = null;
    
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
    this.initCharts();
    this.initializeKPIs();
    this.setupCSVDataListener();
  }

  initCharts() {
    if (typeof Chart === 'undefined') return;

    const sevEl = document.getElementById('dashSeverityChart');
    const trendEl = document.getElementById('dashTrendChart');

    if (sevEl) {
      this.severityChart = new Chart(sevEl, {
        type: 'doughnut',
        data: {
          labels: ['Low', 'Medium', 'High', 'Critical'],
          datasets: [{
            data: [0, 0, 0, 0],
            backgroundColor: ['rgba(57,255,140,0.25)', 'rgba(79,163,255,0.22)', 'rgba(255,193,58,0.25)', 'rgba(255,79,79,0.25)'],
            borderColor: ['rgba(57,255,140,0.65)', 'rgba(79,163,255,0.65)', 'rgba(255,193,58,0.65)', 'rgba(255,79,79,0.65)'],
            borderWidth: 1.5,
            hoverOffset: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,20,23,0.92)', titleColor: '#eef2ee', bodyColor: '#eef2ee' } }
        }
      });
    }

    if (trendEl) {
      const gridColor = 'rgba(255,255,255,0.06)';
      const tickColor = 'rgba(255,255,255,0.35)';
      this.trendChart = new Chart(trendEl, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'Fraud Flags',
            data: [],
            backgroundColor: 'rgba(255,79,79,0.1)',
            borderColor: 'rgba(255,79,79,0.9)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: tickColor, maxTicksLimit: 12 } },
            y: { grid: { color: gridColor }, ticks: { color: tickColor } }
          }
        }
      });
    }
  }

  setupCSVDataListener() {
    window.addEventListener('csvDataUpdated', (e) => {
      this.processCSVDataForDashboard(e.detail.csvData);
    });
    window.addEventListener('storage', (e) => {
      if (e.key === 'analytics_csv_data') {
        this.processCSVDataForDashboard(e.newValue);
      }
    });
    const existingData = sessionStorage.getItem('analytics_csv_data');
    if (existingData) {
      this.processCSVDataForDashboard(existingData);
    }
  }

  processCSVDataForDashboard(csvText) {
    const emptyState = document.getElementById('dash-empty-state');
    const midRow = document.getElementById('dash-mid-row');
    const botRow = document.getElementById('dash-bot-row');

    if (!csvText) {
      this.updateKPIs(0, 0, 0, 0);
      if (emptyState) emptyState.style.display = 'block';
      if (midRow) midRow.style.display = 'none';
      if (botRow) botRow.style.display = 'none';
      return;
    }

    try {
      const rows = csvText.split('\n').map(r => r.trim()).filter(r => r);
      if (rows.length < 2) return;

      if (emptyState) emptyState.style.display = 'none';
      if (midRow) midRow.style.display = 'grid';
      if (botRow) botRow.style.display = 'grid';

      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      const idx = {
        sales: headers.findIndex(h => h.includes('sales')),
        purchase: headers.findIndex(h => h.includes('purchase')),
        itc: headers.findIndex(h => h.includes('itc') || h.includes('tax')),
        refund: headers.findIndex(h => h.includes('refund')),
        id: headers.findIndex(h => h.includes('gstin') || h.includes('identifier') || (h.includes('id') && !h.includes('name'))),
        company: headers.findIndex(h => h.includes('company') || h.includes('name'))
      };

      if (idx.sales === -1 || idx.purchase === -1 || idx.itc === -1 || idx.refund === -1) return;

      const validRows = rows.slice(1);
      let totalSales = 0, totalITC = 0, totalRefund = 0, fraudCount = 0, lowCount = 0;
      let sevCounts = [0, 0, 0, 0]; // Low, Med, High, Crit
      let alerts = [];
      let entities = [];
      let triggerCounts = { 'ITC Mismatch': 0, 'High Refund': 0, 'Circular Trading': 0 };

      // For trend chart (buckets)
      const numBuckets = 20;
      let trendBuckets = new Array(numBuckets).fill(0);

      validRows.forEach((row, i) => {
        const cols = row.split(',').map(c => c.trim());
        const sales = parseFloat(cols[idx.sales]) || 0;
        const purchase = parseFloat(cols[idx.purchase]) || 0;
        const itc = parseFloat(cols[idx.itc]) || 0;
        const refund = parseFloat(cols[idx.refund]) || 0;
        const gstin = idx.id !== -1 ? cols[idx.id] : `Row ${i + 1}`;
        const company = idx.company !== -1 ? cols[idx.company] : 'Unknown Entity';

        totalSales += sales;

        let triggers = [];
        if (itc > 0.5 * sales) { triggers.push('ITC Mismatch'); triggerCounts['ITC Mismatch']++; }
        if (refund > 0.3 * sales) { triggers.push('High Refund'); triggerCounts['High Refund']++; }
        if (purchase > 1.5 * sales) { triggers.push('Circular Trading'); triggerCounts['Circular Trading']++; }

        let riskLevel = 'Low';
        let riskClass = 'g';
        let riskIdx = 0;
        if (triggers.length === 1) { riskLevel = 'Medium'; riskClass = 'b'; riskIdx = 1; }
        else if (triggers.length === 2) { riskLevel = 'High'; riskClass = 'y'; riskIdx = 2; }
        else if (triggers.length >= 3) { riskLevel = 'Critical'; riskClass = 'r'; riskIdx = 3; }

        sevCounts[riskIdx]++;
        if (riskIdx > 0) {
          fraudCount++;
          trendBuckets[Math.floor((i / validRows.length) * numBuckets)]++;
          
          let alertAmt = itc + refund > 0 ? (itc + refund) : sales * 0.18;
          entities.push({ gstin, company, amount: alertAmt, triggers, riskLevel, riskClass, riskIdx });
          
          if (alerts.length < 5) {
            alerts.push({
              title: triggers[0],
              sub: `${company} flagged for suspicious patterns.`,
              time: `${Math.floor(Math.random() * 10) + 1}m ago`,
              riskClass, riskLevel
            });
          }
        } else {
          lowCount++;
        }

        if (riskIdx >= 2) {
          totalITC += itc;
          totalRefund += refund;
        }
      });

      const totalInvoices = validRows.length;
      const fraudAmount = (totalITC + totalRefund) / 10000000;
      const accuracy = totalInvoices > 0 ? ((lowCount / totalInvoices) * 100) : 0;
      this.updateKPIs(totalInvoices, fraudCount, fraudAmount, accuracy);

      // Render Donut Chart
      if (this.severityChart) {
        this.severityChart.data.datasets[0].data = sevCounts;
        this.severityChart.update();
        document.getElementById('dash-severity-total').textContent = fraudCount;

        const legendEl = document.getElementById('dash-donut-legend');
        if (legendEl) {
          const colors = ['var(--green)', 'var(--blue)', 'var(--yellow)', 'var(--red)'];
          const labels = ['Low', 'Medium', 'High', 'Critical'];
          legendEl.innerHTML = labels.map((l, i) => `
            <div class="legend-item" style="margin-bottom:8px;">
              <div class="legend-dot" style="background: ${colors[i]}; box-shadow: 0 0 5px ${colors[i]};"></div>
              <div class="legend-label">${l}</div>
              <div class="legend-val">${sevCounts[i]}</div>
            </div>
          `).join('');
        }
      }

      // Render Trigger Gauges
      const gaugesEl = document.getElementById('dash-gauge-list');
      if (gaugesEl) {
        const totalTriggers = triggerCounts['ITC Mismatch'] + triggerCounts['High Refund'] + triggerCounts['Circular Trading'];
        if (totalTriggers === 0) {
          gaugesEl.innerHTML = '<div style="color:var(--text-2); font-size:0.8rem; padding:10px;">No triggers detected.</div>';
        } else {
          const triggersInfo = [
            { label: 'Circular Trading', val: triggerCounts['Circular Trading'], colorClass: 'red' },
            { label: 'High Refund', val: triggerCounts['High Refund'], colorClass: 'yellow' },
            { label: 'ITC Mismatch', val: triggerCounts['ITC Mismatch'], colorClass: 'blue' }
          ];
          
          gaugesEl.innerHTML = triggersInfo.map(t => {
            const pct = Math.round((t.val / totalTriggers) * 100);
            return `
              <div class="gauge-item">
                <div class="gauge-header">
                  <span class="gauge-label">${t.label}</span>
                  <span class="gauge-val">${t.val} (${pct}%)</span>
                </div>
                <div class="gauge-track">
                  <div class="gauge-fill ${t.colorClass}" style="width: ${pct}%;"></div>
                </div>
              </div>
            `;
          }).join('');
        }
      }

      // Render Trend Chart
      if (this.trendChart) {
        this.trendChart.data.labels = new Array(numBuckets).fill('').map((_, i) => `B${i+1}`);
        this.trendChart.data.datasets[0].data = trendBuckets;
        this.trendChart.update();
      }

      // Render Recent Alerts
      const alertsEl = document.getElementById('dash-alert-list');
      if (alertsEl) {
        if (alerts.length === 0) {
          alertsEl.innerHTML = '<div style="color:var(--text-2); font-size:0.8rem; padding:10px;">No alerts detected.</div>';
        } else {
          alertsEl.innerHTML = alerts.map(a => `
            <div class="alert-row">
              <div class="alert-dot-sm ${a.riskClass}"></div>
              <div class="alert-text">
                <div class="alert-title-sm">${a.title}</div>
                <div class="alert-sub-sm">${a.sub}</div>
              </div>
              <div class="alert-meta">
                <div class="risk-pill ${a.riskLevel === 'Critical' || a.riskLevel === 'High' ? 'high' : a.riskLevel === 'Medium' ? 'med' : 'low'}">${a.riskLevel}</div>
                <div class="alert-time-sm">${a.time}</div>
              </div>
            </div>
          `).join('');
        }
      }

      // Render Top Entities
      const tableBody = document.getElementById('dash-entities-table');
      if (tableBody) {
        entities.sort((a, b) => b.riskIdx - a.riskIdx || b.amount - a.amount);
        const topEntities = entities.slice(0, 5);
        
        if (topEntities.length === 0) {
          tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-2); padding:20px;">No suspicious entities found.</td></tr>';
        } else {
          tableBody.innerHTML = topEntities.map(e => `
            <tr>
              <td class="td-gstin">${e.gstin}</td>
              <td style="color:var(--text-2); font-size:0.8rem;">${e.company}</td>
              <td class="td-amount" style="color:var(--red);">₹${this.formatNumber(e.amount)}</td>
              <td style="font-size:0.75rem;">${e.triggers.join(', ')}</td>
              <td><span class="td-status ${e.riskIdx >= 2 ? 'flagged' : 'review'}">${e.riskLevel}</span></td>
            </tr>
          `).join('');
        }
      }

    } catch (error) {
      console.error('Error processing CSV data for dashboard:', error);
    }
  }

  initializeKPIs() {
    if (!sessionStorage.getItem('analytics_csv_data')) {
      this.updateKPIs(0, 0, 0, 0);
    }
  }

  updateKPIs(invoices, fraudCases, fraudAmount, accuracy) {
    const kpi1 = document.querySelector('.kpi-val.blue');
    const kpi2 = document.querySelector('.kpi-val.red');
    const kpi3 = document.querySelector('.kpi-val.yellow');
    const kpi4 = document.querySelector('.kpi-val.green');

    if (kpi1) kpi1.textContent = this.formatNumber(invoices);
    if (kpi2) kpi2.textContent = this.formatNumber(fraudCases);
    if (kpi3) kpi3.textContent = `₹${fraudAmount.toFixed(1)}Cr`;
    if (kpi4) kpi4.textContent = `${accuracy.toFixed(1)}%`;
  }

  formatNumber(n) {
    return new Intl.NumberFormat('en-IN').format(Math.round(n));
  }

  startRealTimeUpdates() {
    // Initial fetch
    this.fetchExchangeRates();
    
    // Auto-update every 30 seconds
    this.intervalId = setInterval(() => {
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
window.InvoShield = window.InvoShield || {};
window.InvoShield.initDashboard = () => {
  if (window.InvoShield.dashboardInstance) {
    if (window.InvoShield.dashboardInstance.intervalId) {
      clearInterval(window.InvoShield.dashboardInstance.intervalId);
    }
    if (window.InvoShield.dashboardInstance.severityChart) {
      window.InvoShield.dashboardInstance.severityChart.destroy();
    }
    if (window.InvoShield.dashboardInstance.trendChart) {
      window.InvoShield.dashboardInstance.trendChart.destroy();
    }
  }
  window.InvoShield.dashboardInstance = new DashboardController();
};

document.addEventListener('DOMContentLoaded', () => {
  if (location.pathname.endsWith('/dashboard.html') || location.pathname.endsWith('\\dashboard.html') || location.href.includes('dashboard.html')) {
    window.InvoShield.initDashboard();
  }
});

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/public/login.html';
}

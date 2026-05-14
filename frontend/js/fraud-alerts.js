(() => {
  function renderCards(data) {
    try {
      const cardsGrid = document.querySelector('.cards-grid');
      if (!cardsGrid) return;

      if (Array.isArray(data) && data.length > 0) {
        cardsGrid.innerHTML = '';

        const bannerSub = document.querySelector('.banner-sub');
        if (bannerSub) {
          bannerSub.textContent = `${data.length} cases require review`;
        }
        const badgeCount = document.querySelector('.nav-item.active .badge-count');
        if (badgeCount) {
          badgeCount.textContent = data.length;
        }

        data.forEach(alert => {
          try {
            const card = document.createElement('div');
            card.className = 'alert-card';

            let sevBg = '';
            if (alert.severity === 'HIGH') {
              sevBg = 'background:#ff9100;color:#000;';
            } else if (alert.severity === 'MEDIUM') {
              sevBg = 'background:#ffab00;color:#000;';
            }

            let confidenceColor = alert.severity === 'CRITICAL' ? 'red' : 'orange';
            const amount = alert.amount ? alert.amount : 0;
            const inrFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
            
            const triggers = Array.isArray(alert.triggers) ? alert.triggers : [];
            const triggersHtml = triggers.length > 0 
              ? triggers.map(t => `<span class="tag suspicious">${t || 'Suspicious'}</span>`).join('')
              : '<span class="tag suspicious">Anomaly Detected</span>';

            card.innerHTML = `
              <div class="ac-header">
                <div class="ac-left">
                  <span class="ac-status ${alert.severity ? alert.severity.toLowerCase() : 'medium'}">${alert.severity || 'MEDIUM'}</span>
                  <div class="ac-id">${alert.id || 'ALT-UNKNOWN'}</div>
                  <div class="ac-title">${alert.title || 'Suspicious Pattern Detected'}</div>
                </div>
                <div class="ac-right">
                  <div class="ac-severity ${alert.severity ? alert.severity.toLowerCase() : 'medium'}" style="${sevBg}">${alert.severity || 'MEDIUM'}</div>
                  <div class="ac-amount">${inrFormat}</div>
                </div>
              </div>
              <div class="ac-body">
                <div class="ac-row">
                  <span class="ac-label">GSTIN</span>
                  <span class="ac-value mono">${alert.gstin || 'UNKNOWN'}</span>
                </div>
                <div class="ac-row">
                  <span class="ac-label">Entity</span>
                  <span class="ac-value">${alert.entity || 'Unknown Entity'}</span>
                </div>
                <div class="ac-row">
                  <span class="ac-label">Detected</span>
                  <span class="ac-value">${alert.detected || 'Just now'}</span>
                </div>
                <div class="ac-row">
                  <span class="ac-label">Pattern Score</span>
                  <span class="ac-value ${confidenceColor}">${alert.score || 50}/100</span>
                </div>
              </div>
              <div class="ac-tags">
                ${triggersHtml}
              </div>
              <div class="ac-footer">
                <a href="alert-details.html?alertId=${encodeURIComponent(alert.id || 'ALT-001')}" class="ac-action view">View Details</a>
                <a href="assignment-simple.html?alertId=${encodeURIComponent(alert.id || 'ALT-001')}" class="ac-action assign">Assign</a>
              </div>
            `;
            cardsGrid.appendChild(card);
          } catch (itemErr) {
            console.error('Error rendering individual card:', itemErr);
          }
        });
      } else {
        const bannerSub = document.querySelector('.banner-sub');
        if (bannerSub) {
          bannerSub.textContent = `0 cases require review`;
        }
        const badgeCount = document.querySelector('.nav-item.active .badge-count');
        if (badgeCount) {
          badgeCount.textContent = '0';
        }
        cardsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--r); border: 1px dashed var(--border);">
            <div style="font-size: 3rem; margin-bottom: 20px; color: var(--text-3);">✓</div>
            <div style="font-size: 1.2rem; color: var(--text-1); margin-bottom: 10px;">No Fraud Alerts Detected</div>
            <div style="color: var(--text-2);">Upload a CSV file in the Analytics page or refine your search.</div>
            <button class="tbtn ghost" style="margin-top:20px; border: 1px solid var(--border);" onclick="window.location.href='analytics.html'">Go to Analytics</button>
          </div>
        `;
      }
    } catch (err) {
      console.error('Error in renderCards:', err);
    }
  }

  function init() {
    try {
      const main = document.querySelector('.main');
      if (!main) return;

      let alertData = null;
      try {
        const stored = sessionStorage.getItem('fraud_alerts_data');
        if (stored) alertData = JSON.parse(stored);
      } catch(e) {
        console.error('Failed to parse fraud_alerts_data from sessionStorage:', e);
      }

      renderCards(alertData);

      const searchInput = document.getElementById('fa-search');
      if (searchInput) {
        // Remove old listener to avoid duplicates
        const newSearch = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearch, searchInput);
        
        newSearch.addEventListener('input', (e) => {
          const query = e.target.value.toLowerCase();
          if (!alertData) return;
          const filtered = alertData.filter(a =>
            (a.gstin && a.gstin.toLowerCase().includes(query)) ||
            (a.entity && a.entity.toLowerCase().includes(query)) ||
            (a.id && a.id.toLowerCase().includes(query)) ||
            (a.severity && a.severity.toLowerCase().includes(query))
          );
          renderCards(filtered);
        });
      }

      const cardsGrid = document.querySelector('.cards-grid');
      if (cardsGrid) {
        // Since SPA swaps DOM, there are no lingering event listeners. No need to clone.
        cardsGrid.addEventListener('click', function (e) {
          if (e.target.classList.contains('view') || e.target.classList.contains('assign')) {
            e.preventDefault();
            const alertCard = e.target.closest('.alert-card');
            const alertIdElement = alertCard ? alertCard.querySelector('.ac-id') : null;
            const alertId = alertIdElement ? alertIdElement.textContent.trim() : 'ALT-001';

            if (e.target.classList.contains('view')) {
              window.location.href = `alert-details.html?alertId=${encodeURIComponent(alertId)}`;
            } else {
              window.location.href = `assignment-simple.html?alertId=${encodeURIComponent(alertId)}`;
            }
          }
        });
      }
    } catch (err) {
      console.error('Error in initFraudAlerts:', err);
    }
  }

  window.InvoShield = window.InvoShield || {};
  window.InvoShield.initFraudAlerts = () => setTimeout(init, 0);

  // Fallback for direct page loads
  document.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('fraud-alert.html')) {
      window.InvoShield.initFraudAlerts();
    }
  });
})();

(() => {
  function initGSTINLookup() {
    const searchBtn = document.getElementById('searchBtn');
    const gstinInput = document.getElementById('gstinInput');
    const resultContainer = document.getElementById('resultContainer');
    const errorMsg = document.getElementById('errorMsg');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Elements to populate
    const resCompany = document.getElementById('resCompany');
    const resSales = document.getElementById('resSales');
    const resPurchase = document.getElementById('resPurchase');
    const resITC = document.getElementById('resITC');
    const resRefund = document.getElementById('resRefund');
    const resRisk = document.getElementById('resRisk');

    if (!searchBtn || !gstinInput) return;

    // Remove old listeners to prevent duplicates in SPA
    const newBtn = searchBtn.cloneNode(true);
    searchBtn.parentNode.replaceChild(newBtn, searchBtn);

    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumSignificantDigits: 3 }).format(val);

    newBtn.addEventListener('click', async () => {
      const gstin = gstinInput.value.trim().toUpperCase();
      if (gstin.length !== 15) {
        errorMsg.textContent = 'Please enter a valid 15-character GSTIN.';
        errorMsg.style.display = 'block';
        resultContainer.style.display = 'none';
        return;
      }

      errorMsg.style.display = 'none';
      resultContainer.style.display = 'none';
      loadingIndicator.style.display = 'block';

      try {
        // Assuming backend is running on 5000
        const response = await fetch(`http://localhost:5000/api/gstin/lookup/${gstin}`);
        const result = await response.json();
        
        loadingIndicator.style.display = 'none';

        if (result.success) {
          resCompany.textContent = result.data.companyName;
          resSales.textContent = formatCurrency(result.data.sales);
          resPurchase.textContent = formatCurrency(result.data.purchase);
          resITC.textContent = formatCurrency(result.data.itc);
          resRefund.textContent = formatCurrency(result.data.refund);
          
          if (result.data.riskScore === 'HIGH') {
            resRisk.textContent = 'HIGH RISK';
            resRisk.style.background = 'rgba(255, 68, 68, 0.1)';
            resRisk.style.color = '#ff4444';
            resRisk.style.border = '1px solid rgba(255, 68, 68, 0.3)';
          } else {
            resRisk.textContent = 'LOW RISK';
            resRisk.style.background = 'rgba(0, 230, 118, 0.1)';
            resRisk.style.color = '#00e676';
            resRisk.style.border = '1px solid rgba(0, 230, 118, 0.3)';
          }

          resultContainer.style.display = 'block';
        } else {
          errorMsg.textContent = result.message || 'GSTIN not found.';
          errorMsg.style.display = 'block';
        }
      } catch (err) {
        loadingIndicator.style.display = 'none';
        errorMsg.textContent = 'Error connecting to the server. Is the backend running?';
        errorMsg.style.display = 'block';
        console.error(err);
      }
    });
  }

  window.InvoShield = window.InvoShield || {};
  window.InvoShield.initGSTINLookup = initGSTINLookup;

  document.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('gstin-lookup.html')) {
      window.InvoShield.initGSTINLookup();
    }
  });
})();

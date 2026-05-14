(() => {
  let invoices = [];
  let filteredInvoices = [];
  let currentPage = 1;
  const itemsPerPage = 13;

  async function loadCSVData() {
    try {
      // Only load data if CSV has been uploaded in analytics page
      const csvText = sessionStorage.getItem('analytics_csv_data');
      if (!csvText) {
        console.log('No CSV data uploaded in analytics page. Invoice data will not be loaded.');
        invoices = [];
        renderTable();
        return;
      }

      console.log('Loading CSV data for invoices from session storage...');
      const lines = csvText.split('\n').filter(line => line.trim());

      if (lines.length <= 1) {
        invoices = [];
      } else {
        invoices = lines.slice(1).map((line, index) => {
          try {
            const parts = line.split(',');
            const gstin = (parts[0] || '').replace(/"/g, '').trim();
            const company = (parts[1] || '').replace(/"/g, '').trim();
            const sales = (parts[2] || '').replace(/"/g, '').trim();
            
            const invoiceId = `INV-${(gstin.substring(0, 2) || '00')}-${String(index + 1).padStart(6, '0')}`;
            const totalAmount = parseInt(sales) || Math.floor(Math.random() * 10000000) + 100000;
            const riskScore = Math.floor(Math.random() * 100);

            let status = 'cleared';
            if (riskScore >= 80) status = 'flagged';
            else if (riskScore >= 50) status = 'pending';

            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            return {
              id: invoiceId,
              gstin: gstin || 'UNKNOWN',
              entity: company || 'Unknown Entity',
              amount: totalAmount,
              date: formattedDate,
              status: status,
              risk: riskScore
            };
          } catch(err) {
            console.error('Error parsing line:', line, err);
            return null;
          }
        }).filter(Boolean);
      }
      
      applyFilters();
    } catch (error) {
      console.error('Error loading CSV data:', error);
      invoices = [];
      applyFilters();
    }
  }

  function renderTable() {
    try {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const data = filteredInvoices.slice(startIndex, endIndex);
      const body = document.getElementById('invoiceBody');

      if (!body) return;

      body.innerHTML = '';
      
      if (data.length === 0) {
        body.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px; color: var(--text-2);">No invoices found</td></tr>';
        const tableInfo = document.getElementById('tableInfo');
        if (tableInfo) tableInfo.textContent = 'No invoices found';
        return;
      }

      data.forEach(inv => {
        try {
          const tr = document.createElement('tr');
          const amountStr = inv.amount ? inv.amount.toLocaleString('en-IN') : '0';
          const statusStr = inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : 'Unknown';
          
          tr.innerHTML = `
            <td><input type="checkbox" /></td>
            <td class="td-id">${inv.id || 'N/A'}</td>
            <td class="td-gstin">${inv.gstin || 'N/A'}</td>
            <td class="td-entity">${inv.entity || 'N/A'}</td>
            <td class="td-amount ${(inv.amount || 0) > 1000000 ? 'debit' : 'credit'}">₹${amountStr}</td>
            <td class="td-date">${inv.date || 'N/A'}</td>
            <td><span class="status-badge ${inv.status || 'cleared'}">${statusStr}</span></td>
            <td><span class="rscore ${(inv.risk || 0) >= 80 ? 'hi' : (inv.risk || 0) >= 50 ? 'md' : 'lo'}">${inv.risk || 0}</span></td>
            <td class="td-actions">
              <button class="action-icon"><svg viewBox="0 0 24 24" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></svg></button>
            </td>
          `;
          body.appendChild(tr);
        } catch (itemErr) {
          console.error('Error rendering invoice row:', itemErr);
        }
      });

      const startItem = data.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
      const endItem = Math.min(currentPage * itemsPerPage, filteredInvoices.length);
      const tableInfo = document.getElementById('tableInfo');
      if (tableInfo) {
        tableInfo.textContent = `Showing ${startItem}-${endItem} of ${filteredInvoices.length} invoices`;
      }
    } catch (err) {
      console.error('Error in renderTable:', err);
    }
  }

  function updatePagination() {
    try {
      const totalItems = filteredInvoices.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const paginationContainer = document.getElementById('paginationControls');

      if (!paginationContainer) return;
      
      if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
      }

      let paginationHTML = `<button class="pag-btn" onclick="window.InvoShield.changeInvoicePage('prev')" ${currentPage === 1 ? 'disabled' : ''}><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></button>`;

      const maxVisiblePages = 5;
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="pag-btn ${activeClass}" onclick="window.InvoShield.changeInvoicePage(${i})">${i}</button>`;
      }

      paginationHTML += `<button class="pag-btn" onclick="window.InvoShield.changeInvoicePage('next')" ${currentPage === totalPages ? 'disabled' : ''}><svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></button>`;

      paginationContainer.innerHTML = paginationHTML;
    } catch (err) {
      console.error('Error updating pagination:', err);
    }
  }

  function changePage(page) {
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    if (page === 'prev') {
      currentPage = Math.max(1, currentPage - 1);
    } else if (page === 'next') {
      currentPage = Math.min(totalPages, currentPage + 1);
    } else if (typeof page === 'number') {
      currentPage = page;
    }

    renderTable();
    updatePagination();
  }

  function applyFilters() {
    try {
      const gstinInput = document.getElementById('gstinFilter');
      const statusInput = document.getElementById('statusFilter');
      const amountInput = document.getElementById('amountFilter');
      
      const gstinFilter = gstinInput ? (gstinInput.value || '').toLowerCase() : '';
      const statusFilter = statusInput ? (statusInput.value || '') : '';
      const amountFilter = amountInput ? (amountInput.value || '') : '';

      filteredInvoices = invoices.filter(invoice => {
        if (gstinFilter && (!invoice.gstin || !invoice.gstin.toLowerCase().includes(gstinFilter))) return false;
        if (statusFilter && invoice.status !== statusFilter) return false;

        if (amountFilter) {
          const parts = amountFilter.split('-');
          const min = parseFloat(parts[0]?.trim());
          const max = parseFloat(parts[1]?.trim());
          if (!isNaN(min) && (invoice.amount || 0) < min) return false;
          if (!isNaN(max) && (invoice.amount || 0) > max) return false;
        }
        return true;
      });

      currentPage = 1;
      renderTable();
      updatePagination();
    } catch (err) {
      console.error('Error applying filters:', err);
      filteredInvoices = [...invoices];
      renderTable();
      updatePagination();
    }
  }

  // Modal functions
  function openAddInvoiceModal() {
    const modal = document.getElementById('addInvoiceModal');
    if (modal) modal.style.display = 'block';
  }

  function closeAddInvoiceModal() {
    const modal = document.getElementById('addInvoiceModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('addInvoiceForm');
    if (form) form.reset();
  }

  async function saveInvoiceToBackend(invoice) {
    try {
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: invoice.id,
          gstin: invoice.gstin,
          entity: invoice.entity,
          amount: invoice.amount
        })
      });

      if (response.ok) {
        console.log('Invoice saved successfully to CSV');
        
        // Append to local session storage to keep UI in sync
        let localCsv = sessionStorage.getItem('analytics_csv_data');
        if (localCsv) {
          const newCsvLine = `\n${invoice.gstin},"${invoice.entity}",${invoice.amount},0,0,0,Pending`;
          sessionStorage.setItem('analytics_csv_data', localCsv + newCsvLine);
        }
        
        setTimeout(loadCSVData, 1000);
      } else {
        console.error('Failed to save invoice to CSV');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  }

  function handleFormSubmit(event) {
    try {
      event.preventDefault();

      const gstin = document.getElementById('gstin')?.value || '';
      const invoiceId = document.getElementById('invoiceId')?.value || '';
      const supplierName = document.getElementById('supplierName')?.value || '';
      const amount = document.getElementById('amount')?.value || '0';

      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}Z[0-9]{1}$/.test(gstin)) {
        alert('Please enter a valid GSTIN format (e.g., 27AABC1234D1Z5)');
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      const newInvoice = {
        id: invoiceId,
        gstin: gstin,
        entity: supplierName,
        amount: parsedAmount,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'pending',
        risk: Math.floor(Math.random() * 100),
        isNewlyAdded: true
      };

      invoices.unshift(newInvoice);
      applyFilters();
      saveInvoiceToBackend(newInvoice);
      closeAddInvoiceModal();
    } catch (err) {
      console.error('Error handling form submit:', err);
    }
  }

  function bindEvents() {
    try {
      const gstinFilter = document.getElementById('gstinFilter');
      const statusFilter = document.getElementById('statusFilter');
      const amountFilter = document.getElementById('amountFilter');
      const form = document.getElementById('addInvoiceForm');
      
      const apply = () => applyFilters();
      
      // Since DOM is replaced, we can safely re-add listeners.
      if (gstinFilter) { gstinFilter.addEventListener('input', apply); }
      if (statusFilter) { statusFilter.addEventListener('change', apply); }
      if (amountFilter) { amountFilter.addEventListener('input', apply); }
      if (form) { form.addEventListener('submit', handleFormSubmit); }
    } catch (err) {
      console.error('Error binding events:', err);
    }
  }

  function init() {
    const main = document.querySelector('.main');
    if (!main) return;
    
    bindEvents();
    loadCSVData();
  }

  window.InvoShield = window.InvoShield || {};
  window.InvoShield.initInvoices = () => setTimeout(init, 0);
  
  // Expose global methods used by inline event handlers in HTML
  window.InvoShield.changeInvoicePage = changePage;
  window.InvoShield.openAddInvoiceModal = openAddInvoiceModal;
  window.InvoShield.closeAddInvoiceModal = closeAddInvoiceModal;
  window.InvoShield.handleInvoiceSubmit = handleFormSubmit;
  window.InvoShield.applyInvoiceFilters = applyFilters;

  // For compatibility with any existing inline onclicks just in case
  window.changePage = changePage;
  window.openAddInvoiceModal = openAddInvoiceModal;
  window.closeAddInvoiceModal = closeAddInvoiceModal;
  window.handleFormSubmit = handleFormSubmit;
  window.applyFilters = applyFilters;

  // Fallback for direct page loads
  document.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('invoices.html')) {
      window.InvoShield.initInvoices();
    }
  });
})();

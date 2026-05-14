const fs = require('fs');

function fixInvoices() {
  let html = fs.readFileSync('frontend/public/invoices.html', 'utf8');

  // Remove the first inline script block
  html = html.replace(/<script>\s*\/\/\s*Immediate data loading[\s\S]*?<\/script>/, '');

  // Move modal inside .main
  const modalRegex = /<!-- Add Invoice Modal -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
  const modalMatch = html.match(modalRegex);
  if (modalMatch) {
      html = html.replace(modalRegex, '');
      html = html.replace('</main>', '\n  ' + modalMatch[0] + '\n    </main>');
  }

  // Replace bottom scripts
  html = html.replace(/<script src="\/js\/router\.js"><\/script>[\s\S]*?<\/html>/, `<script src="/js/router.js"></script>
  <script src="/js/invoices.js"></script>
  <script>
    function logout() {
      localStorage.removeItem('token');
      window.location.href = '/public/login.html';
    }
  </script>
</body>
</html>`);

  // Also update onclicks for the modal
  html = html.replace(/onclick="closeAddInvoiceModal\(\)"/g, 'onclick="window.InvoShield.closeAddInvoiceModal()"');
  html = html.replace(/onclick="openAddInvoiceModal\(\)"/g, 'onclick="window.InvoShield.openAddInvoiceModal()"');
  html = html.replace(/onsubmit="handleFormSubmit\(event\)"/g, 'onsubmit="window.InvoShield.handleInvoiceSubmit(event)"');
  html = html.replace(/oninput="applyFilters\(\)"/g, 'oninput="window.InvoShield.applyInvoiceFilters()"');
  html = html.replace(/onchange="applyFilters\(\)"/g, 'onchange="window.InvoShield.applyInvoiceFilters()"');

  fs.writeFileSync('frontend/public/invoices.html', html);
  console.log('invoices.html updated successfully');
}

function fixFraudAlerts() {
  let html = fs.readFileSync('frontend/public/fraud-alert.html', 'utf8');

  // Replace bottom scripts
  html = html.replace(/<script src="\/js\/router\.js"><\/script>[\s\S]*?<\/html>/, `<script src="/js/router.js"></script>
  <script src="/js/fraud-alerts.js"></script>
  <script>
    function logout() {
      localStorage.removeItem('token');
      window.location.href = '/public/login.html';
    }
  </script>
</body>
</html>`);

  fs.writeFileSync('frontend/public/fraud-alert.html', html);
  console.log('fraud-alert.html updated successfully');
}

fixInvoices();
fixFraudAlerts();

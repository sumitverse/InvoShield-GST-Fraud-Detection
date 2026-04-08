function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type || 'success');
  setTimeout(() => t.className = 'toast', 3200);
}

function openPanel(name, gstin, risk, amount, zone, type, date, officer, notes) {
  document.getElementById('panel-name').textContent    = name;
  document.getElementById('panel-gstin').textContent   = gstin;
  document.getElementById('panel-risk').textContent    = risk;
  document.getElementById('panel-amount').textContent  = amount;
  document.getElementById('panel-zone').textContent    = zone;
  document.getElementById('panel-type').textContent    = type;
  document.getElementById('panel-date').textContent    = date;
  document.getElementById('panel-officer').textContent = officer;
  document.getElementById('panel-notes').textContent   = notes;
  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('open');
}

function closePanel() {
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('open');
}

function viewCase() {
  closePanel();
  window.location.href = 'case-manager.html';
}

function confirmRemove() {
  const name = document.getElementById('panel-name').textContent;
  if (confirm('Remove "' + name + '" from blacklist? This will require supervisor approval.')) {
    closePanel();
    showToast('✅ Removal request submitted for supervisor review.', 'success');
  }
}

function exportReport() {
  const name = document.getElementById('panel-name').textContent;
  showToast('⬇ Generating PDF report for "' + name + '"…', 'info');
}

function removeEntry(btn) {
  const row = btn.closest('tr');
  const name = row.querySelector('.td-name').textContent;
  if (confirm('Remove "' + name + '" from blacklist? This requires supervisor approval.')) {
    showToast('✅ Removal request submitted for supervisor review.', 'success');
  }
}

function exportBlacklist() {
  showToast('⬇ Exporting blacklist to CSV…', 'info');
}

function openAddModal() {
  document.getElementById('add-modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('add-modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
}

function addToBlacklist() {
  const gstin = document.getElementById('bl-gstin').value.trim();
  const name  = document.getElementById('bl-name').value.trim();
  if (!gstin || !name) { showToast('⚠ GSTIN and Entity Name are required.', 'warning'); return; }
  closeModal();
  showToast('🚫 "' + name + '" has been added to the blacklist.', 'success');
  ['bl-gstin','bl-name','bl-amount','bl-reason'].forEach(id => document.getElementById(id).value = '');
}

// Search filter
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('bl-search').addEventListener('input', function() {
    const term = this.value.toLowerCase();
    document.querySelectorAll('#bl-table tbody tr').forEach(row => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });

  document.getElementById('bl-type-filter').addEventListener('change', function() {
    const val = this.value;
    document.querySelectorAll('#bl-table tbody tr').forEach(row => {
      const type = row.querySelector('.bl-type');
      row.style.display = (!val || (type && type.classList.contains(val))) ? '' : 'none';
    });
  });

  document.getElementById('bl-zone-filter').addEventListener('change', function() {
    const val = this.value;
    document.querySelectorAll('#bl-table tbody tr').forEach(row => {
      row.style.display = (!val || row.textContent.includes(val)) ? '' : 'none';
    });
  });

  document.getElementById('select-all').addEventListener('change', function() {
    document.querySelectorAll('#bl-table tbody input[type="checkbox"]').forEach(cb => cb.checked = this.checked);
  });
});

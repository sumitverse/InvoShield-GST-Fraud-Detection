function logout() { window.location.href = 'login.html'; }

function setView(v) {
  document.getElementById('view-kanban').style.display = v === 'kanban' ? 'grid' : 'none';
  document.getElementById('view-list').style.display   = v === 'list'   ? 'block' : 'none';
  document.getElementById('btn-kanban').classList.toggle('active', v === 'kanban');
  document.getElementById('btn-list').classList.toggle('active', v === 'list');
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + (type || 'success');
  setTimeout(() => t.className = 'toast', 3000);
}

function openPanel(caseId, gstin, priority, amount, status, officer, opened) {
  document.getElementById('panel-case-id').textContent   = caseId;
  document.getElementById('panel-case-gstin').textContent = gstin;
  document.getElementById('panel-priority').textContent  = priority;
  document.getElementById('panel-amount').textContent    = amount;
  document.getElementById('panel-status').textContent    = status;
  document.getElementById('panel-title').textContent     = caseId;
  document.getElementById('panel-officer').textContent   = officer;
  document.getElementById('panel-opened').textContent    = opened;
  const sel = document.getElementById('panel-status-select');
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].text === status) { sel.selectedIndex = i; break; }
  }
  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('open');
}

function closePanel() {
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('open');
}

function updateCaseStatus() {
  const status = document.getElementById('panel-status-select').value;
  const id = document.getElementById('panel-case-id').textContent;
  document.getElementById('panel-status').textContent = status;
  closePanel();
  showToast(`✅ ${id} status updated to "${status}"`, 'success');
}

function escalateCase() {
  const id = document.getElementById('panel-case-id').textContent;
  closePanel();
  showToast(`🚨 ${id} escalated to Senior Commissioner`, 'warning');
}

function exportCase() {
  const id = document.getElementById('panel-case-id').textContent;
  showToast(`⬇ Generating PDF report for ${id}…`, 'info');
}

function openNewCaseModal() {
  document.getElementById('new-case-modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('new-case-modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
}

function createCase() {
  const title = document.getElementById('nc-title').value.trim();
  const gstin  = document.getElementById('nc-gstin').value.trim();
  if (!title || !gstin) { showToast('⚠ Please fill in Title and GSTIN', 'warning'); return; }
  const priority = document.getElementById('nc-priority').value;
  const officer  = document.getElementById('nc-officer').value;
  const id = 'CASE-2025-' + String(Math.floor(Math.random() * 900) + 100).padStart(5, '0');
  closeModal();
  showToast(`✅ ${id} created and assigned to ${officer}`, 'success');
  // Clear form
  ['nc-title','nc-gstin','nc-amount','nc-notes'].forEach(id => document.getElementById(id).value = '');
}

function exportAll() {
  showToast('⬇ Exporting all cases to CSV…', 'info');
}

// Search / filter
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.filter-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const term = this.value.toLowerCase();
      document.querySelectorAll('.case-card').forEach(card => {
        card.style.display = card.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
      document.querySelectorAll('#view-list tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
      });
    });
  }
});

(() => {
  const PAGE_ID = 'blacklist';
  const state = { items: [], selected: null };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function fmtDate(d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}, ${d.getFullYear()}`;
  }

  function classForReason(r) {
    if (r === 'Circular Trading' || r === 'Fake ITC') return 'r';
    if (r === 'Shell Entity') return 'y';
    if (r === 'KYC Mismatch') return 'b';
    return 'g';
  }

  function classForStatus(s) {
    if (s === 'Pending') return 'y';
    if (s === 'Expired') return 'b';
    return 'r';
  }

  function build() {
    const reasons = ['Shell Entity', 'Circular Trading', 'Fake ITC', 'KYC Mismatch', 'Non-filing'];
    const policies = ['Exact hold', '1-hop EDD', '2-hop watch'];
    const statuses = ['Active', 'Pending', 'Expired'];
    const names = [
      'Global Supply Co',
      'Apex Traders Pvt Ltd',
      'NorthStar Electronics',
      'Orchid Textiles',
      'Nimbus Steelworks',
      'Sunrise Enterprises',
      'Zenith Export House',
    ];
    const ids = [
      '27AABC1234D1Z5',
      '07BBBZ9988K1Z2',
      '29CCCM5567L1Z9',
      '24DDDP3321M1Z4',
      '03EEEK7712N1Z1',
      'PAN: AABCU1234Q',
      'PAN: BBBCT9988K'
    ];

    const now = new Date();
    const list = [];
    for (let i = 0; i < 18; i++) {
      const added = new Date(now.getTime() - (Math.random() * 260 + 15) * 24 * 60 * 60 * 1000);
      const expiry = new Date(added.getTime() + (Math.random() * 320 + 60) * 24 * 60 * 60 * 1000);
      const status = i < 3 ? 'Pending' : (i < 14 ? 'Active' : 'Expired');
      const reason = pick(reasons);
      list.push({
        id: i,
        name: pick(names),
        identifier: pick(ids),
        reason,
        policy: pick(policies),
        status,
        added,
        expiry,
        evidence: [
          'Invoice graph shows repeated triangular routing with shared counterparties.',
          'KYC / address overlaps detected across multiple GSTINs within a small radius.',
          'Filing history indicates abrupt turnover rise without matching e-waybill volume.'
        ],
        approvals: status === 'Pending'
          ? ['Awaiting: Zone Lead', 'Awaiting: Legal']
          : ['Approved: Zone Lead', 'Approved: Legal'],
      });
    }
    return list;
  }

  function renderTable() {
    const tbody = document.querySelector('#bl-table tbody');
    if (!tbody) return;

    const q = (document.getElementById('bl-search')?.value || '').trim().toLowerCase();
    const reason = document.getElementById('bl-reason')?.value || '';
    const policy = document.getElementById('bl-policy')?.value || '';
    const status = document.getElementById('bl-status')?.value || '';

    const rows = state.items
      .filter(x => {
        if (reason && x.reason !== reason) return false;
        if (policy && x.policy !== policy) return false;
        if (status && x.status !== status) return false;
        if (!q) return true;
        return (
          x.name.toLowerCase().includes(q) ||
          x.identifier.toLowerCase().includes(q) ||
          x.reason.toLowerCase().includes(q) ||
          x.policy.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const sOrder = { Pending: 0, Active: 1, Expired: 2 };
        return (sOrder[a.status] - sOrder[b.status]) || (b.added - a.added);
      });

    tbody.innerHTML = rows.map(x => `
      <tr data-bl-id="${x.id}" style="${state.selected?.id === x.id ? 'background: var(--bg-hover);' : ''}">
        <td>
          <div style="font-weight:900; letter-spacing:-0.01em;">${x.name}</div>
          <div class="muted" style="margin-top:4px; font-size:0.78rem;">Evidence ref: <span class="mono">BL-${String(9100 + x.id)}</span></div>
        </td>
        <td class="mono">${x.identifier}</td>
        <td><span class="tag ${classForReason(x.reason)}">${x.reason}</span></td>
        <td><span class="tag b">${x.policy}</span></td>
        <td><span class="tag ${classForStatus(x.status)}">${x.status}</span></td>
        <td class="muted">${fmtDate(x.added)}</td>
        <td class="muted">${fmtDate(x.expiry)}</td>
        <td>
          <button class="btn ghost" data-bl-action="view" data-bl-id="${x.id}">
            <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderDetail() {
    const el = document.getElementById('bl-detail');
    if (!el || !state.selected) return;
    const x = state.selected;
    const c = classForReason(x.reason);
    el.innerHTML = `
      <div class="mini-item">
        <div class="mini-dot ${c}"></div>
        <div class="mini-main">
          <div class="mini-top"><div class="mini-title">${x.name}</div><div class="tag ${c}">${x.reason}</div></div>
          <div class="mini-sub">Identifier: <span class="mono">${x.identifier}</span> · Policy: <strong>${x.policy}</strong> · Status: <strong>${x.status}</strong></div>
          <div class="mini-meta">
            <span class="pill">Added <strong>${fmtDate(x.added)}</strong></span>
            <span class="pill">Expiry <strong>${fmtDate(x.expiry)}</strong></span>
          </div>
        </div>
      </div>
      <div class="panel" style="padding: 14px 14px; background: var(--bg-card2); border-radius: 12px; border: 1px solid var(--border);">
        <div class="panel-title" style="margin-bottom:8px;">Evidence summary</div>
        <div class="mini-list">
          ${x.evidence.map((t, i) => `
            <div class="mini-item" style="background: rgba(0,0,0,0.0);">
              <div class="mini-dot ${i === 0 ? 'r' : i === 1 ? 'y' : 'b'}"></div>
              <div class="mini-main">
                <div class="mini-top"><div class="mini-title">Finding ${i + 1}</div><div class="tag ${i === 0 ? 'r' : i === 1 ? 'y' : 'b'}">Signal</div></div>
                <div class="mini-sub">${t}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="panel" style="margin-top:12px; padding: 14px 14px; background: var(--bg-card2); border-radius: 12px; border: 1px solid var(--border);">
        <div class="panel-title" style="margin-bottom:8px;">Approvals</div>
        <div class="mini-list">
          ${x.approvals.map(a => `
            <div class="mini-item" style="background: rgba(0,0,0,0.0);">
              <div class="mini-dot ${x.status === 'Pending' ? 'y' : 'g'}"></div>
              <div class="mini-main">
                <div class="mini-top"><div class="mini-title">${a}</div><div class="tag ${x.status === 'Pending' ? 'y' : 'g'}">${x.status === 'Pending' ? 'Pending' : 'Approved'}</div></div>
                <div class="mini-sub">${x.status === 'Pending' ? 'Approval required before enforcement hold applies.' : 'Approval recorded with immutable audit trail.'}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="btn-row" style="justify-content:flex-start; margin-top: 12px;">
        <button class="btn primary" data-bl-action="enforce">
          <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Apply Policy
        </button>
        <button class="btn" data-bl-action="edit">
          <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          Edit
        </button>
        <button class="btn danger" data-bl-action="remove">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          Remove
        </button>
      </div>
    `;
  }

  function bind() {
    const onFilter = () => renderTable();
    for (const id of ['bl-search','bl-reason','bl-policy','bl-status']) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.addEventListener(id === 'bl-search' ? 'input' : 'change', onFilter);
    }

    const clear = document.getElementById('bl-clear');
    if (clear) clear.addEventListener('click', () => {
      const s = document.getElementById('bl-search'); if (s) s.value = '';
      const r = document.getElementById('bl-reason'); if (r) r.value = '';
      const p = document.getElementById('bl-policy'); if (p) p.value = '';
      const st = document.getElementById('bl-status'); if (st) st.value = '';
      renderTable();
    });

    const add = document.getElementById('bl-add');
    if (add) add.addEventListener('click', () => alert('Demo: Add blacklist entry form (identifier + reason + evidence + approvals).'));
    const imp = document.getElementById('bl-import');
    if (imp) imp.addEventListener('click', () => alert('Demo: Import CSV (GSTIN/PAN + reason + policy + expiry).'));
    const exp = document.getElementById('bl-export');
    if (exp) exp.addEventListener('click', () => alert('Demo: Export registry to CSV/PDF.'));
    const audit = document.getElementById('bl-audit');
    if (audit) audit.addEventListener('click', () => alert('Demo: Audit log (who changed what, when, and why).'));

    const table = document.getElementById('bl-table');
    if (table) {
      table.addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-bl-id]');
        if (!tr) return;
        const id = Number(tr.getAttribute('data-bl-id'));
        state.selected = state.items.find(x => x.id === id) || null;
        renderTable();
        renderDetail();
      });
    }

    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-bl-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-bl-action');
      if (action === 'enforce') alert('Demo: Apply enforcement policy (hold/EDD/watch) with approvals.');
      if (action === 'edit') alert('Demo: Edit entry (reason/policy/expiry).');
      if (action === 'remove') alert('Demo: Remove entry (requires approvals + audit).');
    });
  }

  function init() {
    const main = document.querySelector('.main');
    if (!main) return;
    if (main.getAttribute('data-page') === PAGE_ID) return;
    main.setAttribute('data-page', PAGE_ID);

    state.items = build();
    state.selected = null;
    renderTable();
    bind();
  }

  window.InvoShield = window.InvoShield || {};
  window.InvoShield.initBlacklist = () => setTimeout(init, 0);

  document.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('blacklist.html')) window.InvoShield.initBlacklist();
  });
})();


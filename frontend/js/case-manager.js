(() => {
  const PAGE_ID = 'case-manager';
  const state = {
    cases: [],
    selectedId: null,
  };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function fmtDate(d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')}`;
  }

  function tagClassForPriority(p) {
    if (p === 'Critical') return 'r';
    if (p === 'High') return 'y';
    if (p === 'Medium') return 'b';
    return 'g';
  }

  function tagClassForStatus(s) {
    if (s === 'Escalated') return 'r';
    if (s === 'Notice Sent') return 'y';
    if (s === 'In Review') return 'b';
    if (s === 'Closed') return 'g';
    return 'b';
  }

  function buildCases() {
    const statuses = ['New', 'In Review', 'Notice Sent', 'Escalated', 'Closed'];
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    const officers = ['Sumit K.', 'A. Verma', 'R. Singh', 'P. Mehta', 'N. Iyer', 'Team Queue'];
    const titles = [
      'Circular trading suspicion',
      'Duplicate invoice filing pattern',
      'ITC mismatch + abnormal velocity',
      'Blacklist proximity hit',
      'Address cluster overlap',
      'Transport trail inconsistency'
    ];
    const gstins = [
      '27AABC1234D1Z5',
      '07BBBZ9988K1Z2',
      '29CCCM5567L1Z9',
      '24DDDP3321M1Z4',
      '03EEEK7712N1Z1'
    ];

    const now = new Date();
    const list = [];
    for (let i = 0; i < 14; i++) {
      const created = new Date(now.getTime() - (Math.random() * 8 + 1) * 24 * 60 * 60 * 1000);
      const due = new Date(now.getTime() + (Math.random() * 6 + 1) * 24 * 60 * 60 * 1000);
      const status = i < 3 ? 'New' : pick(statuses);
      const priority = i < 2 ? 'Critical' : pick(priorities);
      const evidence = Math.floor(40 + Math.random() * 55);
      list.push({
        id: `CASE-2026-${String(120 + i).padStart(4, '0')}`,
        title: pick(titles),
        gstin: pick(gstins),
        status,
        priority,
        officer: pick(officers),
        created,
        due,
        evidence,
        notes: [
          'Evidence bundle auto-generated from invoice graph & filing history.',
          'Draft notice ready; requires officer review and sign-off.',
          'Counterparty network contains 1-hop overlap with a monitored cluster.'
        ],
      });
    }
    return list;
  }

  function renderTable() {
    const tbody = document.querySelector('#cm-table tbody');
    if (!tbody) return;

    const q = (document.getElementById('cm-q')?.value || '').trim().toLowerCase();
    const status = document.getElementById('cm-status')?.value || '';
    const priority = document.getElementById('cm-priority')?.value || '';

    const rows = state.cases
      .filter(c => {
        if (status && c.status !== status) return false;
        if (priority && c.priority !== priority) return false;
        if (!q) return true;
        return (
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.gstin.toLowerCase().includes(q) ||
          c.officer.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const pOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
        const sOrder = { Escalated: 0, New: 1, 'In Review': 2, 'Notice Sent': 3, Closed: 4 };
        return (pOrder[a.priority] - pOrder[b.priority]) || (sOrder[a.status] - sOrder[b.status]) || (a.due - b.due);
      });

    tbody.innerHTML = rows.map(c => `
      <tr data-cm-id="${c.id}" style="${state.selectedId === c.id ? 'background: var(--bg-hover);' : ''}">
        <td>
          <div style="font-weight:900; letter-spacing:-0.01em;">${c.id}</div>
          <div class="muted" style="margin-top:4px; font-size:0.78rem; line-height:1.45;">
            ${c.title} · <span class="mono">${c.gstin}</span>
          </div>
        </td>
        <td><span class="tag ${tagClassForStatus(c.status)}">${c.status}</span></td>
        <td><span class="tag ${tagClassForPriority(c.priority)}">${c.priority}</span></td>
        <td>${c.officer}</td>
        <td class="muted">${fmtDate(c.due)}</td>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="flex:1; height:6px; border-radius:99px; background: rgba(255,255,255,0.06); overflow:hidden;">
              <div style="height:100%; width:${c.evidence}%; background: linear-gradient(90deg, var(--blue), var(--green)); box-shadow: 0 0 10px rgba(79,163,255,0.18);"></div>
            </div>
            <div class="mono muted" style="min-width:44px; text-align:right; font-size:0.74rem;">${c.evidence}%</div>
          </div>
        </td>
        <td>
          <button class="btn ghost" data-cm-action="open" data-cm-id="${c.id}">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Open
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderDetail() {
    const el = document.getElementById('cm-detail');
    if (!el) return;

    const c = state.cases.find(x => x.id === state.selectedId);
    if (!c) return;

    const tl = [
      { c: 'b', t: 'Case created', s: `Created from entity triage + alerts bundle`, meta: [`Created ${fmtDate(c.created)}`, `Owner ${c.officer}`] },
      { c: 'y', t: 'Evidence pull complete', s: `Invoice graph snapshot, filings summary, counterparty list`, meta: [`Evidence ${c.evidence}%`, 'Graph v4.2'] },
      { c: c.status === 'Notice Sent' || c.status === 'Escalated' ? 'y' : 'b', t: 'Notice drafting', s: `Template populated with GSTIN + period + allegation category`, meta: ['Template: GST-FRD-01', 'Needs sign-off'] },
      { c: c.status === 'Escalated' ? 'r' : 'b', t: 'Next recommended action', s: c.priority === 'Critical' ? 'Escalate to zone lead + consider temporary ITC hold' : 'Request documents + schedule verification', meta: ['Suggested by policy engine'] },
    ];

    el.innerHTML = `
      <div class="mini-item">
        <div class="mini-dot ${tagClassForPriority(c.priority)}"></div>
        <div class="mini-main">
          <div class="mini-top"><div class="mini-title">${c.id}</div><div class="tag ${tagClassForStatus(c.status)}">${c.status}</div></div>
          <div class="mini-sub"><strong>${c.title}</strong> · GSTIN <span class="mono">${c.gstin}</span> · Priority <strong>${c.priority}</strong></div>
          <div class="mini-meta">
            <span class="pill">Owner <strong>${c.officer}</strong></span>
            <span class="pill">Due <strong>${fmtDate(c.due)}</strong></span>
            <span class="pill">Evidence <strong>${c.evidence}%</strong></span>
          </div>
        </div>
      </div>
      <div class="panel" style="padding: 14px 14px; background: var(--bg-card2); border-radius: 12px; border: 1px solid var(--border);">
        <div class="panel-title" style="margin-bottom:8px;">Timeline</div>
        <div class="mini-list">
          ${tl.map(x => `
            <div class="mini-item" style="background: rgba(0,0,0,0.0);">
              <div class="mini-dot ${x.c}"></div>
              <div class="mini-main">
                <div class="mini-top"><div class="mini-title">${x.t}</div><div class="tag ${x.c}">${x.c === 'r' ? 'Critical' : x.c === 'y' ? 'High' : x.c === 'b' ? 'Medium' : 'Low'}</div></div>
                <div class="mini-sub">${x.s}</div>
                <div class="mini-meta">${(x.meta || []).map(m => `<span class="pill">${m}</span>`).join('')}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="btn-row" style="justify-content:flex-start; margin-top: 12px;">
        <button class="btn primary" data-cm-action="assign">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          Assign
        </button>
        <button class="btn" data-cm-action="notice">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Draft Notice
        </button>
        <button class="btn danger" data-cm-action="escalate">
          <svg viewBox="0 0 24 24"><path d="M12 2l7 7-7 7-7-7 7-7z"/><path d="M12 16v6"/></svg>
          Escalate
        </button>
      </div>
    `;
  }

  function bind() {
    const q = document.getElementById('cm-q');
    const st = document.getElementById('cm-status');
    const pr = document.getElementById('cm-priority');
    const clear = document.getElementById('cm-clear');
    const refresh = document.getElementById('cm-refresh');
    const newBtn = document.getElementById('cm-new');
    const templates = document.getElementById('cm-templates');
    const exportBtn = document.getElementById('cm-export');

    const onFilter = () => renderTable();
    if (q) q.addEventListener('input', onFilter);
    if (st) st.addEventListener('change', onFilter);
    if (pr) pr.addEventListener('change', onFilter);

    if (clear) clear.addEventListener('click', () => {
      if (q) q.value = '';
      if (st) st.value = '';
      if (pr) pr.value = '';
      renderTable();
    });

    if (refresh) refresh.addEventListener('click', () => {
      state.cases = buildCases();
      state.selectedId = null;
      renderTable();
      const el = document.getElementById('cm-detail');
      if (el) el.innerHTML = `
        <div class="mini-item">
          <div class="mini-dot b"></div>
          <div class="mini-main">
            <div class="mini-top"><div class="mini-title">Queue refreshed</div><div class="tag b">Updated</div></div>
            <div class="mini-sub">Select a case again to view details.</div>
          </div>
        </div>
      `;
    });

    if (newBtn) newBtn.addEventListener('click', () => alert('Demo: New Case wizard would open here.'));
    if (templates) templates.addEventListener('click', () => alert('Demo: Templates library would open here.'));
    if (exportBtn) exportBtn.addEventListener('click', () => alert('Demo: Export to PDF/CSV.'));

    const table = document.getElementById('cm-table');
    if (table) {
      table.addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-cm-id]');
        if (!tr) return;
        state.selectedId = tr.getAttribute('data-cm-id');
        renderTable();
        renderDetail();
      });

      table.addEventListener('dblclick', (e) => {
        const tr = e.target.closest('tr[data-cm-id]');
        if (!tr) return;
        const id = tr.getAttribute('data-cm-id');
        alert(`Demo: Fullscreen case view for ${id}`);
      });
    }

    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cm-action]');
      if (!btn) return;
      const action = btn.getAttribute('data-cm-action');
      if (action === 'assign') alert('Demo: Assign dialog (officer/team queue).');
      if (action === 'notice') alert('Demo: Notice drafting editor.');
      if (action === 'escalate') alert('Demo: Escalation workflow + approvals.');
    });
  }

  function init() {
    const main = document.querySelector('.main');
    if (!main) return;
    if (main.getAttribute('data-page') === PAGE_ID) return;
    main.setAttribute('data-page', PAGE_ID);

    state.cases = buildCases();
    renderTable();
    bind();
  }

  window.InvoShield = window.InvoShield || {};
  window.InvoShield.initCaseManager = () => setTimeout(init, 0);

  document.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('case-manager.html')) window.InvoShield.initCaseManager();
  });
})();


(() => {
  const PAGE_ID = 'reports';
  const state = { exports: [] };

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function fmtDate(d) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2,'0')} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function tagClassForStatus(s) {
    if (s === 'Ready') return 'g';
    if (s === 'Generating') return 'b';
    if (s === 'Needs approval') return 'y';
    return 'r';
  }

  function buildExports() {
    const now = new Date();
    const templates = [
      'Enforcement Summary',
      'Fraud Alerts Digest',
      'Entity Risk Register',
      'Blacklist Changes',
      'Case Audit Trail',
      'Zone Performance Pack',
      'Monthly Impact Statement',
      'Evidence Bundle (Legal)'
    ];
    const zones = ['Punjab', 'Delhi', 'Maharashtra', 'Gujarat', 'Karnataka'];
    const periods = ['Last 24 hours', 'Last 7 days', 'Last 30 days', 'FY 2026-27 (YTD)'];
    const statuses = ['Ready', 'Generating', 'Needs approval', 'Failed'];

    const list = [];
    for (let i = 0; i < 10; i++) {
      const created = new Date(now.getTime() - (Math.random() * 18 + 1) * 60 * 60 * 1000);
      const status = i < 3 ? 'Ready' : pick(statuses);
      list.push({
        id: `RPT-${String(2600 + i)}`,
        name: pick(templates),
        zone: pick(zones),
        period: pick(periods),
        created,
        status,
      });
    }
    return list.sort((a, b) => b.created - a.created);
  }

  function templateInfo(name) {
    const map = {
      'Enforcement Summary': {
        c: 'b',
        title: 'Enforcement Summary',
        desc: 'Leadership pack: flags, actions taken, holds applied, impact estimate, and SLA performance.',
        bullets: ['Includes audit trail', 'Zone + period scope', 'Ready for PDF export']
      },
      'Fraud Alerts Digest': {
        c: 'y',
        title: 'Fraud Alerts Digest',
        desc: 'Daily/weekly digest of critical and high alerts with entity references and recommended actions.',
        bullets: ['Severity grouping', 'Officer assignment hints', 'Evidence pointers']
      },
      'Entity Risk Register': {
        c: 'g',
        title: 'Entity Risk Register',
        desc: 'Ranked registry of entities by band with top signals and recent activity for triage.',
        bullets: ['Band + score', 'Signals breakdown', 'Blacklist proximity']
      },
      'Blacklist Changes': {
        c: 'r',
        title: 'Blacklist Changes',
        desc: 'Change log of blacklist entries with reason codes, approvals, and effective dates.',
        bullets: ['Approvals', 'Expiry windows', 'Policy applied']
      },
      'Case Audit Trail': {
        c: 'b',
        title: 'Case Audit Trail',
        desc: 'Immutable timeline of a case: evidence, notices, actions, assignments, and closures.',
        bullets: ['Legally defensible', 'Timestamps', 'Officer actions']
      },
      'Zone Performance Pack': {
        c: 'g',
        title: 'Zone Performance Pack',
        desc: 'Performance metrics: backlog, throughput, SLA compliance, and trend notes.',
        bullets: ['SLA trends', 'Backlog drivers', 'Action items']
      },
      'Monthly Impact Statement': {
        c: 'y',
        title: 'Monthly Impact Statement',
        desc: 'Impact summary: blocked ITC, recoveries, escalations, and compliance improvements.',
        bullets: ['Month over month', 'Top patterns', 'Approvals']
      },
      'Evidence Bundle (Legal)': {
        c: 'r',
        title: 'Evidence Bundle (Legal)',
        desc: 'Strict bundle with invoice trail, e-waybill evidence, network graph snapshot, and audit signatures.',
        bullets: ['Requires approvals', 'Includes hash list', 'Export locked']
      },
    };
    return map[name] || map['Enforcement Summary'];
  }

  function renderTemplateInfo() {
    const box = document.getElementById('rp-template-info');
    const sel = document.getElementById('rp-template')?.value || 'Enforcement Summary';
    if (!box) return;
    const info = templateInfo(sel);

    box.innerHTML = `
      <div class="mini-item">
        <div class="mini-dot ${info.c}"></div>
        <div class="mini-main">
          <div class="mini-top"><div class="mini-title">${info.title}</div><div class="tag ${info.c}">Template</div></div>
          <div class="mini-sub">${info.desc}</div>
          <div class="mini-meta">${info.bullets.map(b => `<span class="pill">${b}</span>`).join('')}</div>
        </div>
      </div>
      <div class="mini-item">
        <div class="mini-dot b"></div>
        <div class="mini-main">
          <div class="mini-top"><div class="mini-title">Output format</div><div class="tag b">Export</div></div>
          <div class="mini-sub">Choose CSV for data tables, PDF for executive summaries, and “Evidence Bundle” for case attachments.</div>
          <div class="mini-meta"><span class="pill">CSV</span><span class="pill">PDF</span><span class="pill">Bundle</span></div>
        </div>
      </div>
    `;
  }

  function renderTable() {
    const tbody = document.querySelector('#rp-table tbody');
    if (!tbody) return;

    tbody.innerHTML = state.exports.map(x => `
      <tr data-rp-id="${x.id}">
        <td>
          <div style="font-weight:900; letter-spacing:-0.01em;">${x.name}</div>
          <div class="muted" style="margin-top:4px; font-size:0.78rem;">${x.id}</div>
        </td>
        <td class="muted">${x.zone} · ${x.period}</td>
        <td class="muted">${fmtDate(x.created)}</td>
        <td><span class="tag ${tagClassForStatus(x.status)}">${x.status}</span></td>
        <td>
          <button class="btn ghost" data-rp-action="download" data-rp-id="${x.id}">
            <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </button>
        </td>
      </tr>
    `).join('');
  }

  function bind() {
    const tpl = document.getElementById('rp-template');
    if (tpl) tpl.addEventListener('change', renderTemplateInfo);

    const run = document.getElementById('rp-run');
    if (run) run.addEventListener('click', () => {
      const t = document.getElementById('rp-template')?.value;
      const z = document.getElementById('rp-zone')?.value;
      const p = document.getElementById('rp-period')?.value;
      alert(`Demo: generating "${t}" for ${z} · ${p}`);
    });

    const gen = document.getElementById('rp-generate');
    if (gen) gen.addEventListener('click', () => alert('Demo: Generate report from selected template.'));
    const sch = document.getElementById('rp-schedule');
    if (sch) sch.addEventListener('click', () => alert('Demo: Schedule a recurring report (daily/weekly/monthly).'));
    const exp = document.getElementById('rp-export');
    if (exp) exp.addEventListener('click', () => alert('Demo: Export table to CSV.'));

    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-rp-action="download"]');
      if (!btn) return;
      const id = btn.getAttribute('data-rp-id');
      const row = state.exports.find(x => x.id === id);
      if (!row) return;
      alert(`Demo: download for ${row.name} (${row.id}) — status: ${row.status}`);
    });
  }

  function init() {
    const main = document.querySelector('.main');
    if (!main) return;
    if (main.getAttribute('data-page') === PAGE_ID) return;
    main.setAttribute('data-page', PAGE_ID);

    state.exports = buildExports();
    renderTemplateInfo();
    renderTable();
    bind();
  }

  window.InvoShield = window.InvoShield || {};
  window.InvoShield.initReports = () => setTimeout(init, 0);

  document.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('reports.html')) window.InvoShield.initReports();
  });
})();


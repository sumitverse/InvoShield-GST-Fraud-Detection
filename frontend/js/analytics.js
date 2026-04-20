(() => {
  const PAGE_ID = 'analytics';
  const state = { paused: false, t: 0, intervalId: null, trend: null, sev: null };

  function fmtInt(n) {
    return new Intl.NumberFormat('en-IN').format(Math.round(n));
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function ensureCharts() {
    return typeof Chart !== 'undefined';
  }

  function initCharts() {
    const trendEl = document.getElementById('anTrend');
    const sevEl = document.getElementById('anSeverity');
    if (!trendEl || !sevEl) return;

    const gridColor = 'rgba(255,255,255,0.06)';
    const tickColor = 'rgba(255,255,255,0.35)';

    const labels = Array.from({ length: 24 }, (_, i) => `${24 - i}m`);
    const baseFlags = Array.from({ length: 24 }, (_, i) => 48 + Math.sin(i / 2.4) * 10 + Math.random() * 6);
    const baseCrit = Array.from({ length: 24 }, (_, i) => 6 + Math.abs(Math.sin(i / 3.1)) * 3 + Math.random());

    state.trend = new Chart(trendEl, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Flags',
            data: baseFlags,
            tension: 0.35,
            borderColor: 'rgba(79,163,255,0.95)',
            backgroundColor: 'rgba(79,163,255,0.10)',
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: 'Critical loops',
            data: baseCrit,
            tension: 0.35,
            borderColor: 'rgba(255,79,79,0.95)',
            backgroundColor: 'rgba(255,79,79,0.06)',
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: 'rgba(255,255,255,0.55)' } },
          tooltip: {
            backgroundColor: 'rgba(15,20,23,0.92)',
            borderColor: 'rgba(79,163,255,0.25)',
            borderWidth: 1,
            titleColor: '#eef2ee',
            bodyColor: '#eef2ee',
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, maxTicksLimit: 8 } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor } }
        }
      }
    });

    state.sev = new Chart(sevEl, {
      type: 'doughnut',
      data: {
        labels: ['Low', 'Medium', 'High', 'Critical'],
        datasets: [
          {
            data: [42, 33, 18, 7],
            backgroundColor: [
              'rgba(57,255,140,0.25)',
              'rgba(79,163,255,0.22)',
              'rgba(255,193,58,0.25)',
              'rgba(255,79,79,0.25)',
            ],
            borderColor: [
              'rgba(57,255,140,0.65)',
              'rgba(79,163,255,0.65)',
              'rgba(255,193,58,0.65)',
              'rgba(255,79,79,0.65)',
            ],
            borderWidth: 1.5,
            hoverOffset: 6,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.55)', boxWidth: 10, boxHeight: 10 } },
          tooltip: {
            backgroundColor: 'rgba(15,20,23,0.92)',
            borderColor: 'rgba(255,193,58,0.25)',
            borderWidth: 1,
            titleColor: '#eef2ee',
            bodyColor: '#eef2ee',
          }
        }
      }
    });
  }

  function renderZoneTable() {
    const tbody = document.querySelector('#an-zone tbody');
    if (!tbody) return;

    const zones = [
      { z: 'Punjab', sla: 92, backlog: 21, thr: 1840 },
      { z: 'Delhi', sla: 88, backlog: 34, thr: 2105 },
      { z: 'Maharashtra', sla: 94, backlog: 18, thr: 2650 },
      { z: 'Gujarat', sla: 90, backlog: 26, thr: 1980 },
      { z: 'Karnataka', sla: 93, backlog: 14, thr: 1760 },
    ].map((x, i) => ({
      ...x,
      sla: clamp(x.sla + Math.sin((state.t + i) / 5) * 2.4, 82, 98),
      backlog: Math.max(3, Math.round(x.backlog + Math.sin((state.t + i) / 4) * 5)),
      thr: Math.max(800, Math.round(x.thr + Math.cos((state.t + i) / 6) * 140)),
    }));

    tbody.innerHTML = zones.map(x => {
      const tag = x.sla >= 93 ? 'g' : x.sla >= 90 ? 'b' : x.sla >= 86 ? 'y' : 'r';
      const status = x.sla >= 93 ? 'Strong' : x.sla >= 90 ? 'Good' : x.sla >= 86 ? 'Watch' : 'At Risk';
      return `
        <tr>
          <td style="font-weight:900;">${x.z}</td>
          <td><span class="tag ${tag}">${x.sla.toFixed(0)}%</span></td>
          <td class="mono muted">${fmtInt(x.backlog)}</td>
          <td class="mono muted">${fmtInt(x.thr)}/day</td>
          <td><span class="tag ${tag}">${status}</span></td>
        </tr>
      `;
    }).join('');
  }

  function renderPatterns() {
    const el = document.getElementById('an-patterns');
    if (!el) return;

    const items = [
      { c: 'r', t: 'Circular trading loop', s: 'Closed-ring counterparties detected with high invoice velocity.' },
      { c: 'y', t: 'Duplicate invoice filing', s: 'Multiple invoices share near-identical metadata and timing.' },
      { c: 'b', t: 'ITC mismatch', s: 'Supplier outward vs recipient inward mismatch beyond threshold.' },
      { c: 'g', t: 'Compliance recovery', s: 'Entities reconciled within grace window; severity reduced.' },
    ];

    el.innerHTML = items.map(it => `
      <div class="mini-item">
        <div class="mini-dot ${it.c}"></div>
        <div class="mini-main">
          <div class="mini-top"><div class="mini-title">${it.t}</div><div class="tag ${it.c}">${it.c === 'r' ? 'Critical' : it.c === 'y' ? 'High' : it.c === 'b' ? 'Medium' : 'Low'}</div></div>
          <div class="mini-sub">${it.s}</div>
          <div class="mini-meta"><span class="pill">Window <strong>60m</strong></span><span class="pill">Auto triage <strong>on</strong></span></div>
        </div>
      </div>
    `).join('');
  }

  function tickKpis() {
    const ingest = 234817 + Math.sin(state.t / 6) * 420 + Math.random() * 60;
    const flags = 1284 + Math.sin(state.t / 5) * 120 + Math.random() * 25;
    const fpr = 3.1 + Math.cos(state.t / 10) * 0.6;
    const impact = 4.8 + Math.sin(state.t / 14) * 0.4;

    const k1 = document.getElementById('an-kpi-ingest'); if (k1) k1.textContent = fmtInt(ingest);
    const k2 = document.getElementById('an-kpi-flags'); if (k2) k2.textContent = fmtInt(flags);
    const k3 = document.getElementById('an-kpi-fpr'); if (k3) k3.textContent = `${clamp(fpr, 1.6, 6.2).toFixed(1)}%`;
    const k4 = document.getElementById('an-kpi-impact'); if (k4) k4.textContent = `₹${clamp(impact, 3.4, 6.8).toFixed(1)}Cr`;

    const sla = document.getElementById('an-sla'); if (sla) sla.textContent = `${clamp(92 + Math.sin(state.t / 9) * 3, 84, 98).toFixed(0)}%`;
    const backlog = document.getElementById('an-backlog'); if (backlog) backlog.textContent = `${fmtInt(Math.max(8, Math.round(21 + Math.cos(state.t / 7) * 10)))}`;
    const critical = document.getElementById('an-critical'); if (critical) critical.textContent = `${fmtInt(Math.max(1, Math.round(7 + Math.sin(state.t / 6) * 3)))}`;

    const fprPill = document.getElementById('an-fpr-pill'); if (fprPill) fprPill.textContent = `${clamp(fpr, 1.6, 6.2).toFixed(1)}%`;
  }

  function tickCharts() {
    if (!state.trend || !state.sev) return;
    const dsFlags = state.trend.data.datasets[0].data;
    const dsCrit = state.trend.data.datasets[1].data;
    dsFlags.shift();
    dsCrit.shift();
    dsFlags.push(48 + Math.abs(Math.sin(state.t / 3)) * 18 + Math.random() * 8);
    dsCrit.push(6 + Math.abs(Math.cos(state.t / 4)) * 5 + Math.random() * 1.4);
    state.trend.update('none');

    const crit = Math.max(4, Math.round(7 + Math.sin(state.t / 6) * 3));
    const high = Math.max(10, Math.round(18 + Math.cos(state.t / 7) * 4));
    const med = Math.max(20, Math.round(33 + Math.sin(state.t / 8) * 6));
    const low = Math.max(25, 100 - (crit + high + med));
    state.sev.data.datasets[0].data = [low, med, high, crit];
    state.sev.update('none');
  }

  function start() {
    if (state.intervalId) return;
    state.intervalId = setInterval(() => {
      if (state.paused) return;
      state.t++;
      tickKpis();
      renderZoneTable();
      tickCharts();
    }, 3000);
  }

  function stop() {
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = null;
  }

  function parseCSVAndAnalyze(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').map(r => r.trim()).filter(r => r);
      if (rows.length < 2) return alert('Invalid CSV: Needs header and at least one row');

      const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
      
      const idx = {
        sales: headers.findIndex(h => h.includes('sales')),
        purchase: headers.findIndex(h => h.includes('purchase')),
        itc: headers.findIndex(h => h.includes('itc') || h.includes('tax')),
        refund: headers.findIndex(h => h.includes('refund')),
        id: headers.findIndex(h => h.includes('company') || h.includes('gstin') || h.includes('id') || h.includes('name'))
      };

      if (idx.sales === -1 || idx.purchase === -1 || idx.itc === -1 || idx.refund === -1) {
        return alert('CSV must contain columns for Sales, Purchase, ITC, and Refund.');
      }

      const tbody = document.querySelector('#analysis-results-table tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      rows.slice(1).forEach((row, i) => {
        // match columns considering basic comma separation without quotes handling for MVP
        const cols = row.split(',').map(c => c.trim());
        const sales = parseFloat(cols[idx.sales]) || 0;
        const purchase = parseFloat(cols[idx.purchase]) || 0;
        const itc = parseFloat(cols[idx.itc]) || 0;
        const refund = parseFloat(cols[idx.refund]) || 0;
        const identifier = idx.id !== -1 ? cols[idx.id] : `Row ${i + 1}`;

        let triggers = [];
        if (itc > 0.5 * sales) triggers.push('ITC > 50% Sales');
        if (refund > 0.3 * sales) triggers.push('Refund > 30% Sales');
        if (purchase > 1.5 * sales) triggers.push('Purchase >> Sales');

        let riskLevel = 'Low';
        let riskClass = 'g';
        if (triggers.length === 1) { riskLevel = 'Medium'; riskClass = 'b'; }
        else if (triggers.length === 2) { riskLevel = 'High'; riskClass = 'y'; }
        else if (triggers.length >= 3) { riskLevel = 'Critical'; riskClass = 'r'; }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight:600;">${identifier}</td>
          <td class="mono muted">${fmtInt(sales)}</td>
          <td class="mono muted">${fmtInt(purchase)}</td>
          <td class="mono muted">${fmtInt(itc)}</td>
          <td class="mono muted">${fmtInt(refund)}</td>
          <td style="font-size:0.75rem;">${triggers.length ? triggers.join(', ') : '<span style="color:var(--text-3)">None</span>'}</td>
          <td><span class="tag ${riskClass}">${riskLevel}</span></td>
        `;
        tbody.appendChild(tr);
      });

      document.getElementById('analysis-results-section').style.display = 'block';
      document.getElementById('analysis-results-section').scrollIntoView({ behavior: 'smooth' });
    };
    reader.readAsText(file);
  }

  function bind() {
    const pause = document.getElementById('an-pause');
    if (pause) pause.addEventListener('click', () => {
      state.paused = !state.paused;
      pause.innerHTML = state.paused
        ? `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>Resume`
        : `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause`;
    });
  }


  function init() {
    const main = document.querySelector('.main');
    if (!main) return;
    if (main.getAttribute('data-page') === PAGE_ID) return;
    main.setAttribute('data-page', PAGE_ID);

    renderPatterns();
    renderZoneTable();
    tickKpis();
    if (ensureCharts()) initCharts();
    bind();
    stop();
    start();
  }

  window.InvoShield = window.InvoShield || {};
  window.InvoShield.parseCSVAndAnalyze = parseCSVAndAnalyze;
  window.InvoShield.initAnalytics = () => {
    stop();
    setTimeout(init, 0);
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('analytics.html')) window.InvoShield.initAnalytics();
  });
})();


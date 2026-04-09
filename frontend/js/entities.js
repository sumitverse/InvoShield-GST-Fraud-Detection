(() => {
  const PAGE_ID = 'entities';
  const state = {
    intervalId: null,
    paused: false,
    line: null,
    donut: null,
    t: 0,
    entities: [],
  };

  function fmtInt(n) {
    return new Intl.NumberFormat('en-IN').format(Math.round(n));
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function bandForRisk(risk) {
    if (risk >= 90) return 'Critical';
    if (risk >= 75) return 'High';
    if (risk >= 45) return 'Medium';
    return 'Low';
  }

  function bandTagClass(band) {
    if (band === 'Critical') return 'r';
    if (band === 'High') return 'y';
    if (band === 'Medium') return 'b';
    return 'g';
  }

  function agoLabel(minsAgo) {
    if (minsAgo < 1) return 'just now';
    if (minsAgo < 60) return `${minsAgo}m ago`;
    const h = Math.floor(minsAgo / 60);
    return `${h}h ago`;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function seededNoise(x) {
    const s = Math.sin(x * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  }

  function buildEntities() {
    const zones = ['Punjab', 'Delhi', 'Maharashtra', 'Gujarat', 'Karnataka'];
    const names = [
      'Apex Traders Pvt Ltd',
      'Sunrise Enterprises',
      'Global Supply Co',
      'Rajdhani Logistics',
      'Metro Parts Ltd',
      'Kaveri Chemicals',
      'Nimbus Steelworks',
      'Orchid Textiles',
      'Zenith Export House',
      'NorthStar Electronics'
    ];
    const gstins = [
      '27AABC1234D1Z5',
      '07BBBZ9988K1Z2',
      '29CCCM5567L1Z9',
      '24DDDP3321M1Z4',
      '03EEEK7712N1Z1',
      '06AAACN1234Q1Z8',
      '09AABCN7744M1Z7',
      '08AACCO1122P1Z0',
      '10AABCT9999R1Z1',
      '27AAACZ4321T1Z9'
    ];

    const list = [];
    for (let i = 0; i < 18; i++) {
      const base = 35 + Math.floor(seededNoise(i + 1) * 60);
      const risk = clamp(base + (Math.random() * 20 - 10), 8, 99);
      const signals = Math.floor(20 + Math.random() * 260);
      const minsAgo = Math.floor(Math.random() * 180);
      list.push({
        id: i,
        name: names[i % names.length],
        gstin: gstins[i % gstins.length],
        zone: zones[i % zones.length],
        risk,
        signals,
        minsAgo,
      });
    }
    return list;
  }

  function ensureCharts() {
    if (typeof Chart === 'undefined') return false;
    return true;
  }

  function initCharts() {
    const lineCanvas = document.getElementById('riskLine');
    const donutCanvas = document.getElementById('riskDonut');
    if (!lineCanvas || !donutCanvas) return;

    const gridColor = 'rgba(255,255,255,0.06)';
    const tickColor = 'rgba(255,255,255,0.35)';

    const labels = Array.from({ length: 30 }, (_, i) => `${30 - i}s`);
    const data = Array.from({ length: 30 }, (_, i) => 62 + Math.sin(i / 3) * 8);

    state.line = new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg risk (top 20)',
            data,
            tension: 0.35,
            borderColor: 'rgba(57,255,140,0.95)',
            backgroundColor: 'rgba(57,255,140,0.10)',
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,20,23,0.92)',
            borderColor: 'rgba(57,255,140,0.25)',
            borderWidth: 1,
            titleColor: '#eef2ee',
            bodyColor: '#eef2ee',
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { color: tickColor, maxTicksLimit: 6 }
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: gridColor },
            ticks: { color: tickColor }
          }
        }
      }
    });

    state.donut = new Chart(donutCanvas, {
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
          legend: {
            position: 'bottom',
            labels: { color: 'rgba(255,255,255,0.55)', boxWidth: 10, boxHeight: 10 }
          },
          tooltip: {
            backgroundColor: 'rgba(15,20,23,0.92)',
            borderColor: 'rgba(79,163,255,0.25)',
            borderWidth: 1,
            titleColor: '#eef2ee',
            bodyColor: '#eef2ee',
          }
        }
      }
    });
  }

  function renderTable() {
    const tbody = document.querySelector('#ent-table tbody');
    if (!tbody) return;

    const q = (document.getElementById('ent-filter-q')?.value || '').trim().toLowerCase();
    const band = document.getElementById('ent-filter-band')?.value || '';
    const zone = document.getElementById('ent-filter-zone')?.value || '';

    const filtered = state.entities
      .map(e => ({ ...e, band: bandForRisk(e.risk) }))
      .filter(e => {
        if (band && e.band !== band) return false;
        if (zone && e.zone !== zone) return false;
        if (!q) return true;
        return (
          e.name.toLowerCase().includes(q) ||
          e.gstin.toLowerCase().includes(q) ||
          e.zone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.risk - a.risk);

    tbody.innerHTML = filtered.map(e => {
      const tag = bandTagClass(e.band);
      const signalsTag = e.signals > 180 ? 'r' : e.signals > 120 ? 'y' : e.signals > 60 ? 'b' : 'g';
      const last = agoLabel(e.minsAgo);
      return `
        <tr>
          <td>
            <div style="font-weight:850; letter-spacing:-0.01em;">${e.name}</div>
            <div class="muted" style="font-size:0.76rem; margin-top:3px;">PAN link: <span class="mono">${e.gstin.slice(2, 12)}</span></div>
          </td>
          <td class="mono">${e.gstin}</td>
          <td>${e.zone}</td>
          <td><span class="tag ${tag}">${e.band}</span></td>
          <td><span style="font-family: var(--font-d); font-weight: 900;">${Math.round(e.risk)}</span><span class="muted">/100</span></td>
          <td><span class="tag ${signalsTag}">${fmtInt(e.signals)} signals</span></td>
          <td class="muted">${last}</td>
          <td>
            <button class="btn ghost" data-ent-action="view" data-ent-id="${e.id}">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderDetections() {
    const el = document.getElementById('ent-detections');
    if (!el) return;

    const items = [
      { c: 'r', t: 'Circular trade loop', s: '3-hop ring detected: supplier → intermediary → recipient → supplier', meta: ['Model v4.2', 'Confidence 0.93', '₹1.2Cr exposure'] },
      { c: 'y', t: 'Invoice burst anomaly', s: 'Invoice count spiked 7× for a mid-tier entity in 12 minutes', meta: ['Velocity rule', 'Burst 412/min', 'New counterparty'] },
      { c: 'b', t: 'Address cluster overlap', s: 'Multiple GSTINs sharing address + phone ranges; possible shell cluster', meta: ['KYC graph', 'Overlap 6 entities', 'EDD suggested'] },
      { c: 'g', t: 'Compliance recovery', s: 'Entity moved from High → Medium after reconciliation window', meta: ['Grace 48h', 'Match +2.1%', 'No blacklist hits'] },
    ];

    el.innerHTML = items.map(it => `
      <div class="mini-item">
        <div class="mini-dot ${it.c}"></div>
        <div class="mini-main">
          <div class="mini-top"><div class="mini-title">${it.t}</div><div class="tag ${it.c}">${it.c === 'r' ? 'Critical' : it.c === 'y' ? 'High' : it.c === 'b' ? 'Medium' : 'Low'}</div></div>
          <div class="mini-sub">${it.s}</div>
          <div class="mini-meta">${it.meta.map(m => `<span class="pill">${m}</span>`).join('')}</div>
        </div>
      </div>
    `).join('');
  }

  function updateTopStats() {
    const monitored = document.getElementById('kpi-monitored');
    const velocity = document.getElementById('kpi-velocity');
    const loops = document.getElementById('kpi-loops');
    const itc = document.getElementById('kpi-itc');
    const stream = document.getElementById('ent-stream');
    const flagged = document.getElementById('ent-flagged');
    const coverage = document.getElementById('ent-coverage');

    const base = 58240 + Math.sin(state.t / 7) * 120 + (seededNoise(state.t / 3) * 15);
    const vel = 290 + Math.floor(Math.abs(Math.sin(state.t / 5)) * 110);
    const lp = 20 + Math.floor(Math.abs(Math.sin(state.t / 9)) * 14);
    const itcVal = 4.2 + Math.abs(Math.sin(state.t / 11)) * 1.6;

    if (monitored) monitored.textContent = fmtInt(base);
    if (velocity) velocity.textContent = fmtInt(vel);
    if (loops) loops.textContent = fmtInt(lp);
    if (itc) itc.textContent = `${itcVal.toFixed(1)}%`;

    const streamVal = 1100 + Math.floor(Math.abs(Math.cos(state.t / 6)) * 420);
    const flaggedVal = 32 + Math.floor(Math.abs(Math.sin(state.t / 8)) * 22);
    const covVal = 88 + Math.floor(Math.abs(Math.cos(state.t / 10)) * 10);
    if (stream) stream.textContent = fmtInt(streamVal);
    if (flagged) flagged.textContent = fmtInt(flaggedVal);
    if (coverage) coverage.textContent = `${covVal}%`;
  }

  function tickEntities() {
    // Mutate risks/signals a bit to feel "live"
    state.entities = state.entities.map(e => {
      const drift = (Math.random() * 6 - 3) + Math.sin((state.t + e.id) / 6) * 1.2;
      const risk = clamp(e.risk + drift, 5, 99);
      const sigDrift = Math.floor(Math.random() * 18 - 6);
      const signals = clamp(e.signals + sigDrift, 5, 450);
      const minsAgo = e.minsAgo + 1 / 30; // ~2 seconds => +0.033 min
      return { ...e, risk, signals, minsAgo };
    });
  }

  function tickCharts() {
    if (!state.line || !state.donut) return;

    const top = [...state.entities].sort((a, b) => b.risk - a.risk).slice(0, 20);
    const avg = top.reduce((acc, e) => acc + e.risk, 0) / Math.max(1, top.length);

    const ds = state.line.data.datasets[0].data;
    ds.shift();
    ds.push(clamp(avg + (Math.random() * 3 - 1.5), 0, 100));
    state.line.update('none');

    const bands = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    for (const e of state.entities) bands[bandForRisk(e.risk)]++;
    state.donut.data.datasets[0].data = [bands.Low, bands.Medium, bands.High, bands.Critical];
    state.donut.update('none');
  }

  function bind() {
    const q1 = document.getElementById('ent-filter-q');
    const q2 = document.getElementById('ent-search');
    const band = document.getElementById('ent-filter-band');
    const zone = document.getElementById('ent-filter-zone');
    const clear = document.getElementById('ent-clear');
    const run = document.getElementById('ent-run');
    const pause = document.getElementById('ent-pause');
    const reset = document.getElementById('ent-reset');

    const onFilter = () => renderTable();

    if (q1) q1.addEventListener('input', onFilter);
    if (q2) q2.addEventListener('input', (e) => {
      if (q1) q1.value = e.target.value;
      onFilter();
    });
    if (band) band.addEventListener('change', onFilter);
    if (zone) zone.addEventListener('change', onFilter);

    if (clear) clear.addEventListener('click', () => {
      if (q1) q1.value = '';
      if (q2) q2.value = '';
      if (band) band.value = '';
      if (zone) zone.value = '';
      renderTable();
    });

    if (run) run.addEventListener('click', () => {
      const pill = document.getElementById('ent-live');
      if (pill) pill.textContent = 'Running';
      setTimeout(() => { if (pill) pill.textContent = 'Live'; }, 900);
    });

    if (pause) pause.addEventListener('click', () => {
      state.paused = !state.paused;
      pause.innerHTML = state.paused
        ? `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>Resume`
        : `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>Pause`;
    });

    if (reset) reset.addEventListener('click', () => {
      state.entities = buildEntities();
      state.t = 0;
      renderTable();
    });

    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-ent-action="view"]');
      if (!btn) return;
      const id = Number(btn.getAttribute('data-ent-id'));
      const ent = state.entities.find(x => x.id === id);
      if (!ent) return;
      alert(`Entity: ${ent.name}\nGSTIN: ${ent.gstin}\nZone: ${ent.zone}\nRisk: ${Math.round(ent.risk)}/100\nSignals: ${ent.signals}`);
    });
  }

  function start() {
    if (state.intervalId) return;
    state.intervalId = setInterval(() => {
      if (state.paused) return;
      state.t++;
      tickEntities();
      updateTopStats();
      renderTable();
      tickCharts();
    }, 2000);
  }

  function stop() {
    if (state.intervalId) clearInterval(state.intervalId);
    state.intervalId = null;
  }

  function init() {
    const main = document.querySelector('.main');
    if (!main) return;
    if (main.getAttribute('data-page') === PAGE_ID) return;
    main.setAttribute('data-page', PAGE_ID);

    state.entities = buildEntities();
    renderDetections();
    renderTable();
    updateTopStats();

    if (ensureCharts()) initCharts();
    bind();
    start();
  }

  // Expose initializer for router-driven navigation
  window.InvoShield = window.InvoShield || {};
  window.InvoShield.initEntities = () => {
    stop();
    // give the router swap a tick to paint DOM
    setTimeout(init, 0);
  };

  document.addEventListener('DOMContentLoaded', () => {
    // If loaded directly, init immediately.
    if (location.pathname.endsWith('/entities.html') || location.pathname.endsWith('\\entities.html') || location.href.includes('entities.html')) {
      window.InvoShield.initEntities();
    }
  });
})();


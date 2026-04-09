(() => {
  const PAGE_ID = 'settings';

  function getToggleState(el) {
    return el.classList.contains('on');
  }

  function setToggleState(el, on) {
    el.classList.toggle('on', !!on);
  }

  function gather() {
    const get = (id) => document.getElementById(id)?.value;
    const toggles = {};
    document.querySelectorAll('.toggle[data-toggle]').forEach(t => {
      toggles[t.getAttribute('data-toggle')] = getToggleState(t);
    });

    return {
      toggles,
      itc: get('st-itc'),
      grace: get('st-grace'),
      approvals: get('st-approvals'),
      evidence: get('st-evidence'),
      gstApi: get('st-gstapi'),
      hook: get('st-hook'),
      retention: get('st-retention'),
      summary: get('st-summary'),
      zone: get('st-zone'),
      fy: get('st-fy'),
      owner: get('st-owner'),
      disclaimer: get('st-disclaimer'),
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem('invoshield_settings_v1');
      if (!raw) return;
      const s = JSON.parse(raw);

      const set = (id, v) => {
        const el = document.getElementById(id);
        if (el && v !== undefined && v !== null) el.value = v;
      };

      if (s.toggles) {
        document.querySelectorAll('.toggle[data-toggle]').forEach(t => {
          const key = t.getAttribute('data-toggle');
          if (key in s.toggles) setToggleState(t, !!s.toggles[key]);
        });
      }
      set('st-itc', s.itc);
      set('st-grace', s.grace);
      set('st-approvals', s.approvals);
      set('st-evidence', s.evidence);
      set('st-gstapi', s.gstApi);
      set('st-hook', s.hook);
      set('st-retention', s.retention);
      set('st-summary', s.summary);
      set('st-zone', s.zone);
      set('st-fy', s.fy);
      set('st-owner', s.owner);
      set('st-disclaimer', s.disclaimer);
    } catch {
      // ignore
    }
  }

  function save() {
    const data = gather();
    localStorage.setItem('invoshield_settings_v1', JSON.stringify(data));
    alert('Settings saved (demo: stored in localStorage).');
  }

  function reset() {
    localStorage.removeItem('invoshield_settings_v1');
    alert('Settings reset. Reloading defaults.');
    window.location.reload();
  }

  function bind() {
    document.querySelectorAll('.toggle[data-toggle]').forEach(t => {
      t.addEventListener('click', () => setToggleState(t, !getToggleState(t)));
    });

    const saveBtn = document.getElementById('st-save');
    if (saveBtn) saveBtn.addEventListener('click', save);

    const resetBtn = document.getElementById('st-reset');
    if (resetBtn) resetBtn.addEventListener('click', reset);

    const testBtn = document.getElementById('st-test');
    if (testBtn) testBtn.addEventListener('click', () => alert('Demo: Connection test would run server-side.'));

    const rotateBtn = document.getElementById('st-rotate');
    if (rotateBtn) rotateBtn.addEventListener('click', () => alert('Demo: Key rotation requires admin approval.'));

    const previewBtn = document.getElementById('st-preview');
    if (previewBtn) previewBtn.addEventListener('click', () => {
      const d = gather();
      alert(`Preview:\nZone: ${d.zone}\nFY: ${d.fy}\nOwner: ${d.owner}\nITC threshold: ${d.itc}%\nGrace: ${d.grace}h\nRetention: ${d.retention}d`);
    });
  }

  function init() {
    const main = document.querySelector('.main');
    if (!main) return;
    if (main.getAttribute('data-page') === PAGE_ID) return;
    main.setAttribute('data-page', PAGE_ID);
    load();
    bind();
  }

  window.InvoShield = window.InvoShield || {};
  window.InvoShield.initSettings = () => setTimeout(init, 0);

  document.addEventListener('DOMContentLoaded', () => {
    if (location.href.includes('settings.html')) window.InvoShield.initSettings();
  });
})();


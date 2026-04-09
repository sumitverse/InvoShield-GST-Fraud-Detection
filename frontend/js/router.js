document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('a.nav-item');
        if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
            e.preventDefault();
            const url = link.getAttribute('href');
            
            // Highlight the clicked link properly
            document.querySelectorAll('a.nav-item').forEach(el => el.classList.remove('active'));
            link.classList.add('active');

            try {
                const response = await fetch(url);
                const html = await response.text();
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                document.title = doc.title;

                // Swap sidebar too (keeps links + active states consistent)
                const currentSidebar = document.querySelector('.sidebar');
                const newSidebar = doc.querySelector('.sidebar');
                if (currentSidebar && newSidebar) currentSidebar.innerHTML = newSidebar.innerHTML;
                
                const currentTopbar = document.querySelector('.topbar');
                const newTopbar = doc.querySelector('.topbar');
                if (currentTopbar && newTopbar) currentTopbar.innerHTML = newTopbar.innerHTML;
                
                const currentMain = document.querySelector('.main');
                const newMain = doc.querySelector('.main');
                if (currentMain && newMain) currentMain.innerHTML = newMain.innerHTML;

                // Load new CSS stylesheets if they aren't loaded
                const newLinks = doc.querySelectorAll('link[rel="stylesheet"]');
                newLinks.forEach(newLink => {
                    const href = newLink.getAttribute('href');
                    if (!document.querySelector(`link[href="${href}"]`)) {
                        const linkEl = document.createElement('link');
                        linkEl.rel = 'stylesheet';
                        linkEl.href = href;
                        document.head.appendChild(linkEl);
                    }
                });

                window.history.pushState({path: url}, '', url);

                const loadScript = (src) => new Promise((resolve, reject) => {
                    if (document.querySelector(`script[src="${src}"]`)) return resolve();
                    const s = document.createElement('script');
                    s.src = src;
                    s.onload = () => resolve();
                    s.onerror = () => reject(new Error(`Failed loading ${src}`));
                    document.body.appendChild(s);
                });

                const ensureChartJs = async () => {
                    const chartSrc = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
                    if (document.querySelector(`script[src="${chartSrc}"]`) || typeof Chart !== 'undefined') return;
                    await new Promise((resolve, reject) => {
                        const s = document.createElement('script');
                        s.src = chartSrc;
                        s.onload = () => resolve();
                        s.onerror = () => reject(new Error('Failed loading Chart.js'));
                        document.head.appendChild(s);
                    });
                };

                // Re-initialize page scripts after DOM swap (scripts inside fetched HTML won't execute)
                if (url.includes('dashboard.html')) {
                    await ensureChartJs();
                    if (typeof CurrencyExchange !== 'undefined') {
                        new CurrencyExchange();
                    } else {
                        await loadScript('/js/dashboard.js');
                    }
                } else if (url.includes('entities.html')) {
                    await ensureChartJs();
                    await loadScript('/js/entities.js');
                    if (window.InvoShield?.initEntities) window.InvoShield.initEntities();
                } else if (url.includes('case-manager.html')) {
                    await loadScript('/js/case-manager.js');
                    if (window.InvoShield?.initCaseManager) window.InvoShield.initCaseManager();
                } else if (url.includes('blacklist.html')) {
                    await loadScript('/js/blacklist.js');
                    if (window.InvoShield?.initBlacklist) window.InvoShield.initBlacklist();
                } else if (url.includes('settings.html')) {
                    await loadScript('/js/settings.js');
                    if (window.InvoShield?.initSettings) window.InvoShield.initSettings();
                } else if (url.includes('analytics.html')) {
                    await ensureChartJs();
                    await loadScript('/js/analytics.js');
                    if (window.InvoShield?.initAnalytics) window.InvoShield.initAnalytics();
                } else if (url.includes('reports.html')) {
                    await loadScript('/js/reports.js');
                    if (window.InvoShield?.initReports) window.InvoShield.initReports();
                }
            } catch (err) {
                console.error("Routing error:", err);
                // Fallback to normal navigation
                window.location.href = url;
            }
        }
    });

    window.addEventListener('popstate', () => {
        window.location.reload();
    });
});

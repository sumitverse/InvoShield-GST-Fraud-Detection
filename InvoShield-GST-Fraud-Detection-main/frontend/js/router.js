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

                // Re-initialize page-specific scripts after navigation
                if (url.includes('dashboard.html')) {
                    if (!document.querySelector('script[src*="Chart.js"]')) {
                        const chartScript = document.createElement('script');
                        chartScript.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
                        document.head.appendChild(chartScript);
                    }
                    if (typeof CurrencyExchange !== 'undefined') {
                        new CurrencyExchange();
                    } else if (!document.querySelector('script[src="/js/dashboard.js"]')) {
                        const script = document.createElement('script');
                        script.src = '/js/dashboard.js';
                        document.body.appendChild(script);
                    }
                }

                if (url.includes('entities.html')) {
                    // no extra scripts needed for entities
                }

                if (url.includes('analytics.html')) {
                    const loadAnalytics = () => {
                        if (typeof initCharts === 'function') {
                            initCharts();
                        } else {
                            const script = document.createElement('script');
                            script.src = '/js/analytics.js';
                            document.body.appendChild(script);
                        }
                    };
                    if (!document.querySelector('script[src*="Chart.js"]')) {
                        const chartScript = document.createElement('script');
                        chartScript.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
                        chartScript.onload = loadAnalytics;
                        document.head.appendChild(chartScript);
                    } else {
                        loadAnalytics();
                    }
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

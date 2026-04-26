document.addEventListener('DOMContentLoaded', () => {
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #060809; opacity: 0; pointer-events: none; transition: opacity 0.2s ease-in-out; z-index: 99999;';
    document.body.appendChild(overlay);

    document.body.addEventListener('click', async (e) => {
        const link = e.target.closest('a.nav-item');
        if (link && link.getAttribute('href') && link.getAttribute('href') !== '#') {
            e.preventDefault();
            const url = link.getAttribute('href');
            
            // Highlight the clicked link properly
            document.querySelectorAll('a.nav-item').forEach(el => el.classList.remove('active'));
            link.classList.add('active');

            try {
                // Immediately fade to black overlay
                overlay.style.opacity = '1';
                
                // Wait for overlay to fully cover
                await new Promise(resolve => setTimeout(resolve, 200));
                
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

                // Remove old page-specific CSS files (fraud-alerts.css, dashboard.css, etc.)
                const pageSpecificCss = ['/css/fraud-alerts.css', '/css/dashboard.css', '/css/invoices.css', '/css/enforcement.css', '/css/login.css', '/css/analytics.css'];
                pageSpecificCss.forEach(cssFile => {
                    const link = document.querySelector(`link[href="${cssFile}"]`);
                    if (link) link.remove();
                });

                // Load new CSS stylesheets and wait for them to load
                const newLinks = doc.querySelectorAll('link[rel="stylesheet"]');
                const cssLoadPromises = Array.from(newLinks).map(newLink => {
                    const href = newLink.getAttribute('href');
                    return new Promise(resolve => {
                        if (!document.querySelector(`link[href="${href}"]`)) {
                            const linkEl = document.createElement('link');
                            linkEl.rel = 'stylesheet';
                            linkEl.href = href;
                            linkEl.onload = () => resolve();
                            linkEl.onerror = () => resolve();
                            document.head.appendChild(linkEl);
                        } else {
                            resolve();
                        }
                    });
                });
                
                // Wait for all CSS files to load
                await Promise.all(cssLoadPromises);
                
                // Extra buffer for rendering
                await new Promise(resolve => setTimeout(resolve, 50));

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
                
                // Fade out overlay to reveal new page
                overlay.style.opacity = '0';
                
                // Update user info
                updateUserInfo();
            } catch (err) {
                console.error("Routing error:", err);
                // Hide overlay even on error
                overlay.style.opacity = '0';
                // Fallback to normal navigation
                window.location.href = url;
            }
        }
    });

    window.addEventListener('popstate', () => {
        window.location.reload();
    });
    
    // Function to update user info in the UI
    function updateUserInfo() {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const nameEls = document.querySelectorAll('.user-name');
                const roleEls = document.querySelectorAll('.user-role');
                const avatarEls = document.querySelectorAll('.user-avatar');
                
                nameEls.forEach(el => el.textContent = user.name || 'User');
                roleEls.forEach(el => el.textContent = user.role || 'Officer');
                
                if (user.name) {
                    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    avatarEls.forEach(el => el.textContent = initials);
                }
            }
        } catch (e) {
            console.error('Error updating user info:', e);
        }
    }
    
    // Initial call on load
    updateUserInfo();
});

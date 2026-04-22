document.addEventListener('DOMContentLoaded', () => {
  initCharts();

  document.querySelectorAll('.period-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
});

function initCharts() {
  const chartDefaults = {
    color: '#7a8a80',
    font: { family: 'Plus Jakarta Sans', size: 11 }
  };
  Chart.defaults.color = chartDefaults.color;
  Chart.defaults.font  = chartDefaults.font;

  // ── Trend Line Chart ──
  const trendCtx = document.getElementById('trendChart');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Threats Detected',
            data: [45, 52, 48, 61, 55, 67, 72],
            borderColor: '#ff4f4f',
            backgroundColor: 'rgba(255,79,79,0.08)',
            borderWidth: 2,
            pointBackgroundColor: '#ff4f4f',
            pointRadius: 4,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Invoices Verified (00s)',
            data: [320, 298, 341, 310, 365, 280, 390],
            borderColor: '#39ff8c',
            backgroundColor: 'rgba(57,255,140,0.06)',
            borderWidth: 2,
            pointBackgroundColor: '#39ff8c',
            pointRadius: 4,
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#7a8a80', boxWidth: 10, padding: 16 }
          },
          tooltip: {
            backgroundColor: '#0f1417',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#eef2ee',
            bodyColor: '#7a8a80',
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#7a8a80' }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#7a8a80' }
          }
        }
      }
    });
  }

  // ── Donut Chart ──
  const donutCtx = document.getElementById('donutChart');
  if (donutCtx) {
    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Circular Trading', 'ITC Mismatch', 'Duplicate Invoice', 'Shell Entity'],
        datasets: [{
          data: [38, 27, 19, 16],
          backgroundColor: ['#ff4f4f', '#ffc13a', '#4fa3ff', '#39ff8c'],
          borderColor: '#0f1417',
          borderWidth: 3,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f1417',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#eef2ee',
            bodyColor: '#7a8a80',
            padding: 10,
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` }
          }
        }
      }
    });
  }

  // ── Bar Chart ──
  const barCtx = document.getElementById('barChart');
  if (barCtx) {
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Verified',
            data: [1250, 1380, 1190, 1420, 1310, 1560, 1480],
            backgroundColor: 'rgba(57,255,140,0.7)',
            borderRadius: 4
          },
          {
            label: 'Suspicious',
            data: [89, 102, 78, 115, 94, 130, 108],
            backgroundColor: 'rgba(255,193,58,0.7)',
            borderRadius: 4
          },
          {
            label: 'Blocked',
            data: [23, 31, 19, 28, 22, 35, 27],
            backgroundColor: 'rgba(255,79,79,0.7)',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#7a8a80', boxWidth: 10, padding: 16 }
          },
          tooltip: {
            backgroundColor: '#0f1417',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            titleColor: '#eef2ee',
            bodyColor: '#7a8a80',
            padding: 10
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#7a8a80' },
            stacked: false
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#7a8a80' }
          }
        }
      }
    });
  }
}

let dailyTestsChart = null;
let subjectPieChart = null;

function initCharts(dailyData = [], subjectData = []) {
  // 1. Line Chart: Daily Tests
  const ctxDaily = document.getElementById('dailyTestsChart');
  if (ctxDaily) {
    const labels = dailyData.map((d) => d._id);
    const counts = dailyData.map((d) => d.count);

    if (dailyTestsChart) {
      dailyTestsChart.destroy();
    }

    dailyTestsChart = new Chart(ctxDaily, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
        datasets: [
          {
            label: 'Testlar soni',
            data: counts.length > 0 ? counts : [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointBackgroundColor: '#60a5fa'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', stepSize: 1 },
            beginAtZero: true
          }
        }
      }
    });
  }

  // 2. Doughnut / Pie Chart: Subject Distribution
  const ctxPie = document.getElementById('subjectPieChart');
  if (ctxPie) {
    const labels = subjectData.map((s) => s._id || 'Noma’lum');
    const counts = subjectData.map((s) => s.count);

    if (subjectPieChart) {
      subjectPieChart.destroy();
    }

    subjectPieChart = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: labels.length > 0 ? labels : ['Matematika', 'Informatika', 'Ingliz tili', 'Boshqa'],
        datasets: [
          {
            data: counts.length > 0 ? counts : [1, 1, 1, 1],
            backgroundColor: [
              '#3b82f6',
              '#10b981',
              '#8b5cf6',
              '#f59e0b',
              '#ec4899',
              '#64748b'
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', padding: 12 }
          }
        }
      }
    });
  }
}

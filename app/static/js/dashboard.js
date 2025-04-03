/**
 * Dashboard.js - Gestiona las gráficas y funcionalidades del dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar todas las gráficas
  initCharts();

  // Inicializar contadores con datos del servidor
  fetch('/api/dashboard_stats') // Endpoint para obtener estadísticas
    .then(response => response.json())
    .then(data => {
      const counters = document.querySelectorAll('.counter');
      counters.forEach(counter => {
        const type = counter.closest('.dashboard-card').classList[1]; // Obtener tipo de tarjeta
        const target = data[type] || 0; // Obtener valor del servidor según el tipo
        counter.setAttribute('data-target', target);

        const updateCounter = () => {
          const current = +counter.innerText;
          const increment = target / 100;

          if (current < target) {
            counter.innerText = Math.ceil(current + increment);
            setTimeout(updateCounter, 15);
          } else {
            counter.innerText = target;
          }
        };
        updateCounter();
      });
    })
    .catch(error => console.error('Error al obtener estadísticas:', error));
});

/**
 * Inicializa todas las gráficas del dashboard
 */
function initCharts() {
  // Gráfico de línea para trabajos por mes
  if (document.getElementById('trabajosLineChart')) {
    const trabajosLineCtx = document.getElementById('trabajosLineChart').getContext('2d');
    const trabajosLineChart = new Chart(trabajosLineCtx, {
      type: 'line',
      data: {
        labels: mesesLabels,
        datasets: [{
          label: 'Trabajos por mes',
          data: trabajosMes,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 2,
          tension: 0.4, // Ajuste para curvas suaves
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleFont: {
              size: 14
            },
            bodyFont: {
              size: 13
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  // Gráfico de barras para facturación
  if (document.getElementById('facturacionBarChart')) {
    const facturacionBarCtx = document.getElementById('facturacionBarChart').getContext('2d');
    const facturacionBarChart = new Chart(facturacionBarCtx, {
      type: 'bar',
      data: {
        labels: mesesLabels,
        datasets: [{
          label: 'Facturación por mes (€)',
          data: facturacionMes,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Gráfico de distribución (pie chart)
  if (document.getElementById('distribucionChart')) {
    const distribucionCtx = document.getElementById('distribucionChart').getContext('2d');
    const distribucionChart = new Chart(distribucionCtx, {
      type: 'pie',
      data: {
        labels: ['Pendientes', 'En Proceso', 'Completados'],
        datasets: [{
          data: [trabajosPendientes, trabajosEnProceso, trabajosCompletados],
          backgroundColor: [
            'rgba(255, 159, 64, 0.7)', // Naranja para pendientes
            'rgba(54, 162, 235, 0.7)', // Azul para en proceso
            'rgba(75, 192, 192, 0.7)'  // Verde para completados
          ],
          borderColor: [
            'rgba(255, 159, 64, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }

  // Gráfico de trabajos pendientes por mes
  if (document.getElementById('trabajosPendientesBarChart')) {
    const pendientesBarCtx = document.getElementById('trabajosPendientesBarChart').getContext('2d');
    const pendientesBarChart = new Chart(pendientesBarCtx, {
      type: 'bar',
      data: {
        labels: mesesLabels,
        datasets: [{
          label: 'Trabajos pendientes',
          data: trabajosPendientesMes,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }

  // Gráfico circular para técnicos y trabajos realizados
  if (document.getElementById('tecnicosPieChart')) {
    const tecnicosPieCtx = document.getElementById('tecnicosPieChart').getContext('2d');
    new Chart(tecnicosPieCtx, {
      type: 'pie',
      data: {
        labels: tecnicosData.map(tecnico => tecnico.nombre),
        datasets: [{
          data: tecnicosData.map(tecnico => tecnico.trabajos_realizados),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)', // Rojo
            'rgba(54, 162, 235, 0.7)', // Azul
            'rgba(75, 192, 192, 0.7)', // Verde
            'rgba(255, 206, 86, 0.7)', // Amarillo
            'rgba(153, 102, 255, 0.7)' // Morado
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right'
          }
        }
      }
    });
  }
}

/**
 * Filtra los datos del gráfico por un período específico
 * @param {number|string} days - Número de días para filtrar o 'max' para mostrar todo
 */
function filterChart(days) {
  // Esta función está referenciada en dashboard_admin.html en los botones de filtro,
  // pero su implementación es básica y solo recarga la página
}

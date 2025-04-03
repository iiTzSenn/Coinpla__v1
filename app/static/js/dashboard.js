/**
 * Dashboard.js - Gestiona las gráficas y funcionalidades del dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar todas las gráficas
  initCharts();

  // Inicializar contadores con datos del servidor
  fetch('/api/dashboard_stats') 
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al obtener datos del servidor');
      }
      return response.json();
    })
    .then(data => {
      const counters = document.querySelectorAll('.counter');
      counters.forEach(counter => {
        const type = counter.closest('.dashboard-card').classList[1]; 
        const target = data[type] || 0; 
        
        counter.setAttribute('data-target', target);
        
        const updateCounter = () => {
          const current = +counter.innerText;
          const increment = Math.ceil(target / 100);

          if (current < target) {
            counter.innerText = current + increment;
            setTimeout(updateCounter, 15);
          } else {
            counter.innerText = target.toLocaleString();
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
          label: 'Facturación de trabajos completados (€)',
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
    
    // Verificar si hay datos de técnicos
    if (!datosTecnicos || datosTecnicos.length === 0) {
      const ctx = distribucionCtx;
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      ctx.fillText('No hay técnicos con trabajos completados', 
                   document.getElementById('distribucionChart').width/2, 
                   document.getElementById('distribucionChart').height/2);
      return;
    }
    
    // Limitar a los 5 técnicos con más trabajos si hay más de 5
    const tecnicosData = datosTecnicos.length > 5 ? datosTecnicos.slice(0, 5) : datosTecnicos;
    
    const distribucionChart = new Chart(distribucionCtx, {
      type: 'pie',
      data: {
        labels: tecnicosData.map(tecnico => tecnico.nombre),
        datasets: [{
          data: tecnicosData.map(tecnico => tecnico.trabajos_completados),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',  // Rojo
            'rgba(54, 162, 235, 0.7)',  // Azul
            'rgba(75, 192, 192, 0.7)',  // Verde
            'rgba(255, 206, 86, 0.7)',  // Amarillo
            'rgba(153, 102, 255, 0.7)', // Morado
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} trabajos (${percentage}%)`;
              }
            }
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

  // Gráfico circular de técnicos y trabajos completados
  if (document.getElementById('tecnicosChart')) {
    const tecnicosChartCtx = document.getElementById('tecnicosChart').getContext('2d');
    
    // Verificar si hay datos
    if (!datosTecnicos || datosTecnicos.length === 0) {
      const ctx = tecnicosChartCtx;
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      ctx.fillText('No hay datos disponibles', 
                   document.getElementById('tecnicosChart').width/2, 
                   document.getElementById('tecnicosChart').height/2);
      return;
    }
    
    // Limitar a los 5 técnicos con más trabajos si hay más de 5
    const tecnicosData = datosTecnicos.length > 5 ? datosTecnicos.slice(0, 5) : datosTecnicos;
    
    const tecnicosChart = new Chart(tecnicosChartCtx, {
      type: 'pie',
      data: {
        labels: tecnicosData.map(tecnico => tecnico.nombre),
        datasets: [{
          data: tecnicosData.map(tecnico => tecnico.trabajos_completados),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',  // Rojo
            'rgba(54, 162, 235, 0.7)',  // Azul
            'rgba(75, 192, 192, 0.7)',  // Verde
            'rgba(255, 206, 86, 0.7)',  // Amarillo
            'rgba(153, 102, 255, 0.7)', // Morado
            'rgba(255, 159, 64, 0.7)',  // Naranja
            'rgba(201, 203, 207, 0.7)'  // Gris
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(201, 203, 207, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} trabajos (${percentage}%)`;
              }
            }
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
  // Esta función está referenciada en dashboard_admin.html en los botones de filtro
}

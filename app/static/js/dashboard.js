/**
 * Dashboard.js - Gestiona las gráficas y funcionalidades del dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar todas las gráficas
  initCharts();
  
  // Aplicar filtro de 3 meses por defecto
  // Pequeño retraso para asegurar que Chart.js haya terminado de renderizar
  setTimeout(() => {
    console.log("Aplicando filtro de 3 meses por defecto");
    filterChart(90);
  }, 500);

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
  console.log(`Filtrando por ${days} días`);
  
  // Referencia al gráfico
  const chartInstance = Chart.getChart("trabajosLineChart");
  if (!chartInstance) {
    console.error("No se pudo encontrar la instancia del gráfico");
    return;
  }
  
  // Si es 'max', mostrar todos los datos
  if (days === 'max') {
    console.log("Mostrando todos los datos disponibles");
    chartInstance.data.labels = mesesLabels;
    chartInstance.data.datasets[0].data = trabajosMes;
    chartInstance.update();
    document.querySelector('#periodoDropdown span').innerText = 'Todo el historial';
    return;
  }
  
  // Para 3 meses, 6 meses o 1 año, simplificamos mostrando los últimos X meses
  let monthsToShow;
  
  if (days === 90) {
    monthsToShow = 3;
    document.querySelector('#periodoDropdown span').innerText = 'Últimos 3 meses';
  } else if (days === 180) {
    monthsToShow = 6;
    document.querySelector('#periodoDropdown span').innerText = 'Últimos 6 meses';
  } else if (days === 365) {
    monthsToShow = 12;
    document.querySelector('#periodoDropdown span').innerText = 'Último año';
  } else {
    monthsToShow = 3; // Default a 3 meses
    document.querySelector('#periodoDropdown span').innerText = 'Últimos 3 meses';
  }
  
  // Obtener los últimos X meses del array
  const startIndex = Math.max(0, mesesLabels.length - monthsToShow);
  
  // Extraer los labels y datos filtrados
  const filteredLabels = mesesLabels.slice(startIndex);
  const filteredData = trabajosMes.slice(startIndex);
  
  console.log(`Mostrando los últimos ${monthsToShow} meses:`, filteredLabels);
  
  // Actualizar el gráfico con los datos filtrados
  chartInstance.data.labels = filteredLabels;
  chartInstance.data.datasets[0].data = filteredData;
  chartInstance.update();
  
  // Mostrar un mensaje si no hay datos para mostrar
  if (filteredLabels.length === 0) {
    console.warn("No hay datos para mostrar en el período seleccionado");
    
    // Mostrar mensaje en el canvas
    const ctx = chartInstance.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(
      'No hay datos para mostrar en el período seleccionado',
      chartInstance.width / 2,
      chartInstance.height / 2
    );
    ctx.restore();
  }
}

/**
 * Convierte el nombre del mes en español a su número (0-11)
 * @param {string} monthName - Nombre del mes en español
 * @returns {number} - Número del mes (0-11)
 */
function getMonthNumber(monthName) {
  const months = {
    'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
    'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
  };
  return months[monthName] || 0;
}

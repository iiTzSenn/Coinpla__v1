document.addEventListener('DOMContentLoaded', function () {
  // Crear un degradado para las gráficas
  function createGradient(ctx, height) {
    const gradient = ctx.createLinearGradient(0, 0, height, 0);
    gradient.addColorStop(0, '#5e63ff'); // Color inicial
    gradient.addColorStop(1, '#565be7'); // Color final actualizado
    return gradient;
  }

  // 1. Gráfico de Trabajos por Mes (Line)
  const ctxTrabajos = document.getElementById('trabajosLineChart');
  if (ctxTrabajos) {
    const ctx = ctxTrabajos.getContext('2d');
    const gradient = createGradient(ctx, ctxTrabajos.height);
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: mesesLabels,
        datasets: [{
          label: 'Trabajos Mensuales',
          data: trabajosMes,
          borderColor: gradient, // Aplicar degradado al borde
          backgroundColor: 'rgba(94, 99, 255, 0.2)', // Fondo con transparencia
          borderWidth: 2,
          tension: 0.4,
          fill: true,
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
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#eaeaea'
            }
          }
        }
      }
    });
  }

  // 2. Gráfico de Facturación Mensual (Bar)
  const ctxFacturacionBar = document.getElementById('facturacionBarChart');
  if (ctxFacturacionBar) {
    const ctx = ctxFacturacionBar.getContext('2d');
    const gradient = createGradient(ctx, ctxFacturacionBar.height);
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: mesesLabels,
        datasets: [{
          label: 'Facturación (€)',
          data: facturacionMes,
          backgroundColor: gradient, // Aplicar degradado al fondo
          borderColor: gradient, // Aplicar degradado al borde
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
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#eaeaea'
            },
            ticks: {
              callback: function(value) {
                return '€' + value;
              }
            }
          }
        }
      }
    });
  }

  // 3. Gráfico de Trabajos Pendientes (Bar)
  const ctxTrabajosPendientesBar = document.getElementById('trabajosPendientesBarChart');
  if (ctxTrabajosPendientesBar) {
    const ctx = ctxTrabajosPendientesBar.getContext('2d');
    const gradient = createGradient(ctx, ctxTrabajosPendientesBar.height);
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: mesesLabels,
        datasets: [{
          label: 'Trabajos Pendientes',
          data: trabajosPendientesMes,
          backgroundColor: gradient, // Aplicar degradado al fondo
          borderColor: gradient, // Aplicar degradado al borde
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
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: '#eaeaea'
            }
          }
        }
      }
    });
  }

  // 4. Distribución de Trabajos (Pie)
  const ctxDistribucion = document.getElementById('distribucionChart');
  if (ctxDistribucion) {
    new Chart(ctxDistribucion.getContext('2d'), {
      type: 'pie',
      data: {
        labels: ['Pendientes', 'En Proceso', 'Completados'],
        datasets: [{
          data: [trabajosPendientes, trabajosEnProceso, trabajosCompletados],
          backgroundColor: [
            'rgba(255, 193, 7, 0.6)',   // Pendientes
            'rgba(54, 162, 235, 0.6)', // En Proceso
            'rgba(75, 192, 192, 0.6)'  // Completados
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  // 5. Calendario FullCalendar (opcional)
  const calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      events: eventosCalendario,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      }
    });
    calendar.render();
  }
});

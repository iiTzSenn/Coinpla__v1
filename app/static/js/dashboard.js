/**
 * Dashboard.js - Gestiona las gráficas y funcionalidades del dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Inicializar todas las gráficas
  initCharts();

  // Aplicar filtro de 6 meses por defecto para ambas gráficas
  console.log("Aplicando filtro de 6 meses por defecto");
  filterChart(180);
  filterFacturacionChart(180);

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

  // Inicializar el selector de año con los años disponibles
  initYearSelector();
  
  // Aplicar filtro del mes actual para el gráfico de distribución
  filterDistribucionChart('current');

  // Aplicar efecto de blur a todas las tarjetas dashboard al hacer clic
  const dashboardCards = document.querySelectorAll('.dashboard-card');
  dashboardCards.forEach(card => {
    const cardValue = card.querySelector('h4');
    if (cardValue) {
      card.addEventListener('click', () => {
        if (cardValue.style.filter === 'blur(5px)') {
          cardValue.style.filter = 'none';
        } else {
          cardValue.style.filter = 'blur(5px)';
        }
      });
    }
  });
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
          tension: 0.4, // Curvas suaves
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleFont: { size: 14 },
            bodyFont: { size: 13 }
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  // Gráfico de barras para facturación
  if (document.getElementById('facturacionBarChart')) {
    const facturacionBarCtx = document.getElementById('facturacionBarChart').getContext('2d');
    new Chart(facturacionBarCtx, {
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
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Gráfico de distribución (pie chart) para técnicos con trabajos completados
  if (document.getElementById('distribucionChart')) {
    const distribucionCtx = document.getElementById('distribucionChart').getContext('2d');
    if (!datosTecnicos || datosTecnicos.length === 0) {
      distribucionCtx.font = '14px Arial';
      distribucionCtx.textAlign = 'center';
      distribucionCtx.fillStyle = '#666';
      distribucionCtx.fillText('No hay técnicos con trabajos completados', 
                                document.getElementById('distribucionChart').width / 2, 
                                document.getElementById('distribucionChart').height / 2);
      return;
    }
    // Limitar a 10 técnicos si hay más
    const tecnicosData = datosTecnicos.length > 10 ? datosTecnicos.slice(0, 10) : datosTecnicos;
    const colors = [
      'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)',
      'rgba(255, 206, 86, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
      'rgba(201, 203, 207, 0.7)', 'rgba(123, 239, 178, 0.7)', 'rgba(255, 87, 51, 0.7)',
      'rgba(0, 123, 255, 0.7)'
    ];
    new Chart(distribucionCtx, {
      type: 'pie',
      data: {
        labels: tecnicosData.map(tecnico => tecnico.nombre),
        datasets: [{
          data: tecnicosData.map(tecnico => tecnico.trabajos_completados),
          backgroundColor: colors.slice(0, tecnicosData.length),
          borderColor: colors.slice(0, tecnicosData.length).map(color => color.replace('0.7', '1')),
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
              font: {
                size: 10 // Reduce el tamaño de la fuente
              },
              boxWidth: 10, // Ajusta el tamaño del cuadro de color
              padding: 5, // Reduce el espacio entre elementos
              textAlign: 'start', // Alinea el texto al inicio
              usePointStyle: true // Usa puntos en lugar de cuadros para ahorrar espacio
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
    new Chart(pendientesBarCtx, {
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
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }

  // Gráfico circular para técnicos y trabajos realizados
  if (document.getElementById('tecnicosPieChart')) {
    const tecnicosPieCtx = document.getElementById('tecnicosPieChart').getContext('2d');
    const tecnicosData = datosTecnicos.length > 15 ? datosTecnicos.slice(0, 15) : datosTecnicos;
    new Chart(tecnicosPieCtx, {
      type: 'pie',
      data: {
        labels: tecnicosData.map(tecnico => tecnico.nombre),
        datasets: [{
          data: tecnicosData.map(tecnico => tecnico.trabajos_realizados),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(153, 102, 255, 0.7)'
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
        plugins: { legend: { position: 'right' } }
      }
    });
  }

  // Gráfico circular de técnicos y trabajos completados
  if (document.getElementById('tecnicosChart')) {
    const tecnicosChartCtx = document.getElementById('tecnicosChart').getContext('2d');
    if (!datosTecnicos || datosTecnicos.length === 0) {
      tecnicosChartCtx.font = '14px Arial';
      tecnicosChartCtx.textAlign = 'center';
      tecnicosChartCtx.fillStyle = '#666';
      tecnicosChartCtx.fillText('No hay datos disponibles', 
                                document.getElementById('tecnicosChart').width / 2, 
                                document.getElementById('tecnicosChart').height / 2);
      return;
    }
    const tecnicosData = datosTecnicos.length > 15 ? datosTecnicos.slice(0, 15) : datosTecnicos;
    new Chart(tecnicosChartCtx, {
      type: 'pie',
      data: {
        labels: tecnicosData.map(tecnico => tecnico.nombre),
        datasets: [{
          data: tecnicosData.map(tecnico => tecnico.trabajos_completados),
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',   // Rojo
            'rgba(54, 162, 235, 0.7)',   // Azul
            'rgba(75, 192, 192, 0.7)',   // Verde azulado
            'rgba(255, 206, 86, 0.7)',   // Amarillo
            'rgba(153, 102, 255, 0.7)',  // Morado
            'rgba(255, 159, 64, 0.7)',   // Naranja
            'rgba(201, 203, 207, 0.7)',  // Gris
            'rgba(100, 149, 237, 0.7)',  // Azul aciano
            'rgba(255, 105, 180, 0.7)',  // Rosa fuerte
            'rgba(144, 238, 144, 0.7)',  // Verde claro
            'rgba(255, 218, 185, 0.7)',  // Melocotón
            'rgba(221, 160, 221, 0.7)',  // Ciruela
            'rgba(64, 224, 208, 0.7)',   // Turquesa
            'rgba(255, 222, 173, 0.7)',  // Miel
            'rgba(135, 206, 235, 0.7)'   // Azul cielo
          ],
          borderColors: [
            'rgb(2, 2, 2)',     // Rojo
            'rgba(54, 162, 235, 1)',     // Azul
            'rgba(75, 192, 192, 1)',     // Verde azulado
            'rgba(255, 206, 86, 1)',     // Amarillo
            'rgba(153, 102, 255, 1)',    // Morado
            'rgba(255, 159, 64, 1)',     // Naranja
            'rgba(201, 203, 207, 1)',    // Gris
            'rgba(100, 149, 237, 1)',    // Azul aciano
            'rgba(255, 105, 180, 1)',    // Rosa fuerte
            'rgba(144, 238, 144, 1)',    // Verde claro
            'rgba(255, 218, 185, 1)',    // Melocotón
            'rgba(221, 160, 221, 1)',    // Ciruela
            'rgba(64, 224, 208, 1)',     // Turquesa
            'rgba(255, 222, 173, 1)',    // Miel
            'rgba(135, 206, 235, 1)'     // Azul cielo
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
            labels: { boxWidth: 12, font: { size: 11 } }
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
 * @param {number|string} days - Número de días para filtrar o 'max' para mostrar todo el historial
 */
function filterChart(days) {
  console.log(`Filtrando por ${days} días`);
  const chartInstance = Chart.getChart("trabajosLineChart");
  if (!chartInstance) {
    console.error("No se pudo encontrar la instancia del gráfico");
    return;
  }
  let monthsToShow;
  const daysStr = String(days).trim();
  if (daysStr === 'max') {
    monthsToShow = mesesLabels.length;
    document.querySelector('#periodoDropdown span').innerText = 'Todo el historial';
  } else if (Number(days) === 90) {
    monthsToShow = 3;
    document.querySelector('#periodoDropdown span').innerText = 'Últimos 3 meses';
  } else if (Number(days) === 180) {
    monthsToShow = 6;
    document.querySelector('#periodoDropdown span').innerText = 'Últimos 6 meses';
  } else if (Number(days) === 365) {
    monthsToShow = 12;
    document.querySelector('#periodoDropdown span').innerText = 'Último año';
  } else {
    monthsToShow = 3;
    document.querySelector('#periodoDropdown span').innerText = 'Últimos 3 meses';
  }
  const startIndex = Math.max(0, mesesLabels.length - monthsToShow);
  const filteredLabels = mesesLabels.slice(startIndex);
  const filteredData = trabajosMes.slice(startIndex);
  console.log(`Mostrando los últimos ${monthsToShow} meses:`, filteredLabels);
  chartInstance.data.labels = filteredLabels;
  chartInstance.data.datasets[0].data = filteredData;
  chartInstance.update();
}

/**
 * Filtra los datos de la gráfica de facturación por un período específico
 * @param {number|string} days - Número de días para filtrar o 'max' para mostrar todo el historial
 */
function filterFacturacionChart(days) {
  console.log(`Filtrando facturación por ${days} días`);
  const chartInstance = Chart.getChart("facturacionBarChart");
  if (!chartInstance) {
    console.error("No se pudo encontrar la instancia de la gráfica de facturación");
    return;
  }
  let monthsToShow;
  const daysStr = String(days).trim();
  if (daysStr === 'max') {
    monthsToShow = mesesLabels.length;
    document.querySelector('#facturacionDropdown span').innerText = 'Todo el historial';
  } else if (Number(days) === 90) {
    monthsToShow = 3;
    document.querySelector('#facturacionDropdown span').innerText = 'Últimos 3 meses';
  } else if (Number(days) === 180) {
    monthsToShow = 6;
    document.querySelector('#facturacionDropdown span').innerText = 'Últimos 6 meses';
  } else if (Number(days) === 365) {
    monthsToShow = 12;
    document.querySelector('#facturacionDropdown span').innerText = 'Último año';
  } else {
    monthsToShow = 3;
    document.querySelector('#facturacionDropdown span').innerText = 'Últimos 3 meses';
  }
  const startIndex = Math.max(0, mesesLabels.length - monthsToShow);
  const filteredLabels = mesesLabels.slice(startIndex);
  const filteredData = facturacionMes.slice(startIndex);
  console.log(`Mostrando los últimos ${monthsToShow} meses:`, filteredLabels);
  chartInstance.data.labels = filteredLabels;
  chartInstance.data.datasets[0].data = filteredData;
  chartInstance.update();
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

/**
 * Inicializa el selector de años con los años disponibles o los últimos 5 años si no hay datos
 */
function initYearSelector() {
  const yearSelect = document.getElementById('distribucionYear');
  if (!yearSelect) return;
  
  // Limpiar opciones existentes, manteniendo la opción por defecto
  const defaultOption = yearSelect.querySelector('option:first-child');
  yearSelect.innerHTML = '';
  if (defaultOption) yearSelect.appendChild(defaultOption);
  
  // Si tenemos años disponibles del servidor, los usamos
  let years = [];
  if (typeof añosDisponibles !== 'undefined' && añosDisponibles.length > 0) {
    years = añosDisponibles;
  } else {
    // Si no hay datos del servidor, usamos los últimos 5 años
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
  }
  
  // Crear opciones para cada año
  years.sort((a, b) => b - a); // Ordenar descendente (más reciente primero)
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
  
  // Seleccionar el año actual por defecto
  yearSelect.value = new Date().getFullYear();
  
  // Evento para deshabilitar el selector de mes si no hay año seleccionado
  yearSelect.addEventListener('change', function() {
    const monthSelect = document.getElementById('distribucionMonth');
    if (!monthSelect) return;
    
    if (!this.value) {
      // Si no hay año seleccionado, deshabilitar selector de mes
      monthSelect.disabled = true;
      monthSelect.value = '';
    } else {
      // Si hay año, habilitar selector de mes
      monthSelect.disabled = false;
    }
  });
  
  // Inicializar el estado del selector de mes
  const monthSelect = document.getElementById('distribucionMonth');
  if (monthSelect && !yearSelect.value) {
    monthSelect.disabled = true;
  }
}

/**
 * Filtra el gráfico de distribución por mes y año seleccionados
 * @param {string} preset - Opción predefinida ('current', 'year', o 'custom')
 */
function filterDistribucionChart(preset) {
  console.log(`Filtrando gráfico de distribución: ${preset}`);
  
  let month = null;
  let year = null;
  let label = '';
  
  if (preset === 'current') {
    // Usar el mes y año actual
    const now = new Date();
    month = now.getMonth() + 1; // JavaScript cuenta meses desde 0
    year = now.getFullYear();
    
    // Actualizar los selectores en la UI
    if (document.getElementById('distribucionMonth'))
      document.getElementById('distribucionMonth').value = month;
    if (document.getElementById('distribucionYear'))
      document.getElementById('distribucionYear').value = year;
      
    label = 'Mes actual';
  } else if (preset === 'year') {
    // Ver todo el año actual
    const now = new Date();
    year = now.getFullYear();
    month = null; // null indica que queremos ver todo el año
    
    // Actualizar los selectores en la UI
    if (document.getElementById('distribucionYear'))
      document.getElementById('distribucionYear').value = year;
    if (document.getElementById('distribucionMonth'))
      document.getElementById('distribucionMonth').value = '';
      
    label = `${year} Completo`;
  } else if (preset === 'custom') {
    // Usar los valores seleccionados por el usuario
    year = document.getElementById('distribucionYear').value;
    if (!year) {
      // Si no hay año seleccionado, mostrar un mensaje y salir
      const yearSelect = document.getElementById('distribucionYear');
      yearSelect.classList.add('is-invalid');
      setTimeout(() => {
        yearSelect.classList.remove('is-invalid');
      }, 2000);
      return;
    }
    
    year = parseInt(year);
    month = document.getElementById('distribucionMonth').value;
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    if (month) {
      month = parseInt(month);
      label = `${monthNames[month-1]} ${year}`;
    } else {
      label = `${year} Completo`;
    }
  }
  
  document.querySelector('#distribucionDropdown span').innerText = label;
  
  // Cerrar el dropdown
  const dropdown = document.getElementById('distribucionDropdownButton');
  if (dropdown && typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
    const dropdownInstance = bootstrap.Dropdown.getInstance(dropdown);
    if (dropdownInstance) dropdownInstance.hide();
  }
  
  // Actualizar el gráfico según el preset seleccionado
  updateDistribucionChart(month, year);
}

/**
 * Actualiza el gráfico de distribución con los datos según el mes y año
 * @param {number|null} month - Mes (1-12) o null para mostrar todo el año
 * @param {number} year - Año a mostrar
 */
function updateDistribucionChart(month, year) {
  // Mostrar indicador de carga
  const distribucionContainer = document.querySelector('#distribucionChart').parentElement;
  distribucionContainer.classList.add('loading-chart');
  
  // Simulamos una pequeña demora para poder apreciar la animación
  setTimeout(() => {
    // Obtener los datos según el filtro seleccionado
    let datosParaMostrar = [];
    
    if (month !== null) {
      // Datos para un mes específico de un año
      if (typeof datosTecnicosPorFecha !== 'undefined') {
        const keyFecha = `${year}-${month.toString().padStart(2, '0')}`;
        if (datosTecnicosPorFecha[keyFecha]) {
          datosParaMostrar = datosTecnicosPorFecha[keyFecha];
        }
      }
    } else {
      // Datos para todo un año
      // Acumular datos de todos los meses del año seleccionado
      const tecnicosTotales = {};
      
      if (typeof datosTecnicosPorFecha !== 'undefined') {
        // Recorrer todos los meses del año
        for (let m = 1; m <= 12; m++) {
          const keyFecha = `${year}-${m.toString().padStart(2, '0')}`;
          if (datosTecnicosPorFecha[keyFecha]) {
            datosTecnicosPorFecha[keyFecha].forEach(tecnico => {
              if (tecnicosTotales[tecnico.id]) {
                tecnicosTotales[tecnico.id].trabajos_completados += tecnico.trabajos_completados;
              } else {
                tecnicosTotales[tecnico.id] = {
                  id: tecnico.id,
                  nombre: tecnico.nombre,
                  trabajos_completados: tecnico.trabajos_completados
                };
              }
            });
          }
        }
        
        // Convertir el objeto a un array
        datosParaMostrar = Object.values(tecnicosTotales);
      }
    }
    
    // Si no hay datos específicos, intentamos usar los datos generales
    if (datosParaMostrar.length === 0 && typeof datosTecnicos !== 'undefined') {
      datosParaMostrar = datosTecnicos;
    }
    
    // Destruir el gráfico existente si hay uno
    const chartInstance = Chart.getChart("distribucionChart");
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    // Recrear el gráfico con los datos filtrados
    const distribucionCtx = document.getElementById('distribucionChart').getContext('2d');
    if (!datosParaMostrar || datosParaMostrar.length === 0) {
      distribucionCtx.clearRect(0, 0, distribucionCtx.canvas.width, distribucionCtx.canvas.height);
      distribucionCtx.font = '14px Arial';
      distribucionCtx.textAlign = 'center';
      distribucionCtx.fillStyle = '#666';
      distribucionCtx.fillText('No hay datos disponibles para este período', 
                              distribucionCtx.canvas.width / 2, 
                              distribucionCtx.canvas.height / 2);
      distribucionContainer.classList.remove('loading-chart');
      return;
    }
    
    // Ordenar por cantidad de trabajos completados descendente y limitar a 10 técnicos si hay más
    datosParaMostrar.sort((a, b) => b.trabajos_completados - a.trabajos_completados);
    const tecnicosData = datosParaMostrar.length > 10 ? datosParaMostrar.slice(0, 10) : datosParaMostrar;
    
    const colors = [
      'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)',
      'rgba(255, 206, 86, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
      'rgba(201, 203, 207, 0.7)', 'rgba(123, 239, 178, 0.7)', 'rgba(255, 87, 51, 0.7)',
      'rgba(0, 123, 255, 0.7)'
    ];
    
    new Chart(distribucionCtx, {
      type: 'pie',
      data: {
        labels: tecnicosData.map(tecnico => tecnico.nombre),
        datasets: [{
          data: tecnicosData.map(tecnico => tecnico.trabajos_completados),
          backgroundColor: colors.slice(0, tecnicosData.length),
          borderColor: colors.slice(0, tecnicosData.length).map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        },
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                size: 10
              },
              boxWidth: 10,
              padding: 5,
              textAlign: 'start',
              usePointStyle: true
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
    
    // Quitar el indicador de carga
    distribucionContainer.classList.remove('loading-chart');
  }, 300);
}

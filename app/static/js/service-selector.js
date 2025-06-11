/**
 * Script para manejar la selección de servicios y planes de mantenimiento
 */
document.addEventListener("DOMContentLoaded", function() {
    // Referencias a elementos de la UI
    const serviceTypeSelect = document.getElementById('service_type');
    const pestTypeContainer = document.getElementById('pest_type_container');
    const pestTypeSelect = document.getElementById('tipo_plaga');
    const subcategoriesContainer = document.getElementById('subcategories_container');
    const maintenanceContainer = document.getElementById('maintenance_container');
    const enableMaintenanceCheck = document.getElementById('enable_maintenance');
    const maintenanceOptionsContainer = document.getElementById('maintenance_options');
    const frequencySelect = document.getElementById('maintenance_frequency');
    const durationContainer = document.getElementById('maintenance_duration_container');
    const durationSelect = document.getElementById('maintenance_duration');
    const servicesSummary = document.getElementById('services_summary');
    
    // Ocultar secciones que deben mostrarse condicionalmente al inicio
    if (pestTypeContainer) pestTypeContainer.style.display = 'none';
    if (subcategoriesContainer) subcategoriesContainer.style.display = 'none';
    if (maintenanceOptionsContainer) maintenanceOptionsContainer.style.display = 'none';
    if (durationContainer) durationContainer.style.display = 'none';
    
    // Datos de servicios
    const services = {
        "DDD": {
            title: "DDD (Desinsectación, Desinfección, Desratización)",
            requiresPestType: true,
            hasSubcategories: false,
            allowsMaintenance: true
        },
        "Desatascos": {
            title: "Desatascos",
            requiresPestType: false,
            hasSubcategories: true,
            subcategories: ["Limpieza", "Desatranque", "Vaciado de fosa"],
            allowsMaintenance: false
        },
        "Legionela": {
            title: "Legionela",
            requiresPestType: false,
            hasSubcategories: false,
            allowsMaintenance: true
        },
        "Poda de Palmeras": {
            title: "Poda de Palmeras",
            requiresPestType: false,
            hasSubcategories: false,
            allowsMaintenance: true
        },
        "Servicio de cubas": {
            title: "Servicio de cubas",
            requiresPestType: false,
            hasSubcategories: true,
            subcategories: ["Cuba de escombro", "Residuos vegetales", "Cuba de aguas"],
            allowsMaintenance: false
        },
        "Servicio de maquinaria": {
            title: "Servicio de maquinaria",
            requiresPestType: false,
            hasSubcategories: false,
            allowsMaintenance: false
        },
        "Tratamientos fitosanitarios": {
            title: "Tratamientos fitosanitarios",
            requiresPestType: false,
            hasSubcategories: true,
            subcategories: ["Herbicidas", "Picudo Rojo", "Insecticidas", "Fertilizantes"],
            allowsMaintenance: true
        },
        "Tratamiento de choque": {
            title: "Tratamiento de choque",
            requiresPestType: false,
            hasSubcategories: false,
            allowsMaintenance: false
        }
    };
    
    // Duración según frecuencia
    const durationOptions = {
        "mensual": [
            {value: 1, label: "1 mes"},
            {value: 3, label: "3 meses"},
            {value: 6, label: "6 meses"},
            {value: 12, label: "12 meses"},
            {value: 18, label: "18 meses"},
            {value: 24, label: "24 meses"}
        ],
        "bimensual": [
            {value: 1, label: "1 bimestre (2 meses)"},
            {value: 3, label: "3 bimestres (6 meses)"},
            {value: 6, label: "6 bimestres (12 meses)"},
            {value: 9, label: "9 bimestres (18 meses)"},
            {value: 12, label: "12 bimestres (24 meses)"}
        ],
        "trimestral": [
            {value: 1, label: "1 trimestre (3 meses)"},
            {value: 2, label: "2 trimestres (6 meses)"},
            {value: 4, label: "4 trimestres (12 meses)"},
            {value: 6, label: "6 trimestres (18 meses)"},
            {value: 8, label: "8 trimestres (24 meses)"}
        ],
        "semestral": [
            {value: 1, label: "1 semestre (6 meses)"},
            {value: 2, label: "2 semestres (12 meses)"},
            {value: 3, label: "3 semestres (18 meses)"},
            {value: 4, label: "4 semestres (24 meses)"}
        ]
    };
    
    /**
     * Maneja el cambio en el tipo de servicio
     */
    function handleServiceTypeChange() {
        const selectedService = serviceTypeSelect.value;
        if (!selectedService || selectedService === "") return;
        
        const serviceData = services[selectedService];
        
        // Controlar visibilidad de sección de tipo de plaga
        if (pestTypeContainer && serviceData) {
            pestTypeContainer.style.display = serviceData.requiresPestType ? 'block' : 'none';
            if (!serviceData.requiresPestType) {
                pestTypeSelect.value = '';
            }
        }
        
        // Controlar visibilidad de subcategorías
        if (subcategoriesContainer && serviceData) {
            if (serviceData.hasSubcategories && serviceData.subcategories) {
                // Limpiar subcategorías anteriores
                subcategoriesContainer.style.display = 'block';
                const subcategoriesList = document.getElementById('subcategories_list');
                subcategoriesList.innerHTML = '';
                
                // Crear nuevas subcategorías
                serviceData.subcategories.forEach(sub => {
                    const checkboxId = `subcategory_${sub.toLowerCase().replace(/\s+/g, '_')}`;
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'form-check form-check-inline';
                    checkboxDiv.innerHTML = `
                        <input class="form-check-input" type="checkbox" name="subcategories" 
                               value="${sub}" id="${checkboxId}">
                        <label class="form-check-label" for="${checkboxId}">${sub}</label>
                    `;
                    subcategoriesList.appendChild(checkboxDiv);
                });
            } else {
                subcategoriesContainer.style.display = 'none';
            }
        }
        
        // Controlar visibilidad de mantenimiento
        if (maintenanceContainer && serviceData) {
            maintenanceContainer.style.display = serviceData.allowsMaintenance ? 'block' : 'none';
            enableMaintenanceCheck.checked = false;
            maintenanceOptionsContainer.style.display = 'none';
        }
        
        updateServicesSummary();
    }
    
    /**
     * Maneja el cambio en la casilla de habilitar mantenimiento
     */
    function handleMaintenanceEnableChange() {
        if (maintenanceOptionsContainer) {
            maintenanceOptionsContainer.style.display = enableMaintenanceCheck.checked ? 'block' : 'none';
            if (!enableMaintenanceCheck.checked) {
                frequencySelect.value = '';
                durationSelect.value = '';
                durationContainer.style.display = 'none';
            }
        }
        updateServicesSummary();
    }
    
    /**
     * Maneja el cambio en la frecuencia de mantenimiento
     */
    function handleFrequencyChange() {
        const frequency = frequencySelect.value;
        if (!frequency || frequency === "") {
            durationContainer.style.display = 'none';
            return;
        }
        
        // Mostrar opciones de duración basadas en frecuencia seleccionada
        durationContainer.style.display = 'block';
        const options = durationOptions[frequency] || [];
        
        // Actualizar dropdown de duración
        durationSelect.innerHTML = '<option value="">Seleccione duración</option>';
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.label;
            durationSelect.appendChild(option);
        });
        
        updateServicesSummary();
    }
    
    /**
     * Actualiza el resumen de servicios
     */
    function updateServicesSummary() {
        if (!servicesSummary) return;
        
        const selectedService = serviceTypeSelect.value;
        if (!selectedService || selectedService === "") {
            servicesSummary.innerHTML = '<p class="text-muted"><i class="bi bi-info-circle me-1"></i>Seleccione un servicio para ver el resumen</p>';
            return;
        }
        
        const serviceData = services[selectedService];
        let summaryHTML = `<h6 class="fw-bold">Resumen del Servicio:</h6>
                           <ul class="list-group list-group-flush">
                           <li class="list-group-item bg-transparent px-0"><i class="bi bi-check-circle-fill text-success me-2"></i><b>Tipo de Servicio:</b> ${serviceData.title}</li>`;
        
        // Añadir tipo de plaga si aplica
        if (serviceData.requiresPestType && pestTypeSelect.value) {
            summaryHTML += `<li class="list-group-item bg-transparent px-0"><i class="bi bi-check-circle-fill text-success me-2"></i><b>Tipo de Plaga:</b> ${pestTypeSelect.value}</li>`;
        }
        
        // Añadir subcategorías si aplica
        if (serviceData.hasSubcategories) {
            const selectedSubcategories = [...document.querySelectorAll('input[name="subcategories"]:checked')].map(cb => cb.value);
            if (selectedSubcategories.length > 0) {
                summaryHTML += `<li class="list-group-item bg-transparent px-0"><i class="bi bi-check-circle-fill text-success me-2"></i><b>Subcategorías:</b> ${selectedSubcategories.join(', ')}</li>`;
            }
        }
        
        // Añadir información de mantenimiento si está habilitado
        if (serviceData.allowsMaintenance && enableMaintenanceCheck.checked) {
            let maintenanceInfo = '<b>Plan de Mantenimiento:</b> ';
            
            if (frequencySelect.value) {
                const frequencyLabel = frequencySelect.options[frequencySelect.selectedIndex].text;
                maintenanceInfo += frequencyLabel;
                
                if (durationSelect.value) {
                    const durationLabel = durationSelect.options[durationSelect.selectedIndex].text;
                    maintenanceInfo += ` durante ${durationLabel}`;
                }
            } else {
                maintenanceInfo += 'Configuración pendiente';
            }
            
            summaryHTML += `<li class="list-group-item bg-transparent px-0"><i class="bi bi-check-circle-fill text-success me-2"></i>${maintenanceInfo}</li>`;
        }
        
        summaryHTML += '</ul>';
        servicesSummary.innerHTML = summaryHTML;
    }
    
    // Configurar listeners de eventos
    if (serviceTypeSelect) {
        serviceTypeSelect.addEventListener('change', handleServiceTypeChange);
    }
    
    if (enableMaintenanceCheck) {
        enableMaintenanceCheck.addEventListener('change', handleMaintenanceEnableChange);
    }
    
    if (frequencySelect) {
        frequencySelect.addEventListener('change', handleFrequencyChange);
    }
    
    if (durationSelect) {
        durationSelect.addEventListener('change', updateServicesSummary);
    }
    
    // También escuchar cambios en el tipo de plaga
    if (pestTypeSelect) {
        pestTypeSelect.addEventListener('change', updateServicesSummary);
    }
    
    // Escuchar cambios en cualquier checkbox de subcategoría
    document.addEventListener('change', function(e) {
        if (e.target && e.target.name === 'subcategories') {
            updateServicesSummary();
        }
    });
});

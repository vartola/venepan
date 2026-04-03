/************* CONFIGURACIÓN DE PRODUCTOS *************/
const productos = [
    { id: 'integral', nombre: 'PAN INTEGRAL', pesoUnitario: 450 },
    { id: 'ajonjoli', nombre: 'PAN C/ AJONJOLÍ', pesoUnitario: 450 },
    { id: 'blanco', nombre: 'PAN BLANCO', pesoUnitario: 450 },
    { id: 'miel', nombre: 'PAN MIEL', pesoUnitario: 450 },
    { id: 'hamburguesa', nombre: 'PAN HAMBURGUESA', pesoUnitario: 100 },
    { id: 'perrocaliente', nombre: 'PAN PERRO CALIENTE', pesoUnitario: 80 },
    { id: 'tostadas', nombre: 'TOSTADAS', pesoUnitario: 250 }
];

// Variables globales para los gráficos
let comparativaChart = null;
let rendimientoChart = null;
let mermaChart = null;
let vistaActual = 'mensual'; // mensual, semanal, diaria, anual
let fechaActual = new Date();

document.addEventListener('DOMContentLoaded', function() {
    // Actualizar datos iniciales
    actualizarVista(vistaActual);
});

// Función para cambiar la vista desde el menú
function cambiarVista(vista) {
    vistaActual = vista;
    actualizarVista(vista);
    
    // Cerrar el menú desplegable
    const menu = document.getElementById('menuDesplegable');
    if (menu) {
        menu.classList.remove('mostrar');
    }
    
    // Actualizar el título de la vista
    const tituloVista = document.getElementById('tituloVista');
    const subtituloVista = document.getElementById('subtituloVista');
    
    switch(vista) {
        case 'mensual':
            tituloVista.textContent = 'Resumen Mensual de Producción';
            subtituloVista.textContent = `Análisis del mes actual - ${nombresMeses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
            break;
        case 'semanal':
            tituloVista.textContent = 'Resumen Semanal de Producción';
            subtituloVista.textContent = `Análisis de la semana actual (${obtenerRangoSemana()})`;
            break;
        case 'diaria':
            tituloVista.textContent = 'Resumen Diario de Producción';
            subtituloVista.textContent = `Análisis del día ${fechaActual.toLocaleDateString('es-ES')}`;
            break;
        case 'anual':
            tituloVista.textContent = 'Resumen Anual de Producción';
            subtituloVista.textContent = `Análisis del año ${fechaActual.getFullYear()}`;
            break;
    }
}

// Función principal que actualiza la vista según la selección
function actualizarVista(vista) {
    const datos = JSON.parse(localStorage.getItem('datos_panaderia')) || [];
    
    // Obtener datos filtrados según la vista
    let datosFiltrados = [];
    let periodoInfo = '';
    
    switch(vista) {
        case 'mensual':
            datosFiltrados = filtrarPorMes(datos, fechaActual.getMonth() + 1, fechaActual.getFullYear());
            periodoInfo = `${nombresMeses[fechaActual.getMonth()]} ${fechaActual.getFullYear()}`;
            break;
        case 'semanal':
            datosFiltrados = filtrarPorSemana(datos);
            periodoInfo = obtenerRangoSemana();
            break;
        case 'diaria':
            datosFiltrados = filtrarPorDia(datos);
            periodoInfo = fechaActual.toLocaleDateString('es-ES');
            break;
        case 'anual':
            datosFiltrados = filtrarPorAnio(datos, fechaActual.getFullYear());
            periodoInfo = `${fechaActual.getFullYear()}`;
            break;
    }
    
    // Actualizar estadísticas generales
    actualizarEstadisticasGenerales(datosFiltrados, vista);
    
    // Generar resumen y gráficos con los datos filtrados
    generarResumenConGraficos(datosFiltrados, periodoInfo, vista);
}

// Función para filtrar por día
function filtrarPorDia(datos) {
    const hoy = new Date();
    const dia = hoy.getDate();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    
    return datos.filter(r => r.dia === dia && r.mes === mes && r.anio === anio);
}

// Función para filtrar por semana
function filtrarPorSemana(datos) {
    const hoy = new Date();
    const fechaInicioSemana = new Date(hoy);
    const diaSemana = hoy.getDay();
    const diferencia = diaSemana === 0 ? 6 : diaSemana - 1;
    fechaInicioSemana.setDate(hoy.getDate() - diferencia);
    
    const fechaFinSemana = new Date(fechaInicioSemana);
    fechaFinSemana.setDate(fechaInicioSemana.getDate() + 6);
    
    return datos.filter(r => {
        const fechaRegistro = new Date(r.anio, r.mes - 1, r.dia);
        return fechaRegistro >= fechaInicioSemana && fechaRegistro <= fechaFinSemana;
    });
}

// Función para filtrar por mes
function filtrarPorMes(datos, mes, anio) {
    return datos.filter(r => r.mes === mes && r.anio === anio);
}

// Función para filtrar por año
function filtrarPorAnio(datos, anio) {
    return datos.filter(r => r.anio === anio);
}

// Función para obtener el rango de la semana actual
function obtenerRangoSemana() {
    const hoy = new Date();
    const fechaInicioSemana = new Date(hoy);
    const diaSemana = hoy.getDay();
    const diferencia = diaSemana === 0 ? 6 : diaSemana - 1;
    fechaInicioSemana.setDate(hoy.getDate() - diferencia);
    
    const fechaFinSemana = new Date(fechaInicioSemana);
    fechaFinSemana.setDate(fechaInicioSemana.getDate() + 6);
    
    return `${fechaInicioSemana.toLocaleDateString('es-ES')} - ${fechaFinSemana.toLocaleDateString('es-ES')}`;
}

// Función para actualizar estadísticas generales
function actualizarEstadisticasGenerales(datosFiltrados, vista) {
    // Contar días únicos con actividad
    const diasUnicos = new Set();
    datosFiltrados.forEach(r => {
        diasUnicos.add(`${r.anio}-${r.mes}-${r.dia}`);
    });
    
    // Calcular total de producción
    let totalKilos = 0;
    datosFiltrados.forEach(r => {
        const producto = productos.find(p => p.id === r.panId);
        if (producto) {
            totalKilos += (r.unidades * producto.pesoUnitario) / 1000;
        }
    });
    
    // Calcular rendimiento promedio
    let sumaRendimientos = 0;
    let conteoRendimientos = 0;
    datosFiltrados.forEach(r => {
        if (r.rendimiento) {
            sumaRendimientos += r.rendimiento;
            conteoRendimientos++;
        }
    });
    const rendimientoPromedio = conteoRendimientos > 0 ? (sumaRendimientos / conteoRendimientos).toFixed(1) : 0;
    
    // Actualizar elementos del DOM
    document.getElementById('dias-registrados').textContent = diasUnicos.size;
    document.getElementById('total-productos-count').textContent = productos.length;
    document.getElementById('total-kilos').textContent = totalKilos.toFixed(2) + " kg";
    
   const rendimientoElement = document.getElementById('rendimiento-promedio');
   if (rendimientoPromedio >= 90) {
        rendimientoElement.style.color = "#27ae60";
    } else if (rendimientoPromedio >= 70) {
        rendimientoElement.style.color = "var(--venepan-red)";
    } else {
        rendimientoElement.style.color = "#1a1a1a";
    }
}

function generarResumenConGraficos(datosFiltrados, periodoInfo, vista) {
    const contenedor = document.getElementById('resumen');
    if (!contenedor) return;
    
    // Variables para los totales generales
    let granTotalMedida = 0;
    let granTotalUnidades = 0;
    let granTotalKilos = 0;
    let granTotalMerma = 0;
    let sumaRendimientos = 0;
    let productosConDatos = 0;
    
    // Arrays para gráficos
    const nombresProductos = [];
    const planificacionKg = [];
    const produccionRealKg = [];
    const rendimientos = [];
    const mermasKg = [];
    
    // Empezamos a construir la tabla con el estilo amarillo/crema
    let html = `
        <div class="card" style="background: #fffbe6; border: 1px solid #e6dbac;">
            <div class="card-header" style="background: #fdf5d0; border-bottom: 2px solid #e6dbac; padding: 15px;">
                <h3 style="color: #856404;">
                    <i class="fas fa-chart-line"></i> Reporte Consolidado: ${periodoInfo}
                </h3>
            </div>
            <div style="overflow-x:auto; margin-top: 0;">
                <table style="width:100%; border-collapse: collapse; background: #fffbe6;">
                    <thead>
                        <tr style="background: #fdf5d0;">
                            <th style="padding: 12px; text-align: left; border: 1px solid #e6dbac; color: #856404;">Producto</th>
                            <th style="padding: 12px; border: 1px solid #e6dbac; color: #856404;">Planificación (Kg)</th>
                            <th style="padding: 12px; border: 1px solid #e6dbac; color: #856404;">Peso Unit.</th>
                            <th style="padding: 12px; border: 1px solid #e6dbac; color: #856404;">Prod. Real (Und)</th>
                            <th style="padding: 12px; border: 1px solid #e6dbac; color: #856404;">Prod. Real (Kg)</th>
                            <th style="padding: 12px; border: 1px solid #e6dbac; color: #856404;">Rendimiento</th>
                            <th style="padding: 12px; border: 1px solid #e6dbac; color: #856404;">Merma (Kg)</th>
                            <th style="padding: 12px; border: 1px solid #e6dbac; color: #856404;">Comparación</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    productos.forEach(p => {
        const registrosProducto = datosFiltrados.filter(r => r.panId === p.id);
        
        if (registrosProducto.length === 0) return;
        
        let planificacionMedida = 0;
        let totalUnidadesReales = 0;
        let totalRendimiento = 0;
        let totalBD = 0;
        let conteoDias = registrosProducto.length;
        
        registrosProducto.forEach(r => {
            planificacionMedida += r.medida || 0;
            totalUnidadesReales += r.unidades || 0;
            totalBD += r.bd || 0;
            totalRendimiento += r.rendimiento || 0;
        });
        
        const prodRealKG = (totalUnidadesReales * p.pesoUnitario) / 1000;
        const planificacionKG = planificacionMedida;
        const mermaKG = (totalBD * p.pesoUnitario) / 1000;
        const promedioRend = conteoDias ? (totalRendimiento / conteoDias).toFixed(1) : 0;
        
        // Comparación entre planificación y producción real
        const diferenciaKg = prodRealKG - planificacionKG;
        const comparacionTexto = diferenciaKg >= 0 
            ? `<span class="comparacion-positiva"><i class="fas fa-arrow-up"></i> +${diferenciaKg.toFixed(2)} kg</span>`
            : `<span class="comparacion-negativa"><i class="fas fa-arrow-down"></i> ${diferenciaKg.toFixed(2)} kg</span>`;
        
        // Sumar a los totales generales
        granTotalMedida += planificacionKG;
        granTotalUnidades += totalUnidadesReales;
        granTotalKilos += prodRealKG;
        granTotalMerma += mermaKG;
        sumaRendimientos += parseFloat(promedioRend);
        productosConDatos++;
        
        // Guardar datos para gráficos
        nombresProductos.push(p.nombre);
        planificacionKg.push(planificacionKG);
        produccionRealKg.push(prodRealKG);
        rendimientos.push(parseFloat(promedioRend));
        mermasKg.push(mermaKG);
        
        // Añadir la fila del producto con estilo amarillo/crema
        html += `
            <tr style="border-bottom: 1px solid #e6dbac;">
                <td style="padding: 10px; border: 1px solid #e6dbac; font-weight: bold; color: #5d4a1b;">${p.nombre}</td>
                <td style="padding: 10px; border: 1px solid #e6dbac; text-align: center; color: #5d4a1b;">${planificacionKG.toFixed(2)} kg</td>
                <td style="padding: 10px; border: 1px solid #e6dbac; text-align: center; color: #5d4a1b;">${p.pesoUnitario}g</td>
                <td style="padding: 10px; border: 1px solid #e6dbac; text-align: center; color: #5d4a1b;">${totalUnidadesReales}</td>
                <td style="padding: 10px; border: 1px solid #e6dbac; text-align: center; font-weight:bold; color: #5d4a1b;">${prodRealKG.toFixed(2)} kg</td>
                <td style="padding: 10px; border: 1px solid #e6dbac; text-align: center;">
                    <span style="background: ${parseFloat(promedioRend) >= 90 ? '#27ae60' : (parseFloat(promedioRend) >= 70 ? '#b33939' : '#1a1a1a')}; 
                                  color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px;">
                        ${promedioRend}%
                    </span>
                </td>
                <td style="padding: 10px; border: 1px solid #e6dbac; text-align: center; color: #b33939; font-weight:bold;">${mermaKG.toFixed(2)} kg</td>
                <td style="padding: 10px; border: 1px solid #e6dbac; text-align: center;">${comparacionTexto}</td>
            </tr>
        `;
    });
    
    // Calcular el promedio de rendimiento general
    const promRendGeneral = productosConDatos ? (sumaRendimientos / productosConDatos).toFixed(1) : 0;
    const diferenciaTotalKg = granTotalKilos - granTotalMedida;
    
    // Añadir la fila de TOTALES con estilo amarillo/crema
    const diferenciaTotalTexto = diferenciaTotalKg >= 0 
        ? `<span style="color: #27ae60;">+${diferenciaTotalKg.toFixed(2)} kg</span>`
        : `<span style="color: #b33939;">${diferenciaTotalKg.toFixed(2)} kg</span>`;
    
    html += `
                    </tbody>
                    <tfoot>
                        <tr style="background: #fdf5d0;">
                            <td style="padding: 12px; border: 1px solid #e6dbac; font-weight: bold; color: #856404;">TOTAL GENERAL</td>
                            <td style="padding: 12px; border: 1px solid #e6dbac; text-align: center; font-weight: bold; color: #856404;">${granTotalMedida.toFixed(2)} kg</td>
                            <td style="padding: 12px; border: 1px solid #e6dbac; text-align: center; color: #856404;">-</td>
                            <td style="padding: 12px; border: 1px solid #e6dbac; text-align: center; font-weight: bold; color: #856404;">${granTotalUnidades}</td>
                            <td style="padding: 12px; border: 1px solid #e6dbac; text-align: center; font-weight: bold; color: #856404;">${granTotalKilos.toFixed(2)} kg</td>
                            <td style="padding: 12px; border: 1px solid #e6dbac; text-align: center; font-weight: bold; color: #856404;">${promRendGeneral}%</td>
                            <td style="padding: 12px; border: 1px solid #e6dbac; text-align: center; font-weight: bold; color: #b33939;">${granTotalMerma.toFixed(2)} kg</td>
                            <td style="padding: 12px; border: 1px solid #e6dbac; text-align: center; font-weight: bold;">${diferenciaTotalTexto}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
    
    contenedor.innerHTML = html;
    
    // Actualizar los mini stats de los gráficos
    const planificacionTotalSpan = document.getElementById('planificacion-total-kg');
    const produccionTotalSpan = document.getElementById('produccion-total-kg');
    const diferenciaTotalSpan = document.getElementById('diferencia-total');
    
    if (planificacionTotalSpan) planificacionTotalSpan.textContent = granTotalMedida.toFixed(2) + " kg";
    if (produccionTotalSpan) produccionTotalSpan.textContent = granTotalKilos.toFixed(2) + " kg";
    if (diferenciaTotalSpan) {
        diferenciaTotalSpan.textContent = (diferenciaTotalKg >= 0 ? "+" : "") + diferenciaTotalKg.toFixed(2) + " kg";
        diferenciaTotalSpan.style.color = diferenciaTotalKg >= 0 ? "#27ae60" : "#b33939";
    }
    
    // Actualizar el badge de rendimiento general
    const rendimientoGeneralDiv = document.getElementById('rendimiento-general');
    if (rendimientoGeneralDiv) {
        rendimientoGeneralDiv.textContent = `Rendimiento General: ${promRendGeneral}%`;
        if (promRendGeneral >= 90) {
            rendimientoGeneralDiv.className = "rendimiento-badge";
            rendimientoGeneralDiv.style.background = "#27ae60";
        } else if (promRendGeneral >= 70) {
            rendimientoGeneralDiv.className = "rendimiento-badge medio";
            rendimientoGeneralDiv.style.background = "#b33939";
        } else {
            rendimientoGeneralDiv.className = "rendimiento-badge bajo";
            rendimientoGeneralDiv.style.background = "#1a1a1a";
        }
    }
    
    // Crear gráficos si hay datos
    if (nombresProductos.length > 0) {
        crearGraficoComparativa(nombresProductos, planificacionKg, produccionRealKg);
        crearGraficoRendimiento(nombresProductos, rendimientos);
        crearGraficoMerma(nombresProductos, mermasKg);
    } else {
        mostrarGraficosVacios();
    }
}

// Función para ver el mes actual (desde el comparador)
function verMesActual() {
    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const anio = hoy.getFullYear();
    
    // Cambiar a vista mensual
    if (vistaActual !== 'mensual') {
        cambiarVista('mensual');
    }
    
    // Actualizar los selectores del comparador
    const selectMesBase = document.getElementById('mesBase');
    const selectMesComparacion = document.getElementById('mesComparacion');
    
    if (selectMesBase && selectMesComparacion) {
        const mesActualKey = `${anio}-${mes}`;
        selectMesBase.value = mesActualKey;
        selectMesComparacion.value = mesActualKey;
    }
    
    // Generar el resumen con los datos del mes actual
    const datos = JSON.parse(localStorage.getItem('datos_panaderia')) || [];
    const datosFiltrados = filtrarPorMes(datos, mes, anio);
    generarResumenConGraficos(datosFiltrados, `${nombresMeses[mes-1]} ${anio}`, 'mensual');
}

// Función para comparar meses (modificada para funcionar con la nueva estructura)
function compararMeses() {
    const mesBaseVal = document.getElementById('mesBase').value;
    const mesComparacionVal = document.getElementById('mesComparacion').value;
    
    if (!mesBaseVal || !mesComparacionVal) {
        alert('Por favor selecciona ambos meses para comparar');
        return;
    }
    
    const [anio1, mes1] = mesBaseVal.split('-').map(Number);
    const [anio2, mes2] = mesComparacionVal.split('-').map(Number);
    
    generarComparacionMeses(mes1, anio1, mes2, anio2);
}

// Función para cambiar entre pestañas (actualizada)
function cambiarTab(tab) {
    const tabMensual = document.getElementById('tabMensual');
    const tabComparativa = document.getElementById('tabComparativa');
    const btns = document.querySelectorAll('.tab-btn');
    
    btns.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'mensual') {
        tabMensual.classList.add('active');
        tabComparativa.classList.remove('active');
        event.target.classList.add('active');
        // Recargar datos según la vista actual
        actualizarVista(vistaActual);
    } else {
        tabMensual.classList.remove('active');
        tabComparativa.classList.add('active');
        event.target.classList.add('active');
        // Cargar meses disponibles si no se han cargado
        if (mesesDisponibles.length === 0) {
            cargarMesesDisponibles();
        }
    }
}

// Función para toggle del menú
function toggleMenu() {
    const menu = document.getElementById('menuDesplegable');
    if (menu) {
        menu.classList.toggle('mostrar');
    }
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(event) {
    const menuContainer = document.querySelector('.menu-desplegable-container');
    const menu = document.getElementById('menuDesplegable');
    
    if (menuContainer && menu && !menuContainer.contains(event.target)) {
        menu.classList.remove('mostrar');
    }
});

// Nombres de meses en español
const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Variables globales adicionales para comparación
let evolucionChart = null;
let variacionChart = null;
let mesesDisponibles = [];

// Función para cargar los meses disponibles en los selectores
function cargarMesesDisponibles() {
    const datos = JSON.parse(localStorage.getItem('datos_panaderia')) || [];
    const mesesSet = new Set();
    
    datos.forEach(r => {
        if (r.mes && r.anio) {
            mesesSet.add(`${r.anio}-${r.mes}`);
        }
    });
    
    mesesDisponibles = Array.from(mesesSet).sort().map(key => {
        const [anio, mes] = key.split('-');
        return { anio: parseInt(anio), mes: parseInt(mes), nombre: `${nombresMeses[parseInt(mes)-1]} ${anio}` };
    });
    
    const selectMesBase = document.getElementById('mesBase');
    const selectMesComparacion = document.getElementById('mesComparacion');
    
    if (selectMesBase && selectMesComparacion) {
        selectMesBase.innerHTML = '<option value="">Seleccionar mes</option>';
        selectMesComparacion.innerHTML = '<option value="">Seleccionar mes</option>';
        
        mesesDisponibles.forEach((m) => {
            const option1 = document.createElement('option');
            option1.value = `${m.anio}-${m.mes}`;
            option1.textContent = m.nombre;
            selectMesBase.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = `${m.anio}-${m.mes}`;
            option2.textContent = m.nombre;
            selectMesComparacion.appendChild(option2);
        });
    }
}

// Las funciones de gráficos se mantienen igual
function crearGraficoComparativa(labels, planificacion, produccion) {
    const ctx = document.getElementById('comparativaChart').getContext('2d');
    
    if (comparativaChart) {
        comparativaChart.destroy();
    }
    
    comparativaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Planificación (Kg)',
                    data: planificacion,
                    backgroundColor: 'rgba(179, 57, 57, 0.7)',  
                    borderColor: '#b33939',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: 'Producción Real (Kg)',
                    data: produccion,
                    backgroundColor: 'rgba(133, 100, 4, 0.7)',  // Ocre combinado con el tema
                    borderColor: '#856404',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { font: { size: 11 }, usePointStyle: true, boxWidth: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw.toFixed(2) + ' kg';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Kilogramos (kg)', font: { size: 11 } },
                    ticks: { callback: function(value) { return value.toFixed(0) + ' kg'; } }
                },
                x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } } }
            }
        }
    });
}

function crearGraficoRendimiento(labels, rendimientos) {
    const ctx = document.getElementById('rendimientoChart').getContext('2d');
    
    if (rendimientoChart) {
        rendimientoChart.destroy();
    }
    
      const colores = rendimientos.map(rend => {
        if (rend >= 90) return 'rgba(39, 174, 96, 0.8)';  // Verde
        if (rend >= 70) return 'rgba(179, 57, 57, 0.8)'; // Rojo corporativo
        return 'rgba(26, 26, 26, 0.8)';                  // Gris oscuro
    });

    rendimientoChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: rendimientos,
                backgroundColor: colores,
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: { size: 10 },
                        boxWidth: 12,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => ({
                                    text: `${label}: ${data.datasets[0].data[i]}%`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    index: i
                                }));
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.raw.toFixed(1) + '%';
                        }
                    }
                }
            }
        }
    });
    
    const leyendaDiv = document.getElementById('leyenda-rendimiento');
    if (leyendaDiv && labels.length > 0) {
        leyendaDiv.innerHTML = `
            <div class="leyenda-item"><div class="leyenda-color" style="background: rgba(39, 174, 96, 0.8);"></div><span>Excelente (≥90%)</span></div>
            <div class="leyenda-item"><div class="leyenda-color" style="background: rgba(179, 57, 57, 0.8);"></div><span>Bueno (70-89%)</span></div>
            <div class="leyenda-item"><div class="leyenda-color" style="background:rgba(26, 26, 26, 0.8);"></div><span>Requiere Mejora (&lt;70%)</span></div>
        `;
    }
}

function crearGraficoMerma(labels, mermas) {
    const ctx = document.getElementById('mermaChart').getContext('2d');
    
    if (mermaChart) {
        mermaChart.destroy();
    }
    
    mermaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Merma (Kg)',
                data: mermas,
                backgroundColor: 'rgba(179, 57, 57, 0.7)',
                borderColor: '#b33939',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            indexAxis: 'y',
            plugins: {
                legend: { position: 'top', labels: { font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'Merma: ' + context.raw.toFixed(2) + ' kg';
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Kilogramos (kg)', font: { size: 11 } },
                    beginAtZero: true
                },
                y: { ticks: { font: { size: 10 } } }
            }
        }
    });
}

function mostrarGraficosVacios() {
    const ctxComparativa = document.getElementById('comparativaChart')?.getContext('2d');
    const ctxRendimiento = document.getElementById('rendimientoChart')?.getContext('2d');
    const ctxMerma = document.getElementById('mermaChart')?.getContext('2d');
    
    if (ctxComparativa) {
        if (comparativaChart) comparativaChart.destroy();
        comparativaChart = new Chart(ctxComparativa, {
            type: 'bar',
            data: { labels: ['Sin datos'], datasets: [{ label: 'No hay registros', data: [0] }] },
            options: { plugins: { legend: { display: false } } }
        });
    }
    
    if (ctxRendimiento) {
        if (rendimientoChart) rendimientoChart.destroy();
        rendimientoChart = new Chart(ctxRendimiento, {
            type: 'doughnut',
            data: { labels: ['Sin datos'], datasets: [{ data: [1], backgroundColor: ['#ccc'] }] },
            options: { plugins: { legend: { display: false } } }
        });
    }
    
    if (ctxMerma) {
        if (mermaChart) mermaChart.destroy();
        mermaChart = new Chart(ctxMerma, {
            type: 'bar',
            data: { labels: ['Sin datos'], datasets: [{ label: 'Merma', data: [0] }] },
            options: { plugins: { legend: { display: false } } }
        });
    }
    
    const leyendaDiv = document.getElementById('leyenda-rendimiento');
    if (leyendaDiv) leyendaDiv.innerHTML = '<p style="text-align:center; color:#999;">No hay datos para el período seleccionado</p>';
    
    const rendimientoGeneralDiv = document.getElementById('rendimiento-general');
    if (rendimientoGeneralDiv) rendimientoGeneralDiv.textContent = 'Rendimiento General: Sin datos';
}

// Función para generar comparación de meses (se mantiene igual)
function generarComparacionMeses(mes1, anio1, mes2, anio2) {
    const datos = JSON.parse(localStorage.getItem('datos_panaderia')) || [];
    
    // Obtener datos de ambos meses
    const datosMes1 = datos.filter(r => r.mes === mes1 && r.anio === anio1);
    const datosMes2 = datos.filter(r => r.mes === mes2 && r.anio === anio2);
    
    // Calcular producción por producto para cada mes
    const produccionMes1 = {};
    const produccionMes2 = {};
    
    productos.forEach(p => {
        const registros1 = datosMes1.filter(r => r.panId === p.id);
        const registros2 = datosMes2.filter(r => r.panId === p.id);
        
        let totalUnidades1 = 0, totalUnidades2 = 0;
        registros1.forEach(r => totalUnidades1 += r.unidades);
        registros2.forEach(r => totalUnidades2 += r.unidades);
        
        produccionMes1[p.nombre] = (totalUnidades1 * p.pesoUnitario) / 1000;
        produccionMes2[p.nombre] = (totalUnidades2 * p.pesoUnitario) / 1000;
    });
    
    // Calcular totales
    const totalMes1 = Object.values(produccionMes1).reduce((a, b) => a + b, 0);
    const totalMes2 = Object.values(produccionMes2).reduce((a, b) => a + b, 0);
    const variacionTotal = totalMes1 > 0 ? ((totalMes2 - totalMes1) / totalMes1 * 100).toFixed(1) : (totalMes2 > 0 ? 100 : 0);
    
    // Mostrar resumen de comparación
    const comparacionResumen = document.getElementById('comparacionResumen');
    if (comparacionResumen) {
        comparacionResumen.style.display = 'block';
        comparacionResumen.innerHTML = `
            <div class="comparacion-resumen">
                <div class="comparacion-card">
                    <div class="mes-nombre">${nombresMeses[mes1-1]} ${anio1}</div>
                    <div class="valor">${totalMes1.toFixed(2)} kg</div>
                    <div class="diferencia">Producción Total</div>
                </div>
                <div class="comparacion-card">
                    <div class="mes-nombre">${nombresMeses[mes2-1]} ${anio2}</div>
                    <div class="valor">${totalMes2.toFixed(2)} kg</div>
                    <div class="diferencia">Producción Total</div>
                </div>
                <div class="comparacion-card">
                    <div class="mes-nombre">Variación</div>
                    <div class="valor ${variacionTotal >= 0 ? 'diferencia-positiva' : 'diferencia-negativa'}">
                        ${variacionTotal >= 0 ? '+' : ''}${variacionTotal}%
                    </div>
                    <div class="diferencia">${(totalMes2 - totalMes1).toFixed(2)} kg</div>
                </div>
            </div>
        `;
    }
    
// Generar tabla comparativa
    const tbody = document.getElementById('tbodyComparativa');
    const thMes1 = document.getElementById('thMes1');
    const thMes2 = document.getElementById('thMes2');
    
    if (thMes1) thMes1.textContent = `${nombresMeses[mes1-1]} ${anio1} (Kg)`;
    if (thMes2) thMes2.textContent = `${nombresMeses[mes2-1]} ${anio2} (Kg)`;
    
    if (tbody) {
        tbody.innerHTML = '';
        
        productos.forEach(p => {
            const prod1 = produccionMes1[p.nombre] || 0;
            const prod2 = produccionMes2[p.nombre] || 0;
            const variacion = prod2 - prod1;
            const variacionPorcentual = prod1 > 0 ? ((variacion / prod1) * 100).toFixed(1) : (prod2 > 0 ? 100 : 0);
            
            const tendencia = variacion > 0 ? 
                `<span class="comparacion-positiva"><i class="fas fa-arrow-up"></i> +${variacionPorcentual}%</span>` :
                variacion < 0 ? 
                `<span class="comparacion-negativa"><i class="fas fa-arrow-down"></i> ${variacionPorcentual}%</span>` :
                `<span><i class="fas fa-minus"></i> 0%</span>`;
            
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 12px; font-weight: bold;">${p.nombre}</td>
                    <td style="text-align:center;">${prod1.toFixed(2)} kg</td>
                    <td style="text-align:center;">${prod2.toFixed(2)} kg</td>
                    <td style="text-align:center;">${variacion >= 0 ? '+' : ''}${variacion.toFixed(2)} kg</td>
                    <td style="text-align:center;">${tendencia}</td>
                </tr>
            `;
        });
    }
    
    // Crear gráfico de evolución
    crearGraficoEvolucion(
        productos.map(p => p.nombre), 
        productos.map(p => produccionMes1[p.nombre] || 0),
        productos.map(p => produccionMes2[p.nombre] || 0),
        `${nombresMeses[mes1-1]} ${anio1}`,
        `${nombresMeses[mes2-1]} ${anio2}`
    );
    
    // Crear gráfico de variación porcentual
    crearGraficoVariacion(
        productos.map(p => p.nombre),
        productos.map(p => {
            const prod1 = produccionMes1[p.nombre] || 0;
            const prod2 = produccionMes2[p.nombre] || 0;
            return prod1 > 0 ? ((prod2 - prod1) / prod1 * 100) : (prod2 > 0 ? 100 : 0);
        })
    );
    
    // Resumen comparativo adicional
    const resumenComparativo = document.getElementById('resumenComparativo');
    const mejoresProductos = [];
    const peoresProductos = [];
    
    productos.forEach(p => {
        const prod1 = produccionMes1[p.nombre] || 0;
        const prod2 = produccionMes2[p.nombre] || 0;
        const variacion = prod2 - prod1;
        if (variacion > 0) mejoresProductos.push({ nombre: p.nombre, variacion });
        if (variacion < 0) peoresProductos.push({ nombre: p.nombre, variacion });
    });
    
    mejoresProductos.sort((a, b) => b.variacion - a.variacion);
    peoresProductos.sort((a, b) => a.variacion - b.variacion);
    
    if (resumenComparativo) {
        resumenComparativo.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong><i class="fas fa-chart-line"></i> Análisis de Variación:</strong><br>
                <span style="font-size: 13px;">Producción ${variacionTotal >= 0 ? 'aumentó' : 'disminuyó'} un ${Math.abs(variacionTotal)}%</span>
            </div>
            ${mejoresProductos.length > 0 ? `
            <div style="margin-bottom: 15px;">
                <strong style="color: #27ae60;"><i class="fas fa-arrow-up"></i> Mayor crecimiento:</strong><br>
                <span style="font-size: 13px;">${mejoresProductos[0].nombre}: +${mejoresProductos[0].variacion.toFixed(2)} kg</span>
            </div>
            ` : ''}
            ${peoresProductos.length > 0 ? `
            <div style="margin-bottom: 15px;">
                <strong style="color: #e74c3c;"><i class="fas fa-arrow-down"></i> Mayor decrecimiento:</strong><br>
                <span style="font-size: 13px;">${peoresProductos[0].nombre}: ${peoresProductos[0].variacion.toFixed(2)} kg</span>
            </div>
            ` : ''}
            <div class="stats-mini" style="margin-top: 10px;">
                <div class="stats-mini-item">
                    <div class="label">Productos que crecieron</div>
                    <div class="value" style="color: #27ae60;">${mejoresProductos.length}</div>
                </div>
                <div class="stats-mini-item">
                    <div class="label">Productos que decrecieron</div>
                    <div class="value" style="color: #e74c3c;">${peoresProductos.length}</div>
                </div>
            </div>
        `;
    }
}

function crearGraficoEvolucion(labels, datosMes1, datosMes2, nombreMes1, nombreMes2) {
    const ctx = document.getElementById('evolucionChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    if (evolucionChart) evolucionChart.destroy();
    
    evolucionChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: nombreMes1,
                    data: datosMes1,
                    backgroundColor: 'rgba(179, 57, 57, 0.7)',
                    borderColor: '#b33939',
                    borderWidth: 1,
                    borderRadius: 6
                },
                {
                    label: nombreMes2,
                    data: datosMes2,
                    backgroundColor: 'rgba(133, 100, 4, 0.7)',
                    borderColor: '#856404',
                    borderWidth: 1,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw.toFixed(2) + ' kg';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Kilogramos (kg)', font: { size: 11 } }
                },
                x: { ticks: { maxRotation: 45, minRotation: 45, font: { size: 10 } } }
            }
        }
    });
}

function crearGraficoVariacion(labels, variaciones) {
    const ctx = document.getElementById('variacionChart');
    if (!ctx) return;
    
    const context = ctx.getContext('2d');
    
    if (variacionChart) variacionChart.destroy();
    
    // Colores: positivo = ocre (#856404), negativo = rojo corporativo (#b33939)
    const colores = variaciones.map(v => v >= 0 ? 'rgba(133, 100, 4, 0.7)' : 'rgba(179, 57, 57, 0.7)');
    const bordes = variaciones.map(v => v >= 0 ? '#856404' : '#b33939');
    
    variacionChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Variación Porcentual (%)',
                data: variaciones,
                backgroundColor: colores,
                borderColor: bordes,
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = context.raw;
                            return `Variación: ${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: { display: true, text: 'Variación (%)', font: { size: 11 } },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Llamar a cargarMesesDisponibles al inicio
cargarMesesDisponibles();
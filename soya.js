
let editandoProduccionIndex = null;
let editandoDespachoIndex = null;
let mesActualSoya = new Date().getMonth() + 1;
let anioActualSoya = new Date().getFullYear();

window.editarProduccion = editarProduccion;
window.editarDespacho = editarDespacho;
window.eliminarSoya = eliminarSoya;
window.expandirTablaSoya = expandirTablaSoya;
window.cerrarModalTablaSoya = cerrarModalTablaSoya;
window.buscarPorMesAnioSoya = buscarPorMesAnioSoya;
window.cerrarModalBusquedaSoya = cerrarModalBusquedaSoya;


document.addEventListener('DOMContentLoaded', () => {
    inicializarModales();
    inicializarMenuHamburguesa();
    inicializarBusqueda();
    inicializarSelectAnios();
    inicializarBotonesGuardar();
    inicializarEventosInput();
    inyectarEstilosNotificacion();
    
    // Cargar tablas con período actual
    cargarTablasSoya(mesActualSoya, anioActualSoya);

    // Cerrar modales con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalProduccion();
            cerrarModalDespacho();
            cerrarModalBusquedaSoya();
            cerrarModalTablaSoya();
        }
    });
});

// ==================== CONTROL DE MODALES ====================
function inicializarModales() {
    // Botones para abrir formularios
    const btnAbrir = document.getElementById('btn-abrir-form-soya');
    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => {
            // Por defecto abrimos producción
            cambiarFormularioSoya('produccion');
            abrirModalProduccion();
        });
    }

    // Botones para cerrar
    const btnCerrarProd = document.getElementById('btn-cerrar-produccion');
    const btnCerrarDesp = document.getElementById('btn-cerrar-despacho');
    const overlay = document.getElementById('form-overlay-soya');

    if (btnCerrarProd) btnCerrarProd.addEventListener('click', cerrarModalProduccion);
    if (btnCerrarDesp) btnCerrarDesp.addEventListener('click', cerrarModalDespacho);
    if (overlay) {
        overlay.addEventListener('click', () => {
            cerrarModalProduccion();
            cerrarModalDespacho();
        });
    }
}

function abrirModalProduccion() {
    const overlay = document.getElementById('form-overlay-soya');
    const modal = document.getElementById('form-contenedor-produccion');
    
    if (overlay && modal) {
        overlay.classList.add('activo');
        modal.classList.add('activo');
        
        if (editandoProduccionIndex === null) {
            limpiarFormularioProduccion();
        }
    }
}

function cerrarModalProduccion() {
    const overlay = document.getElementById('form-overlay-soya');
    const modal = document.getElementById('form-contenedor-produccion');
    
    if (overlay) overlay.classList.remove('activo');
    if (modal) modal.classList.remove('activo');
    
    if (editandoProduccionIndex !== null) {
        editandoProduccionIndex = null;
        const btnGuardar = document.getElementById('btn-guardar-produccion');
        if (btnGuardar) {
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> GUARDAR REGISTRO';
        }
    }
}

function abrirModalDespacho() {
    const overlay = document.getElementById('form-overlay-soya');
    const modal = document.getElementById('form-contenedor-despacho');
    
    if (overlay && modal) {
        overlay.classList.add('activo');
        modal.classList.add('activo');
        
        if (editandoDespachoIndex === null) {
            limpiarFormularioDespacho();
        }
    }
}

function cerrarModalDespacho() {
    const overlay = document.getElementById('form-overlay-soya');
    const modal = document.getElementById('form-contenedor-despacho');
    
    if (overlay) overlay.classList.remove('activo');
    if (modal) modal.classList.remove('activo');
    
    if (editandoDespachoIndex !== null) {
        editandoDespachoIndex = null;
        const btnGuardar = document.getElementById('btn-guardar-despacho');
        if (btnGuardar) {
            btnGuardar.innerHTML = '<i class="fas fa-shipping-fast"></i> REGISTRAR ENTREGA';
        }
    }
}

// ==================== MENÚ HAMBURGUESA ====================
function inicializarMenuHamburguesa() {
    const menuHamburguesa = document.getElementById('menuHamburguesa');
    const menuDesplegable = document.getElementById('menuDesplegable');
    const menuItems = document.querySelectorAll('.menu-item');

    if (menuHamburguesa && menuDesplegable) {
        menuHamburguesa.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDesplegable.classList.toggle('mostrar');
        });

        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const seccionId = item.getAttribute('data-seccion');
                
                cambiarFormularioSoya(seccionId);
                
                if (seccionId === 'produccion') {
                    abrirModalProduccion();
                } else if (seccionId === 'despacho') {
                    abrirModalDespacho();
                }

                menuItems.forEach(mi => mi.classList.remove('activo'));
                item.classList.add('activo');
                menuDesplegable.classList.remove('mostrar');
            });
        });
    }

    document.addEventListener('click', (e) => {
        if (menuDesplegable && menuHamburguesa) {
            if (!menuDesplegable.contains(e.target) && !menuHamburguesa.contains(e.target)) {
                menuDesplegable.classList.remove('mostrar');
            }
        }
    });
}

function cambiarFormularioSoya(seccionId) {
    const tituloPanel = document.querySelector('.page-info h2');
    const subtituloPanel = document.querySelector('.page-info span');
    
    if (seccionId === 'produccion') {
        tituloPanel.textContent = 'Panel de Control de Soya';
        subtituloPanel.textContent = 'Registro de Producción';
    } else if (seccionId === 'despacho') {
        tituloPanel.textContent = 'Panel de Control de Soya';
        subtituloPanel.textContent = 'Entrega a Despacho';
    }
}

// ==================== FUNCIONES DE BÚSQUEDA ====================
function inicializarBusqueda() {
    const lupa = document.getElementById('lupa-busqueda');
    if (lupa) {
        lupa.addEventListener('click', abrirModalBusquedaSoya);
    }
}

function inicializarSelectAnios() {
    const selectAnio = document.getElementById('buscar-anio-soya');
    if (!selectAnio) return;
    
    const anioActual = new Date().getFullYear();
    selectAnio.innerHTML = '';
    
    for (let i = anioActual - 2; i <= anioActual + 1; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (i === anioActual) option.selected = true;
        selectAnio.appendChild(option);
    }
}

function abrirModalBusquedaSoya() {
    const modal = document.getElementById('modal-busqueda-soya');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const hoy = new Date();
        document.getElementById('buscar-mes-soya').value = hoy.getMonth() + 1;
        document.getElementById('buscar-anio-soya').value = hoy.getFullYear();
    }
}

function cerrarModalBusquedaSoya() {
    const modal = document.getElementById('modal-busqueda-soya');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function buscarPorMesAnioSoya() {
    const mes = parseInt(document.getElementById('buscar-mes-soya').value);
    const anio = parseInt(document.getElementById('buscar-anio-soya').value);
    
    mesActualSoya = mes;
    anioActualSoya = anio;
    
    cargarTablasSoya(mes, anio);
    cerrarModalBusquedaSoya();
    mostrarNotificacion(`Mostrando datos de ${getNombreMes(mes)} ${anio}`, 'success');
}

function getNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
}

// ==================== FUNCIONES PARA EXPANDIR TABLAS ====================
function expandirTablaSoya(idTabla) {
    const tabla = document.getElementById(idTabla);
    const modal = document.getElementById('modal-tabla-soya');
    const contenido = document.getElementById('contenido-modal-tabla-soya');

    if (!tabla || !modal || !contenido) return;

    const clon = tabla.cloneNode(true);
    contenido.innerHTML = "";
    contenido.appendChild(clon);

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModalTablaSoya() {
    const modal = document.getElementById('modal-tabla-soya');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ==================== FUNCIONES DE CÁLCULO ====================
function calcularProduccion() {
    const p1 = parseFloat(document.getElementById('soya-primera').value) || 0;
    const dh = parseFloat(document.getElementById('soya-desecho-h').value) || 0;
    const ds = parseFloat(document.getElementById('soya-desecho-s').value) || 0;
    document.getElementById('soya-total').value = (p1 + dh + ds).toFixed(2);
    document.getElementById('soya-total-sin').value = p1.toFixed(2);
}

function calcularDespacho() {
    const t = (parseFloat(document.getElementById('soya-125g').value) || 0) * 0.125 +
              (parseFloat(document.getElementById('soya-250g').value) || 0) * 0.250 +
              (parseFloat(document.getElementById('soya-8kg').value) || 0) * 8 +
              (parseFloat(document.getElementById('soya-12kg').value) || 0) * 12;
    document.getElementById('soya-kg-despacho').value = t.toFixed(2);
}

// ==================== VALIDACIONES ====================
function validarNumeroPositivo(input) {
    if (input.value < 0) {
        input.value = 0;
        mostrarNotificacion("No se permiten números negativos", "error");
    }
}

function validarCampoNumerico(input) {
    input.addEventListener('keydown', (e) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    });
    
    input.addEventListener('input', function() {
        validarNumeroPositivo(this);
    });
    
    input.addEventListener('blur', function() {
        if (this.value === '' || this.value === null) {
            this.value = 0;
        }
    });
}

function inicializarEventosInput() {
    // Validar campos numéricos
    const camposNumericos = document.querySelectorAll('.campo-numerico');
    camposNumericos.forEach(input => validarCampoNumerico(input));
    
    // Eventos para cálculos automáticos
    document.querySelectorAll('.calculo-produccion').forEach(input => {
        input.addEventListener('input', calcularProduccion);
    });
    
    document.querySelectorAll('.calculo-despacho').forEach(input => {
        input.addEventListener('input', calcularDespacho);
    });
}

// ==================== FUNCIONES DE EDICIÓN ====================
function editarProduccion(id) {
    const prod = JSON.parse(localStorage.getItem('SoyaProduccion')) || [];
    const index = prod.findIndex(item => item.id === id);
    const item = prod[index];
    
    if (!item) return;
    
    editandoProduccionIndex = index;
    
    document.getElementById('soya-fecha').value = item.fecha || '';
    document.getElementById('soya-lote').value = item.lote || '';
    document.getElementById('soya-medidas').value = item.medidas || 0;
    document.getElementById('soya-desgranada').value = item.desgranada || 0;
    document.getElementById('soya-azufre').value = item.azufre || 0;
    document.getElementById('soya-humedad').value = item.humedad || 0;
    document.getElementById('soya-primera').value = item.primera || 0;
    document.getElementById('soya-desecho-h').value = item.desechoH || 0;
    document.getElementById('soya-desecho-s').value = item.desechoS || 0;
    document.getElementById('soya-proveedor').value = item.proveedor || '';
    
    calcularProduccion();
    
    const btnGuardar = document.getElementById('btn-guardar-produccion');
    btnGuardar.innerHTML = '<i class="fas fa-sync"></i> ACTUALIZAR REGISTRO';
    
    cambiarFormularioSoya('produccion');
    abrirModalProduccion();
}

function editarDespacho(id) {
    const desp = JSON.parse(localStorage.getItem('SoyaDespacho')) || [];
    const index = desp.findIndex(item => item.id === id);
    const item = desp[index];
    
    if (!item) return;
    
    editandoDespachoIndex = index;
    
    document.getElementById('soya-fecha-despacho').value = item.fecha || '';
    document.getElementById('despacho-lote').value = item.lote || '';
    document.getElementById('soya-125g').value = item.u125 || 0;
    document.getElementById('soya-250g').value = item.u250 || 0;
    document.getElementById('soya-8kg').value = item.u8k || 0;
    document.getElementById('soya-12kg').value = item.u12k || 0;
    
    calcularDespacho();
    
    const btnGuardar = document.getElementById('btn-guardar-despacho');
    btnGuardar.innerHTML = '<i class="fas fa-sync"></i> ACTUALIZAR REGISTRO';
    
    cambiarFormularioSoya('despacho');
    abrirModalDespacho();
}

// ==================== GUARDAR REGISTROS ====================
function inicializarBotonesGuardar() {
    const btnProd = document.getElementById('btn-guardar-produccion');
    const btnDesp = document.getElementById('btn-guardar-despacho');
    
    if (btnProd) btnProd.addEventListener('click', guardarProduccion);
    if (btnDesp) btnDesp.addEventListener('click', guardarDespacho);
}

function guardarProduccion() {
    const fecha = document.getElementById('soya-fecha').value;
    const lote = document.getElementById('soya-lote').value.trim();
    
    if (!fecha || !lote) {
        mostrarNotificacion('⚠️ Complete la Fecha y el Lote', 'error');
        return;
    }
    
    const [anio, mes, dia] = fecha.split('-').map(Number);
    
    const registro = {
        id: editandoProduccionIndex !== null ? 
            JSON.parse(localStorage.getItem('SoyaProduccion'))[editandoProduccionIndex].id : 
            Date.now(),
        fecha: fecha,
        dia: dia,
        mes: mes,
        anio: anio,
        lote: lote,
        medidas: Math.max(0, parseFloat(document.getElementById('soya-medidas').value) || 0),
        desgranada: Math.max(0, parseFloat(document.getElementById('soya-desgranada').value) || 0),
        azufre: Math.max(0, parseFloat(document.getElementById('soya-azufre').value) || 0),
        humedad: Math.max(0, parseFloat(document.getElementById('soya-humedad').value) || 0),
        primera: Math.max(0, parseFloat(document.getElementById('soya-primera').value) || 0),
        desechoH: Math.max(0, parseFloat(document.getElementById('soya-desecho-h').value) || 0),
        desechoS: Math.max(0, parseFloat(document.getElementById('soya-desecho-s').value) || 0),
        total: parseFloat(document.getElementById('soya-total').value) || 0,
        totalSin: parseFloat(document.getElementById('soya-total-sin').value) || 0,
        proveedor: document.getElementById('soya-proveedor').value.trim() || "N/A"
    };

    let listaProd = JSON.parse(localStorage.getItem('SoyaProduccion')) || [];

    if (editandoProduccionIndex !== null) {
        listaProd[editandoProduccionIndex] = registro;
        editandoProduccionIndex = null;
        mostrarNotificacion('✅ Producción actualizada con éxito', 'success');
        
        const btnGuardar = document.getElementById('btn-guardar-produccion');
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> GUARDAR REGISTRO';
    } else {
        listaProd.push(registro);
        mostrarNotificacion('✅ Producción guardada con éxito', 'success');
    }

    localStorage.setItem('SoyaProduccion', JSON.stringify(listaProd));
    limpiarFormularioProduccion();
    cargarTablasSoya(mesActualSoya, anioActualSoya);
    cerrarModalProduccion();
}

function guardarDespacho() {
    const fecha = document.getElementById('soya-fecha-despacho').value;
    const lote = document.getElementById('despacho-lote').value.trim();
    
    if (!fecha || !lote) {
        mostrarNotificacion('⚠️ Complete la Fecha y el Lote', 'error');
        return;
    }
    
    const [anio, mes, dia] = fecha.split('-').map(Number);
    
    const registro = {
        id: editandoDespachoIndex !== null ? 
            JSON.parse(localStorage.getItem('SoyaDespacho'))[editandoDespachoIndex].id : 
            Date.now(),
        fecha: fecha,
        dia: dia,
        mes: mes,
        anio: anio,
        lote: lote,
        u125: Math.max(0, parseInt(document.getElementById('soya-125g').value) || 0),
        u250: Math.max(0, parseInt(document.getElementById('soya-250g').value) || 0),
        u8k: Math.max(0, parseInt(document.getElementById('soya-8kg').value) || 0),
        u12k: Math.max(0, parseInt(document.getElementById('soya-12kg').value) || 0),
        totalKg: parseFloat(document.getElementById('soya-kg-despacho').value) || 0
    };

    let listaDesp = JSON.parse(localStorage.getItem('SoyaDespacho')) || [];

    if (editandoDespachoIndex !== null) {
        listaDesp[editandoDespachoIndex] = registro;
        editandoDespachoIndex = null;
        mostrarNotificacion('✅ Despacho actualizado con éxito', 'success');
        
        const btnGuardar = document.getElementById('btn-guardar-despacho');
        btnGuardar.innerHTML = '<i class="fas fa-shipping-fast"></i> REGISTRAR ENTREGA';
    } else {
        listaDesp.push(registro);
        mostrarNotificacion('✅ Despacho registrado correctamente', 'success');
    }

    localStorage.setItem('SoyaDespacho', JSON.stringify(listaDesp));
    limpiarFormularioDespacho();
    cargarTablasSoya(mesActualSoya, anioActualSoya);
    cerrarModalDespacho();
}

// ==================== CARGAR TABLAS ====================
function cargarTablasSoya(mes, anio) {
    const prod = JSON.parse(localStorage.getItem('SoyaProduccion')) || [];
    const desp = JSON.parse(localStorage.getItem('SoyaDespacho')) || [];

    // Filtrar producción por mes y año
    const prodFiltrada = prod.filter(item => item.mes === mes && item.anio === anio);
    
    // Filtrar despacho por mes y año
    const despFiltrada = desp.filter(item => item.mes === mes && item.anio === anio);

    // ===== TABLA DE PRODUCCIÓN =====
    const tablaProd = document.getElementById('lista-soya-produccion');
    if (tablaProd) {
        if (prodFiltrada.length === 0) {
            tablaProd.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 30px; color: #999;">
                        <i class="fas fa-box-open" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                        No hay registros de producción para ${getNombreMes(mes)} ${anio}
                    </td>
                </tr>
            `;
        } else {
            tablaProd.innerHTML = prodFiltrada.map(item => {
                const fechaFormateada = item.fecha.split('-').reverse().join('/');
                return `
                <tr>
                    <td><b>${fechaFormateada}</b><br>Lote: ${item.lote}</td>
                    <td>
                        Medidas: ${item.medidas}<br>
                        Desgranada: ${item.desgranada}kg<br>
                        Azufre: ${item.azufre}kg<br>
                        Humedad: ${item.humedad}%
                    </td>
                    <td>
                        <b>1ra: ${item.primera}kg</b><br>
                        Total: ${item.total}kg
                    </td>
                    <td>
                        Húmedo: ${item.desechoH}kg<br>
                        Seco: ${item.desechoS}kg
                    </td>
                    <td>${item.proveedor}</td>
                    <td>
                        <div style="display: flex; gap: 5px; justify-content: center;">
                            <button onclick="editarProduccion(${item.id})" 
                                    style="color:#3498db; border:none; background:none; cursor:pointer;"
                                    title="Editar registro">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="eliminarSoya('SoyaProduccion', ${item.id})" 
                                    style="color:red; border:none; background:none; cursor:pointer;"
                                    title="Eliminar registro">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }
    }

    // ===== TABLA DE DESPACHO =====
    const tablaDesp = document.getElementById('lista-soya-despacho');
    if (tablaDesp) {
        if (despFiltrada.length === 0) {
            tablaDesp.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 30px; color: #999;">
                        <i class="fas fa-truck" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                        No hay registros de despacho para ${getNombreMes(mes)} ${anio}
                    </td>
                </tr>
            `;
        } else {
            tablaDesp.innerHTML = despFiltrada.map(item => {
                const fechaFormateada = item.fecha.split('-').reverse().join('/');
                return `
                <tr>
                    <td>
                        <b>${item.lote}</b><br>
                        <small>${fechaFormateada}</small>
                    </td>
                    <td>
                        125g: ${item.u125} | 250g: ${item.u250}<br>
                        8Kg: ${item.u8k} | 12Kg: ${item.u12k}
                    </td>
                    <td><b>${item.totalKg} Kg</b></td>
                    <td>
                        <div style="display: flex; gap: 5px; justify-content: center;">
                            <button onclick="editarDespacho(${item.id})" 
                                    style="color:#3498db; border:none; background:none; cursor:pointer;"
                                    title="Editar registro">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="eliminarSoya('SoyaDespacho', ${item.id})" 
                                    style="color:red; border:none; background:none; cursor:pointer;"
                                    title="Eliminar registro">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }
    }
}

// ==================== FUNCIONES AUXILIARES ====================
function eliminarSoya(key, id) {
    if(confirm("¿Está seguro de eliminar este registro?")) {
        let items = JSON.parse(localStorage.getItem(key)) || [];
        items = items.filter(item => item.id != id);
        localStorage.setItem(key, JSON.stringify(items));
        cargarTablasSoya(mesActualSoya, anioActualSoya);
        mostrarNotificacion("Registro eliminado correctamente", "success");
    }
}

function limpiarFormularioProduccion() {
    document.querySelectorAll('#form-contenedor-produccion input').forEach(i => {
        if (i.type !== 'button' && i.type !== 'submit') {
            i.value = '';
        }
    });
    calcularProduccion();
}

function limpiarFormularioDespacho() {
    document.querySelectorAll('#form-contenedor-despacho input').forEach(i => {
        if (i.type !== 'button' && i.type !== 'submit') {
            i.value = '';
        }
    });
    calcularDespacho();
}

// ==================== NOTIFICACIONES ====================
function mostrarNotificacion(mensaje, tipo) {
    const notificacionesPrevias = document.querySelectorAll('.notificacion-venepan');
    notificacionesPrevias.forEach(n => n.remove());

    const notificacion = document.createElement('div');
    notificacion.className = `notificacion-venepan ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.opacity = '0';
        setTimeout(() => notificacion.remove(), 500);
    }, 3000);
}

function inyectarEstilosNotificacion() {
    if (document.getElementById('estilos-soya')) return;
    
    const style = document.createElement('style');
    style.id = 'estilos-soya';
    style.textContent = `
        .notificacion-venepan {
            position: fixed;
            bottom: 30px;
            right: 30px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            transition: opacity 0.5s;
        }
        .notificacion-venepan.success { background: #27ae60; }
        .notificacion-venepan.error { background: #e74c3c; }
        
        .btn-delete {
            color: red;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 1.1rem;
        }
        .btn-delete:hover {
            color: #c0392b;
            transform: scale(1.1);
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .btn-expand:hover {
            background: #8e2d2d !important;
            transform: scale(1.05);
            transition: all 0.3s;
        }
    `;
    document.head.appendChild(style);
}



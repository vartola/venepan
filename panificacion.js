const productos = [
    { id: 'integral', nombre: 'PAN INTEGRAL' },
    { id: 'ajonjoli', nombre: 'PAN C/ AJONJOLÍ' },
    { id: 'blanco', nombre: 'PAN BLANCO' },
    { id: 'miel', nombre: 'PAN MIEL' },
    { id: 'hamburguesa', nombre: 'PAN HAMBURGUESA' },
    { id: 'perrocaliente', nombre: 'PAN PERRO CALIENTE' },
    { id: 'tostadas', nombre: 'TOSTADAS' }
];

// ===== VARIABLES GLOBALES =====
let editandoRegistro = null; // Para edición
let mesActual = new Date().getMonth() + 1;
let anioActual = new Date().getFullYear();

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const btnAbrir = document.getElementById('btn-abrir-form-pan');
    const btnCerrar = document.getElementById('btn-cerrar-form-pan');
    const formOverlay = document.getElementById('form-overlay-pan');
    const formContenedor = document.getElementById('form-contenedor-pan');
    const menuHamburguesa = document.getElementById('menuHamburguesa');
    const menuDesplegable = document.getElementById('menuDesplegable');
    const lupa = document.querySelector('.fa-search');
    
    // ===== CONTROL DEL MODAL =====
    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => {
            abrirModalFormulario();
        });
    }
    
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarModalFormulario);
    }
    
    if (formOverlay) {
        formOverlay.addEventListener('click', cerrarModalFormulario);
    }
    
    // ===== MENÚ HAMBURGUESA =====
    if (menuHamburguesa && menuDesplegable) {
        menuHamburguesa.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDesplegable.classList.toggle('mostrar');
        });
        
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const seccionId = item.getAttribute('data-seccion');
                
                if (seccionId === 'produccion') {
                    abrirModalFormulario();
                }
                
                menuDesplegable.classList.remove('mostrar');
            });
        });
    }
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (menuDesplegable && menuHamburguesa) {
            if (!menuDesplegable.contains(e.target) && !menuHamburguesa.contains(e.target)) {
                menuDesplegable.classList.remove('mostrar');
            }
        }
    });
    
    // ===== CÁLCULO AUTOMÁTICO =====
    const inputMedida = document.getElementById('medida');
    const inputPaquetes = document.getElementById('paquetes');
    const inputUnidades = document.getElementById('unidades');
    
    if (inputMedida) inputMedida.addEventListener('input', calcularRendimientoAutomatico);
    if (inputPaquetes) inputPaquetes.addEventListener('input', calcularRendimientoAutomatico);
    if (inputUnidades) inputUnidades.addEventListener('input', calcularRendimientoAutomatico);
    
    // ===== VALIDACIÓN DE CAMPOS NUMÉRICOS =====
    const camposNumericos = ['medida', 'paquetes', 'unidades', 'bd'];
    camposNumericos.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', function() {
                validarNumeroPositivo(this);
                calcularRendimientoAutomatico();
            });
            
            input.addEventListener('keydown', function(e) {
                if (e.key === '-' || e.key === 'e' || e.key === 'E') {
                    e.preventDefault();
                }
            });
        }
    });
    
    // ===== BOTÓN GUARDAR =====
    const btnGuardar = document.getElementById('btn-guardar-pan');
    if (btnGuardar) btnGuardar.addEventListener('click', guardarDatos);
    
    // ===== LUPA (BÚSQUEDA) =====
    if (lupa) {
        lupa.addEventListener('click', abrirModalBusqueda);
    }
    
    // ===== CERRAR CON TECLA ESC =====
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (formContenedor?.classList.contains('activo')) {
                cerrarModalFormulario();
            }
            const modalBusqueda = document.getElementById('modal-busqueda-pan');
            if (modalBusqueda && modalBusqueda.style.display === 'block') {
                cerrarModalBusqueda();
            }
            const modalTabla = document.getElementById('modal-tabla');
            if (modalTabla && modalTabla.style.display === 'block') {
                cerrarModalTabla();
            }
        }
    });
    
    // ===== CARGAR TABLAS =====
    llenarSelectAnios();
    actualizarTablas();
});

// ===== FUNCIONES DEL MODAL =====
function abrirModalFormulario() {
    const formOverlay = document.getElementById('form-overlay-pan');
    const formContenedor = document.getElementById('form-contenedor-pan');
    const btnAbrir = document.getElementById('btn-abrir-form-pan');
    
    if (formOverlay && formContenedor) {
        formOverlay.classList.add('activo');
        formContenedor.classList.add('activo');
        if (btnAbrir) btnAbrir.classList.add('activo');
        
        if (editandoRegistro === null) {
            limpiarFormulario();
        }
    }
}

function cerrarModalFormulario() {
    const formOverlay = document.getElementById('form-overlay-pan');
    const formContenedor = document.getElementById('form-contenedor-pan');
    const btnAbrir = document.getElementById('btn-abrir-form-pan');
    
    if (formOverlay && formContenedor) {
        formOverlay.classList.remove('activo');
        formContenedor.classList.remove('activo');
        if (btnAbrir) btnAbrir.classList.remove('activo');
        
        // Resetear modo edición al cerrar
        if (editandoRegistro !== null) {
            editandoRegistro = null;
            const btnGuardar = document.getElementById('btn-guardar-pan');
            if (btnGuardar) {
                btnGuardar.innerHTML = '<i class="fas fa-save"></i> GUARDAR REGISTRO';
            }
        }
    }
}

// ===== FUNCIÓN DE CÁLCULO =====
function calcularRendimientoAutomatico() {
    const medida = Math.max(0, parseFloat(document.getElementById('medida').value) || 0);
    const paquetes = Math.max(0, parseFloat(document.getElementById('paquetes').value) || 0);
    const unidades = Math.max(0, parseFloat(document.getElementById('unidades').value) || 0);
    const campoRendimiento = document.getElementById('rendimiento');

    if (medida > 0) {
        // Fórmula: (paquetes + unidades/8) / medida
        const resultado = (paquetes + (unidades / 8)) / medida;
        campoRendimiento.value = Math.round(resultado);
    } else {
        campoRendimiento.value = "0";
    }
}

// ===== VALIDAR CAMPOS EN TIEMPO REAL =====
function validarNumeroPositivo(input) {
    if (input.value < 0) {
        input.value = 0;
        mostrarNotificacion("No se permiten números negativos", "error");
    }
}

// ===== GUARDAR DATOS (CON EDICIÓN) =====
function guardarDatos() {
    const panId = document.getElementById('tipo-pan').value;
    const fechaSeleccionada = document.getElementById('fecha-manual').value;
    const medida = Math.max(0, parseFloat(document.getElementById('medida').value) || 0);
    const paquetes = Math.max(0, parseFloat(document.getElementById('paquetes').value) || 0);
    const unidades = Math.max(0, parseFloat(document.getElementById('unidades').value) || 0);
    const bd = Math.max(0, parseFloat(document.getElementById('bd').value) || 0);
    const rendimiento = parseInt(document.getElementById('rendimiento').value) || 0;

    // Validaciones
    if (!panId || !fechaSeleccionada || medida <= 0) {
        mostrarNotificacion("Faltan datos: Seleccione Pan, Fecha y Medida", "error");
        return;
    }

    const partesFecha = fechaSeleccionada.split('-');
    const anio = parseInt(partesFecha[0]);
    const mes = parseInt(partesFecha[1]);
    const dia = parseInt(partesFecha[2]);

    const pan = productos.find(p => p.id === panId);

    const registro = {
        panId: pan.id,
        panNombre: pan.nombre,
        dia: dia,
        mes: mes,
        anio: anio,
        medida: medida,
        paquetes: paquetes,
        unidades: unidades,
        bd: bd,
        rendimiento: rendimiento
    };

    let datos = JSON.parse(localStorage.getItem('datos_panaderia')) || [];

    // SI ESTAMOS EDITANDO
    if (editandoRegistro) {
        // Eliminar el registro antiguo
        datos = datos.filter(r => !(
            r.panId === editandoRegistro.panId &&
            r.dia === editandoRegistro.dia &&
            r.mes === editandoRegistro.mes &&
            r.anio === editandoRegistro.anio
        ));
        
        // Agregar el registro actualizado
        datos.push(registro);
        
        // Resetear variable de edición
        editandoRegistro = null;
        
        // Restaurar botón
        const btnGuardar = document.getElementById('btn-guardar-pan');
        if (btnGuardar) {
            btnGuardar.innerHTML = '<i class="fas fa-save"></i> GUARDAR REGISTRO';
        }
        
        mostrarNotificacion("Registro actualizado correctamente", "success");
    } 
    // SI ES UN REGISTRO NUEVO
    else {
        // Evitar duplicados del mismo día
        datos = datos.filter(r => !(
            r.panId === registro.panId &&
            r.dia === registro.dia &&
            r.mes === registro.mes &&
            r.anio === registro.anio
        ));

        datos.push(registro);
        mostrarNotificacion("Guardado en la fecha: " + dia + "/" + mes, "success");
    }

    localStorage.setItem('datos_panaderia', JSON.stringify(datos));

    limpiarFormulario();
    actualizarTablas();
    cerrarModalFormulario();
}

// ===== LIMPIAR FORMULARIO =====
function limpiarFormulario() {
    document.querySelectorAll('#form-contenedor-pan input').forEach(i => i.value = '');
    const select = document.getElementById('tipo-pan');
    if (select) select.value = '';
    
    // Resetear variable de edición
    editandoRegistro = null;
    
    // Restaurar botón
    const btnGuardar = document.getElementById('btn-guardar-pan');
    if (btnGuardar) {
        btnGuardar.innerHTML = '<i class="fas fa-save"></i> GUARDAR REGISTRO';
    }
}


function editarRegistro(panId, dia, mes, anio) {
    // Buscar el registro en localStorage
    const datos = JSON.parse(localStorage.getItem('datos_panaderia')) || [];
    const registro = datos.find(r => 
        r.panId === panId && 
        r.dia === dia && 
        r.mes === mes && 
        r.anio === anio
    );
    
    if (!registro) {
        mostrarNotificacion("Error: No se encontró el registro", "error");
        return;
    }
    
    // Guardar referencia del registro que estamos editando
    editandoRegistro = { panId, dia, mes, anio };
    
    // Llenar el formulario con los datos del registro
    document.getElementById('tipo-pan').value = registro.panId;
    
    // Formatear fecha YYYY-MM-DD
    const fechaFormateada = `${registro.anio}-${String(registro.mes).padStart(2, '0')}-${String(registro.dia).padStart(2, '0')}`;
    document.getElementById('fecha-manual').value = fechaFormateada;
    
    document.getElementById('medida').value = registro.medida;
    document.getElementById('paquetes').value = registro.paquetes;
    document.getElementById('unidades').value = registro.unidades;
    document.getElementById('bd').value = registro.bd;
    
    // Recalcular rendimiento
    calcularRendimientoAutomatico();
    
    // Cambiar el texto del botón guardar
    const btnGuardar = document.getElementById('btn-guardar-pan');
    btnGuardar.innerHTML = '<i class="fas fa-sync"></i> ACTUALIZAR REGISTRO';
    
    // Abrir el modal
    abrirModalFormulario();
    
    mostrarNotificacion("Editando registro del día " + dia, "success");
}


function eliminarRegistro(panId, dia, mes, anio) {
    if (!confirm("¿Eliminar registro?")) return;

    let datos = JSON.parse(localStorage.getItem('datos_panaderia')) || [];
    datos = datos.filter(r => !(
        r.panId === panId &&
        r.dia === dia &&
        r.mes === mes &&
        r.anio === anio
    ));

    localStorage.setItem('datos_panaderia', JSON.stringify(datos));
    actualizarTablasPorPeriodo(mesActual, anioActual);
    mostrarNotificacion("Registro eliminado", "success");
}

function eliminarRegistroPeriodo(id, d, m, a) {
    eliminarRegistro(id, d, m, a);
}


function actualizarTablas() {
    actualizarTablasPorPeriodo(mesActual, anioActual);
}

function actualizarTablasPorPeriodo(mes, anio) {
    const contenedor = document.getElementById('tablas-abajo');
    if (!contenedor) return;

    contenedor.innerHTML = "";
    const datos = JSON.parse(localStorage.getItem('datos_panaderia')) || [];

    let hayRegistros = false;

    productos.forEach(pan => {
        const registrosProducto = datos.filter(r =>
            r.panId === pan.id &&
            r.mes === mes &&
            r.anio === anio
        );

        if (registrosProducto.length === 0) return;

        hayRegistros = true;
        registrosProducto.sort((a, b) => a.dia - b.dia);

        let html = `
        <div class="tabla-producto card" id="tabla-${pan.id}" style="background:#fffbe6;margin-bottom:20px;border-radius:6px;border:1px solid #ddd">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:#fdf5d0">
                <h3 style="color:#856404">${pan.nombre} – ${getNombreMes(mes)} ${anio}</h3>
                <button class="btn-expand" onclick="expandirTabla('tabla-${pan.id}')" 
                    style="background:#c0392b;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer">
                    ⛶
                </button>
            </div>
            <div style="overflow-x:auto">
                <table style="width:100%;border-collapse:collapse;font-size:13px">
                    <thead style="background:#fdf5d0">
                        <tr>
                            <th>Día</th>
                            <th>Medida</th>
                            <th>Paq.</th>
                            <th>Unid.</th>
                            <th>BD</th>
                            <th>Rendimiento</th>
                            <th>Acc.</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let totalMedida = 0;
        let totalPaquetes = 0;
        let totalUnidades = 0;
        let totalBD = 0;
        let totalRendimiento = 0;

        registrosProducto.forEach(r => {
            totalMedida += r.medida;
            totalPaquetes += r.paquetes;
            totalUnidades += r.unidades;
            totalBD += r.bd;
            totalRendimiento += r.rendimiento;

            html += `
            <tr>
                <td><strong>${r.dia}</strong></td>
                <td>${r.medida}</td>
                <td>${r.paquetes}</td>
                <td>${r.unidades}</td>
                <td style="color:red">${r.bd}</td>
                <td>${r.rendimiento}</td>
                <td>
                    <div style="display: flex; gap: 5px; justify-content: center;">
                        <button onclick="editarRegistro('${pan.id}', ${r.dia}, ${mes}, ${anio})" 
                            style="border:none;background:none;cursor:pointer;color:#3498db;"
                            title="Editar registro">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="eliminarRegistro('${pan.id}',${r.dia},${mes},${anio})" 
                            style="border:none;background:none;cursor:pointer;color:#e74c3c;"
                            title="Eliminar registro">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
            `;
        });

        const promedioRend = (totalRendimiento / registrosProducto.length).toFixed(2);

        html += `
                    <tr style="font-weight:bold;background:#f0f0f0">
                        <td>TOTAL</td>
                        <td>${totalMedida}</td>
                        <td>${totalPaquetes}</td>
                        <td>${totalUnidades}</td>
                        <td style="color:red">${totalBD}</td>
                        <td>${promedioRend}</td>
                        <td></td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </div>
        `;

        contenedor.innerHTML += html;
    });

    // Si no hay registros, mostrar mensaje
    if (!hayRegistros) {
        contenedor.innerHTML = `
            <div class="card" style="text-align: center; padding: 50px;">
                <i class="fas fa-calendar-times" style="font-size: 60px; color: #ccc; margin-bottom: 20px;"></i>
                <h3 style="color: #666;">No hay registros para ${getNombreMes(mes)} ${anio}</h3>
                <p style="color: #999; margin-top: 10px;">Selecciona otro período o agrega nuevos registros.</p>
            </div>
        `;
    }
}


function llenarSelectAnios() {
    const selectAnio = document.getElementById('buscar-anio');
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

function abrirModalBusqueda() {
    const modal = document.getElementById('modal-busqueda-pan');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const hoy = new Date();
        document.getElementById('buscar-mes').value = hoy.getMonth() + 1;
        document.getElementById('buscar-anio').value = hoy.getFullYear();
    }
}

function cerrarModalBusqueda() {
    const modal = document.getElementById('modal-busqueda-pan');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function buscarPorMesAnio() {
    const mes = parseInt(document.getElementById('buscar-mes').value);
    const anio = parseInt(document.getElementById('buscar-anio').value);
    
    mesActual = mes;
    anioActual = anio;
    
    actualizarTablasPorPeriodo(mes, anio);
    cerrarModalBusqueda();
    mostrarNotificacion(`Mostrando datos de ${getNombreMes(mes)} ${anio}`, 'success');
}

function getNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes - 1];
}

// ===== FUNCIONES DE TABLA EXPANDIDA =====
function expandirTabla(idTabla) {
    const tabla = document.getElementById(idTabla);
    const modal = document.getElementById('modal-tabla');
    const contenido = document.getElementById('contenido-modal-tabla');

    if (!tabla || !modal || !contenido) return;

    const clon = tabla.cloneNode(true);
    const btn = clon.querySelector('.btn-expand');
    if (btn) btn.remove();

    contenido.innerHTML = "";
    contenido.appendChild(clon);

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function cerrarModalTabla() {
    const modal = document.getElementById('modal-tabla');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(msg, tipo) {
    const previas = document.querySelectorAll('.notificacion-venepan');
    previas.forEach(n => n.remove());

    const div = document.createElement('div');
    div.className = 'notificacion-venepan';
    div.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 99999;
        background: ${tipo === 'success' ? '#27ae60' : '#e74c3c'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    const icono = tipo === 'success' ? '✅' : '❌';
    div.innerHTML = `${icono} ${msg}`;
    document.body.appendChild(div);

    setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 500);
    }, 3000);
}
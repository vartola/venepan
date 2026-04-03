let editandoProduccionIndex = null;
let editandoDespachoIndex = null;
let mesActualCereales = new Date().getMonth() + 1;
let anioActualCereales = new Date().getFullYear();


document.addEventListener('DOMContentLoaded', () => {
    inicializarBusqueda();
    llenarSelectAniosCereales();
    inicializarMenuHamburguesa();
    inicializarModal();
    inicializarBotonesGuardar();
    cargarTablasCereales(); 

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalFormulario();
            cerrarModalBusquedaCereales();
        }
    });
});

function validarNumeroPositivo(input) {
    if (input.value < 0) {
        input.value = 0;
        mostrarNotificacion("No se permiten números negativos", "error");
    }
}

function validarCampoNumerico(input) {
    // Prevenir teclas negativas y letras
    input.addEventListener('keydown', function(e) {
        // Prevenir el signo menos, la letra 'e' y la letra 'E'
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
        }
    });

    // Validar en tiempo real
    input.addEventListener('input', function() {
        validarNumeroPositivo(this);
    });

    // Validar al perder el foco
    input.addEventListener('blur', function() {
        if (this.value === '' || this.value === null) {
            this.value = 0;
        }
    });
}

function inicializarModal() {
    const btnCerrar = document.getElementById('btn-cerrar-form');
    const formOverlay = document.getElementById('form-overlay');

    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModalFormulario);
    if (formOverlay) formOverlay.addEventListener('click', cerrarModalFormulario);
}

function abrirModalFormulario(tipo) {
    const overlay = document.getElementById('form-overlay');
    const modal = document.getElementById('form-contenedor');
    const titulo = document.getElementById('titulo-formulario');
    const formBody = document.getElementById('form-body-cereales');

    if (!overlay || !modal || !titulo || !formBody) return;

    formBody.innerHTML = '';

    if (tipo === 'produccion') {
        titulo.innerHTML = '<i class="fas fa-industry"></i> Registro de Producción';
        formBody.innerHTML = obtenerHTMLFormularioProduccion();
        if (editandoProduccionIndex !== null) {
            cargarDatosProduccionParaEdicion(editandoProduccionIndex);
        }
        setTimeout(() => asignarEventosCalculo(), 100);
    } else if (tipo === 'despacho') {
        titulo.innerHTML = '<i class="fas fa-truck-loading"></i> Entrega a Despacho';
        formBody.innerHTML = obtenerHTMLFormularioDespacho();
        if (editandoDespachoIndex !== null) {
            cargarDatosDespachoParaEdicion(editandoDespachoIndex);
        }
        // Validar campos numéricos de despacho
        setTimeout(() => {
            const camposDespacho = document.querySelectorAll('.campo-numerico-despacho');
            camposDespacho.forEach(input => validarCampoNumerico(input));
        }, 100);
    }

    overlay.classList.add('activo');
    modal.classList.add('activo');
}

function cerrarModalFormulario() {
    const overlay = document.getElementById('form-overlay');
    const modal = document.getElementById('form-contenedor');

    if (overlay) overlay.classList.remove('activo');
    if (modal) modal.classList.remove('activo');

    editandoProduccionIndex = null;
    editandoDespachoIndex = null;
}

function inicializarMenuHamburguesa() {
    const menuHamburguesa = document.getElementById('menuHamburguesa');
    const menuDesplegable = document.getElementById('menuDesplegable');

    if (!menuHamburguesa || !menuDesplegable) return;

    menuHamburguesa.addEventListener('click', (e) => {
        e.stopPropagation();
        menuDesplegable.classList.toggle('mostrar');
    });

    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const seccionId = item.getAttribute('data-seccion');
            abrirModalFormulario(seccionId);

            menuItems.forEach(mi => mi.classList.remove('activo'));
            item.classList.add('activo');
            menuDesplegable.classList.remove('mostrar');
        });
    });

    document.addEventListener('click', (e) => {
        if (!menuDesplegable.contains(e.target) && !menuHamburguesa.contains(e.target)) {
            menuDesplegable.classList.remove('mostrar');
        }
    });
}

function inicializarBusqueda() {
    const lupa = document.getElementById('lupa-busqueda');
    if (lupa) {
        lupa.addEventListener('click', abrirModalBusquedaCereales);
    }
}

function llenarSelectAniosCereales() {
    const selectAnio = document.getElementById('buscar-anio-cereales');
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

function abrirModalBusquedaCereales() {
    const modal = document.getElementById('modal-busqueda-cereales');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        const hoy = new Date();
        document.getElementById('buscar-mes-cereales').value = hoy.getMonth() + 1;
        document.getElementById('buscar-anio-cereales').value = hoy.getFullYear();
    }
}

function cerrarModalBusquedaCereales() {
    const modal = document.getElementById('modal-busqueda-cereales');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function buscarPorMesAnioCereales() {
    const mes = parseInt(document.getElementById('buscar-mes-cereales').value);
    const anio = parseInt(document.getElementById('buscar-anio-cereales').value);
    
    mesActualCereales = mes;
    anioActualCereales = anio;
    
    cargarTablasCerealesPorPeriodo(mes, anio);
    cerrarModalBusquedaCereales();
    mostrarNotificacion(`Mostrando datos de ${getNombreMes(mes)} ${anio}`, 'exito');
}

function getNombreMes(mes) {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
}

function cargarTablasCereales() {
    cargarTablasCerealesPorPeriodo(mesActualCereales, anioActualCereales);
}

// Función UNIFICADA y CORREGIDA para cargar tablas
function cargarTablasCerealesPorPeriodo(mes, anio) {
    const prod = JSON.parse(localStorage.getItem('CerealesProd')) || [];
    const desp = JSON.parse(localStorage.getItem('CerealesDesp')) || [];

    // ===== FILTRAR PRODUCCIÓN POR FECHA =====
    const prodFiltradas = prod.filter(item => {
        if (!item.fecha) return false;
        const [year, month] = item.fecha.split('-').map(Number);
        return year === anio && month === mes;
    });

    // ===== FILTRAR DESPACHO POR FECHA =====
    const despFiltradas = desp.filter(item => {
        if (!item.fecha) return false;
        const [year, month] = item.fecha.split('-').map(Number);
        return year === anio && month === mes;
    });

    // ===== TABLA DE PRODUCCIÓN =====
    const tablaProd = document.getElementById('historial-produccion-cereales');
    if (tablaProd) {
        if (prodFiltradas.length === 0) {
            tablaProd.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: #999;">
                        <i class="fas fa-box-open" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                        No hay registros de producción para ${getNombreMes(mes)} ${anio}
                    </td>
                </tr>
            `;
        } else {
            tablaProd.innerHTML = prodFiltradas.map((item) => {
                const totalDesecho = parseFloat(item.desechoMezcla || 0) +
                                    parseFloat(item.desechoMarmita || 0) +
                                    parseFloat(item.desechoEmpaque || 0);

                let fechaMostrar = item.fecha || 'Sin fecha';
                if (item.fecha) {
                    const partes = item.fecha.split('-');
                    if (partes.length === 3) {
                        fechaMostrar = `${partes[2]}/${partes[1]}/${partes[0]}`;
                    }
                }

                // Encontrar índice original en el array completo (no filtrado)
                const indexOriginal = prod.findIndex(p => 
                    p.fecha === item.fecha && p.tipoCereal === item.tipoCereal && p.id === item.id
                );

                return `
                    <tr>
                        <td>
                            <b>${fechaMostrar}</b><br>
                            ${item.tipoCereal || 'Sin cereal'}
                        </td>
                        <td>${parseFloat(item.totalProducido || 0).toFixed(2)} Kg</td>
                        <td>${parseFloat(item.primera || 0).toFixed(2)} Kg</td>
                        <td style="color:red">${totalDesecho.toFixed(2)} Kg</td>
                        <td>
                            <div style="display: flex; gap: 5px; justify-content: center;">
                                <button onclick="editarProduccion(${indexOriginal})"
                                        style="color:#3498db; border:none; background:none; cursor:pointer;"
                                        title="Editar registro">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="eliminarRegistro('CerealesProd', ${indexOriginal})"
                                        style="color:red; border:none; background:none; cursor:pointer;"
                                        title="Eliminar registro">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }

    // ===== TABLA DE DESPACHO COMPLETA =====
    const tablaDesp = document.getElementById('historial-despacho-cereales');
    if (tablaDesp) {
        if (despFiltradas.length === 0) {
            tablaDesp.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 30px; color: #999;">
                        <i class="fas fa-truck" style="font-size: 40px; margin-bottom: 10px; display: block;"></i>
                        No hay registros de despacho para ${getNombreMes(mes)} ${anio}
                    </td>
                </tr>
            `;
        } else {
            tablaDesp.innerHTML = despFiltradas.map((item) => {
                // Formatear fecha para mostrar
                let fechaMostrar = item.fecha || 'Sin fecha';
                if (item.fecha) {
                    const partes = item.fecha.split('-');
                    if (partes.length === 3) {
                        fechaMostrar = `${partes[2]}/${partes[1]}/${partes[0]}`;
                    }
                }

                // Encontrar índice original para editar/eliminar
                const indexOriginal = desp.findIndex(d => 
                    d.fecha === item.fecha && d.lote === item.lote && d.id === item.id
                );

                return `
                    <tr>
                        <td>
                            <b>${item.lote || 'Sin lote'}</b><br>
                            <small style="color:#666;">${fechaMostrar}</small>
                        </td>
                        <td>
                            <b>Unidades:</b> 12: ${item.u12 || 0} | 8: ${item.u8 || 0} | Lunch: ${item.uL || 0}<br>
                            <b>Bultos:</b> 12: ${item.b12 || 0} | 8: ${item.b8 || 0} | Lunch: ${item.bL || 0}
                        </td>
                        <td>
                            <b>2da:</b> ${item.u2da || 0} uds<br>
                            <b>Viruta:</b> ${item.viruta || 0} uds<br>
                            <b>Desecho:</b> ${item.desecho || 0} uds
                        </td>
                        <td>
                            <b>${item.kg || 0} Kg</b><br>
                            <span style="color:green">Rend: ${item.rend || 0}%</span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 5px; justify-content: center;">
                                <button onclick="editarDespacho(${indexOriginal})"
                                        style="color:#3498db; border:none; background:none; cursor:pointer;"
                                        title="Editar registro">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="eliminarRegistro('CerealesDesp', ${indexOriginal})"
                                        style="color:red; border:none; background:none; cursor:pointer;"
                                        title="Eliminar registro">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    }
}

function obtenerHTMLFormularioProduccion() {
    return `
        <div class="grid-form">
            <div class="input-group" style="grid-column: span 2;">
                <label class="campo-obligatorio">Tipo de Cereal</label>
                <select id="tipo-cereal">
                    <option value="">Seleccione un cereal...</option>
                    <option value="CHOCO BOLITAS">CHOCO BOLITAS</option>
                    <option value="CHOKO CHISPYS">CHOKO CHISPYS</option>
                    <option value="AROS FRUTADOS">AROS FRUTADOS</option>
                    <option value="AROS MIEL">AROS MIEL</option>
                </select>
            </div>
            <div class="input-group">
                <label class="campo-obligatorio">Fecha de producción</label>
                <input type="date" id="fecha-produccion">
            </div>
            <div class="input-group">
                <label>Medida base (kg)</label>
                <input type="number" id="medida-base" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Medida Jarabe (kg)</label>
                <input type="number" id="medida-jarabe" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Base Reproceso (kg)</label>
                <input type="number" id="base-reproceso" step="0.01">
            </div>
            <div class="input-group">
                <label>Jarabe Reproceso (kg)</label>
                <input type="number" id="jarabe-reproceso" step="0.01">
            </div>
            <div class="input-group" style="grid-column: span 2;">
                <label>Total medidas (kg)</label>
                <input type="number" id="total-medidas" step="0.01" readonly class="readonly-input">
            </div>
            <div class="input-group">
                <label>Sobrante Seco (kg)</label>
                <input type="number" id="sobrante-seca" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Sobrante Jarabe (kg)</label>
                <input type="number" id="sobrante-jarabe" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group" style="grid-column: span 2;">
                <label>Total mezcla procesada (kg)</label>
                <input type="number" id="total-mezcla-procesada" step="0.01" readonly class="readonly-input">
            </div>
            <div class="input-group" style="grid-column: span 2;">
                <label>Medidas procesadas (kg)</label>
                <input type="number" id="medidas-procesadas" step="0.01">
            </div>
            <div class="input-group" style="grid-column: span 2;">
                <label>Bobina Entregada</label>
                <input type="text" id="bobina-entregada" placeholder="N° bobina">
            </div>
            <div class="input-group">
                <label>Producción 1ra (kg)</label>
                <input type="number" id="prod-1ra" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Producción 2da (kg)</label>
                <input type="number" id="prod-2da" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Desecho mezcla (kg)</label>
                <input type="number" id="desecho-mezcla" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Desecho marmita (kg)</label>
                <input type="number" id="desecho-marmita" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Desecho Empaque (kg)</label>
                <input type="number" id="desecho-empaque" step="0.01" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Empaque dañado (uds)</label>
                <input type="number" id="empaque-danado">
            </div>
            <div class="input-group">
                <label>Total producido (kg)</label>
                <input type="number" id="total-producido" step="0.01" readonly class="readonly-input">
            </div>
            <div class="input-group">
                <label>Merma (kg)</label>
                <input type="number" id="merma" step="0.01" readonly class="readonly-input">
            </div>
            <div class="input-group">
                <label>Total prod. s/Desecho (kg)</label>
                <input type="number" id="total-sin-desecho" step="0.01" readonly class="readonly-input">
            </div>
            <div class="input-group">
                <label>Medida Base en (kg)</label>
                <input type="number" id="medida-base-en" step="0.01">
            </div>
            <div class="input-group">
                <label>Medida Jarabe en (kg)</label>
                <input type="number" id="medida-jarabe-en" step="0.01">
            </div>
            <div class="input-group">
                <label>Unidades Teóricas</label>
                <input type="number" id="unidad-teorica" class="calculo-produccion">
            </div>
            <div class="input-group">
                <label>Productividad Teórica (%)</label>
                <input type="number" id="prod-teorica" step="0.1" readonly class="readonly-input">
            </div>
        </div>
        <button id="btn-guardar-cereal" class="btn-primary">
            <i class="fas fa-save"></i> GUARDAR PRODUCCIÓN
        </button>
    `;
}

function obtenerHTMLFormularioDespacho() {
    return `
        <div class="grid-form">
            <div class="input-group" style="grid-column: span 2;">
                <label class="campo-obligatorio">Cereal / Lote</label>
                <input type="text" id="desp-lote" placeholder="Ej: Lote-001">
            </div>
            
            <div class="input-group" style="grid-column: span 2;">
                <label class="campo-obligatorio">Fecha de Despacho</label>
                <input type="date" id="fecha-despacho" class="campo-obligatorio">
            </div>
            
            <div class="input-group">
                <label>Unid. 12</label>
                <input type="number" id="u12" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Unid. 8</label>
                <input type="number" id="u8" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Unid. Lunch</label>
                <input type="number" id="uLunch" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Bulto 12</label>
                <input type="number" id="b12" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Bulto 8</label>
                <input type="number" id="b8" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Bulto Lunch</label>
                <input type="number" id="bLunch" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Total Kg</label>
                <input type="number" id="desp-kg" step="0.01" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Unid. 2da</label>
                <input type="number" id="u2da" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Virutas</label>
                <input type="number" id="uViruta" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Desecho</label>
                <input type="number" id="uDesecho" class="campo-numerico-despacho">
            </div>
            <div class="input-group">
                <label>Prod. Real (%)</label>
                <input type="number" id="pReal" step="0.01" class="campo-numerico-despacho">
            </div>
        </div>
        <button id="btn-guardar-despacho" class="btn-primary">
            <i class="fas fa-shipping-fast"></i> GUARDAR DESPACHO
        </button>
    `;
}

function asignarEventosCalculo() {
    const inputsCalculo = document.querySelectorAll('.calculo-produccion');
    inputsCalculo.forEach(input => {
        input.removeEventListener('input', calcularTotalesCereales);
        input.addEventListener('input', calcularTotalesCereales);
        
        validarCampoNumerico(input);
    });

    const otrosNumericos = document.querySelectorAll('#medidas-procesadas, #empaque-danado, #medida-base-en, #medida-jarabe-en');
    otrosNumericos.forEach(input => {
        validarCampoNumerico(input);
    });
}

function calcularTotalesCereales() {
    // Obtener valores
    const medidaBase = parseFloat(document.getElementById('medida-base')?.value) || 0;
    const medidaJarabe = parseFloat(document.getElementById('medida-jarabe')?.value) || 0;
    const sobranteSeca = parseFloat(document.getElementById('sobrante-seca')?.value) || 0;
    const sobranteJarabe = parseFloat(document.getElementById('sobrante-jarabe')?.value) || 0;
    const prod1ra = parseFloat(document.getElementById('prod-1ra')?.value) || 0;
    const prod2da = parseFloat(document.getElementById('prod-2da')?.value) || 0;
    const desechoMezcla = parseFloat(document.getElementById('desecho-mezcla')?.value) || 0;
    const desechoMarmita = parseFloat(document.getElementById('desecho-marmita')?.value) || 0;
    const desechoEmpaque = parseFloat(document.getElementById('desecho-empaque')?.value) || 0;
    const unidadTeorica = parseFloat(document.getElementById('unidad-teorica')?.value) || 0;

    // 1. Calcular Total Medidas (base + jarabe)
    const totalMedidas = medidaBase + medidaJarabe;
    const totalMedidasEl = document.getElementById('total-medidas');
    if (totalMedidasEl) totalMedidasEl.value = totalMedidas.toFixed(2);

    // 2. Calcular Total Mezcla Procesada (Total Medidas - Sobrantes)
    const totalMezclaProcesada = totalMedidas - (sobranteSeca + sobranteJarabe);
    const mezclaProcEl = document.getElementById('total-mezcla-procesada');
    if (mezclaProcEl) mezclaProcEl.value = totalMezclaProcesada.toFixed(2);

    // 3. Calcular Total Producido (Suma de todo)
    const totalProducido = prod1ra + prod2da + desechoMezcla + desechoMarmita + desechoEmpaque;
    const totalProdEl = document.getElementById('total-producido');
    if (totalProdEl) totalProdEl.value = totalProducido.toFixed(2);

    // 4. Calcular Total sin Desecho (Solo producto de primera y segunda)
    const totalSinDesecho = prod1ra + prod2da;
    const totalSinDesechoEl = document.getElementById('total-sin-desecho');
    if (totalSinDesechoEl) totalSinDesechoEl.value = totalSinDesecho.toFixed(2);

    // 5. Calcular Merma
    const merma = totalMezclaProcesada - totalProducido;
    const mermaEl = document.getElementById('merma');
    if (mermaEl) mermaEl.value = merma.toFixed(2);

    // 6. Calcular Productividad Teórica
    const prodTeoricaEl = document.getElementById('prod-teorica');
    if (prodTeoricaEl) {
        if (totalProducido > 0 && unidadTeorica > 0) {
            const productividad = (unidadTeorica / totalProducido) * 100;
            prodTeoricaEl.value = productividad.toFixed(2);
        } else {
            prodTeoricaEl.value = "0";
        }
    }
}

function cargarDatosProduccionParaEdicion(index) {
    const prod = JSON.parse(localStorage.getItem('CerealesProd')) || [];
    const item = prod[index];
    if (!item) return;

    document.getElementById('tipo-cereal').value = item.tipoCereal || '';
    document.getElementById('fecha-produccion').value = item.fecha || '';
    document.getElementById('medida-base').value = item.medidaBase || 0;
    document.getElementById('medida-jarabe').value = item.medidaJarabe || 0;
    document.getElementById('base-reproceso').value = item.baseReproceso || 0;
    document.getElementById('jarabe-reproceso').value = item.jarabeReproceso || 0;
    document.getElementById('sobrante-seca').value = item.sobranteSeca || 0;
    document.getElementById('sobrante-jarabe').value = item.sobranteJarabe || 0;
    document.getElementById('medidas-procesadas').value = item.medidasProcesadas || 0;
    document.getElementById('bobina-entregada').value = item.bobina || '';
    document.getElementById('prod-1ra').value = item.primera || 0;
    document.getElementById('prod-2da').value = item.segunda || 0;
    document.getElementById('desecho-mezcla').value = item.desechoMezcla || 0;
    document.getElementById('desecho-marmita').value = item.desechoMarmita || 0;
    document.getElementById('desecho-empaque').value = item.desechoEmpaque || 0;
    document.getElementById('empaque-danado').value = item.empaqueDanado || 0;
    document.getElementById('medida-base-en').value = item.medidaBaseEn || 0;
    document.getElementById('medida-jarabe-en').value = item.medidaJarabeEn || 0;
    document.getElementById('unidad-teorica').value = item.uniTeorica || 0;

    calcularTotalesCereales();

    const btnGuardar = document.getElementById('btn-guardar-cereal');
    if (btnGuardar) {
        btnGuardar.innerHTML = '<i class="fas fa-sync"></i> ACTUALIZAR PRODUCCIÓN';
    }
}

function cargarDatosDespachoParaEdicion(index) {
    const desp = JSON.parse(localStorage.getItem('CerealesDesp')) || [];
    const item = desp[index];
    if (!item) return;

    document.getElementById('desp-lote').value = item.lote || '';
    document.getElementById('fecha-despacho').value = item.fecha || '';
    document.getElementById('u12').value = item.u12 || 0;
    document.getElementById('u8').value = item.u8 || 0;
    document.getElementById('uLunch').value = item.uL || 0;
    document.getElementById('b12').value = item.b12 || 0;
    document.getElementById('b8').value = item.b8 || 0;
    document.getElementById('bLunch').value = item.bL || 0;
    document.getElementById('desp-kg').value = item.kg || 0;
    document.getElementById('u2da').value = item.u2da || 0;
    document.getElementById('uViruta').value = item.viruta || 0;
    document.getElementById('uDesecho').value = item.desecho || 0;
    document.getElementById('pReal').value = item.rend || 0;

    const btnGuardar = document.getElementById('btn-guardar-despacho');
    if (btnGuardar) {
        btnGuardar.innerHTML = '<i class="fas fa-sync"></i> ACTUALIZAR DESPACHO';
    }
}

window.editarProduccion = function(index) {
    editandoProduccionIndex = index;
    abrirModalFormulario('produccion');
};

window.editarDespacho = function(index) {
    editandoDespachoIndex = index;
    abrirModalFormulario('despacho');
};

function inicializarBotonesGuardar() {
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'btn-guardar-cereal') {
            e.preventDefault();
            guardarProduccion();
        }
        if (e.target && e.target.id === 'btn-guardar-despacho') {
            e.preventDefault();
            guardarDespacho();
        }
    });
}

function guardarProduccion() {
    const tipoCereal = document.getElementById('tipo-cereal')?.value;
    const fecha = document.getElementById('fecha-produccion')?.value;

    if (!tipoCereal || !fecha) {
        mostrarNotificacion('⚠️ Complete el Tipo de Cereal y la Fecha', 'error');
        return;
    }

    const nuevaProduccion = {
        tipoCereal: tipoCereal,
        fecha: fecha,
        medidaBase: Math.max(0, parseFloat(document.getElementById('medida-base')?.value) || 0),
        medidaJarabe: Math.max(0, parseFloat(document.getElementById('medida-jarabe')?.value) || 0),
        baseReproceso: Math.max(0, parseFloat(document.getElementById('base-reproceso')?.value) || 0),
        jarabeReproceso: Math.max(0, parseFloat(document.getElementById('jarabe-reproceso')?.value) || 0),
        totalMedidas: document.getElementById('total-medidas')?.value || 0,
        sobranteSeca: Math.max(0, parseFloat(document.getElementById('sobrante-seca')?.value) || 0),
        sobranteJarabe: Math.max(0, parseFloat(document.getElementById('sobrante-jarabe')?.value) || 0),
        totalMezclaProcesada: document.getElementById('total-mezcla-procesada')?.value || 0,
        medidasProcesadas: Math.max(0, parseFloat(document.getElementById('medidas-procesadas')?.value) || 0),
        bobina: document.getElementById('bobina-entregada')?.value || "",
        primera: Math.max(0, parseFloat(document.getElementById('prod-1ra')?.value) || 0),
        segunda: Math.max(0, parseFloat(document.getElementById('prod-2da')?.value) || 0),
        desechoMezcla: Math.max(0, parseFloat(document.getElementById('desecho-mezcla')?.value) || 0),
        desechoMarmita: Math.max(0, parseFloat(document.getElementById('desecho-marmita')?.value) || 0),
        desechoEmpaque: Math.max(0, parseFloat(document.getElementById('desecho-empaque')?.value) || 0),
        empaqueDanado: Math.max(0, parseFloat(document.getElementById('empaque-danado')?.value) || 0),
        totalProducido: document.getElementById('total-producido')?.value || 0,
        merma: document.getElementById('merma')?.value || 0,
        totalSinDesecho: document.getElementById('total-sin-desecho')?.value || 0,
        medidaBaseEn: Math.max(0, parseFloat(document.getElementById('medida-base-en')?.value) || 0),
        medidaJarabeEn: Math.max(0, parseFloat(document.getElementById('medida-jarabe-en')?.value) || 0),
        uniTeorica: Math.max(0, parseFloat(document.getElementById('unidad-teorica')?.value) || 0),
        prodTeorica: document.getElementById('prod-teorica')?.value || 0,
        id: Date.now()
    };

    let listaProd = JSON.parse(localStorage.getItem('CerealesProd')) || [];

    if (editandoProduccionIndex !== null) {
        listaProd[editandoProduccionIndex] = nuevaProduccion;
        editandoProduccionIndex = null;
        mostrarNotificacion('✅ Producción actualizada con éxito', 'exito');
    } else {
        listaProd.push(nuevaProduccion);
        mostrarNotificacion('✅ Producción guardada con éxito', 'exito');
    }

    localStorage.setItem('CerealesProd', JSON.stringify(listaProd));
    cargarTablasCereales();
    cerrarModalFormulario();
}

function guardarDespacho() {
    const elLote = document.getElementById('desp-lote');
    const fechaDespacho = document.getElementById('fecha-despacho')?.value;

    // Validar campos obligatorios
    if (!elLote || !elLote.value.trim()) {
        mostrarNotificacion('⚠️ Por favor, ingrese el nombre del Lote', 'error');
        return;
    }

    if (!fechaDespacho) {
        mostrarNotificacion('⚠️ Por favor, seleccione la fecha de despacho', 'error');
        return;
    }

    const nuevoDespacho = {
        lote: elLote.value.trim(),
        fecha: fechaDespacho,
        u12: Math.max(0, parseFloat(document.getElementById('u12')?.value) || 0),
        u8: Math.max(0, parseFloat(document.getElementById('u8')?.value) || 0),
        uL: Math.max(0, parseFloat(document.getElementById('uLunch')?.value) || 0),
        b12: Math.max(0, parseFloat(document.getElementById('b12')?.value) || 0),
        bL: Math.max(0, parseFloat(document.getElementById('bLunch')?.value) || 0),
        b8: Math.max(0, parseFloat(document.getElementById('b8')?.value) || 0),
        kg: Math.max(0, parseFloat(document.getElementById('desp-kg')?.value) || 0),
        u2da: Math.max(0, parseFloat(document.getElementById('u2da')?.value) || 0),
        viruta: Math.max(0, parseFloat(document.getElementById('uViruta')?.value) || 0),
        desecho: Math.max(0, parseFloat(document.getElementById('uDesecho')?.value) || 0),
        rend: Math.max(0, parseFloat(document.getElementById('pReal')?.value) || 0),
        id: Date.now()
    };

    let listaDesp = JSON.parse(localStorage.getItem('CerealesDesp')) || [];

    if (editandoDespachoIndex !== null) {
        listaDesp[editandoDespachoIndex] = nuevoDespacho;
        editandoDespachoIndex = null;
        mostrarNotificacion('✅ Despacho actualizado con éxito', 'exito');
    } else {
        listaDesp.push(nuevoDespacho);
        mostrarNotificacion('✅ Despacho registrado correctamente', 'exito');
    }

    localStorage.setItem('CerealesDesp', JSON.stringify(listaDesp));
    cargarTablasCereales();
    cerrarModalFormulario();
}

window.eliminarRegistro = function(key, index) {
    if(confirm("¿Está seguro de eliminar este registro?")) {
        let items = JSON.parse(localStorage.getItem(key)) || [];
        items.splice(index, 1);
        localStorage.setItem(key, JSON.stringify(items));
        cargarTablasCerealesPorPeriodo(mesActualCereales, anioActualCereales);
        mostrarNotificacion('Registro eliminado correctamente', 'exito');
    }
};

function mostrarNotificacion(mensaje, tipo) {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas ${tipo === 'exito' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensaje}</span>
    `;

    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'exito' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10001;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 10px;
    `;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}
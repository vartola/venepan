let editandoIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    // === ELEMENTOS DEL DOM ===
    const btnAbrir = document.getElementById('btn-abrir-form');
    const btnCerrar = document.getElementById('btn-cerrar-form');
    const formOverlay = document.getElementById('form-overlay');
    const formContenedor = document.getElementById('form-contenedor');
    
    // === AUTO-CÁLCULO DE EDAD ===
    const fechaNacimiento = document.getElementById('emp-nacimiento');
    const campoEdad = document.getElementById('emp-edad');
    
    if (fechaNacimiento) {
        fechaNacimiento.addEventListener('change', function() {
            calcularEdad(this.value, campoEdad);
        });
    }
    
    // === CONTROL DEL MODAL FORMULARIO ===
    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => {
            formOverlay.classList.add('activo');
            formContenedor.classList.add('activo');
            btnAbrir.classList.add('activo');
            
            if (editandoIndex === null) {
                limpiarFormulario();
            }
        });
    }
    
    const cerrarFormulario = () => {
        formOverlay.classList.remove('activo');
        formContenedor.classList.remove('activo');
        if (btnAbrir) btnAbrir.classList.remove('activo');
    };
    
    if (btnCerrar) {
        btnCerrar.addEventListener('click', cerrarFormulario);
    }
    
    if (formOverlay) {
        formOverlay.addEventListener('click', cerrarFormulario);
    }
    
    // === CARGAR EMPLEADOS ===
    cargarEmpleados();

    // === EVENTO PARA EL BOTÓN GUARDAR ===
    document.getElementById('btn-guardar-empleado').addEventListener('click', () => {
        // Obtener valores del formulario
        const empleado = {
            nombre: document.getElementById('emp-nombre').value.trim(),
            apellido: document.getElementById('emp-apellido').value.trim(),
            cedula: document.getElementById('emp-cedula').value.trim(),
            edad: document.getElementById('emp-edad').value,
            estadoCivil: document.getElementById('emp-estado-civil').value,
            hijos: document.getElementById('emp-hijos').value || 0,
            nacimiento: document.getElementById('emp-nacimiento').value,
            ingreso: document.getElementById('emp-ingreso').value,
            telefono: document.getElementById('emp-telefono').value.trim(),
            correo: document.getElementById('emp-correo').value.trim(),
            direccion: document.getElementById('emp-direccion').value.trim(),
            tallaCamisa: document.getElementById('emp-talla-camisa').value,
            tallaPantalon: document.getElementById('emp-talla-pantalon').value,
            tallaZapatos: document.getElementById('emp-talla-zapatos').value,
            lateralidad: document.getElementById('emp-lateralidad').value,
            educacion: document.getElementById('emp-educacion').value,
            estudiante: document.getElementById('emp-estudiante').value,
            enfermedad: document.getElementById('emp-enfermedad').value.trim() || "Ninguna",
            alergia: document.getElementById('emp-alergia').value.trim() || "Ninguna",
            religion: document.getElementById('emp-religion').value  // NUEVO CAMPO
        };

        // Validar campos obligatorios
        if (empleado.nombre === "" || empleado.apellido === "" || empleado.cedula === "") {
            alert("⚠️ Nombre, Apellido y Cédula son obligatorios.");
            return;
        }

        // Obtener datos existentes
        let nomina = JSON.parse(localStorage.getItem('Empleados')) || [];

        // Si estamos editando, actualizar; si no, agregar nuevo
        if (editandoIndex !== null) {
            nomina[editandoIndex] = empleado;
            alert("✅ Empleado actualizado correctamente");
        } else {
            nomina.push(empleado);
            alert("✅ Empleado guardado correctamente");
        }

        // Guardar en localStorage
        localStorage.setItem('Empleados', JSON.stringify(nomina));

        // Cerrar el modal
        cerrarFormulario();

        // Limpiar formulario y recargar lista
        limpiarFormulario();
        cargarEmpleados();
    });

    // === EVENTO PARA EL BUSCADOR ===
    const buscador = document.getElementById('buscador-empleado');
    if (buscador) {
        buscador.addEventListener('keyup', filtrarEmpleados);
    }
    
    // === CERRAR CON TECLA ESC ===
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (formContenedor?.classList.contains('activo')) {
                cerrarFormulario();
            }
            const modalExpediente = document.getElementById('expediente-modal');
            if (modalExpediente && modalExpediente.style.display === 'block') {
                modalExpediente.style.display = 'none';
            }
        }
    });
});

// FUNCIÓN PARA CALCULAR EDAD AUTOMÁTICAMENTE
function calcularEdad(fechaNacimiento, campoEdad) {
    if (!fechaNacimiento) {
        if (campoEdad) campoEdad.value = '';
        return;
    }
    
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    
    if (campoEdad && edad > 0 && edad < 120) {
        campoEdad.value = edad;
    } else if (campoEdad) {
        campoEdad.value = '';
    }
}

function cargarEmpleados() {
    if (document.getElementById('total-empleados')) {
        actualizarContadores();
    }

    const lista = document.getElementById('lista-empleados');
    const nomina = JSON.parse(localStorage.getItem('Empleados')) || [];

    lista.innerHTML = '';

    nomina.forEach((emp, index) => {
        const tieneAlerta = (emp.enfermedad && emp.enfermedad.toLowerCase() !== 'ninguna') || 
                           (emp.alergia && emp.alergia.toLowerCase() !== 'ninguna');
        
        const fila = document.createElement('tr');
        fila.style.borderBottom = '1px solid #eee';
        
        const col1 = document.createElement('td');
        col1.style.padding = '15px';
        col1.style.fontWeight = 'bold';
        col1.style.color = '#2c3e50';
        col1.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-user-circle" style="font-size: 24px; color: #b33939;"></i>
                <div>
                    <div>${emp.nombre} ${emp.apellido}</div>
                    <div style="font-size: 12px; color: #7f8c8d; font-weight: normal;">
                        V-${emp.cedula} 
                        ${tieneAlerta ? '<span style="color: #e74c3c; margin-left: 5px;"><i class="fas fa-exclamation-circle"></i> Alerta médica</span>' : ''}
                    </div>
                </div>
            </div>
        `;
        
        const col2 = document.createElement('td');
        col2.style.padding = '15px';
        col2.style.color = '#34495e';
        col2.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-heart" style="color: #e74c3c; font-size: 14px;"></i>
                <span>${emp.estadoCivil || 'No registrado'}</span>
                ${emp.hijos > 0 ? `<span style="background: #f0f0f0; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                    <i class="fas fa-child"></i> ${emp.hijos}
                </span>` : ''}
            </div>
        `;
        
        const col3 = document.createElement('td');
        col3.style.padding = '15px';
        col3.style.textAlign = 'right';
        col3.innerHTML = `
            <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick="verExpediente(${index})" 
                    style="background:#3498db; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:13px; display:inline-flex; align-items:center; gap:5px;">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button onclick="prepararEdicion(${index})" 
                    style="background:#f39c12; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:13px; display:inline-flex; align-items:center; gap:5px;">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button onclick="eliminarEmpleado(${index})" 
                    style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:13px; display:inline-flex; align-items:center; gap:5px;">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        
        fila.appendChild(col1);
        fila.appendChild(col2);
        fila.appendChild(col3);
        lista.appendChild(fila);
    });

    if (nomina.length === 0) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td colspan="3" style="padding: 30px; text-align: center; color: #7f8c8d;">
                <i class="fas fa-users" style="font-size: 40px; opacity: 0.3; margin-bottom: 10px; display: block;"></i>
                No hay empleados registrados. Haz clic en el botón <strong style="color:#b33939;">+</strong> para agregar.
            </td>
        `;
        lista.appendChild(fila);
    }
}

function prepararEdicion(index) {
    const nomina = JSON.parse(localStorage.getItem('Empleados')) || [];
    const emp = nomina[index];

    document.getElementById('emp-nombre').value = emp.nombre || '';
    document.getElementById('emp-apellido').value = emp.apellido || '';
    document.getElementById('emp-cedula').value = emp.cedula || '';
    document.getElementById('emp-edad').value = emp.edad || '';
    document.getElementById('emp-estado-civil').value = emp.estadoCivil || 'Soltero(a)';
    document.getElementById('emp-hijos').value = emp.hijos || '0';
    document.getElementById('emp-nacimiento').value = emp.nacimiento || '';
    document.getElementById('emp-ingreso').value = emp.ingreso || '';
    document.getElementById('emp-telefono').value = emp.telefono || '';
    document.getElementById('emp-correo').value = emp.correo || '';
    document.getElementById('emp-direccion').value = emp.direccion || '';
    document.getElementById('emp-talla-camisa').value = emp.tallaCamisa || 'M';
    document.getElementById('emp-talla-pantalon').value = emp.tallaPantalon || '';
    document.getElementById('emp-talla-zapatos').value = emp.tallaZapatos || '';
    document.getElementById('emp-lateralidad').value = emp.lateralidad || 'Derecho';
    document.getElementById('emp-educacion').value = emp.educacion || 'Bachiller';
    document.getElementById('emp-estudiante').value = emp.estudiante || 'No';
    document.getElementById('emp-enfermedad').value = emp.enfermedad || '';
    document.getElementById('emp-alergia').value = emp.alergia || '';
    document.getElementById('emp-religion').value = emp.religion || 'Ninguna';  // NUEVO CAMPO

    document.getElementById('btn-guardar-empleado').innerHTML = '<i class="fas fa-sync"></i> Actualizar Registro';
    editandoIndex = index;

    const formOverlay = document.getElementById('form-overlay');
    const formContenedor = document.getElementById('form-contenedor');
    const btnAbrir = document.getElementById('btn-abrir-form');
    
    if (formOverlay && formContenedor) {
        formOverlay.classList.add('activo');
        formContenedor.classList.add('activo');
        if (btnAbrir) btnAbrir.classList.add('activo');
    }
}

function verExpediente(index) {
    const nomina = JSON.parse(localStorage.getItem('Empleados')) || [];
    const emp = nomina[index];

    let modal = document.getElementById('expediente-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'expediente-modal';
        modal.className = 'expediente-modal';
        document.body.appendChild(modal);
    }

    const contenido = `
        <div class="expediente-contenido">
            <div class="expediente-header">
                <h2>
                    <i class="fas fa-user-circle"></i>
                    ${emp.nombre} ${emp.apellido}
                    ${(emp.enfermedad && emp.enfermedad.toLowerCase() !== 'ninguna') || 
                      (emp.alergia && emp.alergia.toLowerCase() !== 'ninguna') ? 
                        '<span class="expediente-badge"><i class="fas fa-notes-medical"></i> Alerta Médica</span>' : ''}
                </h2>
                <button class="cerrar-expediente" onclick="document.getElementById('expediente-modal').style.display='none'">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="expediente-body">
                <div class="expediente-grid">
                    <div class="expediente-seccion">
                        <h3><i class="fas fa-user"></i> Datos Personales</h3>
                        <div class="expediente-info">
                            <span class="label">Cédula:</span>
                            <span class="valor">${emp.cedula || 'No registrada'}</span>
                            
                            <span class="label">Edad:</span>
                            <span class="valor">${emp.edad || 'No registrada'} años</span>
                            
                            <span class="label">Fecha Nac.:</span>
                            <span class="valor">${emp.nacimiento || 'No registrada'}</span>
                            
                            <span class="label">Estado Civil:</span>
                            <span class="valor">${emp.estadoCivil || 'No registrado'}</span>
                            
                            <span class="label">Hijos:</span>
                            <span class="valor">${emp.hijos || '0'}</span>
                                                           
                            <span class="label">Religión:</span>  
                            <span class="valor">${emp.religion || 'No registrada'}</span>  
                        </div>
                    </div>

                    <div class="expediente-seccion">
                        <h3><i class="fas fa-briefcase"></i> Datos Laborales</h3>
                        <div class="expediente-info">
                            <span class="label">Fecha Ingreso:</span>
                            <span class="valor">${emp.ingreso || 'No registrada'}</span>
                            
                            <span class="label">Lateralidad:</span>
                            <span class="valor">${emp.lateralidad || 'No registrada'}</span>
                            
                            <span class="label">Educación:</span>
                            <span class="valor">${emp.educacion || 'No registrada'}</span>
                            
                            <span class="label">Estudiante:</span>
                            <span class="valor">${emp.estudiante || 'No'}</span>
                        </div>
                    </div>

                    <div class="expediente-seccion">
                        <h3><i class="fas fa-address-book"></i> Contacto</h3>
                        <div class="expediente-info">
                            <span class="label">Teléfono:</span>
                            <span class="valor">${emp.telefono || 'No registrado'}</span>
                            
                            <span class="label">Correo:</span>
                            <span class="valor">${emp.correo || 'No registrado'}</span>
                            
                            <span class="label">Dirección:</span>
                            <span class="valor">${emp.direccion || 'No registrada'}</span>
                        </div>
                    </div>

                    <div class="expediente-seccion">
                        <h3><i class="fas fa-tshirt"></i> Tallas de Uniforme</h3>
                        <div class="expediente-info">
                            <span class="label">Camisa:</span>
                            <span class="valor">${emp.tallaCamisa || 'No registrada'}</span>
                            
                            <span class="label">Pantalón:</span>
                            <span class="valor">${emp.tallaPantalon || 'No registrada'}</span>
                            
                            <span class="label">Zapatos:</span>
                            <span class="valor">${emp.tallaZapatos || 'No registrada'}</span>
                        </div>
                    </div>

                    <div class="expediente-seccion" style="grid-column: span 2;">
                        <h3><i class="fas fa-heartbeat"></i> Información Médica</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div class="expediente-info">
                                <span class="label">Enfermedades:</span>
                                <span class="valor" style="${emp.enfermedad && emp.enfermedad.toLowerCase() !== 'ninguna' ? 'color: #e74c3c; font-weight: bold;' : ''}">
                                    ${emp.enfermedad || 'Ninguna'}
                                </span>
                            </div>
                            <div class="expediente-info">
                                <span class="label">Alergias:</span>
                                <span class="valor" style="${emp.alergia && emp.alergia.toLowerCase() !== 'ninguna' ? 'color: #e74c3c; font-weight: bold;' : ''}">
                                    ${emp.alergia || 'Ninguna'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="expediente-footer">
                <button class="btn-cerrar" onclick="document.getElementById('expediente-modal').style.display='none'">
                    <i class="fas fa-times"></i> Cerrar
                </button>
                <button class="btn-imprimir" onclick="imprimirExpediente(${index})">
                    <i class="fas fa-print"></i> Imprimir Expediente
                </button>
            </div>
        </div>
    `;

    modal.innerHTML = contenido;
    modal.style.display = 'block';

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function cerrarModal() {
    const modal = document.getElementById("modal-detalle");
    if (modal) modal.style.display = "none";
}

function filtrarEmpleados() {
    const filtro = document.getElementById("buscador-empleado").value.toLowerCase();
    const filas = document.querySelectorAll("#lista-empleados tr");

    filas.forEach(fila => {
        const texto = fila.innerText.toLowerCase();
        fila.style.display = texto.includes(filtro) ? "" : "none";
    });
}

function imprimirExpediente(index) {
    const nomina = JSON.parse(localStorage.getItem('Empleados')) || [];
    const emp = nomina[index];
    
    const ventanaImpresion = window.open('', '_blank');
    
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Expediente - ${emp.nombre} ${emp.apellido}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    padding: 40px;
                    max-width: 1000px;
                    margin: 0 auto;
                    color: #333;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 3px solid #b33939;
                }
                .header h1 {
                    color: #b33939;
                    margin-bottom: 10px;
                    font-size: 28px;
                }
                .header p {
                    font-size: 16px;
                    color: #666;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                    margin-bottom: 30px;
                }
                .seccion {
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #b33939;
                    page-break-inside: avoid;
                }
                .seccion h3 {
                    color: #b33939;
                    margin-top: 0;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e0e0e0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .info {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 10px;
                    line-height: 1.6;
                }
                .label {
                    font-weight: bold;
                    color: #666;
                }
                .valor {
                    color: #333;
                }
                .medica-alerta {
                    color: #e74c3c;
                    font-weight: bold;
                }
                .full-width {
                    grid-column: span 2;
                }
                @media print {
                    body { padding: 20px; }
                    .seccion { break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${emp.nombre} ${emp.apellido}</h1>
                <p>Cédula: ${emp.cedula || 'No registrada'}</p>
            </div>
            
            <div class="grid">
                <div class="seccion">
                    <h3>📋 Datos Personales</h3>
                    <div class="info">
                        <span class="label">Cédula:</span>
                        <span class="valor">${emp.cedula || 'No registrada'}</span>
                        
                        <span class="label">Edad:</span>
                        <span class="valor">${emp.edad || 'No registrada'} años</span>
                        
                        <span class="label">Fecha Nac.:</span>
                        <span class="valor">${emp.nacimiento || 'No registrada'}</span>
                        
                        <span class="label">Estado Civil:</span>
                        <span class="valor">${emp.estadoCivil || 'No registrado'}</span>
                        
                        <span class="label">Hijos:</span>
                        <span class="valor">${emp.hijos || '0'}</span>
                        
                        <span class="label">Religión:</span>
                        <span class="valor">${emp.religion || 'No registrada'}</span>
                    </div>
                </div>

                <div class="seccion">
                    <h3>💼 Datos Laborales</h3>
                    <div class="info">
                        <span class="label">Fecha Ingreso:</span>
                        <span class="valor">${emp.ingreso || 'No registrada'}</span>
                        
                        <span class="label">Lateralidad:</span>
                        <span class="valor">${emp.lateralidad || 'No registrada'}</span>
                        
                        <span class="label">Educación:</span>
                        <span class="valor">${emp.educacion || 'No registrada'}</span>
                        
                        <span class="label">Estudiante:</span>
                        <span class="valor">${emp.estudiante || 'No'}</span>
                    </div>
                </div>

                <div class="seccion">
                    <h3>📞 Contacto</h3>
                    <div class="info">
                        <span class="label">Teléfono:</span>
                        <span class="valor">${emp.telefono || 'No registrado'}</span>
                        
                        <span class="label">Correo:</span>
                        <span class="valor">${emp.correo || 'No registrado'}</span>
                        
                        <span class="label">Dirección:</span>
                        <span class="valor">${emp.direccion || 'No registrada'}</span>
                    </div>
                </div>

                <div class="seccion">
                    <h3>👕 Tallas de Uniforme</h3>
                    <div class="info">
                        <span class="label">Camisa:</span>
                        <span class="valor">${emp.tallaCamisa || 'No registrada'}</span>
                        
                        <span class="label">Pantalón:</span>
                        <span class="valor">${emp.tallaPantalon || 'No registrada'}</span>
                        
                        <span class="label">Zapatos:</span>
                        <span class="valor">${emp.tallaZapatos || 'No registrada'}</span>
                    </div>
                </div>

                <div class="seccion full-width">
                    <h3>❤️ Información Médica</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div class="info">
                            <span class="label">Enfermedades:</span>
                            <span class="valor ${emp.enfermedad && emp.enfermedad.toLowerCase() !== 'ninguna' ? 'medica-alerta' : ''}">
                                ${emp.enfermedad || 'Ninguna'}
                            </span>
                        </div>
                        <div class="info">
                            <span class="label">Alergias:</span>
                            <span class="valor ${emp.alergia && emp.alergia.toLowerCase() !== 'ninguna' ? 'medica-alerta' : ''}">
                                ${emp.alergia || 'Ninguna'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
                <p>Documento generado el ${new Date().toLocaleDateString()} - Sistema VENEPAN</p>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                }
            </script>
        </body>
        </html>
    `);
    
    ventanaImpresion.document.close();
}

function limpiarFormulario() {
    document.getElementById('emp-nombre').value = '';
    document.getElementById('emp-apellido').value = '';
    document.getElementById('emp-cedula').value = '';
    document.getElementById('emp-edad').value = '';
    document.getElementById('emp-hijos').value = '';
    document.getElementById('emp-telefono').value = '';
    document.getElementById('emp-correo').value = '';
    document.getElementById('emp-direccion').value = '';
    document.getElementById('emp-talla-pantalon').value = '';
    document.getElementById('emp-talla-zapatos').value = '';
    document.getElementById('emp-enfermedad').value = '';
    document.getElementById('emp-alergia').value = '';
    document.getElementById('emp-nacimiento').value = '';
    document.getElementById('emp-ingreso').value = '';

    // Resetear selects
    document.getElementById('emp-estado-civil').selectedIndex = 0;
    document.getElementById('emp-lateralidad').selectedIndex = 0;
    document.getElementById('emp-educacion').selectedIndex = 0;
    document.getElementById('emp-estudiante').selectedIndex = 0;
    document.getElementById('emp-talla-camisa').selectedIndex = 0;
    document.getElementById('emp-religion').selectedIndex = 7; // Selecciona "Ninguna"

    editandoIndex = null;
    document.getElementById('btn-guardar-empleado').innerHTML = '<i class="fas fa-save"></i> Guardar Ficha';
}

function eliminarEmpleado(index) {
    if (confirm("¿Está seguro de eliminar permanentemente este expediente?")) {
        let nomina = JSON.parse(localStorage.getItem('Empleados')) || [];
        nomina.splice(index, 1);
        localStorage.setItem('Empleados', JSON.stringify(nomina));
        cargarEmpleados();
    }
}

function actualizarContadores() {
    const nomina = JSON.parse(localStorage.getItem('Empleados')) || [];

    const total = nomina.length;
    const estudiantes = nomina.filter(emp => emp.estudiante === "Si").length;
    const alertasMedicas = nomina.filter(emp => {
        const tieneEnfermedad = emp.enfermedad && emp.enfermedad.toLowerCase() !== "ninguna";
        const tieneAlergia = emp.alergia && emp.alergia.toLowerCase() !== "ninguna";
        return tieneEnfermedad || tieneAlergia;
    }).length;

    const elTotal = document.getElementById('total-empleados');
    const elEstudiantes = document.getElementById('cant-estudiantes');
    const elMedico = document.getElementById('cant-medico');
    
    if (elTotal) {
        elTotal.innerText = total;
        elTotal.style.color = total > 10 ? '#27ae60' : 'white';
    }
    
    if (elEstudiantes) {
        elEstudiantes.innerText = estudiantes;
    }
    
    if (elMedico) {
        elMedico.innerText = alertasMedicas;
        if (alertasMedicas > 0) {
            elMedico.style.color = '#ff6b6b';
        } else {
            elMedico.style.color = 'white';
        }
    }
}
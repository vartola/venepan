let editandoIndex = null;


document.addEventListener('DOMContentLoaded', () => {
    cargarEmpaques();

    document.getElementById('btn-guardar-empaque').addEventListener('click', () => {
        const producto = document.getElementById('empaque-producto').value;
        const entregado = parseFloat(document.getElementById('empaque-entregado').value);
        const danado = parseFloat(document.getElementById('empaque-danado').value) || 0;
        const unidades = document.getElementById('empaque-unidades').value;

        if (producto && entregado > 0) {
            let inventarioEmpaques = JSON.parse(localStorage.getItem('Empaques')) || [];
            
            
            const calculoPorcentaje = ((danado / entregado) * 100).toFixed(2);

            const datosEmpaque = {
                producto,
                entregado,
                danado,
                unidades,
                porcentaje: calculoPorcentaje
            };

            if (editandoIndex !== null) {
                inventarioEmpaques[editandoIndex] = datosEmpaque;
                editandoIndex = null;
                document.getElementById('btn-guardar-empaque').innerHTML = '<i class="fas fa-save"></i> Guardar Registro';
            } else {
                inventarioEmpaques.push(datosEmpaque);
            }

            localStorage.setItem('Empaques', JSON.stringify(inventarioEmpaques));
            limpiarCampos();
            cargarEmpaques();
        } else {
            alert("Por favor indica el producto y la cantidad entregada");
        }
    });
});

function cargarEmpaques() {
    const lista = document.getElementById('lista-empaques');
    const inventario = JSON.parse(localStorage.getItem('Empaques')) || [];
    lista.innerHTML = "";

    inventario.forEach((item, index) => {
        // Lógica de colores para el porcentaje
        // Si el daño es mayor al 5%, se pone en rojo (alerta)
        let colorPorcentaje = item.porcentaje > 5 ? "#e74c3c" : "#2ecc71";

        lista.innerHTML += `
            <tr>
                <td><strong>${item.producto}</strong></td>
                <td>${item.entregado}</td>
                <td>${item.danado}</td>
                <td>
                    <span style="background:${colorPorcentaje}; color:white; padding:3px 8px; border-radius:10px; font-size:12px; font-weight:bold;">
                        ${item.porcentaje}%
                    </span>
                </td>
                <td style="font-weight:bold;">${item.unidades} Und</td>
                <td>
                    <button onclick="prepararEdicion(${index})" style="border:none; background:none; cursor:pointer; color:#3498db;"><i class="fas fa-edit"></i></button>
                    <button onclick="eliminarEmpaque(${index})" style="border:none; background:none; cursor:pointer; color:#e74c3c; margin-left:10px;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function prepararEdicion(index) {
    const inventario = JSON.parse(localStorage.getItem('Empaques')) || [];
    const item = inventario[index];

    document.getElementById('empaque-producto').value = item.producto;
    document.getElementById('empaque-entregado').value = item.entregado;
    document.getElementById('empaque-danado').value = item.danado;
    document.getElementById('empaque-unidades').value = item.unidades;

    document.getElementById('btn-guardar-empaque').innerHTML = '<i class="fas fa-sync"></i> Actualizar Registro';
    editandoIndex = index;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarEmpaque(index) {
    if (confirm("¿Desea eliminar este registro?")) {
        let inventario = JSON.parse(localStorage.getItem('Empaques')) || [];
        inventario.splice(index, 1);
        localStorage.setItem('Empaques', JSON.stringify(inventario));
        cargarEmpaques();
    }
}

function limpiarCampos() {
    document.getElementById('empaque-producto').value = "";
    document.getElementById('empaque-entregado').value = "";
    document.getElementById('empaque-danado').value = "";
    document.getElementById('empaque-unidades').value = "";
    editandoIndex = null;
}
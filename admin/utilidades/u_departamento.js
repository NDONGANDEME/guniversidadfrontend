// u_departamento.js - Utilidades para el módulo de departamentos
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_departamento {
    // ============================================
    // VALIDACIONES DE CAMPOS
    // ============================================
    
    // Validar nombre del departamento
    static validarNombre(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    // Validar facultad seleccionada
    static validarFacultad(valor) {
        return valor !== 'Ninguno' && valor !== '';
    }
    
    // ============================================
    // MANEJO DE FORMULARIO
    // ============================================
    
    // Limpiar formulario
    static limpiarFormulario() {
        document.getElementById('formDepartamento').reset();
        
        // Limpiar clases de validación
        document.querySelectorAll('#formDepartamento input, #formDepartamento select').forEach(campo => {
            campo.classList.remove('border-success', 'border-danger');
        });
        
        // Limpiar mensajes de error
        document.querySelectorAll('.errorMensaje').forEach(error => {
            error.textContent = '';
            error.classList.add('d-none');
        });
        
        // Resetear select
        document.getElementById('facultadesDepartamento').value = 'Ninguno';
    }
    
    // Obtener datos del formulario
    static obtenerDatosFormulario() {
        return {
            nombre: document.getElementById('nombreDepartamento').value.trim(),
            idFacultad: document.getElementById('facultadesDepartamento').value
        };
    }
    
    // Cargar facultades en el select
    static cargarSelectFacultades(selectId, facultades, valorSeleccionado = null) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="Ninguno">Seleccione la facultad ...</option>';
        
        facultades.forEach(facultad => {
            const option = document.createElement('option');
            option.value = facultad.idFacultad;
            option.textContent = facultad.nombreFacultad || facultad.nombre;
            
            if (valorSeleccionado && valorSeleccionado == facultad.idFacultad) {
                option.selected = true;
            }
            
            select.appendChild(option);
        });
    }
    
    // ============================================
    // UTILIDADES PARA LA TABLA
    // ============================================
    
    // Crear botones de acción para la tabla
    static crearBotonesAccion(departamento) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar" 
                        title="Editar" 
                        data-id="${departamento.idDepartamento}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        title="Deshabilitar" 
                        data-id="${departamento.idDepartamento}">
                    <i class="fas fa-ban"></i>
                </button>
            </div>
        `;
    }
    
    // Obtener nombre de la facultad por ID
    static obtenerNombreFacultad(facultades, idFacultad) {
        if (!idFacultad || idFacultad === 'Ninguno') return '<span class="text-muted">Ninguna</span>';
        
        const facultad = facultades.find(f => f.idFacultad == idFacultad);
        return facultad ? facultad.nombreFacultad || facultad.nombre : '<span class="text-muted">Desconocida</span>';
    }
}
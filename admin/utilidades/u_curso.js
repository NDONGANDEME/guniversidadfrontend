import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_curso {
    // ============================================
    // VALIDACIONES DE CAMPOS
    // ============================================
    
    // Validar nombre del curso
    static validarNombre(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    // Validar nivel del curso
    static validarNivel(valor) {
        if (valor === '' || valor === null) return false;
        const num = parseInt(valor);
        return !isNaN(num) && num >= 0;
    }
    
    // ============================================
    // MANEJO DE FORMULARIO
    // ============================================
    
    // Limpiar formulario
    static limpiarFormulario() {
        $('#formCurso')[0].reset();
        
        // Limpiar clases de validación
        $('#formCurso input').removeClass('border-success border-danger');
        
        // Limpiar mensajes de error
        $('.errorMensaje').text('').hide();
    }
    
    // Obtener datos del formulario
    static obtenerDatosFormulario() {
        return {
            nombre: $('#nombreCurso').val().trim(),
            nivel: $('#nivelCurso').val().trim()
        };
    }
    
    // Cargar datos en el formulario para edición
    static cargarFormularioEdicion(curso) {
        $('#nombreCurso').val(curso.nombreCurso || '');
        $('#nivelCurso').val(curso.nivel || '');
        
        // Forzar validaciones
        $('#nombreCurso').trigger('input');
        $('#nivelCurso').trigger('input');
    }
    
    // Configurar modo edición
    static configurarModoEdicion(modoEdicion) {
        if (modoEdicion) {
            $('.btnGuardarCurso').text('Actualizar Curso');
            if ($('#btnCancelarEdicion').length === 0) {
                $('.btnGuardarCurso').after(`
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicion">
                        <i class="fas fa-times me-1"></i> Cancelar
                    </button>
                `);
            }
        } else {
            $('.btnGuardarCurso').text('Guardar Curso');
            $('#btnCancelarEdicion').remove();
        }
    }
    
    // ============================================
    // UTILIDADES PARA LA TABLA
    // ============================================
    
    // Crear botones de acción para la tabla
    static crearBotonesAccion(idCurso, habilitado = true) {
        const claseBoton = habilitado ? 'btn-outline-danger' : 'btn-outline-success';
        const icono = habilitado ? 'fa-toggle-on' : 'fa-toggle-off';
        const titulo = habilitado ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar"
                        title="Editar" 
                        data-id="${idCurso}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseBoton} btn-toggle-estado" 
                        data-id="${idCurso}" 
                        title="${titulo}">
                    <i class="fas ${icono}"></i>
                </button>
            </div>
        `;
    }
    
    // Actualizar estado visual de una fila
    static actualizarEstadoFila(fila, habilitado) {
        const $fila = $(fila);
        const $boton = $fila.find('.btn-toggle-estado');
        const $icono = $boton.find('i');
        
        if (habilitado) {
            $fila.removeClass('text-muted bg-light');
            $fila.find('td:not(:last-child)').css('opacity', '1');
            $boton.removeClass('btn-outline-success').addClass('btn-outline-danger');
            $boton.attr('title', 'Deshabilitar');
            $icono.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        } else {
            $fila.addClass('text-muted bg-light');
            $fila.find('td:not(:last-child)').css('opacity', '0.6');
            $boton.removeClass('btn-outline-danger').addClass('btn-outline-success');
            $boton.attr('title', 'Habilitar');
            $icono.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        }
    }
    
    // Actualizar tabla
    static actualizarTabla(dataTable, cursos, generadorBotones) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (cursos.length === 0) {
            dataTable.draw();
            return;
        }
        
        cursos.forEach(curso => {
            const estado = curso.habilitado !== 0; // Asumiendo que existe campo habilitado
            
            dataTable.row.add([
                curso.nombreCurso || 'Sin nombre',
                curso.nivel || '0',
                generadorBotones(curso.idCurso, estado)
            ]);
        });
        
        dataTable.draw();
    }
}
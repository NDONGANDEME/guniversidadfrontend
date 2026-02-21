import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_aula {
    // ============================================
    // VALIDACIONES DE CAMPOS
    // ============================================
    
    // Validar nombre del aula
    static validarNombre(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    // Validar capacidad
    static validarCapacidad(valor) {
        if (valor === '' || valor === null) return false;
        const num = parseInt(valor);
        return !isNaN(num) && num > 0;
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
        $('#formAula')[0].reset();
        
        // Limpiar clases de validación
        $('#formAula input, #formAula select').removeClass('border-success border-danger');
        
        // Limpiar mensajes de error
        $('.errorMensaje').text('').hide();
        
        // Resetear select
        $('#facultadesAula').val('Ninguno');
    }
    
    // Obtener datos del formulario
    static obtenerDatosFormulario() {
        return {
            nombre: $('#nombreAula').val().trim(),
            capacidad: $('#capacidadAula').val().trim(), // Nota: el ID dice direccion pero es capacidad
            idFacultad: $('#facultadesAula').val()
        };
    }
    
    // Cargar datos en el formulario para edición
    static cargarFormularioEdicion(aula, facultades) {
        $('#nombreAula').val(aula.nombreAula || '');
        $('#capacidadAula').val(aula.capacidad || ''); // Nota: el ID dice direccion pero es capacidad
        
        // Seleccionar la facultad correspondiente
        if (aula.idFacultad) {
            $('#facultadesAula').val(aula.idFacultad);
        } else {
            $('#facultadesAula').val('Ninguno');
        }
        
        // Forzar validaciones
        $('#nombreAula').trigger('input');
        $('#capacidadAula').trigger('input');
        $('#facultadesAula').trigger('change');
    }
    
    // Cargar facultades en el select
    static cargarSelectFacultades(facultades, valorSeleccionado = null) {
        const select = $('#facultadesAula');
        select.empty();
        select.append('<option value="Ninguno">Seleccione la facultad ...</option>');
        
        facultades.forEach(facultad => {
            const option = $('<option></option>')
                .val(facultad.idFacultad)
                .text(facultad.nombreFacultad || facultad.nombre);
            
            if (valorSeleccionado && valorSeleccionado == facultad.idFacultad) {
                option.prop('selected', true);
            }
            
            select.append(option);
        });
    }
    
    // Configurar modo edición
    static configurarModoEdicion(modoEdicion) {
        if (modoEdicion) {
            $('#btnGuardarAula').text('Actualizar Aula');
            if ($('#btnCancelarEdicion').length === 0) {
                $('#btnGuardarAula').after(`
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicion">
                        <i class="fas fa-times me-1"></i> Cancelar
                    </button>
                `);
            }
        } else {
            $('#btnGuardarAula').text('Guardar Aula');
            $('#btnCancelarEdicion').remove();
        }
    }
    
    // ============================================
    // UTILIDADES PARA LA TABLA
    // ============================================
    
    // Crear botones de acción para la tabla
    static crearBotonesAccion(idAula, habilitado = true) {
        const claseBoton = habilitado ? 'btn-outline-danger' : 'btn-outline-success';
        const icono = habilitado ? 'fa-toggle-on' : 'fa-toggle-off';
        const titulo = habilitado ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar"
                        title="Editar" 
                        data-id="${idAula}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseBoton} btn-toggle-estado" 
                        data-id="${idAula}" 
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
    
    // Obtener nombre de la facultad por ID
    static obtenerNombreFacultad(facultades, idFacultad) {
        if (!idFacultad || idFacultad === 'Ninguno') return '<span class="text-muted">Ninguna</span>';
        
        const facultad = facultades.find(f => f.idFacultad == idFacultad);
        return facultad ? (facultad.nombreFacultad || facultad.nombre) : '<span class="text-muted">Desconocida</span>';
    }
    
    // Actualizar tabla
    static actualizarTabla(dataTable, aulas, facultades, generadorBotones) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (aulas.length === 0) {
            dataTable.draw();
            return;
        }
        
        aulas.forEach(aula => {
            const estado = aula.habilitado !== 0; // Asumiendo que existe campo habilitado
            const nombreFacultad = this.obtenerNombreFacultad(facultades, aula.idFacultad);
            
            dataTable.row.add([
                aula.nombreAula || 'Sin nombre',
                aula.capacidad || '0',
                nombreFacultad,
                generadorBotones(aula.idAula, estado)
            ]);
        });
        
        dataTable.draw();
    }
}
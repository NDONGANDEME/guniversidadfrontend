export class u_semestre {
    // ============================================
    // VALIDACIONES DE CAMPOS
    // ============================================
    
    // Validar número de semestre
    static validarNumero(valor) {
        if (valor === '' || valor === null) return false;
        const num = parseInt(valor);
        return !isNaN(num) && num > 0;
    }
    
    // Validar tipo de semestre
    static validarTipo(valor) {
        return valor === 'Par' || valor === 'Impar';
    }
    
    // ============================================
    // MANEJO DE FORMULARIO
    // ============================================
    
    // Limpiar formulario
    static limpiarFormulario() {
        $('#formSemestre')[0].reset();
        
        // Limpiar clases de validación
        $('#formSemestre input, #formSemestre select').removeClass('border-success border-danger');
        
        // Limpiar mensajes de error
        $('.errorMensaje').text('').hide();
        
        // Resetear select
        $('#tipoSemestre').val('Ninguno');
    }
    
    // Obtener datos del formulario
    static obtenerDatosFormulario() {
        return {
            numero: $('#numeroSemestre').val().trim(),
            tipo: $('#tipoSemestre').val()
        };
    }
    
    // Cargar datos en el formulario para edición
    static cargarFormularioEdicion(semestre) {
        $('#numeroSemestre').val(semestre.numeroSemestre || '');
        $('#tipoSemestre').val(semestre.tipoSemestre || 'Ninguno');
        
        // Forzar validaciones
        $('#numeroSemestre').trigger('input');
        $('#tipoSemestre').trigger('change');
    }
    
    // Configurar modo edición
    static configurarModoEdicion(modoEdicion) {
        if (modoEdicion) {
            $('#btnGuardarSemestre').text('Actualizar Semestre');
            if ($('#btnCancelarEdicion').length === 0) {
                $('#btnGuardarSemestre').after(`
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicion">
                        <i class="fas fa-times me-1"></i> Cancelar
                    </button>
                `);
            }
        } else {
            $('#btnGuardarSemestre').text('Guardar Semestre');
            $('#btnCancelarEdicion').remove();
        }
    }
    
    // ============================================
    // UTILIDADES PARA LA TABLA
    // ============================================
    
    // Crear botones de acción para la tabla
    static crearBotonesAccion(idSemestre, habilitado = true) {
        const claseBoton = habilitado ? 'btn-outline-danger' : 'btn-outline-success';
        const icono = habilitado ? 'fa-toggle-on' : 'fa-toggle-off';
        const titulo = habilitado ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar"
                        title="Editar" 
                        data-id="${idSemestre}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseBoton} btn-toggle-estado" 
                        data-id="${idSemestre}" 
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
    
    // Obtener badge para tipo de semestre
    static obtenerBadgeTipo(tipo) {
        if (tipo === 'Par') {
            return '<span class="badge bg-info">Par</span>';
        } else if (tipo === 'Impar') {
            return '<span class="badge bg-warning text-dark">Impar</span>';
        }
        return '<span class="badge bg-secondary">Desconocido</span>';
    }
    
    // Actualizar tabla
    static actualizarTabla(dataTable, semestres, generadorBotones) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (semestres.length === 0) {
            dataTable.draw();
            return;
        }
        
        semestres.forEach(semestre => {
            const estado = semestre.habilitado !== 0; // Asumiendo que existe campo habilitado
            const badgeTipo = this.obtenerBadgeTipo(semestre.tipoSemestre);
            
            dataTable.row.add([
                semestre.numeroSemestre || '0',
                badgeTipo,
                generadorBotones(semestre.idSemestre, estado)
            ]);
        });
        
        dataTable.draw();
    }
}
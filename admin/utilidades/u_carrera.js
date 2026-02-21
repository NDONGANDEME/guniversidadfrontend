import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_carrera {
    // ============================================
    // VALIDACIONES DE CAMPOS
    // ============================================
    
    // Validar nombre de la carrera
    static validarNombre(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    // Validar departamento seleccionado
    static validarDepartamento(valor) {
        return valor !== null && valor !== '';
    }
    
    // ============================================
    // MANEJO DE FORMULARIO
    // ============================================
    
    // Limpiar formulario
    static limpiarFormulario() {
        $('#formCarrera')[0].reset();
        
        // Limpiar clases de validación
        $('#formCarrera input, #formCarrera .combo-input').removeClass('border-success border-danger');
        
        // Limpiar mensajes de error
        $('.errorMensaje').text('').hide();
        
        // Limpiar combo input
        $('#comboDepartamentoCarrera').val('');
        $('#opcionesDepartamentosCarrera').empty();
    }
    
    // Obtener datos del formulario
    static obtenerDatosFormulario() {
        return {
            nombre: $('#nombreCarrera').val().trim(),
            idDepartamento: $('#comboDepartamentoCarrera').data('selected-id') || null
        };
    }
    
    // Cargar datos en el formulario para edición
    static cargarFormularioEdicion(carrera, departamentos) {
        $('#nombreCarrera').val(carrera.nombreCarrera || '');
        
        // Buscar el departamento correspondiente
        const departamento = departamentos.find(d => d.idDepartamento == carrera.idDepartamento);
        if (departamento) {
            $('#comboDepartamentoCarrera')
                .val(departamento.nombre)
                .data('selected-id', departamento.idDepartamento);
        }
        
        // Forzar validaciones
        $('#nombreCarrera').trigger('input');
    }
    
    // Configurar modo edición
    static configurarModoEdicion(modoEdicion) {
        if (modoEdicion) {
            $('#btnGuardarCarrera').text('Actualizar Carrera');
            if ($('#btnCancelarEdicion').length === 0) {
                $('#btnGuardarCarrera').after(`
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicion">
                        <i class="fas fa-times me-1"></i> Cancelar
                    </button>
                `);
            }
        } else {
            $('#btnGuardarCarrera').text('Guardar Carrera');
            $('#btnCancelarEdicion').remove();
        }
    }
    
    // ============================================
    // COMBO INPUT (SELECT MEJORADO)
    // ============================================
    
    // Inicializar combo input para departamentos
    static inicializarComboDepartamentos(departamentos, onSeleccionar) {
        const $comboInput = $('#comboDepartamentoCarrera');
        const $dropdownOptions = $('#opcionesDepartamentosCarrera');
        
        // Guardar referencia a los departamentos
        $comboInput.data('departamentos', departamentos);
        
        // Mostrar opciones al hacer focus
        $comboInput.off('focus').on('focus', () => {
            this.mostrarOpcionesDepartamentos(departamentos, $dropdownOptions, onSeleccionar);
        });
        
        // Filtrar opciones mientras se escribe
        $comboInput.off('input').on('input', function() {
            const searchTerm = $(this).val();
            u_carrera.filtrarOpcionesDepartamentos(searchTerm, departamentos, $dropdownOptions, onSeleccionar);
        });
        
        // Cerrar dropdown al hacer clic fuera
        $(document).off('click.combo').on('click.combo', function(e) {
            if (!$(e.target).closest('.combo-input-wrapper').length) {
                $dropdownOptions.removeClass('active');
            }
        });
        
        // Permitir limpiar selección con tecla Escape
        $comboInput.off('keydown').on('keydown', function(e) {
            if (e.key === 'Escape') {
                $dropdownOptions.removeClass('active');
            } else if (e.key === 'Enter' && $dropdownOptions.children().length > 0) {
                // Seleccionar el primer elemento con Enter
                const $firstOption = $dropdownOptions.children().first();
                if ($firstOption.length && !$firstOption.hasClass('no-results')) {
                    const id = $firstOption.data('id');
                    const nombre = $firstOption.data('nombre');
                    u_carrera.seleccionarDepartamento(id, nombre, $comboInput, $dropdownOptions, onSeleccionar);
                }
            }
        });
    }
    
    // Mostrar opciones de departamentos
    static mostrarOpcionesDepartamentos(departamentos, $dropdownOptions, onSeleccionar) {
        if (!departamentos || departamentos.length === 0) {
            $dropdownOptions.html('<div class="dropdown-option no-results">No hay departamentos disponibles</div>');
        } else {
            $dropdownOptions.empty();
            
            departamentos.forEach(depto => {
                const $option = $('<div class="dropdown-option"></div>')
                    .text(depto.nombre)
                    .data('id', depto.idDepartamento)
                    .data('nombre', depto.nombre);
                
                $option.on('click', function() {
                    const id = $(this).data('id');
                    const nombre = $(this).data('nombre');
                    u_carrera.seleccionarDepartamento(id, nombre, $('#comboDepartamentoCarrera'), $dropdownOptions, onSeleccionar);
                });
                
                $dropdownOptions.append($option);
            });
        }
        
        $dropdownOptions.addClass('active');
    }
    
    // Filtrar opciones de departamentos
    static filtrarOpcionesDepartamentos(searchTerm, departamentos, $dropdownOptions, onSeleccionar) {
        $dropdownOptions.empty();
        
        if (!departamentos || departamentos.length === 0) {
            $dropdownOptions.append('<div class="dropdown-option no-results">No hay departamentos disponibles</div>');
            $dropdownOptions.addClass('active');
            return;
        }
        
        const searchLower = searchTerm.toLowerCase();
        const filtered = departamentos.filter(depto => 
            depto.nombre.toLowerCase().includes(searchLower)
        );
        
        if (filtered.length === 0) {
            $dropdownOptions.append('<div class="dropdown-option no-results">No se encontraron departamentos</div>');
        } else {
            filtered.forEach(depto => {
                const $option = $('<div class="dropdown-option"></div>')
                    .text(depto.nombre)
                    .data('id', depto.idDepartamento)
                    .data('nombre', depto.nombre);
                
                $option.on('click', function() {
                    const id = $(this).data('id');
                    const nombre = $(this).data('nombre');
                    u_carrera.seleccionarDepartamento(id, nombre, $('#comboDepartamentoCarrera'), $dropdownOptions, onSeleccionar);
                });
                
                $dropdownOptions.append($option);
            });
        }
        
        $dropdownOptions.addClass('active');
    }
    
    // Seleccionar un departamento del combo
    static seleccionarDepartamento(id, nombre, $comboInput, $dropdownOptions, onSeleccionar) {
        $comboInput.val(nombre).data('selected-id', id);
        $dropdownOptions.removeClass('active');
        
        // Aplicar estilo de éxito
        $comboInput.removeClass('border-danger').addClass('border-success');
        
        // Llamar callback
        if (onSeleccionar) onSeleccionar(id, nombre);
    }
    
    // ============================================
    // UTILIDADES PARA LA TABLA
    // ============================================
    
    // Crear botones de acción para la tabla
    static crearBotonesAccion(idCarrera, habilitado = true) {
        const claseBoton = habilitado ? 'btn-outline-danger' : 'btn-outline-success';
        const icono = habilitado ? 'fa-toggle-on' : 'fa-toggle-off';
        const titulo = habilitado ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar"
                        title="Editar" 
                        data-id="${idCarrera}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseBoton} btn-toggle-estado" 
                        data-id="${idCarrera}" 
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
    
    // Obtener nombre del departamento por ID
    static obtenerNombreDepartamento(departamentos, idDepartamento) {
        if (!idDepartamento) return '<span class="text-muted">Ninguno</span>';
        
        const depto = departamentos.find(d => d.idDepartamento == idDepartamento);
        return depto ? depto.nombre : '<span class="text-muted">Desconocido</span>';
    }
    
    // Actualizar tabla
    static actualizarTabla(dataTable, carreras, departamentos, generadorBotones) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (carreras.length === 0) {
            dataTable.draw();
            return;
        }
        
        carreras.forEach(carrera => {
            const nombreDepto = this.obtenerNombreDepartamento(departamentos, carrera.idDepartamento);
            const estado = carrera.habilitado !== 0; // Asumiendo que existe campo habilitado
            
            dataTable.row.add([
                carrera.nombreCarrera || 'Sin nombre',
                nombreDepto,
                generadorBotones(carrera.idCarrera, estado)
            ]);
        });
        
        dataTable.draw();
    }
}
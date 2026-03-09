import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class u_estudiante {
    
    // ========== VARIABLES ESTÁTICAS ==========
    static asignaturasDisponibles = [];
    static filteredAsignaturas = [];
    static asignaturasSemestre = [];
    static asignaturasPendientes = [];
    static asignaturasBloqueadas = [];
    static asignaturasAsignar = [];
    static creditosMaximos = 30;
    static creditosActuales = 0;
    static estudianteActual = null;
    static matriculaActual = null;
    
    // ========== MANEJO DE ASIGNATURAS (COMBO) ==========
    static inicializarComboAsignaturas() {
        const input = $('#asignaturasConvalidacion');
        const dropdown = $('#opcionesAsignaturasConvalidacion');

        input.off('focus').on('focus', function() {
            u_estudiante.mostrarDropdownAsignaturas();
        });

        input.off('keyup').on('keyup', function(e) {
            if (e.key === 'Escape') {
                u_estudiante.ocultarDropdownAsignaturas();
            } else {
                u_estudiante.filtrarAsignaturas($(this).val());
            }
        });

        // Cerrar al hacer clic fuera
        $(document).off('click').on('click', function(e) {
            if (!$(e.target).closest('.combo-input-wrapper').length) {
                u_estudiante.ocultarDropdownAsignaturas();
            }
        });
    }

    static cargarAsignaturasEnCombo(asignaturas) {
        u_estudiante.asignaturasDisponibles = asignaturas || [];
        u_estudiante.filteredAsignaturas = asignaturas || [];
        u_estudiante.renderizarDropdownAsignaturas();
    }

    static filtrarAsignaturas(searchTerm) {
        const term = searchTerm.toLowerCase();
        u_estudiante.filteredAsignaturas = u_estudiante.asignaturasDisponibles.filter(a => 
            a.nombreAsignatura?.toLowerCase().includes(term) || 
            a.codigoAsignatura?.toLowerCase().includes(term)
        );
        u_estudiante.renderizarDropdownAsignaturas();
        u_estudiante.mostrarDropdownAsignaturas();
    }

    static renderizarDropdownAsignaturas() {
        const dropdown = $('#opcionesAsignaturasConvalidacion');
        dropdown.empty();

        if (u_estudiante.filteredAsignaturas.length === 0) {
            dropdown.append('<div class="dropdown-option no-results">No se encontraron asignaturas</div>');
        } else {
            u_estudiante.filteredAsignaturas.forEach(a => {
                const option = $(`<div class="dropdown-option" data-id="${a.idAsignatura}">${a.codigoAsignatura || ''} - ${a.nombreAsignatura || ''} (${a.creditos || 0} créd.)</div>`);
                option.on('click', function() {
                    u_estudiante.seleccionarAsignaturaConvalidacion(a);
                });
                dropdown.append(option);
            });
        }
    }

    static mostrarDropdownAsignaturas() {
        $('#opcionesAsignaturasConvalidacion').addClass('active');
    }

    static ocultarDropdownAsignaturas() {
        $('#opcionesAsignaturasConvalidacion').removeClass('active');
    }

    static seleccionarAsignaturaConvalidacion(asignatura) {
        $('#asignaturasConvalidacion').val(`${asignatura.codigoAsignatura || ''} - ${asignatura.nombreAsignatura || ''}`);
        $('#asignaturasConvalidacion').data('selected', asignatura.idAsignatura);
        $('#asignaturasConvalidacion').data('asignatura', asignatura);
        u_estudiante.ocultarDropdownAsignaturas();
        
        // Validar campo
        u_utiles.colorearCampo(true, '#asignaturasConvalidacion', '#errorAsignaturasConvalidacion', '');
    }

    // ========== MANEJO DE ASIGNATURAS EN CONTENEDORES ==========
    
    static cargarAsignaturasSemestre(asignaturas) {
        u_estudiante.asignaturasSemestre = asignaturas || [];
        u_estudiante.renderizarAsignaturasSemestre();
    }

    static renderizarAsignaturasSemestre() {
        const contenedor = $('#contenedorAsignaturasSemestre');
        contenedor.empty();

        if (u_estudiante.asignaturasSemestre.length === 0) {
            contenedor.html('<div class="text-center p-3 text-muted">No hay asignaturas en este semestre</div>');
            return;
        }

        let html = '<div class="list-group">';
        
        u_estudiante.asignaturasSemestre.forEach(asig => {
            // Verificar si ya está en asignadas
            const yaAsignada = u_estudiante.asignaturasAsignar.some(a => a.idPlanSemestreAsignatura == asig.idPlanSemestreAsignatura);
            const claseDeshabilitada = yaAsignada ? 'disabled opacity-50' : '';
            const puedeArrastrar = !yaAsignada && (u_estudiante.creditosActuales + (asig.creditos || 0) <= u_estudiante.creditosMaximos);
            
            html += `
                <div class="list-group-item list-group-item-action ${claseDeshabilitada} asignatura-item" 
                     data-id="${asig.idPlanSemestreAsignatura}" 
                     data-creditos="${asig.creditos || 0}"
                     data-nombre="${asig.nombreAsignatura || ''}"
                     data-codigo="${asig.codigoAsignatura || ''}"
                     draggable="${puedeArrastrar}"
                     ondragstart="u_estudiante.dragStart(event)">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${asig.codigoAsignatura || ''}</strong> - ${asig.nombreAsignatura || ''}
                            <br><small class="text-muted">${asig.creditos || 0} créditos</small>
                        </div>
                        ${yaAsignada ? '<span class="badge bg-success">Asignada</span>' : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        contenedor.html(html);
    }

    static cargarAsignaturasPendientesYBloqueadas(pendientes, bloqueadas) {
        u_estudiante.asignaturasPendientes = pendientes || [];
        u_estudiante.asignaturasBloqueadas = bloqueadas || [];
        u_estudiante.renderizarAsignaturasPendientesYBloqueadas();
    }

    static renderizarAsignaturasPendientesYBloqueadas() {
        const contenedor = $('#contenedorAsignaturasPendienteYBloqueadas');
        contenedor.empty();

        const todas = [...u_estudiante.asignaturasPendientes, ...u_estudiante.asignaturasBloqueadas];
        
        if (todas.length === 0) {
            contenedor.html('<div class="text-center p-3 text-muted">No hay asignaturas pendientes o bloqueadas</div>');
            return;
        }

        let html = '<div class="list-group">';
        
        todas.forEach(asig => {
            const esBloqueada = u_estudiante.asignaturasBloqueadas.some(b => b.idPlanSemestreAsignatura == asig.idPlanSemestreAsignatura);
            const claseBloqueada = esBloqueada ? 'list-group-item-danger' : '';
            const yaAsignada = u_estudiante.asignaturasAsignar.some(a => a.idPlanSemestreAsignatura == asig.idPlanSemestreAsignatura);
            const claseDeshabilitada = yaAsignada ? 'disabled opacity-50' : '';
            const puedeArrastrar = !yaAsignada && !esBloqueada && (u_estudiante.creditosActuales + (asig.creditos || 0) <= u_estudiante.creditosMaximos);
            
            html += `
                <div class="list-group-item list-group-item-action ${claseBloqueada} ${claseDeshabilitada} asignatura-item" 
                     data-id="${asig.idPlanSemestreAsignatura}" 
                     data-creditos="${asig.creditos || 0}"
                     data-nombre="${asig.nombreAsignatura || ''}"
                     data-codigo="${asig.codigoAsignatura || ''}"
                     data-es-bloqueada="${esBloqueada}"
                     draggable="${puedeArrastrar}"
                     ondragstart="u_estudiante.dragStart(event)">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${asig.codigoAsignatura || ''}</strong> - ${asig.nombreAsignatura || ''}
                            <br><small class="text-muted">${asig.creditos || 0} créditos</small>
                            ${esBloqueada ? '<br><small class="text-danger">Bloqueada</small>' : ''}
                        </div>
                        ${yaAsignada ? '<span class="badge bg-success">Asignada</span>' : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        contenedor.html(html);
    }

    static renderizarAsignaturasAsignar() {
        const contenedor = $('#contenedorAsignaturasAsignar');
        
        if (u_estudiante.asignaturasAsignar.length === 0) {
            contenedor.html('<div class="text-center p-3 text-muted">Arrastre asignaturas aquí</div>');
            $('#totalCreditos').text('0');
            return;
        }

        let html = '<div class="list-group" id="listaAsignaturasAsignar">';
        let totalCreditos = 0;
        
        u_estudiante.asignaturasAsignar.forEach((asig, index) => {
            totalCreditos += asig.creditos || 0;
            
            html += `
                <div class="list-group-item d-flex justify-content-between align-items-center" data-id="${asig.idPlanSemestreAsignatura}">
                    <div>
                        <strong>${asig.codigoAsignatura || ''}</strong> - ${asig.nombreAsignatura || ''}
                        <br><small class="text-muted">${asig.creditos || 0} créditos</small>
                    </div>
                    <button class="btn btn-sm btn-outline-danger btn-eliminar-asignatura" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        html += '</div>';
        contenedor.html(html);
        
        u_estudiante.creditosActuales = totalCreditos;
        $('#totalCreditos').text(totalCreditos);
        
        // Actualizar estado de arrastre en otros contenedores
        u_estudiante.actualizarEstadoArrastre();
        
        // Agregar eventos a botones eliminar
        $('.btn-eliminar-asignatura').off('click').on('click', function() {
            const index = $(this).data('index');
            u_estudiante.eliminarAsignaturaAsignar(index);
        });
    }

    static actualizarEstadoArrastre() {
        // Actualizar contenedor de semestre
        $('.asignatura-item').each(function() {
            const $this = $(this);
            const id = $this.data('id');
            const creditos = $this.data('creditos');
            const esBloqueada = $this.data('es-bloqueada') === 'true';
            
            const yaAsignada = u_estudiante.asignaturasAsignar.some(a => a.idPlanSemestreAsignatura == id);
            const puedeArrastrar = !yaAsignada && !esBloqueada && (u_estudiante.creditosActuales + creditos <= u_estudiante.creditosMaximos);
            
            if (yaAsignada) {
                $this.addClass('disabled opacity-50');
                $this.attr('draggable', 'false');
            } else {
                $this.removeClass('disabled opacity-50');
                $this.attr('draggable', puedeArrastrar ? 'true' : 'false');
            }
        });
    }

    static dragStart(event) {
        const element = event.target.closest('.asignatura-item');
        if (!element) return;
        
        const id = $(element).data('id');
        const creditos = $(element).data('creditos');
        const nombre = $(element).data('nombre');
        const codigo = $(element).data('codigo');
        const esBloqueada = $(element).data('es-bloqueada');
        
        // No permitir arrastrar si está bloqueada
        if (esBloqueada) {
            event.preventDefault();
            return;
        }
        
        // Verificar límite de créditos
        if (u_estudiante.creditosActuales + creditos > u_estudiante.creditosMaximos) {
            event.preventDefault();
            Alerta.advertencia('Límite de créditos', `No puede superar los ${u_estudiante.creditosMaximos} créditos`);
            return;
        }
        
        event.dataTransfer.setData('text/plain', JSON.stringify({
            idPlanSemestreAsignatura: id,
            creditos: creditos,
            nombreAsignatura: nombre,
            codigoAsignatura: codigo
        }));
        
        event.dataTransfer.effectAllowed = 'move';
    }

    static allowDrop(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    static dropAsignar(event) {
        event.preventDefault();
        
        const dataStr = event.dataTransfer.getData('text/plain');
        if (!dataStr) return;
        
        try {
            const asignatura = JSON.parse(dataStr);
            
            // Verificar si ya está asignada
            if (u_estudiante.asignaturasAsignar.some(a => a.idPlanSemestreAsignatura == asignatura.idPlanSemestreAsignatura)) {
                Alerta.advertencia('Duplicado', 'Esta asignatura ya está en la lista de asignar');
                return;
            }
            
            // Verificar límite de créditos
            if (u_estudiante.creditosActuales + asignatura.creditos > u_estudiante.creditosMaximos) {
                Alerta.advertencia('Límite de créditos', `No puede superar los ${u_estudiante.creditosMaximos} créditos`);
                return;
            }
            
            u_estudiante.asignaturasAsignar.push(asignatura);
            u_estudiante.renderizarAsignaturasAsignar();
            
        } catch (e) {
            console.error('Error al procesar asignatura:', e);
        }
    }

    static eliminarAsignaturaAsignar(index) {
        u_estudiante.asignaturasAsignar.splice(index, 1);
        u_estudiante.renderizarAsignaturasAsignar();
    }

    static limpiarAsignaturasAsignar() {
        u_estudiante.asignaturasAsignar = [];
        u_estudiante.creditosActuales = 0;
        u_estudiante.renderizarAsignaturasAsignar();
    }

    // ========== ACTUALIZAR DATOS DE ASIGNATURA SELECCIONADA ==========
    static actualizarDatosAsignatura(asignatura) {
        if (!asignatura) {
            $('#convocatoriaAsignacion').val('').prop('disabled', true);
            $('#vecesMatriculadoAsignacion').val('').prop('disabled', true);
            $('#notaFinalAsignacion').val('').prop('disabled', true);
            return;
        }
        
        $('#convocatoriaAsignacion').val(asignatura.convocatoria || 0).prop('disabled', false);
        $('#vecesMatriculadoAsignacion').val(asignatura.numeroVecesMatriculado || 0).prop('disabled', false);
        $('#notaFinalAsignacion').val(asignatura.notaFinal || 0).prop('disabled', false);
    }

    // ========== MANEJO DE CONVALIDACIONES ==========
    static agregarFilaConvalidacion() {
        const asignaturaId = $('#asignaturasConvalidacion').data('selected');
        const nota = $('#notaConvalidacion').val().trim();
        
        if (!asignaturaId) {
            Alerta.advertencia('Campo requerido', 'Seleccione una asignatura');
            return;
        }
        
        if (!nota || nota < 0 || nota > 10) {
            Alerta.advertencia('Nota inválida', 'La nota debe estar entre 0 y 10');
            return;
        }
        
        // Obtener datos de la asignatura seleccionada
        const asignatura = u_estudiante.asignaturasDisponibles.find(a => a.idAsignatura == asignaturaId);
        
        if (!asignatura) return;
        
        // Crear fila en el formulario
        const filaHtml = `
            <div class="row mt-2 fila-convalidacion" data-asignatura-id="${asignaturaId}">
                <div class="col-10">
                    <input type="text" class="form-control" value="${asignatura.codigoAsignatura || ''} - ${asignatura.nombreAsignatura || ''}" readonly>
                </div>
                <div class="col-2">
                    <div class="d-flex">
                        <input type="number" class="form-control nota-convalidacion" value="${nota}" min="0" max="10" step="0.1" readonly>
                        <button class="btn btn-sm btn-outline-danger ms-1 btn-eliminar-convalidacion" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        $('#formConvalidacion').append(filaHtml);
        
        // Limpiar selección
        $('#asignaturasConvalidacion').val('').removeData('selected').removeData('asignatura');
        $('#notaConvalidacion').val('');
        
        // Actualizar eventos
        $('.btn-eliminar-convalidacion').off('click').on('click', function() {
            $(this).closest('.fila-convalidacion').remove();
        });
    }

    static limpiarConvalidaciones() {
        $('.fila-convalidacion').remove();
        $('#asignaturasConvalidacion').val('').removeData('selected').removeData('asignatura');
        $('#notaConvalidacion').val('');
    }

    // ========== GENERAR BOTONES PARA TABLA ==========
    static generarBotonesEstudiante(idMatricula) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-success convalidar" title="Convalidar" data-id="${idMatricula}">
                    <i class="fas fa-check-circle"></i>
                </button>
                <button class="btn btn-sm btn-outline-info ver-detalles" title="Ver detalles" data-id="${idMatricula}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning asignar" title="Asignar asignaturas" data-id="${idMatricula}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    // ========== ACTUALIZAR TABLA DE ESTUDIANTES ==========
    static actualizarTablaEstudiantes(dataTable, estudiantes) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (!estudiantes || estudiantes.length === 0) {
            dataTable.draw();
            return;
        }

        estudiantes.forEach(e => {
            const fila = [
                e.nombreCompleto || `${e.nombre || ''} ${e.apellidos || ''}`,
                e.carrera || 'Sin carrera',
                e.curso || 'Sin curso',
                e.semestre || '0',
                e.numAsignaturas || '0',
                u_estudiante.generarBotonesEstudiante(e.idMatricula)
            ];
            
            dataTable.row.add(fila).draw(false);
        });
        
        dataTable.draw();
    }

    // ========== GENERAR HTML PARA DETALLES ==========
    static generarDetallesEstudianteHTML(estudiante, matricula, planEstudio, carrera, curso, semestre) {
        return `
            <div class="border border-2 border-black rounded-2 p-3">
                <div class="mb-3">
                    <label class="form-label fw-bold">Nombre del estudiante:</label>
                    <span class="ms-2" id="nombreCompletoDetalle">${estudiante.nombre || ''} ${estudiante.apellidos || ''}</span>
                </div>

                <div class="row">
                    <div class="col-6 mb-2">
                        <label class="form-label fw-bold">Plan de estudios:</label>
                        <span class="ms-2" id="planEstudioDetalle">${planEstudio?.nombre || 'No disponible'}</span>
                    </div>
                    <div class="col-6 mb-2">
                        <label class="form-label fw-bold">Carrera:</label>
                        <span class="ms-2" id="carreraDetalle">${carrera?.nombreCarrera || 'No disponible'}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-6 mb-2">
                        <label class="form-label fw-bold">Curso:</label>
                        <span class="ms-2" id="cursoDetalle">${curso?.nombreCurso || 'No disponible'}</span>
                    </div>
                    <div class="col-6 mb-2">
                        <label class="form-label fw-bold">Semestre:</label>
                        <span class="ms-2" id="semestreDetalle">${semestre?.numeroSemestre || 'No disponible'}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-4 mb-2">
                        <label class="form-label fw-bold">Convocatorias:</label>
                        <span class="ms-2" id="convocatoriaDetalle">${matricula?.convocatoria || '0'}</span>
                    </div>
                    <div class="col-4 mb-2">
                        <label class="form-label fw-bold">Veces matriculado:</label>
                        <span class="ms-2" id="vecesMatriculadoDetalle">${matricula?.numeroVecesMatriculado || '0'}</span>
                    </div>
                    <div class="col-4 mb-2">
                        <label class="form-label fw-bold">Nota final:</label>
                        <span class="ms-2" id="notaFinalDetalle">${matricula?.notaFinal || '0'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== LIMPIAR MODAL ==========
    static limpiarModalAsignacion() {
        u_estudiante.asignaturasSemestre = [];
        u_estudiante.asignaturasPendientes = [];
        u_estudiante.asignaturasBloqueadas = [];
        u_estudiante.limpiarAsignaturasAsignar();
        
        $('#contenedorAsignaturasSemestre').empty();
        $('#contenedorAsignaturasPendienteYBloqueadas').empty();
        
        $('#convocatoriaAsignacion').val('').prop('disabled', true);
        $('#vecesMatriculadoAsignacion').val('').prop('disabled', true);
        $('#notaFinalAsignacion').val('').prop('disabled', true);
    }

    static limpiarModalConvalidacion() {
        u_estudiante.limpiarConvalidaciones();
        $('#asignaturasConvalidacion').val('').removeData('selected').removeData('asignatura');
        $('#notaConvalidacion').val('');
    }
}
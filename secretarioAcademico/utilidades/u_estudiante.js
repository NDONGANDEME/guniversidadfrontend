import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class u_estudiante {
    
    // ========== VARIABLES ESTÁTICAS ==========
    static asignaturasSeleccionadas = [];
    static maxCreditos = 30;
    static creditosActuales = 0;

    // ========== VALIDACIONES ==========
    static validarCreditos(creditos) {
        return this.creditosActuales + creditos <= this.maxCreditos;
    }

    // ========== CARGAR DATOS ESPECÍFICOS DEL ESTUDIANTE ==========
    static cargarDatosEspecificosEstudiante(datos) {
        if (!datos) return;

        // Cargar datos en el modal de detalles
        $('#nombreCompletoDetalle').text(datos.nombreCompleto || '');
        $('#planEstudioDetalle').text(datos.planEstudio || '');
        $('#carreraDetalle').text(datos.carrera || '');
        $('#cursoDetalle').text(datos.curso || '');
        $('#semestreDetalle').text(datos.semestre || '');
        
        // Estos se cargarán cuando se abra el modal de asignación
        $('#convocatoriaDetalle').text(datos.convocatoria || '0');
        $('#vecesMatriculadoDetalle').text(datos.vecesMatriculado || '0');
        $('#notaFinalDetalle').text(datos.notaFinal || '0');
    }

    // ========== CARGAR ASIGNATURAS DEL SEMESTRE ==========
    static cargarAsignaturasSemestre(asignaturas, semestreActual) {
        const contenedor = $('#contenedorAsignaturasSemestre');
        contenedor.empty();

        if (!asignaturas || asignaturas.length === 0) {
            contenedor.html('<div class="alert alert-info m-2">No hay asignaturas para este semestre</div>');
            return;
        }

        let html = '<div class="list-group">';
        asignaturas.forEach(asig => {
            html += `
                <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                     data-id="${asig.idPlanSemestreAsignatura}"
                     data-nombre="${asig.nombreAsignatura}"
                     data-creditos="${asig.creditos}">
                    <div>
                        <strong>${asig.codigo || ''}</strong> - ${asig.nombreAsignatura}
                        <br><small class="text-muted">${asig.creditos} créditos</small>
                    </div>
                    <button class="btn btn-sm btn-success btn-agregar-asignatura">
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            `;
        });
        html += '</div>';
        
        contenedor.html(html);
    }

    // ========== CARGAR ASIGNATURAS PENDIENTES Y BLOQUEADAS ==========
    static cargarAsignaturasPendientesYBloqueadas(asignaturas) {
        const contenedor = $('#contenedorAsignaturasPendienteYBloqueadas');
        contenedor.empty();

        if (!asignaturas || asignaturas.length === 0) {
            contenedor.html('<div class="alert alert-info m-2">No hay asignaturas pendientes o bloqueadas</div>');
            return;
        }

        // Separar por tipo
        const pendientes = asignaturas.filter(a => a.estado === 'pendiente' || !a.estado);
        const bloqueadas = asignaturas.filter(a => a.estado === 'bloqueada');

        let html = '<div class="accordion" id="accordionPendientesBloqueadas">';
        
        // Pendientes
        if (pendientes.length > 0) {
            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePendientes">
                            Asignaturas Pendientes (${pendientes.length})
                        </button>
                    </h2>
                    <div id="collapsePendientes" class="accordion-collapse collapse" data-bs-parent="#accordionPendientesBloqueadas">
                        <div class="accordion-body">
                            <div class="list-group">
            `;
            
            pendientes.forEach(asig => {
                html += `
                    <div class="list-group-item d-flex justify-content-between align-items-center"
                         data-id="${asig.idPlanSemestreAsignatura}">
                        <div>
                            <strong>${asig.codigo || ''}</strong> - ${asig.nombreAsignatura}
                            <br><small class="text-muted">${asig.creditos} créditos</small>
                        </div>
                        <span class="badge bg-warning">Pendiente</span>
                    </div>
                `;
            });
            
            html += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        // Bloqueadas
        if (bloqueadas.length > 0) {
            html += `
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseBloqueadas">
                            Asignaturas Bloqueadas (${bloqueadas.length})
                        </button>
                    </h2>
                    <div id="collapseBloqueadas" class="accordion-collapse collapse" data-bs-parent="#accordionPendientesBloqueadas">
                        <div class="accordion-body">
                            <div class="list-group">
            `;
            
            bloqueadas.forEach(asig => {
                html += `
                    <div class="list-group-item d-flex justify-content-between align-items-center"
                         data-id="${asig.idPlanSemestreAsignatura}">
                        <div>
                            <strong>${asig.codigo || ''}</strong> - ${asig.nombreAsignatura}
                            <br><small class="text-muted">${asig.creditos} créditos</small>
                        </div>
                        <span class="badge bg-danger">Bloqueada</span>
                    </div>
                `;
            });
            
            html += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        contenedor.html(html);
    }

    // ========== ACTUALIZAR ASIGNATURAS A ASIGNAR ==========
    static actualizarAsignaturasAsignar() {
        const contenedor = $('#contenedorAsignaturasAsignar');
        contenedor.empty();

        if (this.asignaturasSeleccionadas.length === 0) {
            contenedor.html('<div class="alert alert-info">No hay asignaturas seleccionadas</div>');
            $('#totalCreditos').text('0');
            return;
        }

        let html = '<div class="list-group">';
        this.creditosActuales = 0;

        this.asignaturasSeleccionadas.forEach((asig, index) => {
            this.creditosActuales += asig.creditos;
            html += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${asig.codigo || ''}</strong> - ${asig.nombreAsignatura}
                        <br><small class="text-muted">${asig.creditos} créditos</small>
                    </div>
                    <button class="btn btn-sm btn-danger btn-quitar-asignatura" data-index="${index}">
                        <i class="fas fa-times"></i> Quitar
                    </button>
                </div>
            `;
        });
        html += '</div>';

        contenedor.html(html);
        $('#totalCreditos').text(this.creditosActuales);
    }

    // ========== AGREGAR ASIGNATURA A SELECCIONADAS ==========
    static agregarAsignatura(elemento) {
        const item = $(elemento).closest('.list-group-item');
        const id = item.data('id');
        const nombre = item.data('nombre');
        const creditos = item.data('creditos');

        // Validar créditos
        if (!this.validarCreditos(creditos)) {
            alert(`No puede superar el máximo de ${this.maxCreditos} créditos`);
            return false;
        }

        // Verificar si ya está seleccionada
        if (this.asignaturasSeleccionadas.some(a => a.id === id)) {
            alert('Esta asignatura ya está seleccionada');
            return false;
        }

        this.asignaturasSeleccionadas.push({
            id: id,
            nombre: nombre,
            creditos: creditos
        });

        this.actualizarAsignaturasAsignar();
        return true;
    }

    // ========== QUITAR ASIGNATURA DE SELECCIONADAS ==========
    static quitarAsignatura(index) {
        this.asignaturasSeleccionadas.splice(index, 1);
        this.actualizarAsignaturasAsignar();
    }

    // ========== LIMPIAR SELECCIÓN ==========
    static limpiarSeleccion() {
        this.asignaturasSeleccionadas = [];
        this.creditosActuales = 0;
        this.actualizarAsignaturasAsignar();
    }

    // ========== CARGAR DATOS EN MODAL DE ASIGNACIÓN ==========
    static cargarDatosEnModalAsignacion(datos) {
        if (!datos) return;

        $('#convocatoriaAsignacion').val(datos.convocatoria || '0');
        $('#vecesMatriculadoAsignacion').val(datos.vecesMatriculado || '0');
        $('#notaFinalAsignacion').val(datos.notaFinal || '0');
    }

    // ========== GENERAR BOTONES PARA TABLA ==========
    static generarBotonesEstudiante(idMatricula, idEstudiante) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-info ver-detalles-estudiante" 
                        title="Ver detalles" 
                        data-id="${idMatricula}"
                        data-estudiante="${idEstudiante}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning asignar-asignaturas" 
                        title="Asignar asignaturas" 
                        data-id="${idMatricula}"
                        data-estudiante="${idEstudiante}">
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
                e.nombreCompleto || 'Sin nombre',
                e.carrera || 'Sin carrera',
                e.curso || 'Sin curso',
                e.semestre || '0',
                e.numeroAsignaturas || '0',
                this.generarBotonesEstudiante(e.idMatricula, e.idEstudiante)
            ];
            
            dataTable.row.add(fila).draw(false);
        });
        
        dataTable.draw();
    }

    // ========== GENERAR HTML PARA DETALLES ==========
    static generarDetallesEstudianteHTML(datos) {
        if (!datos) return '<div class="alert alert-warning">No hay datos disponibles</div>';

        let asignaturasHTML = '';
        if (datos.asignaturas && datos.asignaturas.length > 0) {
            asignaturasHTML = '<h6 class="mt-3">Asignaturas matriculadas:</h6><ul class="list-group">';
            datos.asignaturas.forEach(asig => {
                asignaturasHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        ${asig.nombreAsignatura}
                        <span class="badge bg-${asig.estado === 'aprobada' ? 'success' : 'warning'}">
                            ${asig.estado || 'cursando'}
                        </span>
                    </li>
                `;
            });
            asignaturasHTML += '</ul>';
        }

        return `
            <div class="border border-2 border-black rounded-2 p-3">
                <h5 class="border-bottom pb-2">Información Personal</h5>
                <p><strong>Nombre:</strong> ${datos.nombreCompleto}</p>
                <p><strong>Código:</strong> ${datos.codigoEstudiante || 'N/A'}</p>
                
                <h5 class="border-bottom pb-2 mt-3">Información Académica</h5>
                <p><strong>Plan de Estudios:</strong> ${datos.planEstudio}</p>
                <p><strong>Carrera:</strong> ${datos.carrera}</p>
                <p><strong>Curso:</strong> ${datos.curso} - Semestre ${datos.semestre}</p>
                
                <div class="row">
                    <div class="col-4">
                        <p><strong>Convocatorias:</strong> ${datos.convocatoria || '0'}</p>
                    </div>
                    <div class="col-4">
                        <p><strong>Veces matriculado:</strong> ${datos.vecesMatriculado || '0'}</p>
                    </div>
                    <div class="col-4">
                        <p><strong>Nota final:</strong> ${datos.notaFinal || '0'}</p>
                    </div>
                </div>
                
                ${asignaturasHTML}
            </div>
        `;
    }

    // ========== LIMPIAR MODALES ==========
    static limpiarModalAsignacion() {
        $('#convocatoriaAsignacion').val('');
        $('#vecesMatriculadoAsignacion').val('');
        $('#notaFinalAsignacion').val('');
        $('#contenedorAsignaturasSemestre').empty();
        $('#contenedorAsignaturasPendienteYBloqueadas').empty();
        this.limpiarSeleccion();
    }

    static limpiarModalDetalles() {
        $('#nombreCompletoDetalle').text('');
        $('#planEstudioDetalle').text('');
        $('#carreraDetalle').text('');
        $('#cursoDetalle').text('');
        $('#semestreDetalle').text('');
        $('#convocatoriaDetalle').text('');
        $('#vecesMatriculadoDetalle').text('');
        $('#notaFinalDetalle').text('');
    }
}
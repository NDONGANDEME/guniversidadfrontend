import { u_planEstudio } from "./u_planEstudio.js";

/**
 * Utilidades específicas para el formulario de Planes de Estudio
 * Contiene funciones de validación, renderizado y manejo de UI
 */
export class u_formularioPlanEstudio {
    
    /**
     * OBTENER PARÁMETROS DE URL
     */
    static obtenerParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const modo = urlParams.get('modo') || 'crear';
        const id = urlParams.get('id');
        return { modo, id };
    }

    /**
     * CONFIGURAR INTERFAZ SEGÚN MODO
     */
    static configurarInterfazPorModo(modo) {
        const seccionVisualizacion = document.getElementById('seccionVisualizacion');
        const seccionEdicion = document.getElementById('seccionEdicion');
        const tituloPagina = document.getElementById('tituloPagina');
        const btnGuardarPlan = document.getElementById('btnGuardarPlanEstudio');

        if (modo === 'visualizar') {
            if (seccionVisualizacion) seccionVisualizacion.classList.remove('d-none');
            if (seccionEdicion) seccionEdicion.classList.add('d-none');
            if (tituloPagina) tituloPagina.textContent = 'Visualizar Plan de Estudio';
            if (btnGuardarPlan) btnGuardarPlan.style.display = 'none';
        } else if (modo === 'editar') {
            if (seccionVisualizacion) seccionVisualizacion.classList.add('d-none');
            if (seccionEdicion) seccionEdicion.classList.remove('d-none');
            if (tituloPagina) tituloPagina.textContent = 'Editar Plan de Estudio';
            if (btnGuardarPlan) btnGuardarPlan.style.display = 'inline-flex';
        } else {
            if (seccionVisualizacion) seccionVisualizacion.classList.add('d-none');
            if (seccionEdicion) seccionEdicion.classList.remove('d-none');
            if (tituloPagina) tituloPagina.textContent = 'Nuevo Plan de Estudio';
            if (btnGuardarPlan) btnGuardarPlan.style.display = 'inline-flex';
        }
    }

    /**
     * CREAR HTML DE UN SEMESTRE
     * @param {Object} semestre - Datos del semestre
     * @param {boolean} puedeEditar - Si puede editar
     * @param {Function} onEditar - Callback para editar semestre
     * @param {Function} onEliminar - Callback para eliminar semestre
     * @param {Function} onAgregarAsignatura - Callback para agregar asignatura
     * @returns {string} - HTML del semestre
     */
    static crearSemestreHTML(semestre, puedeEditar, onEditar, onEliminar, onAgregarAsignatura) {
        const asignaturasHTML = semestre.asignaturas.map((asig, idx) => `
            <div class="asignatura-item mb-2 p-2 border rounded position-relative">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${this.escapeHTML(asig.nombreAsignatura)}</strong>
                        <br>
                        <small class="text-muted">
                            Créditos: ${asig.creditos} | Modalidad: ${asig.modalidad}
                        </small>
                        ${asig.prerrequisitos && asig.prerrequisitos.length > 0 ? `
                            <br>
                            <small class="text-info">
                                <i class="fas fa-link"></i> Prerrequisitos: ${asig.prerrequisitos.join(', ')}
                            </small>
                        ` : ''}
                    </div>
                    ${puedeEditar ? `
                        <button class="btn btn-sm btn-outline-danger eliminar-asignatura" 
                                data-asignatura-id="${asig.idAsignatura}"
                                title="Eliminar asignatura">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        const btnAgregarHTML = puedeEditar ? `
            <div class="text-end mt-2">
                <button class="btn btn-outline-warning btn-sm agregar-asignatura" 
                        data-semestre-id="${semestre.idSemestre}"
                        data-semestre-numero="${semestre.numeroSemestre}"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNuevaAsignatura">
                    <i class="fas fa-plus"></i> Agregar Asignatura
                </button>
            </div>
        ` : '';

        return `
            <div class="card semestre-horizontal mb-3" data-id="${semestre.idSemestre}">
                <div class="card-header bg-warning d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                        <i class="fas fa-book"></i> ${this.escapeHTML(semestre.nombreCurso || `Semestre ${semestre.numeroSemestre}`)} 
                        <span class="badge bg-dark ms-2">Semestre ${semestre.numeroSemestre}</span>
                    </h6>
                    ${puedeEditar ? `
                        <div>
                            <button class="btn btn-sm btn-outline-info editar-semestre" 
                                    data-semestre-id="${semestre.idSemestre}"
                                    title="Editar semestre">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger eliminar-semestre" 
                                    data-semestre-id="${semestre.idSemestre}"
                                    title="Eliminar semestre">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="card-body">
                    <div id="semestre-asignaturas-scroll">
                        <div id="semestre-asignaturas-container">
                            ${asignaturasHTML || '<p class="text-muted text-center">No hay asignaturas asignadas</p>'}
                            ${btnAgregarHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * RENDERIZAR VISTA DE VISUALIZACIÓN
     * @param {Object} plan - Datos del plan
     * @param {Array} semestres - Lista de semestres con asignaturas
     * @param {Array} asignaturas - Lista de asignaturas disponibles
     */
    static renderizarVistaVisualizacion(plan, semestres, asignaturas) {
        const container = document.getElementById('seccionVisualizacion');
        if (!container) return;

        // Estadísticas
        const estadisticas = u_planEstudio.calcularEstadisticas(semestres);
        
        // Generar malla curricular
        const malla = u_planEstudio.generarMallaCurricular(semestres, asignaturas);

        let mallaHTML = '';
        malla.forEach(semestre => {
            const asignaturasLista = semestre.asignaturas.map(asig => 
                `${asig.nombre} (${asig.creditos} créditos, ${asig.modalidad})`
            ).join('<br>');

            mallaHTML += `
                <tr>
                    <td class="align-middle"><strong>${this.escapeHTML(semestre.nombreCurso)}</strong><br><small>Semestre ${semestre.numero}</small></td>
                    <td>${asignaturasLista || 'Sin asignaturas'}</td>
                    <td class="align-middle text-center">${semestre.asignaturas.reduce((sum, asig) => sum + (asig.creditos || 0), 0)}</td>
                </tr>
            `;
        });

        container.innerHTML = `
            <div class="card mb-4">
                <div class="card-header bg-warning">
                    <h5 class="mb-0">📋 Datos Generales</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Nombre del Plan:</strong> ${this.escapeHTML(plan.nombre || '')}</p>
                            <p><strong>Fecha de Elaboración:</strong> ${plan.fechaElaboracion || ''}</p>
                            <p><strong>Período:</strong> ${plan.periodoPlanEstudio || ''}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Carrera:</strong> ${this.escapeHTML(plan.nombreCarrera || '')}</p>
                            <p><strong>Vigente:</strong> 
                                <span class="badge ${plan.vigente === 'Sí' ? 'bg-success' : 'bg-danger'}">
                                    ${plan.vigente || 'No'}
                                </span>
                            </p>
                            <p><strong>ID Plan:</strong> ${plan.idPlanEstudio || ''}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header bg-warning">
                    <h5 class="mb-0">📊 Estadísticas del Plan</h5>
                </div>
                <div class="card-body">
                    <table class="table table-sm">
                        <tr>
                            <th>Total de Semestres con asignaturas:</th>
                            <td>${estadisticas.totalSemestres}</td>
                        </tr>
                        <tr>
                            <th>Total de Asignaturas:</th>
                            <td>${estadisticas.totalAsignaturas}</td>
                        </tr>
                        <tr>
                            <th>Total de Créditos:</th>
                            <td>${estadisticas.totalCreditos}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="card">
                <div class="card-header bg-warning d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">📋 Malla Curricular</h5>
                    <button class="btn btn-sm btn-outline-warning" id="btnEditarPlan">
                        <i class="fas fa-edit me-1"></i> Editar Plan
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead class="table-warning">
                                <tr>
                                    <th>Semestre</th>
                                    <th>Asignaturas</th>
                                    <th>Créditos</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${mallaHTML || '<tr><td colspan="3" class="text-center text-muted">No hay asignaturas asignadas</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Agregar evento al botón editar si existe
        const btnEditar = document.getElementById('btnEditarPlan');
        if (btnEditar && u_planEstudio.verificarPermiso('actualizar')) {
            btnEditar.addEventListener('click', () => {
                window.location.href = `/guniversidadfrontend/secretarioAcademico/template/html/formularioPlanEstudio.html?modo=editar&id=${plan.idPlanEstudio}`;
            });
        } else if (btnEditar) {
            btnEditar.style.display = 'none';
        }
    }

    /**
     * ACTUALIZAR ESTADÍSTICAS DEL PLAN
     * @param {Array} semestresPlan - Lista de semestres
     */
    static actualizarEstadisticas(semestresPlan) {
        const estadisticas = u_planEstudio.calcularEstadisticas(semestresPlan);
        
        const totalSemestresSpan = document.getElementById('totalSemestres');
        const totalAsignaturasSpan = document.getElementById('totalAsignaturas');
        const totalCreditosSpan = document.getElementById('totalCreditos');
        
        if (totalSemestresSpan) totalSemestresSpan.textContent = estadisticas.totalSemestres;
        if (totalAsignaturasSpan) totalAsignaturasSpan.textContent = estadisticas.totalAsignaturas;
        if (totalCreditosSpan) totalCreditosSpan.textContent = estadisticas.totalCreditos;
    }

    /**
     * ACTUALIZAR MALLA CURRICULAR
     * @param {Array} semestresPlan - Lista de semestres
     * @param {Array} asignaturas - Lista de asignaturas disponibles
     */
    static actualizarMallaCurricular(semestresPlan, asignaturas) {
        const tbody = document.getElementById('mallaCurricularBody');
        if (!tbody) return;

        const malla = u_planEstudio.generarMallaCurricular(semestresPlan, asignaturas);

        if (malla.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center text-muted">
                        No hay asignaturas asignadas
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = malla.map(semestre => `
            <tr>
                <td class="align-middle">
                    <strong>${this.escapeHTML(semestre.nombreCurso)}</strong>
                    <br><small class="text-muted">Semestre ${semestre.numero}</small>
                </td>
                <td>
                    ${semestre.asignaturas.map(asig => `
                        <div class="mb-1">
                            <strong>${this.escapeHTML(asig.nombre)}</strong>
                            <br><small class="text-muted">Créditos: ${asig.creditos} | Modalidad: ${asig.modalidad}</small>
                            ${asig.prerrequisitos && asig.prerrequisitos.length > 0 ? 
                                `<br><small class="text-info">Prerrequisitos: ${asig.prerrequisitos.join(', ')}</small>` : ''}
                        </div>
                    `).join('') || '<span class="text-muted">Sin asignaturas</span>'}
                </td>
                <td class="align-middle text-center">
                    ${semestre.asignaturas.reduce((sum, asig) => sum + (asig.creditos || 0), 0)}
                </td>
            </tr>
        `).join('');
    }

    /**
     * ESCAPE HTML
     * @param {string} str - String a escapar
     * @returns {string} - String escapado
     */
    static escapeHTML(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}
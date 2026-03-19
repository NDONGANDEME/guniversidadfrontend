/**
 * Utilidades específicas para el formulario de Plan de Estudio
 */

import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_planEstudio } from "./u_planEstudio.js";

export class u_formularioPlanEstudio {
    
    /**
     * Obtiene los parámetros de la URL
     * @returns {Object} - { modo, id }
     */
    static obtenerParametrosURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            modo: urlParams.get('modo') || 'crear', // crear, editar, visualizar
            id: urlParams.get('id')
        };
    }

    /**
     * Configura la interfaz según el modo
     * @param {string} modo - 'crear', 'editar', 'visualizar'
     */
    static configurarInterfazPorModo(modo) {
        const seccionEdicion = document.getElementById('seccionEdicion');
        const seccionVisualizacion = document.getElementById('seccionVisualizacion');
        const tituloPagina = document.getElementById('tituloPagina');
        const btnGuardar = document.getElementById('btnGuardarPlanEstudio');
        const inputs = document.querySelectorAll('#formPlanEstudio input, #formPlanEstudio select, #formPlanEstudio textarea, #formPlanEstudio button:not(#btnGuardarPlanEstudio):not(#btnCancelar)');

        switch(modo) {
            case 'visualizar':
                seccionEdicion.classList.add('d-none');
                seccionVisualizacion.classList.remove('d-none');
                if (tituloPagina) tituloPagina.textContent = 'Visualizar Plan de Estudio';
                if (btnGuardar) btnGuardar.style.display = 'none';
                
                // Deshabilitar todos los inputs
                inputs.forEach(input => {
                    input.disabled = true;
                });
                break;

            case 'editar':
                seccionEdicion.classList.remove('d-none');
                seccionVisualizacion.classList.add('d-none');
                if (tituloPagina) tituloPagina.textContent = 'Editar Plan de Estudio';
                if (btnGuardar) {
                    btnGuardar.style.display = 'inline-block';
                    btnGuardar.innerHTML = '<i class="fas fa-sync-alt me-2"></i> Actualizar Plan de Estudio';
                }
                
                // Habilitar inputs
                inputs.forEach(input => {
                    input.disabled = false;
                });
                
                // Verificar permiso de edición
                if (!u_planEstudio.verificarPermiso('actualizar')) {
                    btnGuardar.style.display = 'none';
                    Alerta.advertencia('Sin permiso', 'No tienes permisos para editar planes de estudio');
                }
                break;

            case 'crear':
            default:
                seccionEdicion.classList.remove('d-none');
                seccionVisualizacion.classList.add('d-none');
                if (tituloPagina) tituloPagina.textContent = 'Nuevo Plan de Estudio';
                if (btnGuardar) {
                    btnGuardar.style.display = 'inline-block';
                    btnGuardar.innerHTML = '<i class="fas fa-save me-2"></i> Guardar Plan de Estudio';
                }
                
                // Habilitar inputs
                inputs.forEach(input => {
                    input.disabled = false;
                });
                
                // Verificar permiso de creación
                if (!u_planEstudio.verificarPermiso('insertar')) {
                    btnGuardar.style.display = 'none';
                    Alerta.advertencia('Sin permiso', 'No tienes permisos para crear planes de estudio');
                }
                break;
        }

        // Botón cancelar siempre visible
        const btnCancelar = document.getElementById('btnCancelar');
        if (btnCancelar) {
            btnCancelar.style.display = 'inline-block';
        }
    }

    /**
     * Renderiza la vista de visualización
     * @param {Object} plan - Datos del plan
     * @param {Array} semestres - Semestres con asignaturas
     * @param {Array} asignaturasCompletas - Asignaturas con prerrequisitos
     */
    static renderizarVistaVisualizacion(plan, semestres, asignaturasCompletas = []) {
        const contenedor = document.getElementById('seccionVisualizacion');
        if (!contenedor) return;

        const estadisticas = u_planEstudio.calcularEstadisticas(semestres);
        const malla = u_planEstudio.generarMallaCurricular(semestres, asignaturasCompletas);

        let mallaHTML = '';
        malla.forEach(semestre => {
            if (semestre.asignaturas.length > 0) {
                semestre.asignaturas.forEach(asig => {
                    const prerrequisitos = asig.prerrequisitos.length > 0 
                        ? `<small class="text-muted d-block">Prerreq: ${asig.prerrequisitos.join(', ')}</small>`
                        : '';
                    
                    mallaHTML += `
                        <tr>
                            <td>${semestre.numero} (${semestre.nombreCurso})</td>
                            <td>${asig.nombre} ${prerrequisitos}</td>
                            <td>${asig.creditos}</td>
                        </tr>
                    `;
                });
            } else {
                mallaHTML += `
                    <tr>
                        <td>${semestre.numero} (${semestre.nombreCurso})</td>
                        <td colspan="2" class="text-muted">Sin asignaturas</td>
                    </tr>
                `;
            }
        });

        if (mallaHTML === '') {
            mallaHTML = '<tr><td colspan="3" class="text-center text-muted">No hay asignaturas asignadas</td></tr>';
        }

        const html = `
            <div class="card">
                <div class="card-header bg-warning">
                    <h5 class="mb-0">${plan.nombre}</h5>
                </div>
                <div class="card-body">
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <strong>Fecha elaboración:</strong> ${plan.fechaElaboracion}
                        </div>
                        <div class="col-md-3">
                            <strong>Período:</strong> ${plan.periodoPlanEstudio}
                        </div>
                        <div class="col-md-3">
                            <strong>Vigente:</strong> 
                            <span class="badge ${plan.vigente === 'Sí' ? 'bg-success' : 'bg-danger'}">${plan.vigente}</span>
                        </div>
                        <div class="col-md-3">
                            <strong>Carrera:</strong> ${plan.nombreCarrera || 'N/A'}
                        </div>
                    </div>

                    <div class="row mb-4">
                        <div class="col-md-12">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <div class="row text-center">
                                        <div class="col-md-4">
                                            <h6>Total Semestres</h6>
                                            <h3>${estadisticas.totalSemestres}</h3>
                                        </div>
                                        <div class="col-md-4">
                                            <h6>Total Asignaturas</h6>
                                            <h3>${estadisticas.totalAsignaturas}</h3>
                                        </div>
                                        <div class="col-md-4">
                                            <h6>Total Créditos</h6>
                                            <h3>${estadisticas.totalCreditos}</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h5 class="mb-3">Malla Curricular</h5>
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
                                ${mallaHTML}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        contenedor.innerHTML = html;
    }

    /**
     * Crea un elemento de semestre en el DOM
     * @param {Object} semestre - Datos del semestre
     * @param {boolean} editable - Si es editable
     * @param {Function} onEditar - Callback para editar
     * @param {Function} onEliminar - Callback para eliminar
     * @param {Function} onAgregarAsignatura - Callback para agregar asignatura
     * @returns {string} HTML del semestre
     */
    static crearSemestreHTML(semestre, editable = true, onEditar, onEliminar, onAgregarAsignatura) {
        const puedeEditar = editable && u_planEstudio.verificarPermiso('actualizar');
        
        let asignaturasHTML = '';
        if (semestre.asignaturas && semestre.asignaturas.length > 0) {
            semestre.asignaturas.forEach(asig => {
                asignaturasHTML += `
                    <div class="alert alert-warning p-2 mb-2 d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${asig.nombreAsignatura}</strong><br>
                            <small>Créditos: ${asig.creditos} | ${asig.modalidad}</small>
                            ${asig.prerrequisitos && asig.prerrequisitos.length > 0 ? 
                                `<br><small class="text-muted">Prerreq: ${asig.prerrequisitos.join(', ')}</small>` : ''}
                        </div>
                        ${puedeEditar ? `
                            <div>
                                <button class="btn btn-sm btn-outline-danger eliminar-asignatura" data-id="${asig.idPlanSemestreAsignatura || ''}" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
        } else {
            asignaturasHTML = '<div class="text-muted text-center p-3">Sin asignaturas</div>';
        }

        return `
            <div class="card semestre-horizontal semester-card" data-id="${semestre.idSemestre || semestre.tempId || ''}">
                <div class="card-header bg-warning d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">${semestre.nombreCurso} (Semestre ${semestre.numeroSemestre})</h6>
                    ${puedeEditar ? `
                        <div>
                            <button class="btn btn-sm btn-outline-info editar-semestre" title="Editar semestre">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger eliminar-semestre" title="Eliminar semestre">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <div class="card-body" style="height: 300px; overflow-y: auto;">
                    <div class="semestre-asignaturas-container">
                        ${asignaturasHTML}
                        ${puedeEditar ? `
                            <div class="text-end mt-2">
                                <button class="btn btn-outline-warning rounded-circle" 
                                        data-bs-toggle="modal" data-bs-target="#modalNuevaAsignatura"
                                        data-semestre-id="${semestre.idSemestre || semestre.tempId || ''}"
                                        title="Nueva asignatura">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Actualiza las estadísticas en el formulario
     * @param {Array} semestres - Lista de semestres
     */
    static actualizarEstadisticas(semestres) {
        const estadisticas = u_planEstudio.calcularEstadisticas(semestres);
        
        const totalSemestres = document.getElementById('totalSemestres');
        const totalAsignaturas = document.getElementById('totalAsignaturas');
        const totalCreditos = document.getElementById('totalCreditos');

        if (totalSemestres) totalSemestres.textContent = estadisticas.totalSemestres;
        if (totalAsignaturas) totalAsignaturas.textContent = estadisticas.totalAsignaturas;
        if (totalCreditos) totalCreditos.textContent = estadisticas.totalCreditos;
    }

    /**
     * Actualiza la malla curricular en el formulario
     * @param {Array} semestres - Lista de semestres
     * @param {Array} asignaturasCompletas - Asignaturas con prerrequisitos
     */
    static actualizarMallaCurricular(semestres, asignaturasCompletas = []) {
        const tbody = document.getElementById('mallaCurricularBody');
        if (!tbody) return;

        const malla = u_planEstudio.generarMallaCurricular(semestres, asignaturasCompletas);

        let html = '';
        malla.forEach(semestre => {
            if (semestre.asignaturas.length > 0) {
                semestre.asignaturas.forEach(asig => {
                    const prerrequisitos = asig.prerrequisitos.length > 0 
                        ? `<small class="text-muted">Prerreq: ${asig.prerrequisitos.join(', ')}</small>`
                        : '';
                    
                    html += `
                        <tr>
                            <td>${semestre.numero} (${semestre.nombreCurso})</td>
                            <td>${asig.nombre} ${prerrequisitos}</td>
                            <td>${asig.creditos}</td>
                        </tr>
                    `;
                });
            } else {
                html += `
                    <tr>
                        <td>${semestre.numero} (${semestre.nombreCurso})</td>
                        <td colspan="2" class="text-muted">Sin asignaturas</td>
                    </tr>
                `;
            }
        });

        if (html === '') {
            html = '<tr><td colspan="3" class="text-center text-muted">No hay asignaturas asignadas</td></tr>';
        }

        tbody.innerHTML = html;
    }
}
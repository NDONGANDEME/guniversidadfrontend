/*import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_planEstudio {
    
    // ========== VARIABLES ESTÁTICAS ==========
    static asignaturasPorSemestre = {};
    static profesores = [];
    static semestresDisponibles = [];

    // ========== VALIDACIONES ==========
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarFecha(valor) {
        return valor && valor !== '';
    }
    
    static validarPeriodo(valor) {
        // Formato esperado: 2024-2028
        const regex = /^\d{4}-\d{4}$/;
        return regex.test(valor.trim());
    }
    
    static validarVigente(valor) {
        return valor === 'Sí' || valor === 'No';
    }
    
    static validarCarrera(valor) {
        return valor && valor !== '';
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validación del nombre
        $('#nombrePlanEstudio').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_planEstudio.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombrePlanEstudio', '#errorNombrePlanEstudio', 'Mínimo 3 caracteres');
        });

        // Validación de fecha
        $('#fechaElaboracionPlanEstudio').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_planEstudio.validarFecha(valor);
            u_utiles.colorearCampo(valido, '#fechaElaboracionPlanEstudio', '#errorFechaElaboracionPlanEstudio', 'Seleccione una fecha');
        });

        // Validación de periodo
        $('#periodoPlanEstudio').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_planEstudio.validarPeriodo(valor);
            u_utiles.colorearCampo(valido, '#periodoPlanEstudio', '#errorPeriodoPlanEstudio', 'Formato: 2024-2028');
        });

        // Validación de vigente
        $('#vigentePlanEstudio').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_planEstudio.validarVigente(valor);
            u_utiles.colorearCampo(valido, '#vigentePlanEstudio', '#errorVigentePlanEstudio', 'Seleccione Sí o No');
        });

        // Validación de carrera
        $('#carrerasPlanEstudio').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_planEstudio.validarCarrera(valor);
            u_utiles.colorearCampo(valido, '#carrerasPlanEstudio', '#errorCarrerasPlanEstudio', 'Seleccione una carrera');
        });
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevoPlanEstudioLabel').text('Editar plan de estudios');
            $('#btnGuardarPlanEstudio').text('Actualizar Plan');
        } else {
            $('#modalNuevoPlanEstudioLabel').text('Agregar nuevo plan de estudios');
            $('#btnGuardarPlanEstudio').text('Guardar Plan de Estudio');
        }
    }

    // ========== CARGAR CARRERAS EN SELECT ==========
    static cargarCarrerasEnSelect(carreras) {
        const select = $('#carrerasPlanEstudio');
        select.empty();
        select.append('<option value="">Seleccione...</option>');
        
        if (carreras && carreras.length > 0) {
            carreras.forEach(c => {
                select.append(`<option value="${c.idCarrera}">${c.nombreCarrera || 'Sin nombre'}</option>`);
            });
        }
    }

    // ========== CARGAR ASIGNATURAS EN BIBLIOTECA ==========
    static cargarAsignaturasEnBiblioteca(asignaturas) {
        const lista = $('#listaAsignaturas');
        lista.empty();
        
        if (!asignaturas || asignaturas.length === 0) {
            lista.html('<div class="list-group-item text-muted">No hay asignaturas disponibles</div>');
            return;
        }

        asignaturas.forEach(a => {
            const item = $(`
                <div class="list-group-item list-group-item-action draggable-item" 
                     draggable="true" 
                     data-id="${a.idAsignatura || ''}"
                     data-nombre="${a.nombreAsignatura || ''}"
                     data-codigo="${a.codigoAsignatura || 'N/A'}">
                    <strong>${a.codigoAsignatura || 'N/A'}</strong> - ${a.nombreAsignatura || 'Sin nombre'}<br>
                </div>
            `);
            lista.append(item);
        });
        // <small class="text-muted">Créditos: <span class="credito-original">${a.creditos || 0}</span></small>
    }

    // ========== FUNCIONES DE DRAG & DROP ==========
    static allowDrop(ev) {
        ev.preventDefault();
    }

    static dragAsignatura(ev) {
        const elemento = ev.target.closest('.draggable-item');
        if (!elemento) return;

        // Guardar los datos originales incluyendo los créditos por defecto
        const creditosOriginales = parseInt($(elemento).find('.credito-original').text()) || 3;
        
        const data = {
            id: elemento.dataset.id,
            nombre: elemento.dataset.nombre,
            creditos: creditosOriginales,
            codigo: elemento.dataset.codigo || 'N/A'
        };

        ev.dataTransfer.setData('text/plain', JSON.stringify(data));
        $(elemento).addClass('bg-warning');
    }

    static dropAsignatura(ev, semestreId, callbackActualizar) {
        ev.preventDefault();

        try {
            const data = JSON.parse(ev.dataTransfer.getData('text/plain'));
            
            // Solicitar créditos al usuario
            this.solicitarCreditos(data, (creditosPersonalizados) => {
                if (creditosPersonalizados === null) return; // Usuario canceló
                
                if (!u_planEstudio.asignaturasPorSemestre[semestreId]) {
                    u_planEstudio.asignaturasPorSemestre[semestreId] = [];
                }

                // Verificar si ya existe
                if (u_planEstudio.asignaturasPorSemestre[semestreId].some(a => a.idAsignatura === data.id)) {
                    alert('Esta asignatura ya está en este semestre');
                    return;
                }

                const asignatura = {
                    idAsignatura: data.id,
                    nombreAsignatura: data.nombre,
                    creditos: creditosPersonalizados, // Usar créditos personalizados
                    codigo: data.codigo,
                    profesor: null
                };

                u_planEstudio.asignaturasPorSemestre[semestreId].push(asignatura);
                
                if (callbackActualizar) {
                    callbackActualizar(semestreId);
                }
            });
        } catch (e) {
            console.error('Error en drop:', e);
        }
    }

    // ========== SOLICITAR CRÉDITOS ==========
    static solicitarCreditos(data, callback) {
        // Crear modal dinámico para ingresar créditos
        const modalId = 'modalIngresarCreditos';
        
        // Eliminar modal existente si hay
        $(`#${modalId}`).remove();
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title">Asignar Créditos</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Asignatura:</strong> ${data.nombre}</p>
                            <p><strong>Código:</strong> ${data.codigo}</p>
                            <label for="creditosAsignatura" class="form-label">Créditos:</label>
                            <input type="number" class="form-control" id="creditosAsignatura" 
                                   value="${data.creditos}" min="1" max="12" step="1" required>
                            <small class="text-muted">Ingrese la cantidad de créditos para esta asignatura en este plan</small>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="btnConfirmarCreditos">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        // Manejar confirmación
        $('#btnConfirmarCreditos').off('click').on('click', function() {
            const creditos = parseInt($('#creditosAsignatura').val());
            
            if (isNaN(creditos) || creditos < 1 || creditos > 12) {
                alert('Los créditos deben ser un número entre 1 y 12');
                return;
            }
            
            modal.hide();
            $(`#${modalId}`).on('hidden.bs.modal', function() {
                $(this).remove();
            });
            
            callback(creditos);
        });
        
        // Manejar cancelación
        $(`#${modalId}`).on('hidden.bs.modal', function() {
            $(this).remove();
            callback(null);
        });
    }

    // ========== ACTUALIZAR VISTA DE SEMESTRE ==========
    static actualizarVistaSemestre(semestreId) {
        const lista = $(`#semestre${semestreId}-list`);
        if (!lista.length) return;

        lista.empty();

        const asignaturas = u_planEstudio.asignaturasPorSemestre[semestreId] || [];
        
        asignaturas.forEach((asignatura, index) => {
            const item = $(`
                <div class="alert alert-warning p-2 mb-2">
                    <div>
                        <strong>${asignatura.nombreAsignatura || 'Sin nombre'}</strong><br>
                        <small>Créditos: ${asignatura.creditos || 0}</small><br>
                        <small class="text-muted">${asignatura.codigo || ''}</small>
                    </div>
                    <div class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1 editar-creditos" 
                                data-semestre="${semestreId}" 
                                data-index="${index}"
                                title="Editar créditos">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger eliminar-asignatura" 
                                data-semestre="${semestreId}" 
                                data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `);
            lista.append(item);
        });

        // Actualizar contadores
        $(`#asignaturas${semestreId}`).text(asignaturas.length);
        u_planEstudio.actualizarCreditos(semestreId);
    }

    static actualizarCreditos(semestreId) {
        const total = (u_planEstudio.asignaturasPorSemestre[semestreId] || []).reduce(
            (sum, a) => sum + (parseInt(a.creditos) || 0), 0
        );
        $(`#creditos${semestreId}`).text(total);
    }

    // ========== FUNCIONES DE MANEJO DE SEMESTRES ==========
    static generarSemestres(containerId, semestres, asignaturasGuardadas = {}) {
        const container = $(containerId);
        container.empty();

        if (!semestres || semestres.length === 0) {
            container.html('<div class="alert alert-warning">No hay semestres disponibles</div>');
            return;
        }

        // Inicializar asignaturasPorSemestre con los datos guardados
        u_planEstudio.asignaturasPorSemestre = {};
        
        // Ordenar semestres por número
        const semestresOrdenados = [...semestres].sort((a, b) => a.numeroSemestre - b.numeroSemestre);

        semestresOrdenados.forEach(sem => {
            const semestreId = sem.idSemestre;
            
            // Cargar asignaturas guardadas si existen
            u_planEstudio.asignaturasPorSemestre[semestreId] = asignaturasGuardadas[semestreId] || [];

            const semestreDiv = $(`
                <div class="semestre-horizontal" id="semestre-col-${semestreId}">
                    <div class="card semester-card h-100" data-semestre="${semestreId}">
                        <div class="card-header bg-warning d-flex justify-content-between align-items-center py-2">
                            <h6 class="mb-0">Semestre ${sem.numeroSemestre}</h6>
                            <div>
                                <button class="btn btn-sm btn-outline-danger eliminar-semestre" 
                                        data-semestre="${semestreId}"
                                        title="Eliminar semestre">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="asignaturas-list" 
                                 id="semestre${semestreId}-list"
                                 ondragover="u_planEstudio.allowDrop(event)"
                                 ondrop="u_planEstudio.dropAsignatura(event, ${semestreId}, window.callbackActualizarVista)">
                            </div>
                            <div class="mt-2 d-flex justify-content-between pt-2 border-top">
                                <small class="text-muted">Créditos: <span id="creditos${semestreId}">0</span></small>
                                <small class="text-muted">Asignaturas: <span id="asignaturas${semestreId}">0</span></small>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            container.append(semestreDiv);
            
            // Actualizar vista con datos existentes
            u_planEstudio.actualizarVistaSemestre(semestreId);
        });
    }

    // ========== ACTUALIZAR ESTADÍSTICAS ==========
    static actualizarEstadisticas() {
        let totalAsignaturas = 0;
        let totalCreditos = 0;
        let semestresConAsignaturas = 0;

        Object.values(u_planEstudio.asignaturasPorSemestre).forEach(asignaturas => {
            if (asignaturas.length > 0) {
                totalAsignaturas += asignaturas.length;
                totalCreditos += asignaturas.reduce((sum, a) => sum + (parseInt(a.creditos) || 0), 0);
                semestresConAsignaturas++;
            }
        });

        $('#totalAsignaturas').text(totalAsignaturas);
        $('#totalCreditos').text(totalCreditos);
        $('#totalSemestres').text(semestresConAsignaturas);

        u_planEstudio.actualizarMallaCurricular();
    }

    static actualizarMallaCurricular() {
        const tbody = $('#mallaCurricularBody');
        tbody.empty();

        let tieneAsignaturas = false;

        // Ordenar semestres por ID
        const semestresOrdenados = Object.keys(u_planEstudio.asignaturasPorSemestre)
            .map(Number)
            .sort((a, b) => a - b);

        semestresOrdenados.forEach(semestreId => {
            const asignaturas = u_planEstudio.asignaturasPorSemestre[semestreId] || [];
            if (asignaturas.length > 0) {
                tieneAsignaturas = true;
                const nombres = asignaturas.map(a => a.nombreAsignatura).join(', ');
                const creditos = asignaturas.reduce((sum, a) => sum + (parseInt(a.creditos) || 0), 0);

                tbody.append(`
                    <tr>
                        <td>Semestre ${semestreId}</td>
                        <td>${nombres}</td>
                        <td>${creditos}</td>
                    </tr>
                `);
            }
        });

        if (!tieneAsignaturas) {
            tbody.html('<tr><td colspan="3" class="text-center text-muted">No hay asignaturas asignadas</td></tr>');
        }
    }

    // ========== FILTRAR ASIGNATURAS ==========
    static filtrarAsignaturas(searchTerm) {
        const items = document.querySelectorAll('#listaAsignaturas .draggable-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'block' : 'none';
        });
    }

    // ========== LIMPIAR FORMULARIO ==========
    static limpiarFormulario() {
        $('#formPlanEstudio')[0].reset();
        $('#vigentePlanEstudio').val('');
        $('#carrerasPlanEstudio').val('');
        $('.errorMensaje').text('').hide();
        $('#formPlanEstudio input, #formPlanEstudio select').removeClass('border-success border-danger');
        
        // Limpiar datos de elaboración
        u_planEstudio.asignaturasPorSemestre = {};
        
        // Auto-completar periodo con año actual - año siguiente
        $('#periodoPlanEstudio').val(this.generarPeriodoAutomatico());
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    static cargarDatosEnModal(plan) {
        $('#nombrePlanEstudio').val(plan.nombre || '');
        $('#fechaElaboracionPlanEstudio').val(plan.fechaElaboracion || '');
        $('#periodoPlanEstudio').val(plan.periodoPlanEstudio || '' || this.generarPeriodoAutomatico());
        $('#vigentePlanEstudio').val(plan.vigente || '');
        $('#carrerasPlanEstudio').val(plan.idCarrera || '');
    }

    // Función auxiliar para generar el periodo automático
    static generarPeriodoAutomatico() {
        const añoActual = new Date().getFullYear();
        const añoSiguiente = añoActual + 1;
        return `${añoActual}-${añoSiguiente}`;
    }

    // ========== GENERAR BOTONES PARA TABLA ==========
    static generarBotonesPlan(id, vigente) {
        const iconoToggle = vigente === 'Sí' ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = vigente === 'Sí' ? 'btn-outline-danger' : 'btn-outline-success';
        const textoToggle = vigente === 'Sí' ? 'Deshabilitar' : 'Habilitar';
        
        /*
        <button class="btn btn-sm ${claseToggle} toggle-estado-plan" title="${textoToggle}" data-id="${id}">
            <i class="fas ${iconoToggle}"></i>
        </button>*
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-plan" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info ver-detalles-plan" title="Ver Detalles" data-id="${id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
    }

    // ========== ACTUALIZAR TABLA DE PLANES ==========
    static actualizarTablaPlanes(dataTable, planes, carreras) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (!planes || planes.length === 0) {
            dataTable.draw();
            return;
        }

        planes.forEach(p => {
            // Buscar nombre de la carrera
            const carrera = carreras.find(c => c.idCarrera == p.idCarrera);
            const nombreCarrera = carrera ? carrera.nombreCarrera : 'Desconocida';
            
            // Formatear fecha
            let fecha = 'Sin fecha';
            if (p.fechaElaboracion) {
                try {
                    fecha = new Date(p.fechaElaboracion).toLocaleDateString();
                } catch (e) {
                    fecha = p.fechaElaboracion;
                }
            }
            
            const fila = [
                p.nombre || 'Sin nombre',
                fecha,
                p.periodoPlanEstudio || 'Sin periodo',
                nombreCarrera,
                p.vigente || 'No',
                this.generarBotonesPlan(p.idPlanEstudio, p.vigente)
            ];
            
            dataTable.row.add(fila).draw() //const nodoFila = .node();
            
            // Si no está vigente, atenuar la fila
            /*if (p.vigente !== 'Sí') {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }*
        });
        
        dataTable.draw();
    }

    // ========== GENERAR HTML PARA DETALLES ==========
    static generarDetallesPlanHTML(plan, nombreCarrera, asignaturasPorSemestre) {
        let semestresHTML = '';
        
        // Ordenar semestres
        const semestresOrdenados = Object.keys(asignaturasPorSemestre).map(Number).sort((a, b) => a - b);

        semestresOrdenados.forEach(semestreId => {
            const asignaturas = asignaturasPorSemestre[semestreId] || [];
            if (asignaturas.length > 0) {
                let asignaturasHTML = '';
                asignaturas.forEach(a => {
                    asignaturasHTML += `
                        <tr>
                            <td>${a.codigo || 'N/A'}</td>
                            <td>${a.nombreAsignatura || 'Sin nombre'}</td>
                            <td>${a.creditos || 0}</td>
                            <td>${a.profesor || 'Por asignar'}</td>
                        </tr>
                    `;
                });

                semestresHTML += `
                    <div class="mt-4">
                        <h6 class="bg-warning p-2 rounded">Semestre ${semestreId}</h6>
                        <table class="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Asignatura</th>
                                    <th>Créditos</th>
                                    <th>Profesor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${asignaturasHTML}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        });

        if (!semestresHTML) {
            semestresHTML = '<p class="text-muted">No hay asignaturas asignadas</p>';
        }

        // Formatear fecha
        let fecha = 'Sin fecha';
        if (plan.fechaElaboracion) {
            try {
                fecha = new Date(plan.fechaElaboracion).toLocaleDateString();
            } catch (e) {
                fecha = plan.fechaElaboracion;
            }
        }

        return `
            <div class="card shadow">
                <div class="card-header bg-warning py-3">
                    <h6 class="m-0 font-weight-bold">Plan de Estudios: ${plan.nombre || 'Sin nombre'}</h6>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Fecha de elaboración:</strong> ${fecha}</p>
                            <p><strong>Periodo:</strong> ${plan.periodoPlanEstudio || 'Sin periodo'}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Carrera:</strong> ${nombreCarrera}</p>
                            <p><strong>Vigente:</strong> ${plan.vigente || 'No'}</p>
                        </div>
                    </div>
                    
                    <hr>
                    
                    <h5 class="mt-3">Estructura del Plan</h5>
                    ${semestresHTML}
                </div>
            </div>
        `;
    }

    // ========== VERIFICAR SEMESTRES ==========
    static verificarSemestres(semestres) {
        const btnAgregarSemestre = $('#btnAgregarSemestre');
        
        if (!semestres || semestres.length === 0) {
            btnAgregarSemestre.prop('disabled', true);
            btnAgregarSemestre.attr('title', 'No hay semestres disponibles. Cree semestres primero.');
            return false;
        } else {
            btnAgregarSemestre.prop('disabled', false);
            btnAgregarSemestre.attr('title', 'Agregar Semestre');
            return true;
        }
    }
}*/

import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_planEstudio {
    
    // ========== VARIABLES ESTÁTICAS ==========
    static asignaturasPorSemestre = {};
    static profesores = [];
    static semestresDisponibles = [];
    static prerequisitosPorAsignatura = {};

    // ========== VALIDACIONES ==========
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarFecha(valor) {
        return valor && valor !== '';
    }
    
    static validarPeriodo(valor) {
        // Formato esperado: 2024-2028
        const regex = /^\d{4}-\d{4}$/;
        return regex.test(valor.trim());
    }
    
    static validarVigente(valor) {
        return valor === 'Sí' || valor === 'No';
    }
    
    static validarCarrera(valor) {
        return valor && valor !== '';
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validación del nombre
        $('#nombrePlanEstudio').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_planEstudio.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombrePlanEstudio', '#errorNombrePlanEstudio', 'Mínimo 3 caracteres');
        });

        // Validación de fecha
        $('#fechaElaboracionPlanEstudio').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_planEstudio.validarFecha(valor);
            u_utiles.colorearCampo(valido, '#fechaElaboracionPlanEstudio', '#errorFechaElaboracionPlanEstudio', 'Seleccione una fecha');
        });

        // Validación de periodo
        $('#periodoPlanEstudio').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_planEstudio.validarPeriodo(valor);
            u_utiles.colorearCampo(valido, '#periodoPlanEstudio', '#errorPeriodoPlanEstudio', 'Formato: 2024-2028');
        });

        // Validación de vigente
        $('#vigentePlanEstudio').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_planEstudio.validarVigente(valor);
            u_utiles.colorearCampo(valido, '#vigentePlanEstudio', '#errorVigentePlanEstudio', 'Seleccione Sí o No');
        });

        // Validación de carrera
        $('#carrerasPlanEstudio').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_planEstudio.validarCarrera(valor);
            u_utiles.colorearCampo(valido, '#carrerasPlanEstudio', '#errorCarrerasPlanEstudio', 'Seleccione una carrera');
        });
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevoPlanEstudioLabel').text('Editar plan de estudios');
            $('#btnGuardarPlanEstudio').text('Actualizar Plan');
        } else {
            $('#modalNuevoPlanEstudioLabel').text('Agregar nuevo plan de estudios');
            $('#btnGuardarPlanEstudio').text('Guardar Plan de Estudio');
        }
    }

    // ========== CARGAR CARRERAS EN SELECT ==========
    static cargarCarrerasEnSelect(carreras) {
        const select = $('#carrerasPlanEstudio');
        select.empty();
        select.append('<option value="">Seleccione...</option>');
        
        if (carreras && carreras.length > 0) {
            carreras.forEach(c => {
                select.append(`<option value="${c.idCarrera}">${c.nombreCarrera || 'Sin nombre'}</option>`);
            });
        }
    }

    // ========== CARGAR ASIGNATURAS EN BIBLIOTECA ==========
    static cargarAsignaturasEnBiblioteca(asignaturas) {
        const lista = $('#listaAsignaturas');
        lista.empty();
        
        if (!asignaturas || asignaturas.length === 0) {
            lista.html('<div class="list-group-item text-muted">No hay asignaturas disponibles</div>');
            return;
        }

        asignaturas.forEach(a => {
            const item = $(`
                <div class="list-group-item list-group-item-action draggable-item" 
                     draggable="true" 
                     data-id="${a.idAsignatura || ''}"
                     data-nombre="${a.nombreAsignatura || ''}"
                     data-codigo="${a.codigoAsignatura || 'N/A'}">
                    <strong>${a.codigoAsignatura || 'N/A'}</strong> - ${a.nombreAsignatura || 'Sin nombre'}<br>
                    <small class="text-muted">Créditos: <span class="credito-original">${a.creditos || 3}</span></small>
                </div>
            `);
            lista.append(item);
        });
    }

    // ========== FUNCIONES DE DRAG & DROP ==========
    static allowDrop(ev) {
        ev.preventDefault();
    }

    static dragAsignatura(ev) {
        const elemento = ev.target.closest('.draggable-item');
        if (!elemento) return;

        // Guardar los datos originales incluyendo los créditos por defecto
        const creditosOriginales = parseInt($(elemento).find('.credito-original').text()) || 3;
        
        const data = {
            id: elemento.dataset.id,
            nombre: elemento.dataset.nombre,
            creditos: creditosOriginales,
            codigo: elemento.dataset.codigo || 'N/A'
        };

        ev.dataTransfer.setData('text/plain', JSON.stringify(data));
        $(elemento).addClass('bg-warning');
    }

    static dropAsignatura(ev, semestreId, callbackActualizar) {
        ev.preventDefault();

        try {
            const data = JSON.parse(ev.dataTransfer.getData('text/plain'));
            
            // Solicitar créditos, modalidad y prerrequisitos al usuario
            this.solicitarCreditos(data, (creditosPersonalizados, modalidad, prerequisitos) => {
                if (creditosPersonalizados === null) return; // Usuario canceló
                
                if (!u_planEstudio.asignaturasPorSemestre[semestreId]) {
                    u_planEstudio.asignaturasPorSemestre[semestreId] = [];
                }

                // Verificar si ya existe
                if (u_planEstudio.asignaturasPorSemestre[semestreId].some(a => a.idAsignatura === data.id)) {
                    alert('Esta asignatura ya está en este semestre');
                    return;
                }

                const asignatura = {
                    idAsignatura: data.id,
                    nombreAsignatura: data.nombre,
                    creditos: creditosPersonalizados,
                    codigo: data.codigo,
                    modalidad: modalidad,
                    prerequisitos: prerequisitos || [],
                    profesor: null
                };

                u_planEstudio.asignaturasPorSemestre[semestreId].push(asignatura);
                
                if (callbackActualizar) {
                    callbackActualizar(semestreId);
                }
            });
        } catch (e) {
            console.error('Error en drop:', e);
        }
    }

    // ========== SOLICITAR CRÉDITOS, MODALIDAD Y PRERREQUISITOS ==========
    static solicitarCreditos(data, callback) {
        // Crear modal dinámico para ingresar créditos, modalidad y prerrequisitos
        const modalId = 'modalIngresarCreditos';
        
        // Eliminar modal existente si hay
        $(`#${modalId}`).remove();
        
        // Obtener asignaturas disponibles para prerrequisitos (excluyendo la actual)
        const asignaturasDisponibles = this.obtenerAsignaturasParaPrerequisitos(data.id);
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-md">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title">Configurar Asignatura</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Asignatura:</strong> ${data.nombre}</p>
                            <p><strong>Código:</strong> ${data.codigo}</p>
                            
                            <div class="mb-3">
                                <label for="creditosAsignatura" class="form-label">Créditos:</label>
                                <input type="number" class="form-control" id="creditosAsignatura" 
                                       value="${data.creditos}" min="1" max="12" step="1" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="modalidadAsignatura" class="form-label">Modalidad:</label>
                                <select class="form-select" id="modalidadAsignatura" required>
                                    <option value="">Seleccione...</option>
                                    <option value="basica">Básica</option>
                                    <option value="obligatoria">Obligatoria</option>
                                    <option value="opcional">Opcional</option>
                                    <option value="especifica">Específica</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Prerrequisitos:</label>
                                <div id="prerrequisitos-container">
                                    <!-- Los prerrequisitos se agregarán dinámicamente aquí -->
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-primary mt-2" id="btnAgregarPrerrequisito">
                                    <i class="fas fa-plus"></i> Agregar Prerrequisito
                                </button>
                            </div>
                            
                            <small class="text-muted">Complete la información para esta asignatura en el plan</small>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="btnConfirmarCreditos">Aceptar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        // Manejar agregar prerrequisito
        $('#btnAgregarPrerrequisito').off('click').on('click', () => {
            this.agregarCampoPrerrequisito(asignaturasDisponibles);
        });
        
        // Manejar confirmación
        $('#btnConfirmarCreditos').off('click').on('click', () => {
            const creditos = parseInt($('#creditosAsignatura').val());
            const modalidad = $('#modalidadAsignatura').val();
            
            if (isNaN(creditos) || creditos < 1 || creditos > 12) {
                alert('Los créditos deben ser un número entre 1 y 12');
                return;
            }
            
            if (!modalidad) {
                alert('Debe seleccionar una modalidad');
                return;
            }
            
            // Recopilar prerrequisitos seleccionados
            const prerequisitos = [];
            $('.prerrequisito-select').each(function() {
                const valor = $(this).val();
                if (valor) {
                    prerequisitos.push(parseInt(valor));
                }
            });
            
            modal.hide();
            $(`#${modalId}`).on('hidden.bs.modal', function() {
                $(this).remove();
            });
            
            callback(creditos, modalidad, prerequisitos);
        });
        
        // Manejar cancelación
        $(`#${modalId}`).on('hidden.bs.modal', function() {
            $(this).remove();
            callback(null, null, null);
        });
    }

    // ========== EDITAR CONFIGURACIÓN DE ASIGNATURA ==========
    static editarConfiguracionAsignatura(semestreId, index, callback) {
        const asignatura = u_planEstudio.asignaturasPorSemestre[semestreId]?.[index];
        if (!asignatura) return;
        
        // Obtener asignaturas disponibles para prerrequisitos (excluyendo la actual)
        const asignaturasDisponibles = this.obtenerAsignaturasParaPrerequisitos(asignatura.idAsignatura);
        
        // Crear modal similar al de solicitarCreditos pero con datos precargados
        const modalId = 'modalEditarConfiguracion';
        
        $(`#${modalId}`).remove();
        
        // Generar HTML para prerrequisitos existentes
        let prerequisitosHTML = '';
        if (asignatura.prerequisitos && asignatura.prerequisitos.length > 0) {
            asignatura.prerequisitos.forEach(prereqId => {
                const prereqAsig = this.buscarAsignaturaPorId(prereqId);
                prerequisitosHTML += `
                    <div class="input-group mb-2 prerrequisito-item">
                        <select class="form-select form-select-sm prerrequisito-select">
                            <option value="">Seleccione asignatura...</option>
                            ${asignaturasDisponibles.map(a => 
                                `<option value="${a.id}" ${a.id == prereqId ? 'selected' : ''}>${a.codigo} - ${a.nombre}</option>`
                            ).join('')}
                        </select>
                        <button class="btn btn-sm btn-outline-danger eliminar-prerrequisito" type="button">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
            });
        }
        
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-md">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title">Editar Configuración</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Asignatura:</strong> ${asignatura.nombreAsignatura}</p>
                            <p><strong>Código:</strong> ${asignatura.codigo}</p>
                            
                            <div class="mb-3">
                                <label for="creditosAsignatura" class="form-label">Créditos:</label>
                                <input type="number" class="form-control" id="creditosAsignatura" 
                                       value="${asignatura.creditos}" min="1" max="12" step="1" required>
                            </div>
                            
                            <div class="mb-3">
                                <label for="modalidadAsignatura" class="form-label">Modalidad:</label>
                                <select class="form-select" id="modalidadAsignatura" required>
                                    <option value="">Seleccione...</option>
                                    <option value="basica" ${asignatura.modalidad === 'basica' ? 'selected' : ''}>Básica</option>
                                    <option value="obligatoria" ${asignatura.modalidad === 'obligatoria' ? 'selected' : ''}>Obligatoria</option>
                                    <option value="opcional" ${asignatura.modalidad === 'opcional' ? 'selected' : ''}>Opcional</option>
                                    <option value="especifica" ${asignatura.modalidad === 'especifica' ? 'selected' : ''}>Específica</option>
                                </select>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Prerrequisitos:</label>
                                <div id="prerrequisitos-container">
                                    ${prerequisitosHTML}
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-primary mt-2" id="btnAgregarPrerrequisito">
                                    <i class="fas fa-plus"></i> Agregar Prerrequisito
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-success" id="btnGuardarConfiguracion">Guardar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        $('body').append(modalHTML);
        
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
        
        // Configurar agregar prerrequisito
        $('#btnAgregarPrerrequisito').off('click').on('click', () => {
            this.agregarCampoPrerrequisito(asignaturasDisponibles);
        });
        
        // Configurar eliminar prerrequisitos
        $('.eliminar-prerrequisito').off('click').on('click', function() {
            $(this).closest('.prerrequisito-item').remove();
        });
        
        // Manejar guardado
        $('#btnGuardarConfiguracion').off('click').on('click', () => {
            const creditos = parseInt($('#creditosAsignatura').val());
            const modalidad = $('#modalidadAsignatura').val();
            
            if (isNaN(creditos) || creditos < 1 || creditos > 12) {
                alert('Los créditos deben ser un número entre 1 y 12');
                return;
            }
            
            if (!modalidad) {
                alert('Debe seleccionar una modalidad');
                return;
            }
            
            // Recopilar prerrequisitos
            const prerequisitos = [];
            $('.prerrequisito-select').each(function() {
                const valor = $(this).val();
                if (valor) {
                    prerequisitos.push(parseInt(valor));
                }
            });
            
            modal.hide();
            $(`#${modalId}`).on('hidden.bs.modal', function() {
                $(this).remove();
            });
            
            callback(creditos, modalidad, prerequisitos);
        });
    }

    // ========== MÉTODOS AUXILIARES PARA PRERREQUISITOS ==========
    static obtenerAsignaturasParaPrerequisitos(excluirId) {
        const asignaturas = [];
        $('.draggable-item').each(function() {
            const id = $(this).data('id');
            if (id != excluirId) {
                asignaturas.push({
                    id: id,
                    nombre: $(this).data('nombre'),
                    codigo: $(this).data('codigo')
                });
            }
        });
        return asignaturas;
    }

    static agregarCampoPrerrequisito(asignaturas) {
        const container = $('#prerrequisitos-container');
        const index = container.children().length;
        
        const campoHTML = `
            <div class="input-group mb-2 prerrequisito-item" data-index="${index}">
                <select class="form-select form-select-sm prerrequisito-select">
                    <option value="">Seleccione asignatura...</option>
                    ${asignaturas.map(a => `<option value="${a.id}">${a.codigo} - ${a.nombre}</option>`).join('')}
                </select>
                <button class="btn btn-sm btn-outline-danger eliminar-prerrequisito" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.append(campoHTML);
        
        // Evento para eliminar el campo
        $('.eliminar-prerrequisito').off('click').on('click', function() {
            $(this).closest('.prerrequisito-item').remove();
        });
    }

    static buscarAsignaturaPorId(id) {
        for (const semId in u_planEstudio.asignaturasPorSemestre) {
            const asig = u_planEstudio.asignaturasPorSemestre[semId].find(a => a.idAsignatura == id);
            if (asig) return asig;
        }
        return null;
    }

    static obtenerNombresPrerrequisitos(prerequisitos) {
        if (!prerequisitos || prerequisitos.length === 0) return '';
        
        // Si prerequisitos es un array de objetos con nombre
        if (typeof prerequisitos[0] === 'object') {
            return prerequisitos.map(p => p.nombre).join(', ');
        }
        
        // Si prerequisitos es un array de IDs (para compatibilidad con código existente)
        const nombres = [];
        prerequisitos.forEach(id => {
            // Buscar en todas las asignaturas de todos los semestres
            for (const semId in u_planEstudio.asignaturasPorSemestre) {
                const asig = u_planEstudio.asignaturasPorSemestre[semId].find(a => a.idAsignatura == id);
                if (asig) {
                    nombres.push(asig.nombreAsignatura);
                    break;
                }
            }
        });
        
        return nombres.join(', ');
    }

    static obtenerTextoModalidad(modalidad) {
        const modales = {
            'basica': 'Básica',
            'obligatoria': 'Obligatoria',
            'opcional': 'Opcional',
            'especifica': 'Específica'
        };
        return modales[modalidad] || modalidad || 'No definida';
    }

    // ========== ACTUALIZAR VISTA DE SEMESTRE ==========
    static actualizarVistaSemestre(semestreId) {
        const lista = $(`#semestre${semestreId}-list`);
        if (!lista.length) return;

        lista.empty();

        const asignaturas = u_planEstudio.asignaturasPorSemestre[semestreId] || [];
        
        asignaturas.forEach((asignatura, index) => {
            // Obtener nombres de prerrequisitos
            let prerequisitosNombres = '';
            if (asignatura.prerequisitos) {
                if (asignatura.prerequisitos.length > 0) {
                    if (typeof asignatura.prerequisitos[0] === 'object') {
                        // Nuevo formato: array de objetos
                        prerequisitosNombres = asignatura.prerequisitos.map(p => p.nombre).join(', ');
                    } else {
                        // Formato antiguo: array de IDs
                        prerequisitosNombres = this.obtenerNombresPrerrequisitos(asignatura.prerequisitos);
                    }
                }
            }
            
            const modalidadTexto = this.obtenerTextoModalidad(asignatura.modalidad);
            
            const item = $(`
                <div class="alert alert-warning p-2 mb-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${asignatura.nombreAsignatura || 'Sin nombre'}</strong>
                            <span class="badge bg-secondary ms-2">${modalidadTexto}</span><br>
                            <small>Créditos: ${asignatura.creditos || 0}</small><br>
                            <small class="text-muted">${asignatura.codigo || ''}</small>
                            ${prerequisitosNombres ? `<br><small class="text-info"><i class="fas fa-bookmark"></i> Prerreq: ${prerequisitosNombres}</small>` : ''}
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-1 editar-configuracion" 
                                    data-semestre="${semestreId}" 
                                    data-index="${index}"
                                    title="Editar configuración">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger eliminar-asignatura" 
                                    data-semestre="${semestreId}" 
                                    data-index="${index}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `);
            lista.append(item);
        });

        // Actualizar contadores
        $(`#asignaturas${semestreId}`).text(asignaturas.length);
        u_planEstudio.actualizarCreditos(semestreId);
    }

    static actualizarCreditos(semestreId) {
        const total = (u_planEstudio.asignaturasPorSemestre[semestreId] || []).reduce(
            (sum, a) => sum + (parseInt(a.creditos) || 0), 0
        );
        $(`#creditos${semestreId}`).text(total);
    }

    // ========== FUNCIONES DE MANEJO DE SEMESTRES ==========
    static generarSemestres(containerId, semestres, asignaturasGuardadas = {}) {
        const container = $(containerId);
        container.empty();

        if (!semestres || semestres.length === 0) {
            container.html('<div class="alert alert-warning">No hay semestres disponibles</div>');
            return;
        }

        // Inicializar asignaturasPorSemestre con los datos guardados
        u_planEstudio.asignaturasPorSemestre = {};
        
        // Ordenar semestres por número
        const semestresOrdenados = [...semestres].sort((a, b) => a.numeroSemestre - b.numeroSemestre);

        semestresOrdenados.forEach(sem => {
            const semestreId = sem.idSemestre;
            
            // Cargar asignaturas guardadas si existen
            u_planEstudio.asignaturasPorSemestre[semestreId] = asignaturasGuardadas[semestreId] || [];

            const semestreDiv = $(`
                <div class="semestre-horizontal" id="semestre-col-${semestreId}">
                    <div class="card semester-card h-100" data-semestre="${semestreId}">
                        <div class="card-header bg-warning d-flex justify-content-between align-items-center py-2">
                            <h6 class="mb-0">Semestre ${sem.numeroSemestre}</h6>
                            <div>
                                <button class="btn btn-sm btn-outline-danger eliminar-semestre" 
                                        data-semestre="${semestreId}"
                                        title="Eliminar semestre">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="asignaturas-list" 
                                 id="semestre${semestreId}-list"
                                 ondragover="u_planEstudio.allowDrop(event)"
                                 ondrop="u_planEstudio.dropAsignatura(event, ${semestreId}, window.callbackActualizarVista)">
                            </div>
                            <div class="mt-2 d-flex justify-content-between pt-2 border-top">
                                <small class="text-muted">Créditos: <span id="creditos${semestreId}">0</span></small>
                                <small class="text-muted">Asignaturas: <span id="asignaturas${semestreId}">0</span></small>
                            </div>
                        </div>
                    </div>
                </div>
            `);

            container.append(semestreDiv);
            
            // Actualizar vista con datos existentes
            u_planEstudio.actualizarVistaSemestre(semestreId);
        });
    }

    // ========== ACTUALIZAR ESTADÍSTICAS ==========
    static actualizarEstadisticas() {
        let totalAsignaturas = 0;
        let totalCreditos = 0;
        let semestresConAsignaturas = 0;

        Object.values(u_planEstudio.asignaturasPorSemestre).forEach(asignaturas => {
            if (asignaturas.length > 0) {
                totalAsignaturas += asignaturas.length;
                totalCreditos += asignaturas.reduce((sum, a) => sum + (parseInt(a.creditos) || 0), 0);
                semestresConAsignaturas++;
            }
        });

        $('#totalAsignaturas').text(totalAsignaturas);
        $('#totalCreditos').text(totalCreditos);
        $('#totalSemestres').text(semestresConAsignaturas);

        u_planEstudio.actualizarMallaCurricular();
    }

    static actualizarMallaCurricular() {
        const tbody = $('#mallaCurricularBody');
        tbody.empty();

        let tieneAsignaturas = false;

        // Ordenar semestres por ID
        const semestresOrdenados = Object.keys(u_planEstudio.asignaturasPorSemestre)
            .map(Number)
            .sort((a, b) => a - b);

        semestresOrdenados.forEach(semestreId => {
            const asignaturas = u_planEstudio.asignaturasPorSemestre[semestreId] || [];
            if (asignaturas.length > 0) {
                tieneAsignaturas = true;
                
                asignaturas.forEach(asig => {
                    const prerequisitosNombres = this.obtenerNombresPrerrequisitos(asig.prerequisitos || []);
                    const modalidadTexto = this.obtenerTextoModalidad(asig.modalidad);
                    
                    tbody.append(`
                        <tr>
                            <td>Semestre ${semestreId}</td>
                            <td>
                                ${asig.nombreAsignatura || 'Sin nombre'}
                                ${prerequisitosNombres ? `<br><small class="text-info">(Prerreq: ${prerequisitosNombres})</small>` : ''}
                            </td>
                            <td>${asig.creditos || 0} (${modalidadTexto})</td>
                        </tr>
                    `);
                });
            }
        });

        if (!tieneAsignaturas) {
            tbody.html('<tr><td colspan="3" class="text-center text-muted">No hay asignaturas asignadas</td></tr>');
        }
    }

    // ========== FILTRAR ASIGNATURAS ==========
    static filtrarAsignaturas(searchTerm) {
        const items = document.querySelectorAll('#listaAsignaturas .draggable-item');
        const term = searchTerm.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(term) ? 'block' : 'none';
        });
    }

    // ========== LIMPIAR FORMULARIO ==========
    static limpiarFormulario() {
        $('#formPlanEstudio')[0].reset();
        $('#vigentePlanEstudio').val('');
        $('#carrerasPlanEstudio').val('');
        $('.errorMensaje').text('').hide();
        $('#formPlanEstudio input, #formPlanEstudio select').removeClass('border-success border-danger');
        
        // Limpiar datos de elaboración
        u_planEstudio.asignaturasPorSemestre = {};
        
        // Auto-completar periodo con año actual - año siguiente
        $('#periodoPlanEstudio').val(this.generarPeriodoAutomatico());
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    static cargarDatosEnModal(plan) {
        $('#nombrePlanEstudio').val(plan.nombre || '');
        $('#fechaElaboracionPlanEstudio').val(plan.fechaElaboracion || '');
        $('#periodoPlanEstudio').val(plan.periodoPlanEstudio || '' || this.generarPeriodoAutomatico());
        $('#vigentePlanEstudio').val(plan.vigente || '');
        $('#carrerasPlanEstudio').val(plan.idCarrera || '');
    }

    // Función auxiliar para generar el periodo automático
    static generarPeriodoAutomatico() {
        const añoActual = new Date().getFullYear();
        const añoSiguiente = añoActual + 1;
        return `${añoActual}-${añoSiguiente}`;
    }

    // ========== GENERAR BOTONES PARA TABLA ==========
    static generarBotonesPlan(id, vigente) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-plan" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info ver-detalles-plan" title="Ver Detalles" data-id="${id}">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
    }

    // ========== ACTUALIZAR TABLA DE PLANES ==========
    static actualizarTablaPlanes(dataTable, planes, carreras) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (!planes || planes.length === 0) {
            dataTable.draw();
            return;
        }

        planes.forEach(p => {
            // Buscar nombre de la carrera
            const carrera = carreras.find(c => c.idCarrera == p.idCarrera);
            const nombreCarrera = carrera ? carrera.nombreCarrera : 'Desconocida';
            
            // Formatear fecha
            let fecha = 'Sin fecha';
            if (p.fechaElaboracion) {
                try {
                    fecha = new Date(p.fechaElaboracion).toLocaleDateString();
                } catch (e) {
                    fecha = p.fechaElaboracion;
                }
            }
            
            const fila = [
                p.nombre || 'Sin nombre',
                fecha,
                p.periodoPlanEstudio || 'Sin periodo',
                nombreCarrera,
                p.vigente || 'No',
                this.generarBotonesPlan(p.idPlanEstudio, p.vigente)
            ];
            
            dataTable.row.add(fila).draw();
        });
        
        dataTable.draw();
    }

    // ========== GENERAR HTML PARA DETALLES ==========
    // ========== GENERAR HTML PARA DETALLES ==========
static generarDetallesPlanHTML(plan, nombreCarrera, asignaturasPorSemestre) {
    let semestresHTML = '';
    
    // Ordenar semestres
    const semestresOrdenados = Object.keys(asignaturasPorSemestre).map(Number).sort((a, b) => a - b);

    semestresOrdenados.forEach(semestreId => {
        const asignaturas = asignaturasPorSemestre[semestreId] || [];
        if (asignaturas.length > 0) {
            let asignaturasHTML = '';
            asignaturas.forEach(a => {
                // Obtener nombres de prerrequisitos
                let prerequisitosNombres = '';
                if (a.prerequisitos) {
                    if (a.prerequisitos.length > 0) {
                        if (typeof a.prerequisitos[0] === 'object') {
                            // Nuevo formato: array de objetos
                            prerequisitosNombres = a.prerequisitos.map(p => p.nombre).join(', ');
                        } else {
                            // Formato antiguo: array de IDs
                            prerequisitosNombres = this.obtenerNombresPrerrequisitos(a.prerequisitos);
                        }
                    }
                }
                
                const modalidadTexto = this.obtenerTextoModalidad(a.modalidad);
                
                asignaturasHTML += `
                    <tr>
                        <td>${a.codigo || 'N/A'}</td>
                        <td>${a.nombreAsignatura || 'Sin nombre'}</td>
                        <td>${a.creditos || 0}</td>
                        <td>${modalidadTexto}</td>
                        <td>${prerequisitosNombres || 'Ninguno'}</td>
                        <td>${a.profesor || 'Por asignar'}</td>
                    </tr>
                `;
            });

            semestresHTML += `
                <div class="mt-4">
                    <h6 class="bg-warning p-2 rounded">Semestre ${semestreId}</h6>
                    <table class="table table-sm table-bordered">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Asignatura</th>
                                <th>Créditos</th>
                                <th>Modalidad</th>
                                <th>Prerrequisitos</th>
                                <th>Profesor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${asignaturasHTML}
                        </tbody>
                    </table>
                </div>
            `;
        }
    });

    if (!semestresHTML) {
        semestresHTML = '<p class="text-muted">No hay asignaturas asignadas</p>';
    }

    // Formatear fecha
    let fecha = 'Sin fecha';
    if (plan.fechaElaboracion) {
        try {
            fecha = new Date(plan.fechaElaboracion).toLocaleDateString();
        } catch (e) {
            fecha = plan.fechaElaboracion;
        }
    }

    return `
        <div class="card shadow">
            <div class="card-header bg-warning py-3">
                <h6 class="m-0 font-weight-bold">Plan de Estudios: ${plan.nombre || 'Sin nombre'}</h6>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Fecha de elaboración:</strong> ${fecha}</p>
                        <p><strong>Periodo:</strong> ${plan.periodoPlanEstudio || 'Sin periodo'}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Carrera:</strong> ${nombreCarrera}</p>
                        <p><strong>Vigente:</strong> ${plan.vigente || 'No'}</p>
                    </div>
                </div>
                
                <hr>
                
                <h5 class="mt-3">Estructura del Plan</h5>
                ${semestresHTML}
            </div>
        </div>
    `;
}

    // ========== VERIFICAR SEMESTRES ==========
    static verificarSemestres(semestres) {
        const btnAgregarSemestre = $('#btnAgregarSemestre');
        
        if (!semestres || semestres.length === 0) {
            btnAgregarSemestre.prop('disabled', true);
            btnAgregarSemestre.attr('title', 'No hay semestres disponibles. Cree semestres primero.');
            return false;
        } else {
            btnAgregarSemestre.prop('disabled', false);
            btnAgregarSemestre.attr('title', 'Agregar Semestre');
            return true;
        }
    }
}
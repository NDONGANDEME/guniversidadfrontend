import { u_utiles } from "../../public/utilidades/u_utiles.js";
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
                     data-creditos="${a.creditos || 3}"
                     data-codigo="${a.codigoAsignatura || 'N/A'}">
                    <strong>${a.codigoAsignatura || 'N/A'}</strong> - ${a.nombreAsignatura || 'Sin nombre'}<br>
                    <small class="text-muted">${a.creditos || 3} créditos</small>
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

        const data = {
            id: elemento.dataset.id,
            nombre: elemento.dataset.nombre,
            creditos: parseInt(elemento.dataset.creditos) || 3,
            codigo: elemento.dataset.codigo || 'N/A'
        };

        ev.dataTransfer.setData('text/plain', JSON.stringify(data));
        $(elemento).addClass('bg-warning');
    }

    static dropAsignatura(ev, semestreId, callbackActualizar) {
        ev.preventDefault();

        try {
            const data = JSON.parse(ev.dataTransfer.getData('text/plain'));
            
            if (!u_planEstudio.asignaturasPorSemestre[semestreId]) {
                u_planEstudio.asignaturasPorSemestre[semestreId] = [];
            }

            // Verificar si ya existe
            if (u_planEstudio.asignaturasPorSemestre[semestreId].some(a => a.id === data.id)) {
                alert('Esta asignatura ya está en este semestre');
                return;
            }

            const asignatura = {
                idAsignatura: data.id,
                nombreAsignatura: data.nombre,
                creditos: data.creditos,
                codigo: data.codigo,
                profesor: null
            };

            u_planEstudio.asignaturasPorSemestre[semestreId].push(asignatura);
            
            if (callbackActualizar) {
                callbackActualizar(semestreId);
            }
        } catch (e) {
            console.error('Error en drop:', e);
        }
    }

    // ========== ACTUALIZAR VISTA DE SEMESTRE ==========
    static actualizarVistaSemestre(semestreId) {
        const lista = $(`#semestre${semestreId}-list`);
        if (!lista.length) return;

        lista.empty();

        const asignaturas = u_planEstudio.asignaturasPorSemestre[semestreId] || [];
        
        asignaturas.forEach((asignatura, index) => {
            const item = $(`
                <div class="alert alert-warning p-2 mb-2 d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${asignatura.nombreAsignatura || 'Sin nombre'}</strong><br>
                        <small>${asignatura.creditos || 0} créditos</small>
                    </div>
                    <div>
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
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    static cargarDatosEnModal(plan) {
        $('#nombrePlanEstudio').val(plan.nombre || '');
        $('#fechaElaboracionPlanEstudio').val(plan.fechaElaboracion || '');
        $('#periodoPlanEstudio').val(plan.periodoPlanEstudio || '');
        $('#vigentePlanEstudio').val(plan.vigente || '');
        $('#carrerasPlanEstudio').val(plan.idCarrera || '');
    }

    // ========== GENERAR BOTONES PARA TABLA ==========
    static generarBotonesPlan(id, vigente) {
        const iconoToggle = vigente === 'Sí' ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = vigente === 'Sí' ? 'btn-outline-danger' : 'btn-outline-success';
        const textoToggle = vigente === 'Sí' ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-plan" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-info ver-detalles-plan" title="Ver Detalles" data-id="${id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm ${claseToggle} toggle-estado-plan" title="${textoToggle}" data-id="${id}">
                    <i class="fas ${iconoToggle}"></i>
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
            
            const nodoFila = dataTable.row.add(fila).draw(false).node();
            
            // Si no está vigente, atenuar la fila
            if (p.vigente !== 'Sí') {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }
        });
        
        dataTable.draw();
    }

    // ========== GENERAR HTML PARA DETALLES ==========
    static generarDetallesPlanHTML(plan, nombreCarrera, asignaturasPorSemestre) {
        let semestresHTML = '';
        
        // Ordenar semestres
        const semestresOrdenados = Object.keys(asignaturasPorSemestre)
            .map(Number)
            .sort((a, b) => a - b);

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
        const btnAgregarSemestre = $('.btn-dark[onclick="agregarSemestre()"]');
        
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
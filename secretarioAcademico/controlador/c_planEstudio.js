import { m_asignatura } from "../../admin/modelo/m_asignatura.js";
import { m_carrera } from "../../admin/modelo/m_carrera.js";
import { m_semestre } from "../../admin/modelo/m_semestre.js";
import { sesiones } from "../../public/core/sesiones.js";
import { m_sesion } from "../../public/modelo/m_sesion.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_planEstudio } from "../modelo/m_planEstudio.js";
import { m_PlanSemestreAsignatura } from "../modelo/m_PlanSemestreAsignatura.js";
import { m_prerequisito } from "../modelo/m_prerequisito.js";
import { u_planEstudio } from "../utilidades/u_planEstudio.js";

export class c_planEstudio {
    constructor() {
        // Planes de estudio
        this.planes = [];
        this.planActual = null;
        this.modoEdicion = false;
        this.dataTablePlanes = null;
        
        // Datos relacionados
        this.carreras = [];
        this.semestres = [];
        this.asignaturas = [];
        
        // Modal
        this.modalInstance = null;
        this.modalDetallesInstance = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            //sesiones.verificarExistenciaSesion();
            
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionSecretario();
            
            this.inicializarDataTables();
            
            await this.cargarCarreras();
            await this.cargarSemestres();
            await this.cargarAsignaturas();
            await this.cargarPlanes();
            
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarDragAndDrop();
            
            // Inicializar modales
            const modalElement = document.getElementById('modalNuevoPlanEstudio');
            if (modalElement) {
                this.modalInstance = new bootstrap.Modal(modalElement);
            }
            
            const modalDetallesElement = document.getElementById('modalVerDetallesPlanEstudio');
            if (modalDetallesElement) {
                this.modalDetallesInstance = new bootstrap.Modal(modalDetallesElement);
            }
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            //Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTables() {
        if ($.fn.dataTable.isDataTable('#tablaPlanesEstudios')) {
            $('#tablaPlanesEstudios').DataTable().destroy();
        }
        this.dataTablePlanes = $('#tablaPlanesEstudios').DataTable({
            language: { 
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' 
            },
            columnDefs: [{ orderable: false, targets: [5] }]
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarCarreras() {
        try {
            this.carreras = await m_carrera.obtenerCarreras() || [];
            u_planEstudio.cargarCarrerasEnSelect(this.carreras);
        } catch (error) {
            console.error('Error cargando carreras:', error);
            this.carreras = [];
        }
    }

    async cargarSemestres() {
        try {
            this.semestres = await m_semestre.obtenerSemestres() || [];
            u_planEstudio.semestresDisponibles = this.semestres;
            
            // Verificar si hay semestres y deshabilitar botón si no hay
            u_planEstudio.verificarSemestres(this.semestres);
            
        } catch (error) {
            console.error('Error cargando semestres:', error);
            this.semestres = [];
            u_planEstudio.verificarSemestres([]); // Deshabilita botón
        }
    }

    async cargarAsignaturas() {
        // datos del actor: vamos a recuperrar el id de la facultad a la que pertenece el actor
        let actorConectado = m_sesion.leerSesion('usuarioActivo');
        let idFacultadActor = actorConectado.datos_rol.idFacultad;

        try {
            this.asignaturas = await m_asignatura.obtenerAsignaturasPorFacultad(idFacultadActor) || [];
            u_planEstudio.cargarAsignaturasEnBiblioteca(this.asignaturas);
        } catch (error) {
            console.error('Error cargando asignaturas:', error);
            this.asignaturas = [];
        }
    }

    async cargarPlanes() {
        try {
            this.planes = await m_planEstudio.obtenerPlanesEstudios() || [];
            this.actualizarTablaPlanes();
        } catch (error) {
            console.error('Error cargando planes:', error);
            Alerta.error('Error', 'Fallo al cargar planes de estudio');
            this.planes = [];
        }
    }

    async cargarAsignaturasPorPlan(idPlan) {
        try {
            const relaciones = await m_PlanSemestreAsignatura.obtenerPlanSemestreAsignaturas() || [];
            
            // Filtrar por el plan actual
            const relacionesPlan = relaciones.filter(r => r.idPlanEstudio == idPlan);
            
            const asignaturasPorSemestre = {};
            
            // Obtener todos los prerrequisitos
            const todosPrerequisitos = await m_prerequisito.obtenerPrerequisito() || [];
            console.log('Prerrequisitos desde backend:', todosPrerequisitos);
            
            for (const rel of relacionesPlan) {
                if (!asignaturasPorSemestre[rel.idSemestre]) {
                    asignaturasPorSemestre[rel.idSemestre] = [];
                }
                
                // Buscar información completa de la asignatura
                const asignatura = this.asignaturas.find(a => a.idAsignatura == rel.idAsignatura);
                
                // Filtrar prerrequisitos para esta asignatura específica
                const prerequisitosAsignatura = todosPrerequisitos
                    .filter(p => p.idAsignatura == rel.idAsignatura)
                    .map(p => ({
                        id: p.idAsignaturaRequerida,
                        codigo: p.codigoAsignaturaRequerida,
                        nombre: p.nombreAsignaturaRequerida
                    }));
                
                console.log(`Prerrequisitos para asignatura ${rel.idAsignatura}:`, prerequisitosAsignatura);
                
                asignaturasPorSemestre[rel.idSemestre].push({
                    idAsignatura: rel.idAsignatura,
                    nombreAsignatura: asignatura ? asignatura.nombreAsignatura : 'Desconocida',
                    creditos: rel.creditos || 3,
                    modalidad: rel.modalidad || 'obligatoria',
                    codigo: asignatura ? asignatura.codigoAsignatura : 'N/A',
                    prerequisitos: prerequisitosAsignatura, // Guardar objeto completo con id, codigo y nombre
                    profesor: null
                });
            }
            
            return asignaturasPorSemestre;
            
        } catch (error) {
            console.error('Error cargando asignaturas del plan:', error);
            return {};
        }
    }

    async guardarAsignaturasPorSemestre(idPlan) {
        try {
            // Obtener relaciones existentes
            const todasRelaciones = await m_PlanSemestreAsignatura.obtenerPlanSemestreAsignaturas() || [];
            const relacionesExistentes = todasRelaciones.filter(r => r.idPlanEstudio == idPlan);
            
            // Crear mapa de relaciones existentes
            const mapaExistente = {};
            relacionesExistentes.forEach(r => {
                const key = `${r.idSemestre}-${r.idAsignatura}`;
                mapaExistente[key] = r;
            });

            // Procesar cada semestre
            for (const semestreId in u_planEstudio.asignaturasPorSemestre) {
                const asignaturas = u_planEstudio.asignaturasPorSemestre[semestreId];
                
                for (const asig of asignaturas) {
                    const key = `${semestreId}-${asig.idAsignatura}`;
                    
                    // Preparar objeto con todos los datos
                    const relacionData = {
                        idPlanEstudio: idPlan,
                        idSemestre: semestreId,
                        idAsignatura: asig.idAsignatura,
                        creditos: asig.creditos || 3,
                        modalidad: asig.modalidad || 'obligatoria'
                    };
                    
                    if (!mapaExistente[key]) {
                        // Nueva relación
                        const resultado = await m_PlanSemestreAsignatura.insertarPlanSemestreAsignatura(relacionData);
                        
                        // Guardar prerrequisitos
                        if (asig.prerequisitos && asig.prerequisitos.length > 0) {
                            for (const prereqId of asig.prerequisitos) {
                                await m_prerequisito.insertarPrerequisito({
                                    idAsignatura: asig.idAsignatura,
                                    idAsignaturaRequerida: prereqId
                                });
                            }
                        }
                        
                    } else {
                        // Actualizar relación existente (incluyendo modalidad si cambió)
                        relacionData.idPlanSemestreAsignatura = mapaExistente[key].idPlanSemestreAsignatura;
                        await m_PlanSemestreAsignatura.actualizarPlanSemestreAsignatura(relacionData);
                        
                        // Actualizar prerrequisitos: eliminar existentes y crear nuevos
                        const prerequisitosExistentes = await m_prerequisito.obtenerPrerequisito() || [];
                        const prerequisitosActuales = prerequisitosExistentes.filter(p => p.idAsignatura == asig.idAsignatura);
                        
                        // Eliminar prerrequisitos que ya no están
                        for (const prereq of prerequisitosActuales) {
                            if (!asig.prerequisitos.includes(prereq.idAsignaturaRequerida)) {
                                // Aquí deberías tener un método para eliminar prerrequisito
                                console.log('Eliminar prerrequisito:', prereq.idPrerrequisito);
                            }
                        }
                        
                        // Insertar nuevos prerrequisitos
                        if (asig.prerequisitos && asig.prerequisitos.length > 0) {
                            for (const prereqId of asig.prerequisitos) {
                                const existe = prerequisitosActuales.some(p => p.idAsignaturaRequerida == prereqId);
                                if (!existe) {
                                    await m_prerequisito.insertarPrerequisito({
                                        idAsignatura: asig.idAsignatura,
                                        idAsignaturaRequerida: prereqId
                                    });
                                }
                            }
                        }
                        
                        delete mapaExistente[key];
                    }
                }
            }
            
            // Las relaciones que quedaron en mapaExistente ya no están en el plan actual, se eliminan
            for (const key in mapaExistente) {
                // Aquí podrías deshabilitar o eliminar la relación
                console.log('Relación eliminada:', mapaExistente[key]);
            }
            
        } catch (error) {
            console.error('Error guardando asignaturas:', error);
            throw error;
        }
    }

    // ========== VALIDACIONES ==========
    configurarValidaciones() {
        u_planEstudio.configurarValidaciones();
    }

    // ========== CONFIGURAR DRAG & DROP ==========
    configurarDragAndDrop() {
        // Hacer funciones accesibles globalmente
        window.u_planEstudio = u_planEstudio;
        window.callbackActualizarVista = (semestreId) => {
            u_planEstudio.actualizarVistaSemestre(semestreId);
            this.actualizarEstadisticas();
        };

        // Inicializar eventos drag en elementos existentes
        $(document).on('dragstart', '.draggable-item', function(e) {
            u_planEstudio.dragAsignatura(e.originalEvent);
        });

        $(document).on('dragend', '.draggable-item', function() {
            $(this).removeClass('bg-warning');
        });
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Botón nuevo plan
        $('.nuevo').off('click').on('click', () => {
            this.modoEdicion = false;
            this.planActual = null;
            u_planEstudio.limpiarFormulario();
            u_planEstudio.configurarModoEdicion(false);
            
            // Cambiar a la primera pestaña
            $('#datos-tab').tab('show');
        });

        // Guardar plan
        $('#btnGuardarPlanEstudio').off('click').on('click', () => this.guardarPlan());

        // Cambio de pestaña
        $('button[data-bs-toggle="tab"]').off('shown.bs.tab').on('shown.bs.tab', (e) => {
            if (e.target.id === 'elaboracion-tab') {
                this.generarSemestresEnModal();
            } else if (e.target.id === 'revision-tab') {
                this.actualizarEstadisticas();
            }
        });

        // Eventos de la tabla (usar event delegation)
        $(document).off('click', '.editar-plan').on('click', '.editar-plan', (e) => {
            e.stopPropagation();
            this.editarPlan($(e.currentTarget).data('id'));
        });

        $(document).off('click', '.ver-detalles-plan').on('click', '.ver-detalles-plan', (e) => {
            e.stopPropagation();
            this.verDetallesPlan($(e.currentTarget).data('id'));
        });

        $(document).off('click', '.toggle-estado-plan').on('click', '.toggle-estado-plan', (e) => {
            e.stopPropagation();
            this.cambiarEstadoPlan($(e.currentTarget).data('id'));
        });

        // Eliminar asignatura de semestre
        $(document).off('click', '.eliminar-asignatura').on('click', '.eliminar-asignatura', (e) => {
            e.stopPropagation();
            const semestreId = $(e.currentTarget).data('semestre');
            const index = $(e.currentTarget).data('index');
            this.eliminarAsignatura(semestreId, index);
        });

        // Eliminar semestre
        $(document).off('click', '.eliminar-semestre').on('click', '.eliminar-semestre', (e) => {
            e.stopPropagation();
            const semestreId = $(e.currentTarget).data('semestre');
            this.eliminarSemestre(semestreId);
        });

        // Búsqueda de asignaturas
        $('#searchAsignatura').off('keyup').on('keyup', function() {
            u_planEstudio.filtrarAsignaturas($(this).val());
        });

        // Cuando se cierra el modal
        $('#modalNuevoPlanEstudio').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_planEstudio.limpiarFormulario();
            }
        });

        // Evento para editar configuración de asignatura (créditos, modalidad, prerrequisitos)
        $(document).off('click', '.editar-configuracion').on('click', '.editar-configuracion', (e) => {
            e.stopPropagation();
            const semestreId = $(e.currentTarget).data('semestre');
            const index = $(e.currentTarget).data('index');
            this.editarConfiguracionAsignatura(semestreId, index);
        });
    }

    editarConfiguracionAsignatura(semestreId, index) {
        u_planEstudio.editarConfiguracionAsignatura(semestreId, index, (nuevosCreditos, nuevaModalidad, nuevosPrerequisitos) => {
            const asignatura = u_planEstudio.asignaturasPorSemestre[semestreId]?.[index];
            if (asignatura) {
                asignatura.creditos = nuevosCreditos;
                asignatura.modalidad = nuevaModalidad;
                asignatura.prerequisitos = nuevosPrerequisitos;
                
                u_planEstudio.actualizarVistaSemestre(semestreId);
                this.actualizarEstadisticas();
            }
        });
    }

    generarSemestresEnModal() {
        if (!this.semestres || this.semestres.length === 0) {
            $('#semestres-container').html(`
                <div class="alert alert-warning text-center p-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <h5>No hay semestres disponibles</h5>
                    <p class="mb-0">Para elaborar un plan de estudios, primero debe crear semestres en el módulo de Currículo.</p>
                </div>
            `);
            return;
        }

        u_planEstudio.generarSemestres('#semestres-container', this.semestres, u_planEstudio.asignaturasPorSemestre);
    }

    actualizarEstadisticas() {
        u_planEstudio.actualizarEstadisticas();
    }

    eliminarAsignatura(semestreId, index) {
        if (u_planEstudio.asignaturasPorSemestre[semestreId]) {
            u_planEstudio.asignaturasPorSemestre[semestreId].splice(index, 1);
            u_planEstudio.actualizarVistaSemestre(semestreId);
            this.actualizarEstadisticas();
        }
    }

    eliminarSemestre(semestreId) {
        if (u_planEstudio.asignaturasPorSemestre[semestreId]?.length > 0) {
            Alerta.advertencia('No se puede eliminar', 'El semestre tiene asignaturas asignadas');
            return;
        }

        $(`#semestre-col-${semestreId}`).remove();
        delete u_planEstudio.asignaturasPorSemestre[semestreId];
        this.actualizarEstadisticas();
    }

    // ========== FUNCIONES PARA PLANES ==========
    
    formularioPlanEsValido() {
        const nombre = $('#nombrePlanEstudio').val().trim();
        const fecha = $('#fechaElaboracionPlanEstudio').val();
        const periodo = $('#periodoPlanEstudio').val().trim();
        const vigente = $('#vigentePlanEstudio').val();
        const idCarrera = $('#carrerasPlanEstudio').val();
        
        // En modo edición, los campos pueden estar vacíos (no se modifican)
        if (this.modoEdicion) {
            if (nombre && !u_planEstudio.validarNombre(nombre)) return false;
            if (fecha && !u_planEstudio.validarFecha(fecha)) return false;
            if (periodo && !u_planEstudio.validarPeriodo(periodo)) return false;
            if (vigente && !u_planEstudio.validarVigente(vigente)) return false;
            if (idCarrera && !u_planEstudio.validarCarrera(idCarrera)) return false;
            return true;
        }
        
        // Para nuevo plan, todos son obligatorios
        return u_planEstudio.validarNombre(nombre) && 
               u_planEstudio.validarFecha(fecha) && 
               u_planEstudio.validarPeriodo(periodo) && 
               u_planEstudio.validarVigente(vigente) && 
               u_planEstudio.validarCarrera(idCarrera);
    }

    async guardarPlan() {
        if (!this.formularioPlanEsValido()) {
            Alerta.advertencia('Campos inválidos', 'Complete correctamente los campos');
            return;
        }
        
        try {
            const datos = {
                nombre: $('#nombrePlanEstudio').val().trim(),
                fechaElaboracion: $('#fechaElaboracionPlanEstudio').val(),
                periodoPlanEstudio: $('#periodoPlanEstudio').val().trim(),
                vigente: $('#vigentePlanEstudio').val(),
                idCarrera: $('#carrerasPlanEstudio').val()
            };
            
            let resultado;
            let idPlan;
            
            if (this.modoEdicion) {
                datos.idPlanEstudio = this.planActual.idPlanEstudio;
                resultado = await m_planEstudio.actualizarPlanEstudio(datos);
                idPlan = this.planActual.idPlanEstudio;
            } else {
                resultado = await m_planEstudio.insertarPlanEstudio(datos);
                idPlan = resultado?.idPlanEstudio || resultado?.id;
            }
            
            if (resultado && idPlan) {
                // Guardar relaciones con asignaturas (incluye modalidad y prerrequisitos)
                await this.guardarAsignaturasPorSemestre(idPlan);
                
                await this.cargarPlanes();
                if (this.modalInstance) {
                    this.modalInstance.hide();
                }
                Alerta.exito('Éxito', this.modoEdicion ? 'Plan actualizado' : 'Plan creado');
            }
        } catch (error) {
            console.error('Error al guardar plan:', error);
            Alerta.error('Error', 'No se pudo guardar el plan');
        }
    }

    async editarPlan(id) {
        const plan = this.planes.find(p => p.idPlanEstudio == id);
        if (!plan) return;
        
        this.modoEdicion = true;
        this.planActual = plan;
        
        // Cargar asignaturas del plan
        const asignaturasGuardadas = await this.cargarAsignaturasPorPlan(id);
        u_planEstudio.asignaturasPorSemestre = asignaturasGuardadas;
        
        // Cargar datos en el formulario
        u_planEstudio.cargarDatosEnModal(plan);
        u_planEstudio.configurarModoEdicion(true);
        
        // Abrir modal en la pestaña de datos generales
        $('#datos-tab').tab('show');
        
        if (this.modalInstance) {
            this.modalInstance.show();
        }
    }

    async verDetallesPlan(id) {
        const plan = this.planes.find(p => p.idPlanEstudio == id);
        if (!plan) return;
        
        try {
            const carrera = this.carreras.find(c => c.idCarrera == plan.idCarrera);
            const nombreCarrera = carrera ? carrera.nombreCarrera : 'Desconocida';
            
            const asignaturasPorSemestre = await this.cargarAsignaturasPorPlan(id);
            
            const html = u_planEstudio.generarDetallesPlanHTML(plan, nombreCarrera, asignaturasPorSemestre);
            $('#modalVerDetallesPlanEstudio .card-body').html(html);
            
            if (this.modalDetallesInstance) {
                this.modalDetallesInstance.show();
            }
        } catch (error) {
            console.error('Error al ver detalles:', error);
            Alerta.error('Error', 'No se pudieron cargar los detalles');
        }
    }

    actualizarTablaPlanes() {
        u_planEstudio.actualizarTablaPlanes(this.dataTablePlanes, this.planes, this.carreras);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_planEstudio();
    await controlador.inicializar();
});
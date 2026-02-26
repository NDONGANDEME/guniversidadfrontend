import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_estudiante } from "../modelo/m_estudiante.js";
import { m_matricula } from "../modelo/m_matricula.js";
import { m_matriculaAsignatura } from "../modelo/m_matriculaAsignatura.js";
import { m_PlanSemestreAsignatura } from "../modelo/m_PlanSemestreAsignatura.js";
import { u_estudiante } from "../utilidades/u_estudiante.js";

export class c_estudiante {
    constructor() {
        // Datos principales
        this.estudiantes = [];
        this.matriculas = [];
        this.datosEspecificos = [];
        
        // Datos para asignación
        this.estudianteActual = null;
        this.matriculaActual = null;
        this.asignaturasSemestre = [];
        this.asignaturasPendientesBloqueadas = [];
        
        // DataTable
        this.dataTableEstudiantes = null;
        
        // Modales
        this.modalAsignacionInstance = null;
        this.modalDetallesInstance = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionSecretario();
            
            this.inicializarDataTables();
            
            // Primero cargar datos específicos de estudiantes
            await this.cargarDatosEspecificos();
            
            this.configurarEventos();
            
            // Inicializar modales
            const modalAsignacion = document.getElementById('modalAsignarAsignatura');
            if (modalAsignacion) {
                this.modalAsignacionInstance = new bootstrap.Modal(modalAsignacion);
            }
            
            const modalDetalles = document.getElementById('modalVerDetallesEstudiante');
            if (modalDetalles) {
                this.modalDetallesInstance = new bootstrap.Modal(modalDetalles);
            }
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTables() {
        if ($.fn.dataTable.isDataTable('#tablaEstudiantes')) {
            $('#tablaEstudiantes').DataTable().destroy();
        }
        this.dataTableEstudiantes = $('#tablaEstudiantes').DataTable({
            language: { 
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' 
            },
            columnDefs: [{ orderable: false, targets: [5] }]
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarDatosEspecificos() {
        try {
            // Esta es la primera función que se llama
            this.datosEspecificos = await m_estudiante.obtenerDatosEspecificosEstudiantes() || [];
            
            // Cargar también las matrículas para tener los IDs
            await this.cargarMatriculas();
            
            // Actualizar tabla con los datos específicos
            this.actualizarTablaEstudiantes();
            
        } catch (error) {
            console.error('Error cargando datos específicos:', error);
            Alerta.error('Error', 'Fallo al cargar datos de estudiantes');
            this.datosEspecificos = [];
        }
    }

    async cargarMatriculas() {
        try {
            this.matriculas = await m_matricula.obtenerMatriculas() || [];
        } catch (error) {
            console.error('Error cargando matrículas:', error);
            this.matriculas = [];
        }
    }

    async cargarAsignaturasSemestre(idPlanEstudio, idSemestre) {
        try {
            const relaciones = await m_PlanSemestreAsignatura.obtenerPlanSemestreAsignaturas() || [];
            
            // Filtrar por plan y semestre
            this.asignaturasSemestre = relaciones.filter(r => 
                r.idPlanEstudio == idPlanEstudio && r.idSemestre == idSemestre
            );
            
            // Enriquecer con datos de asignatura
            for (let i = 0; i < this.asignaturasSemestre.length; i++) {
                const asig = this.asignaturasSemestre[i];
                // Aquí podrías cargar más detalles de la asignatura si es necesario
            }
            
        } catch (error) {
            console.error('Error cargando asignaturas del semestre:', error);
            this.asignaturasSemestre = [];
        }
    }

    async cargarAsignaturasPendientesYBloqueadas(idEstudiante, idPlanEstudio) {
        try {
            // Obtener matrículas del estudiante
            const matriculasEstudiante = this.matriculas.filter(m => m.idEstudiante == idEstudiante);
            
            if (matriculasEstudiante.length === 0) {
                this.asignaturasPendientesBloqueadas = [];
                return;
            }

            // Obtener todas las asignaturas del plan
            const todasAsignaturasPlan = await m_PlanSemestreAsignatura.obtenerPlanSemestreAsignaturas() || [];
            const asignaturasPlan = todasAsignaturasPlan.filter(r => r.idPlanEstudio == idPlanEstudio);
            
            // Obtener asignaturas ya matriculadas
            const asignaturasMatriculadas = [];
            for (const matricula of matriculasEstudiante) {
                const matsAsig = await m_matriculaAsignatura.obtenerMatriculaAsignaturas() || [];
                const filtradas = matsAsig.filter(ma => ma.idMatricula == matricula.idMatricula);
                asignaturasMatriculadas.push(...filtradas);
            }

            // Determinar pendientes y bloqueadas
            // Esta lógica puede variar según tu backend
            this.asignaturasPendientesBloqueadas = asignaturasPlan.filter(asig => {
                const matriculada = asignaturasMatriculadas.some(ma => 
                    ma.idPlanSemestreAsignatura == asig.idPlanSemestreAsignatura
                );
                return !matriculada; // Por ahora, las no matriculadas son pendientes
            });

        } catch (error) {
            console.error('Error cargando asignaturas pendientes:', error);
            this.asignaturasPendientesBloqueadas = [];
        }
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Ver detalles
        $(document).off('click', '.ver-detalles-estudiante').on('click', '.ver-detalles-estudiante', (e) => {
            e.stopPropagation();
            const idMatricula = $(e.currentTarget).data('id');
            const idEstudiante = $(e.currentTarget).data('estudiante');
            this.verDetallesEstudiante(idMatricula, idEstudiante);
        });

        // Asignar asignaturas
        $(document).off('click', '.asignar-asignaturas').on('click', '.asignar-asignaturas', (e) => {
            e.stopPropagation();
            const idMatricula = $(e.currentTarget).data('id');
            const idEstudiante = $(e.currentTarget).data('estudiante');
            this.abrirModalAsignacion(idMatricula, idEstudiante);
        });

        // Agregar asignatura a selección
        $(document).off('click', '.btn-agregar-asignatura').on('click', '.btn-agregar-asignatura', (e) => {
            e.stopPropagation();
            u_estudiante.agregarAsignatura(e.currentTarget);
        });

        // Quitar asignatura de selección
        $(document).off('click', '.btn-quitar-asignatura').on('click', '.btn-quitar-asignatura', (e) => {
            e.stopPropagation();
            const index = $(e.currentTarget).data('index');
            u_estudiante.quitarAsignatura(index);
        });

        // Guardar asignación
        $('#btnGuardarAsignación').off('click').on('click', () => this.guardarAsignacion());

        // Limpiar modales al cerrar
        $('#modalAsignarAsignatura').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            u_estudiante.limpiarModalAsignacion();
        });

        $('#modalVerDetallesEstudiante').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            u_estudiante.limpiarModalDetalles();
        });
    }

    // ========== FUNCIONES PARA ESTUDIANTES ==========
    
    async verDetallesEstudiante(idMatricula, idEstudiante) {
        try {
            // Buscar datos específicos
            const datosEstudiante = this.datosEspecificos.find(d => d.idEstudiante == idEstudiante);
            
            if (!datosEstudiante) {
                Alerta.advertencia('Datos no encontrados', 'No se encontró información del estudiante');
                return;
            }

            // Buscar matrícula actual
            const matricula = this.matriculas.find(m => m.idMatricula == idMatricula);
            
            // Combinar datos
            const datosCompletos = {
                ...datosEstudiante,
                idMatricula: idMatricula,
                // Agregar más datos de la matrícula si es necesario
            };

            // Cargar asignaturas matriculadas (opcional)
            const matsAsig = await m_matriculaAsignatura.obtenerMatriculaAsignaturas() || [];
            const asignaturasMatriculadas = matsAsig.filter(ma => ma.idMatricula == idMatricula);
            
            datosCompletos.asignaturas = asignaturasMatriculadas;

            // Generar y mostrar HTML
            const html = u_estudiante.generarDetallesEstudianteHTML(datosCompletos);
            $('#modalVerDetallesEstudiante .card-body').html(html);
            
            if (this.modalDetallesInstance) {
                this.modalDetallesInstance.show();
            }
            
        } catch (error) {
            console.error('Error al ver detalles:', error);
            Alerta.error('Error', 'No se pudieron cargar los detalles');
        }
    }

    async abrirModalAsignacion(idMatricula, idEstudiante) {
        try {
            u_estudiante.limpiarModalAsignacion();
            
            // Buscar datos del estudiante
            const datosEstudiante = this.datosEspecificos.find(d => d.idEstudiante == idEstudiante);
            const matricula = this.matriculas.find(m => m.idMatricula == idMatricula);
            
            if (!datosEstudiante || !matricula) {
                Alerta.advertencia('Datos no encontrados', 'No se encontró información del estudiante o matrícula');
                return;
            }

            this.estudianteActual = datosEstudiante;
            this.matriculaActual = matricula;

            // Cargar datos en el modal
            u_estudiante.cargarDatosEnModalAsignacion({
                convocatoria: datosEstudiante.convocatoria || 0,
                vecesMatriculado: datosEstudiante.vecesMatriculado || 0,
                notaFinal: datosEstudiante.notaFinal || 0
            });

            // Cargar asignaturas del semestre
            await this.cargarAsignaturasSemestre(
                matricula.idPlanEstudio, 
                datosEstudiante.idSemestre
            );
            
            u_estudiante.cargarAsignaturasSemestre(
                this.asignaturasSemestre, 
                datosEstudiante.semestre
            );

            // Cargar asignaturas pendientes y bloqueadas
            await this.cargarAsignaturasPendientesYBloqueadas(
                idEstudiante, 
                matricula.idPlanEstudio
            );
            
            u_estudiante.cargarAsignaturasPendientesYBloqueadas(
                this.asignaturasPendientesBloqueadas
            );

            if (this.modalAsignacionInstance) {
                this.modalAsignacionInstance.show();
            }
            
        } catch (error) {
            console.error('Error al abrir modal de asignación:', error);
            Alerta.error('Error', 'No se pudo abrir el modal de asignación');
        }
    }

    async guardarAsignacion() {
        if (!this.matriculaActual || !this.estudianteActual) {
            Alerta.advertencia('Error', 'No hay datos de matrícula o estudiante');
            return;
        }

        if (u_estudiante.asignaturasSeleccionadas.length === 0) {
            Alerta.advertencia('Selección vacía', 'Debe seleccionar al menos una asignatura');
            return;
        }

        try {
            // Guardar cada asignatura seleccionada
            for (const asig of u_estudiante.asignaturasSeleccionadas) {
                const datosMatriculaAsignatura = {
                    idMatricula: this.matriculaActual.idMatricula,
                    idPlanSemestreAsignatura: asig.id,
                    convocatoria: parseInt($('#convocatoriaAsignacion').val()) || 0,
                    notaFinal: 0, // Inicialmente 0
                    estado: 'cursando',
                    numeroVecesMatriculado: parseInt($('#vecesMatriculadoAsignacion').val()) || 0
                };

                await m_matriculaAsignatura.insertarMatriculaAsignatura(datosMatriculaAsignatura);
            }

            // Actualizar total de créditos en matrícula si es necesario
            await m_matricula.actualizarMatricula({
                idMatricula: this.matriculaActual.idMatricula,
                totalCreditos: u_estudiante.creditosActuales
            });

            Alerta.exito('Éxito', 'Asignaturas asignadas correctamente');
            
            if (this.modalAsignacionInstance) {
                this.modalAsignacionInstance.hide();
            }

            // Recargar datos
            await this.cargarDatosEspecificos();
            
        } catch (error) {
            console.error('Error al guardar asignación:', error);
            Alerta.error('Error', 'No se pudo guardar la asignación');
        }
    }

    actualizarTablaEstudiantes() {
        // Transformar datos específicos al formato de la tabla
        const datosTabla = this.datosEspecificos.map(d => ({
            idEstudiante: d.idEstudiante,
            idMatricula: d.idMatricula,
            nombreCompleto: d.nombreCompleto,
            carrera: d.carrera,
            curso: d.curso,
            semestre: d.semestre,
            numeroAsignaturas: d.numeroAsignaturas || '0'
        }));

        u_estudiante.actualizarTablaEstudiantes(this.dataTableEstudiantes, datosTabla);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_estudiante();
    await controlador.inicializar();
});
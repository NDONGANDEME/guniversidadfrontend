import { sesiones } from "../../public/core/sesiones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_estudiante } from "../utilidades/u_estudiante.js";
import { m_estudiante } from "../modelo/m_estudiante.js";
import { m_matricula } from "../modelo/m_matricula.js";
import { m_matriculaAsignatura } from "../modelo/m_matriculaAsignatura.js";
import { m_planEstudio } from "../modelo/m_planEstudio.js";
import { m_asignatura } from "../../admin/modelo/m_asignatura.js";
import { m_semestre } from "../../admin/modelo/m_semestre.js";
import { m_curso } from "../../admin/modelo/m_curso.js";
import { m_carrera } from "../../admin/modelo/m_carrera.js";

export class c_estudiante {
    constructor() {
        // Estudiantes y matriculas
        this.estudiantes = [];
        this.matriculas = [];
        this.matriculasAsignaturas = [];
        
        // Datos relacionados
        this.planesEstudio = [];
        this.carreras = [];
        this.cursos = [];
        this.semestres = [];
        this.asignaturas = [];
        
        // Estado actual
        this.estudianteSeleccionado = null;
        this.matriculaSeleccionada = null;
        this.dataTableEstudiantes = null;
        
        // Modales
        this.modalAsignacionInstance = null;
        this.modalConvalidacionInstance = null;
        this.modalDetallesInstance = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            // Verificar sesión
            //sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionSecretario();
            
            // Inicializar DataTable
            this.inicializarDataTables();
            
            // Cargar datos iniciales
            await this.cargarDatosIniciales();
            
            // Configurar eventos
            this.configurarEventos();
            
            // Inicializar modales
            const modalAsignacion = document.getElementById('modalAsignarAsignatura');
            if (modalAsignacion) {
                this.modalAsignacionInstance = new bootstrap.Modal(modalAsignacion);
            }
            
            const modalConvalidacion = document.getElementById('modalConvalidarEstudiante');
            if (modalConvalidacion) {
                this.modalConvalidacionInstance = new bootstrap.Modal(modalConvalidacion);
            }
            
            const modalDetalles = document.getElementById('modalVerDetallesEstudiante');
            if (modalDetalles) {
                this.modalDetallesInstance = new bootstrap.Modal(modalDetalles);
            }
            
            // Configurar drag and drop
            this.configurarDragAndDrop();
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            //Alerta.error('Error', 'No se pudo inicializar el módulo');
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
    async cargarDatosIniciales() {
        try {
            await Promise.all([
                this.cargarPlanesEstudio(),
                this.cargarCarreras(),
                this.cargarCursos(),
                this.cargarSemestres(),
                this.cargarAsignaturas()
            ]);
            
            await this.cargarEstudiantesMatriculados();
            
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    async cargarPlanesEstudio() {
        try {
            this.planesEstudio = await m_planEstudio.obtenerPlanesEstudios() || [];
        } catch (error) {
            console.error('Error cargando planes:', error);
            this.planesEstudio = [];
        }
    }

    async cargarCarreras() {
        try {
            this.carreras = await m_carrera.obtenerCarreras() || [];
        } catch (error) {
            console.error('Error cargando carreras:', error);
            this.carreras = [];
        }
    }

    async cargarCursos() {
        try {
            this.cursos = await m_curso.obtenerCursos() || [];
        } catch (error) {
            console.error('Error cargando cursos:', error);
            this.cursos = [];
        }
    }

    async cargarSemestres() {
        try {
            this.semestres = await m_semestre.obtenerSemestres() || [];
        } catch (error) {
            console.error('Error cargando semestres:', error);
            this.semestres = [];
        }
    }

    async cargarAsignaturas() {
        try {
            this.asignaturas = await m_asignatura.obtenerAsignaturas() || [];
        } catch (error) {
            console.error('Error cargando asignaturas:', error);
            this.asignaturas = [];
        }
    }

    async cargarEstudiantesMatriculados() {
        try {
            // Obtener estudiantes por facultad (desde backend)
            this.estudiantes = await m_estudiante.obtenerEstudiantesPorFacultad() || [];
            
            // Obtener matrículas
            this.matriculas = await m_matricula.obtenerMatriculas() || [];
            
            // Obtener matrículas de asignaturas
            this.matriculasAsignaturas = await m_matriculaAsignatura.obtenerMatriculaAsignaturas() || [];
            
            // Procesar datos para la tabla
            const datosTabla = this.procesarDatosEstudiantes();
            u_estudiante.actualizarTablaEstudiantes(this.dataTableEstudiantes, datosTabla);
            
        } catch (error) {
            console.error('Error cargando estudiantes:', error);
            Alerta.error('Error', 'Fallo al cargar estudiantes');
            this.estudiantes = [];
        }
    }

    procesarDatosEstudiantes() {
        return this.estudiantes.map(est => {
            // Buscar matrícula activa del estudiante
            const matricula = this.matriculas.find(m => m.idEstudiante == est.idEstudiante && m.estado == 'activa');
            
            // Buscar plan de estudio
            const plan = this.planesEstudio.find(p => p.idPlanEstudio == matricula?.idPlanEstudio);
            
            // Buscar carrera
            const carrera = this.carreras.find(c => c.idCarrera == plan?.idCarrera);
            
            // Buscar semestre
            const semestre = this.semestres.find(s => s.idSemestre == matricula?.idSemestre);
            
            // Buscar curso
            const curso = this.cursos.find(c => c.idCurso == semestre?.idCurso);
            
            // Contar asignaturas que cursa
            const asignaturasCursa = this.matriculasAsignaturas.filter(
                ma => ma.idMatricula == matricula?.idMatricula && ma.estado == 'cursando'
            ).length;
            
            return {
                idEstudiante: est.idEstudiante,
                idMatricula: matricula?.idMatricula,
                nombre: est.nombre,
                apellidos: est.apellidos,
                nombreCompleto: `${est.nombre || ''} ${est.apellidos || ''}`,
                carrera: carrera?.nombreCarrera || 'Sin carrera',
                curso: curso?.nombreCurso || 'Sin curso',
                semestre: semestre?.numeroSemestre || '0',
                numAsignaturas: asignaturasCursa || '0'
            };
        });
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Eventos de la tabla
        $(document).off('click', '.convalidar').on('click', '.convalidar', (e) => {
            this.abrirModalConvalidacion($(e.currentTarget).data('id'));
        });

        $(document).off('click', '.ver-detalles').on('click', '.ver-detalles', (e) => {
            this.verDetallesEstudiante($(e.currentTarget).data('id'));
        });

        $(document).off('click', '.asignar').on('click', '.asignar', (e) => {
            this.abrirModalAsignacion($(e.currentTarget).data('id'));
        });

        // Botón añadir más asignaturas en convalidación
        $('#añadirAsignaturas').off('click').on('click', () => {
            u_estudiante.agregarFilaConvalidacion();
        });

        // Guardar asignación
        $('#btnGuardarAsignación').off('click').on('click', () => {
            this.guardarAsignacion();
        });

        // Guardar convalidación
        $('#btnConvalidarAsignaturas').off('click').on('click', () => {
            this.guardarConvalidacion();
        });

        // Cuando se abre el modal de asignación
        $('#modalAsignarAsignatura').off('shown.bs.modal').on('shown.bs.modal', () => {
            this.configurarDragAndDrop();
        });

        // Cuando se cierra el modal de asignación
        $('#modalAsignarAsignatura').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            u_estudiante.limpiarModalAsignacion();
        });

        // Cuando se cierra el modal de convalidación
        $('#modalConvalidarEstudiante').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            u_estudiante.limpiarModalConvalidacion();
        });

        // Validar nota de convalidación
        $('#notaConvalidacion').off('input').on('input', function() {
            const valor = parseFloat($(this).val());
            const valido = !isNaN(valor) && valor >= 0 && valor <= 10;
            u_utiles.colorearCampo(valido, '#notaConvalidacion', '#errorNotaConvalidacion', 'La nota debe estar entre 0 y 10');
        });
    }

    configurarDragAndDrop() {
        // Configurar contenedor de destino
        const contenedorAsignar = document.getElementById('contenedorAsignaturasAsignar');
        if (contenedorAsignar) {
            contenedorAsignar.ondragover = u_estudiante.allowDrop;
            contenedorAsignar.ondrop = u_estudiante.dropAsignar;
        }
        
        // Hacer global la función u_estudiante para que sea accesible desde HTML
        window.u_estudiante = u_estudiante;
    }

    // ========== FUNCIONES PARA ASIGNACIÓN ==========
    
    async abrirModalAsignacion(idMatricula) {
        try {
            // Buscar matrícula
            this.matriculaSeleccionada = this.matriculas.find(m => m.idMatricula == idMatricula);
            if (!this.matriculaSeleccionada) return;
            
            // Buscar estudiante
            this.estudianteSeleccionado = this.estudiantes.find(e => e.idEstudiante == this.matriculaSeleccionada.idEstudiante);
            
            // Obtener asignaturas del semestre
            const asignaturasSemestre = await m_asignatura.obtenerAsignaturasPorSemestre(
                this.matriculaSeleccionada.idSemestre
            );
            
            // Obtener asignaturas pendientes y bloqueadas
            const pendientesYBloqueadas = await m_asignatura.obtenerAsignaturasPendientesYBloqueadas(
                this.matriculaSeleccionada.idSemestre
            );
            
            // Obtener matrículas de asignaturas del estudiante
            const matAsignaturas = this.matriculasAsignaturas.filter(
                ma => ma.idMatricula == idMatricula
            );
            
            // Cargar en la UI
            u_estudiante.cargarAsignaturasSemestre(asignaturasSemestre || []);
            u_estudiante.cargarAsignaturasPendientesYBloqueadas(
                pendientesYBloqueadas?.pendientes || [],
                pendientesYBloqueadas?.bloqueadas || []
            );
            
            // Cargar asignaturas ya asignadas en "Asignaturas a asignar"
            const yaAsignadas = matAsignaturas.filter(ma => ma.estado == 'cursando')
                .map(ma => {
                    const asig = [...(asignaturasSemestre || []), ...(pendientesYBloqueadas?.pendientes || [])]
                        .find(a => a.idPlanSemestreAsignatura == ma.idPlanSemestreAsignatura);
                    return asig || ma;
                });
            
            u_estudiante.asignaturasAsignar = yaAsignadas;
            u_estudiante.renderizarAsignaturasAsignar();
            
            // Mostrar modal
            if (this.modalAsignacionInstance) {
                this.modalAsignacionInstance.show();
            }
            
        } catch (error) {
            console.error('Error al abrir modal de asignación:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos de asignación');
        }
    }

    async guardarAsignacion() {
        if (u_estudiante.asignaturasAsignar.length === 0) {
            Alerta.advertencia('Sin asignaturas', 'No hay asignaturas para guardar');
            return;
        }
        
        try {
            // Crear matrículas de asignaturas
            for (const asignatura of u_estudiante.asignaturasAsignar) {
                const datosMatriculaAsignatura = {
                    idMatricula: this.matriculaSeleccionada.idMatricula,
                    idPlanSemestreAsignatura: asignatura.idPlanSemestreAsignatura,
                    convocatoria: 1,
                    notaFinal: 0,
                    estado: 'cursando',
                    numeroVecesMatriculado: 1
                };
                
                // Verificar si ya existe
                const existente = this.matriculasAsignaturas.find(
                    ma => ma.idMatricula == this.matriculaSeleccionada.idMatricula && 
                          ma.idPlanSemestreAsignatura == asignatura.idPlanSemestreAsignatura
                );
                
                if (existente) {
                    await m_matriculaAsignatura.actualizarMatriculaAsignatura({
                        ...datosMatriculaAsignatura,
                        idMatriculaAsignatura: existente.idMatriculaAsignatura
                    });
                } else {
                    await m_matriculaAsignatura.insertarMatriculaAsignatura(datosMatriculaAsignatura);
                }
            }
            
            // Actualizar datos
            await this.cargarEstudiantesMatriculados();
            
            // Cerrar modal
            if (this.modalAsignacionInstance) {
                this.modalAsignacionInstance.hide();
            }
            
            Alerta.exito('Éxito', 'Asignaturas guardadas correctamente');
            
        } catch (error) {
            console.error('Error al guardar asignación:', error);
            Alerta.error('Error', 'No se pudo guardar la asignación');
        }
    }

    // ========== FUNCIONES PARA CONVALIDACIÓN ==========
    
    async abrirModalConvalidacion(idMatricula) {
        try {
            // Buscar matrícula
            this.matriculaSeleccionada = this.matriculas.find(m => m.idMatricula == idMatricula);
            if (!this.matriculaSeleccionada) return;
            
            // Buscar estudiante
            this.estudianteSeleccionado = this.estudiantes.find(e => e.idEstudiante == this.matriculaSeleccionada.idEstudiante);
            
            // Buscar plan de estudio
            const plan = this.planesEstudio.find(p => p.idPlanEstudio == this.matriculaSeleccionada.idPlanEstudio);
            
            // Obtener todas las asignaturas del plan de estudio
            const asignaturasPlan = await m_asignatura.obtenerAsignaturasPorPlanEstudio(plan?.idPlanEstudio);
            
            // Cargar en combo
            u_estudiante.cargarAsignaturasEnCombo(asignaturasPlan || []);
            
            // Mostrar modal
            if (this.modalConvalidacionInstance) {
                this.modalConvalidacionInstance.show();
            }
            
        } catch (error) {
            console.error('Error al abrir modal de convalidación:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos de convalidación');
        }
    }

    async guardarConvalidacion() {
        // Obtener todas las filas de convalidación
        const filas = $('.fila-convalidacion');
        
        if (filas.length === 0) {
            Alerta.advertencia('Sin asignaturas', 'No hay asignaturas para convalidar');
            return;
        }
        
        const convalidaciones = [];
        
        filas.each(function() {
            const asignaturaId = $(this).data('asignatura-id');
            const nota = $(this).find('.nota-convalidacion').val();
            
            convalidaciones.push({
                idAsignatura: asignaturaId,
                nota: parseFloat(nota)
            });
        });
        
        try {
            // Procesar cada convalidación
            for (const conval of convalidaciones) {
                // Buscar planSemestreAsignatura correspondiente
                // Esto dependerá de cómo esté estructurado el backend
                
                const datosMatriculaAsignatura = {
                    idMatricula: this.matriculaSeleccionada.idMatricula,
                    // idPlanSemestreAsignatura: ...,
                    convocatoria: 0,
                    notaFinal: conval.nota,
                    estado: 'convalidada',
                    numeroVecesMatriculado: 0
                };
                
                await m_matriculaAsignatura.insertarMatriculaAsignatura(datosMatriculaAsignatura);
            }
            
            // Actualizar datos
            await this.cargarEstudiantesMatriculados();
            
            // Cerrar modal
            if (this.modalConvalidacionInstance) {
                this.modalConvalidacionInstance.hide();
            }
            
            Alerta.exito('Éxito', 'Convalidaciones guardadas correctamente');
            
        } catch (error) {
            console.error('Error al guardar convalidaciones:', error);
            Alerta.error('Error', 'No se pudieron guardar las convalidaciones');
        }
    }

    // ========== FUNCIONES PARA DETALLES ==========
    
    async verDetallesEstudiante(idMatricula) {
        try {
            // Buscar matrícula
            const matricula = this.matriculas.find(m => m.idMatricula == idMatricula);
            if (!matricula) return;
            
            // Buscar estudiante
            const estudiante = this.estudiantes.find(e => e.idEstudiante == matricula.idEstudiante);
            if (!estudiante) return;
            
            // Buscar plan de estudio
            const plan = this.planesEstudio.find(p => p.idPlanEstudio == matricula.idPlanEstudio);
            
            // Buscar carrera
            const carrera = this.carreras.find(c => c.idCarrera == plan?.idCarrera);
            
            // Buscar semestre
            const semestre = this.semestres.find(s => s.idSemestre == matricula.idSemestre);
            
            // Buscar curso
            const curso = this.cursos.find(c => c.idCurso == semestre?.idCurso);
            
            // Buscar matrícula de asignatura (para datos adicionales)
            const matAsignatura = this.matriculasAsignaturas.find(
                ma => ma.idMatricula == idMatricula && ma.estado == 'cursando'
            );
            
            const html = u_estudiante.generarDetallesEstudianteHTML(
                estudiante, matAsignatura || {}, plan, carrera, curso, semestre
            );
            
            $('#modalVerDetallesEstudiante .card-body').html(html);
            
            if (this.modalDetallesInstance) {
                this.modalDetallesInstance.show();
            }
            
        } catch (error) {
            console.error('Error al ver detalles:', error);
            Alerta.error('Error', 'No se pudieron cargar los detalles');
        }
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_estudiante();
    
    // Hacer global para debugging
    window.c_estudiante = controlador;
    
    await controlador.inicializar();
    
    // Inicializar combo de asignaturas
    u_estudiante.inicializarComboAsignaturas();
});
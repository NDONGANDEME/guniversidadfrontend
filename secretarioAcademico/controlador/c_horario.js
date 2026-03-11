import { sesiones } from "../../public/core/sesiones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_sesion } from "../../public/modelo/m_sesion.js";

// Modelos necesarios
import { m_horario } from "../modelo/m_horario.js";
import { m_clase } from "../modelo/m_clase.js";
import { m_claseHorario } from "../modelo/m_claseHorario.js";
import { m_carrera } from "../../admin/modelo/m_carrera.js";
import { m_semestre } from "../../admin/modelo/m_semestre.js";
import { m_asignatura } from "../../admin/modelo/m_asignatura.js";
import { m_aula } from "../../admin/modelo/m_aula.js";
import { m_profesor } from "../modelo/m_profesor.js";
import { u_horario } from "../utilidades/u_horario.js";

export class c_horario {
    constructor() {
        // Horarios
        this.horarios = [];
        this.horarioActual = null;
        this.modoEdicion = false;
        this.dataTableHorarios = null;
        
        // Datos relacionados
        this.carreras = [];
        this.semestres = [];
        this.asignaturas = [];
        this.aulas = [];
        this.profesores = [];
        this.clases = [];
        this.clasesHorario = [];
        
        // Modales
        this.modalHorarioInstance = null;
        this.modalClaseInstance = null;
        
        // Actor conectado
        this.actorConectado = null;
        this.diaSeleccionado = null;
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            // Obtener actor conectado
            this.actorConectado = m_sesion.leerSesion('usuarioActivo');
            
            // Verificar sesión
            sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionSecretario();
            
            // Inicializar DataTable
            this.inicializarDataTables();
            
            // Cargar datos
            await this.cargarCarreras();
            await this.cargarSemestres();
            await this.cargarAsignaturas();
            await this.cargarAulas();
            await this.cargarProfesores();
            await this.cargarHorarios();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarCombos();
            
            // Inicializar modales
            const modalHorarioElement = document.getElementById('modalNuevoHorario');
            if (modalHorarioElement) {
                this.modalHorarioInstance = new bootstrap.Modal(modalHorarioElement, {
                    backdrop: 'static', // Evita cerrar al hacer clic fuera
                    keyboard: false
                });
            }
            
            const modalClaseElement = document.getElementById('modalAñadirClase');
            if (modalClaseElement) {
                this.modalClaseInstance = new bootstrap.Modal(modalClaseElement, {
                    backdrop: 'static',
                    keyboard: false
                });
            }
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTables() {
        if ($.fn.dataTable.isDataTable('#tablaHorarios')) {
            $('#tablaHorarios').DataTable().destroy();
        }
        this.dataTableHorarios = $('#tablaHorarios').DataTable({
            language: { 
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' 
            },
            columnDefs: [{ orderable: false, targets: [1] }]
        });
    }

    // ========== CARGA DE DATOS ==========
    
    async cargarCarreras() {
        try {
            const datos = await m_carrera.obtenerCarreras();
            this.carreras = datos || [];
            u_horario.cargarCarrerasEnFiltro(this.carreras);
        } catch (error) {
            console.error('Error cargando carreras:', error);
            this.carreras = [];
        }
    }

    async cargarSemestres() {
        try {
            const datos = await m_semestre.obtenerSemestres();
            this.semestres = datos || [];
            u_horario.cargarSemestresEnFiltro(this.semestres);
        } catch (error) {
            console.error('Error cargando semestres:', error);
            this.semestres = [];
        }
    }

    async cargarAsignaturas() {
        try {
            let idFacultadActor = this.actorConectado?.datos_rol?.idFacultad;
            const datos = await m_asignatura.obtenerAsignaturasPorFacultad(idFacultadActor);
            this.asignaturas = datos || [];
            u_horario.inicializarComboAsignaturas(this.asignaturas);
        } catch (error) {
            console.error('Error cargando asignaturas:', error);
            this.asignaturas = [];
        }
    }

    async cargarAulas() {
        try {
            let idFacultadActor = this.actorConectado?.datos_rol?.idFacultad;
            const datos = await m_aula.obtenerAulasPorFacultad(idFacultadActor);
            this.aulas = datos || [];
            u_horario.inicializarComboAulas(this.aulas);
        } catch (error) {
            console.error('Error cargando aulas:', error);
            this.aulas = [];
        }
    }

    async cargarProfesores() {
        try {
            let idFacultadActor = this.actorConectado?.datos_rol?.idFacultad;
            const datos = await m_profesor.obtenerProfesoresPorFacultad(idFacultadActor);
            this.profesores = datos || [];
        } catch (error) {
            console.error('Error cargando profesores:', error);
            this.profesores = [];
        }
    }

    async cargarHorarios() {
        try {
            const datos = await m_horario.obtenerHorarios();
            this.horarios = datos || [];
            this.actualizarTablaHorarios();
        } catch (error) {
            console.error('Error cargando horarios:', error);
            Alerta.error('Error', 'Fallo al cargar horarios');
            this.horarios = [];
        }
    }

    async cargarClases() {
        try {
            const datos = await m_clase.obtenerClases();
            this.clases = datos || [];
        } catch (error) {
            console.error('Error cargando clases:', error);
            this.clases = [];
        }
    }

    async cargarClasesPorHorario(idHorario) {
        try {
            const todasRelaciones = await m_claseHorario.obtenerClaseHorarios() || [];
            const relaciones = todasRelaciones.filter(r => r.idHorario == idHorario);
            
            const clasesHorario = [];
            for (const rel of relaciones) {
                const clase = this.clases.find(c => c.idClase == rel.idClase) || 
                             await m_clase.obtenerClase(rel.idClase);
                if (clase) {
                    clasesHorario.push(clase);
                }
            }
            
            return clasesHorario;
        } catch (error) {
            console.error('Error cargando clases del horario:', error);
            return [];
        }
    }

    // ========== CONFIGURACIÓN ==========
    
    configurarValidaciones() {
        u_horario.configurarValidaciones();
    }

    configurarCombos() {
        // Los combos ya se inicializaron en la carga de datos
    }

    // ========== EVENTOS ==========
    
    configurarEventos() {
        // Botón nuevo horario
        $('.nuevo').off('click').on('click', () => {
            this.modoEdicion = false;
            this.horarioActual = null;
            u_horario.limpiarModal();
            u_horario.configurarModoEdicion(false);
        });

        // Guardar horario
        $('#btnGuardarHorario').off('click').on('click', () => this.guardarHorario());

        // Botones de búsqueda/filtro
        $('#btnBuscarHorario').off('click').on('click', () => this.buscarHorario());

        // Botón imprimir
        $('#btnImprimir').off('click').on('click', () => this.imprimirHorario());

        // Botones para añadir clases por día
        $('[data-bs-target="#modalAñadirClase"]').off('click').on('click', (e) => {
            // Determinar qué día se está añadiendo
            const diaContainer = $(e.target).closest('.diaSemana-horizontal');
            if (diaContainer.length) {
                const id = diaContainer.attr('id');
                if (id.includes('Lunes')) this.diaSeleccionado = 'Lunes';
                else if (id.includes('Martes')) this.diaSeleccionado = 'Martes';
                else if (id.includes('Miercoles')) this.diaSeleccionado = 'Miercoles';
                else if (id.includes('Jueves')) this.diaSeleccionado = 'Jueves';
                else if (id.includes('Viernes')) this.diaSeleccionado = 'Viernes';
            }
            
            u_horario.limpiarModalClase();
        });

        // Crear clase
        $('#btnCrearClase').off('click').on('click', () => this.crearClase());

        // Eventos de la tabla de horarios
        $(document).off('click', '.editar-horario').on('click', '.editar-horario', (e) => {
            e.stopPropagation();
            this.editarHorario($(e.currentTarget).data('id'));
        });

        $(document).off('click', '.ver-horario').on('click', '.ver-horario', (e) => {
            e.stopPropagation();
            this.verHorario($(e.currentTarget).data('id'));
        });

        $(document).off('click', '.eliminar-horario').on('click', '.eliminar-horario', (e) => {
            e.stopPropagation();
            this.eliminarHorario($(e.currentTarget).data('id'));
        });

        // Eliminar clase de un día
        $(document).off('click', '.eliminar-clase').on('click', '.eliminar-clase', (e) => {
            e.stopPropagation();
            const dia = $(e.currentTarget).data('dia');
            const index = $(e.currentTarget).data('index');
            u_horario.eliminarClaseDelDia(dia, index);
        });

        // Cuando se cierra el modal principal
        $('#modalNuevoHorario').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_horario.limpiarModal();
            }
        });

        // Cuando se cierra el modal de clase, no afecta al principal
        $('#modalAñadirClase').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            // Solo limpiamos el modal de clase
            u_horario.limpiarModalClase();
        });
    }

    // ========== MÉTODOS PARA PREPARAR DATOS ==========

    prepararDatosHorario() {
        return {
            nombre: $('#nombreHorario').val().trim()
        };
    }

    prepararDatosClase(dia, asignaturaId, aulaId, profesorId) {
        return {
            idPlanSemestreAsignatura: null, // Se asignará después
            idAula: aulaId,
            idProfesor: profesorId,
            diaSemanal: dia,
            horaInicio: $('#horaInicioClase').val(),
            horaFinal: $('#horaFinClase').val(),
            tipoSesion: $('#tipoSesionClase').val(),
            observaciones: $('#observacionesClase').val().trim() || ''
        };
    }

    // ========== FUNCIONES PRINCIPALES ==========

    async guardarHorario() {
        // Validar nombre
        if (!u_horario.validarNombreHorario($('#nombreHorario').val().trim())) {
            Alerta.advertencia('Campo requerido', 'El nombre del horario es obligatorio');
            return;
        }

        // Verificar que haya al menos una clase
        const totalClases = Object.values(u_horario.clasesPorDia).reduce((sum, arr) => sum + arr.length, 0);
        if (totalClases === 0) {
            Alerta.advertencia('Sin clases', 'Debe agregar al menos una clase al horario');
            return;
        }
        
        try {
            let idHorario;
            
            // ===== 1. GUARDAR HORARIO =====
            const datosHorario = this.prepararDatosHorario();
            
            if (this.modoEdicion && this.horarioActual) {
                datosHorario.idHorario = this.horarioActual.idHorario;
                await m_horario.actualizarHorario(datosHorario);
                idHorario = this.horarioActual.idHorario;
            } else {
                const resultado = await m_horario.insertarHorario(datosHorario);
                idHorario = resultado?.idHorario || resultado?.id;
            }
            
            if (!idHorario) {
                throw new Error('No se pudo crear/actualizar el horario');
            }

            // ===== 2. PROCESAR CLASES =====
            // Obtener clases existentes para este horario
            const clasesExistentes = await this.cargarClasesPorHorario(idHorario);
            const clasesExistentesMap = {};
            clasesExistentes.forEach(c => { clasesExistentesMap[c.idClase] = c; });

            // Obtener todas las relaciones existentes
            const relacionesExistentes = await m_claseHorario.obtenerClaseHorarios() || [];
            const relacionesHorario = relacionesExistentes.filter(r => r.idHorario == idHorario);
            const relacionesMap = {};
            relacionesHorario.forEach(r => { relacionesMap[r.idClase] = r; });

            // Procesar clases por día
            const nuevasClasesIds = [];
            
            for (const dia in u_horario.clasesPorDia) {
                const clases = u_horario.clasesPorDia[dia];
                
                for (const claseData of clases) {
                    // Si la clase ya tiene ID, es existente
                    if (claseData.idClase) {
                        // Actualizar clase existente
                        const datosClase = {
                            idClase: claseData.idClase,
                            idPlanSemestreAsignatura: null, // Pendiente de implementación
                            idAula: claseData.idAula,
                            idProfesor: claseData.idProfesor,
                            diaSemanal: dia,
                            horaInicio: claseData.horaInicio,
                            horaFinal: claseData.horaFinal,
                            tipoSesion: claseData.tipoSesion,
                            observaciones: claseData.observaciones
                        };
                        
                        await m_clase.actualizarClase(datosClase);
                        nuevasClasesIds.push(claseData.idClase);
                        
                        // Eliminar del mapa de existentes
                        delete clasesExistentesMap[claseData.idClase];
                        delete relacionesMap[claseData.idClase];
                        
                    } else {
                        // Crear nueva clase
                        const datosClase = this.prepararDatosClase(
                            dia,
                            claseData.idAsignatura,
                            claseData.idAula,
                            claseData.idProfesor
                        );
                        
                        const resultado = await m_clase.insertarClase(datosClase);
                        const idClase = resultado?.idClase || resultado?.id;
                        
                        if (idClase) {
                            nuevasClasesIds.push(idClase);
                            
                            // Crear relación con horario
                            await m_claseHorario.insertarClaseHorario({
                                idClase: idClase,
                                idHorario: idHorario
                            });
                        }
                    }
                }
            }

            // ===== 3. ELIMINAR CLASES QUE YA NO ESTÁN =====
            for (const idClase in clasesExistentesMap) {
                // Eliminar relación primero
                if (relacionesMap[idClase]) {
                    await m_claseHorario.eliminarClaseHorario(relacionesMap[idClase].idClaseHoario);
                }
                // Eliminar clase
                await m_clase.eliminarClase(idClase);
            }

            // ===== 4. FINALIZAR =====
            await this.cargarClases();
            await this.cargarHorarios();
            
            if (this.modalHorarioInstance) {
                this.modalHorarioInstance.hide();
            }
            
            Alerta.exito('Éxito', this.modoEdicion ? 'Horario actualizado' : 'Horario creado');
            
        } catch (error) {
            console.error('Error al guardar horario:', error);
            if (error.mensaje) {
                Alerta.error('Error', error.mensaje);
            } else {
                Alerta.error('Error', 'No se pudo guardar el horario');
            }
        }
    }

    async crearClase() {
        // Validar formulario de clase
        if (!u_horario.validarFormularioClase()) {
            Alerta.advertencia('Campos inválidos', 'Complete correctamente todos los campos');
            return;
        }

        try {
            const asignaturaId = $('#comboAsignaturasClase').data('selected');
            const aulaId = $('#comboAulasClase').data('selected');
            
            // Buscar un profesor para esta asignatura (simplificado)
            // En un sistema real, deberías tener una relación asignatura-profesor
            const profesorId = this.profesores.length > 0 ? this.profesores[0].idProfesor : null;
            
            if (!profesorId) {
                Alerta.advertencia('Sin profesor', 'No hay profesores disponibles');
                return;
            }

            // Obtener datos de asignatura y aula para mostrar
            const asignatura = this.asignaturas.find(a => a.idAsignatura == asignaturaId);
            const aula = this.aulas.find(a => a.idAula == aulaId);

            const claseData = {
                idAsignatura: asignaturaId,
                idAula: aulaId,
                idProfesor: profesorId,
                horaInicio: $('#horaInicioClase').val(),
                horaFinal: $('#horaFinClase').val(),
                tipoSesion: $('#tipoSesionClase').val(),
                observaciones: $('#observacionesClase').val().trim(),
                asignatura: asignatura,
                aula: aula
            };

            // Agregar al día seleccionado
            u_horario.agregarClaseAlDia(this.diaSeleccionado, claseData);
            
            // Cerrar modal de clase
            if (this.modalClaseInstance) {
                this.modalClaseInstance.hide();
            }
            
        } catch (error) {
            console.error('Error al crear clase:', error);
            Alerta.error('Error', 'No se pudo crear la clase');
        }
    }

    async editarHorario(id) {
        const horario = this.horarios.find(h => h.idHorario == id);
        if (!horario) return;
        
        this.modoEdicion = true;
        this.horarioActual = horario;
        
        try {
            // Cargar clases de este horario
            await this.cargarClases();
            const clasesHorario = await this.cargarClasesPorHorario(id);
            
            // Cargar en el utility
            u_horario.cargarDatosEnModal(horario, clasesHorario, this.asignaturas, this.aulas);
            u_horario.configurarModoEdicion(true);
            
            // Mostrar modal
            if (this.modalHorarioInstance) {
                this.modalHorarioInstance.show();
            }
        } catch (error) {
            console.error('Error al cargar datos para edición:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos del horario');
        }
    }

    async verHorario(id) {
        const horario = this.horarios.find(h => h.idHorario == id);
        if (!horario) return;
        
        try {
            const clasesHorario = await this.cargarClasesPorHorario(id);
            
            // Actualizar el título
            $('.card-header h1 .carrera').text('General');
            $('.card-header h1 .semestre').text('');
            
            // Generar tabla
            u_horario.generarTablaHorario(horario, clasesHorario, this.asignaturas, this.aulas, this.profesores);
            
        } catch (error) {
            console.error('Error al ver horario:', error);
            Alerta.error('Error', 'No se pudieron cargar los datos del horario');
        }
    }

    async eliminarHorario(id) {
        const confirmacion = await Alerta.confirmar('Confirmar', '¿Está seguro de eliminar este horario?');
        if (!confirmacion) return;
        
        try {
            // Obtener relaciones
            const relaciones = await m_claseHorario.obtenerClaseHorarios() || [];
            const relacionesHorario = relaciones.filter(r => r.idHorario == id);
            
            // Eliminar clases asociadas
            for (const rel of relacionesHorario) {
                await m_clase.eliminarClase(rel.idClase);
                await m_claseHorario.eliminarClaseHorario(rel.idClaseHoario);
            }
            
            // Eliminar horario
            await m_horario.eliminarHorario(id);
            
            await this.cargarHorarios();
            Alerta.exito('Éxito', 'Horario eliminado');
            
        } catch (error) {
            console.error('Error al eliminar horario:', error);
            Alerta.error('Error', 'No se pudo eliminar el horario');
        }
    }

    async buscarHorario() {
        const idCarrera = $('#filtroPorCarreraHorario').val();
        const idSemestre = $('#filtroPorSemestreHorario').val();
        
        if (idCarrera === 'Ninguno' && idSemestre === 'Ninguno') {
            Alerta.advertencia('Filtros', 'Seleccione al menos un filtro');
            return;
        }
        
        // Aquí implementarías la lógica para buscar horarios por carrera y semestre
        // Por ahora, mostramos un mensaje
        Alerta.informacion('Búsqueda', `Buscando horarios para Carrera: ${idCarrera}, Semestre: ${idSemestre}`);
    }

    imprimirHorario() {
        window.print();
    }

    actualizarTablaHorarios() {
        u_horario.actualizarTablaHorarios(this.dataTableHorarios, this.horarios);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_horario();
    await controlador.inicializar();
});
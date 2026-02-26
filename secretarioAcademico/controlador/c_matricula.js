/**
 * Controlador de Matrículas - Versión simplificada
 * Maneja la lógica de negocio de matrículas
 */

import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_matricula } from "../modelo/m_matricula.js";
import { m_estudiante } from "../modelo/m_estudiante.js";
import { m_planEstudio } from "../modelo/m_planEstudio.js";
import { m_familiar } from "../modelo/m_familiar.js";
import { m_beca } from "../modelo/m_beca.js";
import { m_estudianteBeca } from "../modelo/m_estudianteBeca.js";
import { m_pago } from "../modelo/m_pago.js";
import { u_matricula } from "../utilidades/u_matricula.js";
import { m_carrera } from "../../admin/modelo/m_carrera.js";
import { m_semestre } from "../../admin/modelo/m_semestre.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { m_archivo } from "../../public/modelo/m_archivo.js";

export class c_matricula {
    constructor() {
        // Datos principales
        this.matriculas = [];
        this.estudiantes = [];
        this.carreras = [];
        this.planesEstudio = [];
        this.semestres = [];
        this.familiares = [];
        this.becas = [];
        
        // Control de modo
        this.modoNuevo = true; // true = nuevo estudiante, false = estudiante existente
        this.modoEdicion = false;
        this.matriculaActual = null;
        this.estudianteActual = null;
        
        // DataTable
        this.dataTable = null;
        
        // Control de secciones del modal
        this.seccionActual = 1;
        this.totalSecciones = 3;
        
        // Control de elementos dinámicos
        this.contactosFamiliares = [];
        this.becasEstudiante = [];
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            u_utiles.botonesNavegacionSecretario();
            
            this.inicializarDataTable();
            await this.cargarDatosIniciales();
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarCombos();
        } catch (error) {
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    inicializarDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaMatriculas')) {
            $('#tablaMatriculas').DataTable().destroy();
        }
        
        this.dataTable = $('#tablaMatriculas').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [6] }]
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarDatosIniciales() {
        try {
            // Cargar todas las matrículas
            this.matriculas = await m_matricula.obtenerMatriculas() || [];
            
            // Cargar datos para combos
            this.estudiantes = await m_estudiante.obtenerEstudiantes() || [];
            this.carreras = await m_carrera.obtenerCarreras() || [];
            this.planesEstudio = await m_planEstudio.obtenerPlanesEstudios() || [];
            this.semestres = await m_semestre.obtenerSemestres() || [];
            this.becas = await m_beca.obtenerBecas() || [];
            
            this.actualizarTabla();
            this.cargarCombos();
        } catch (error) {
            Alerta.error('Error', 'Fallo al cargar datos');
        }
    }

    cargarCombos() {
        // Cargar carreras en combo
        u_matricula.cargarComboCarreras(this.carreras);
        
        // Cargar estudiantes en combo
        u_matricula.cargarComboEstudiantes(this.estudiantes);
        
        // Cargar planes de estudio en combo
        u_matricula.cargarComboPlanesEstudio(this.planesEstudio);
        
        // Cargar semestres en select
        u_matricula.cargarSelectSemestres('#semestresMatricula', this.semestres);
    }

    // ========== CONFIGURACIÓN ==========
    configurarValidaciones() {
        u_matricula.configurarValidaciones();
    }

    configurarCombos() {
        // Configurar combo de carreras
        u_matricula.configurarComboCarreras(this.carreras, (id) => {
            this.seleccionarCarrera(id);
        });
        
        // Configurar combo de estudiantes
        u_matricula.configurarComboEstudiantes(this.estudiantes, (id) => {
            this.buscarEstudiante(id);
        });
        
        // Configurar combo de países
        u_matricula.configurarComboPaises();
        
        // Configurar combo de centros
        u_matricula.configurarComboCentros();
        
        // Configurar combo de universidades
        u_matricula.configurarComboUniversidades();
        
        // Configurar combo de planes de estudio
        u_matricula.configurarComboPlanesEstudio(this.planesEstudio, (id) => {
            this.seleccionarPlanEstudio(id);
        });
    }

    configurarEventos() {
        // Botones de nuevo/antiguo
        $('.antiguo').on('click', () => {
            this.modoNuevo = false;
            u_matricula.mostrarBusquedaEstudiante(true);
            this.limpiarModal();
            u_matricula.abrirModalNuevo();
        });
        
        $('.nueva').on('click', () => {
            this.modoNuevo = true;
            u_matricula.mostrarBusquedaEstudiante(false);
            this.limpiarModal();
            u_matricula.abrirModalNuevo();
        });
        
        // Botones de navegación del modal
        $('#siguiente').on('click', () => this.siguienteSeccion());
        $('#anterior').on('click', () => this.anteriorSeccion());
        
        // Checkbox de becario
        $('#esBecario').on('change', function() {
            u_matricula.mostrarSeccionBecas($(this).is(':checked'));
        });
        
        // Botones de añadir más
        $('#añadirContactos').on('click', () => this.añadirContactoFamiliar());
        $('#añadirBecas').on('click', () => this.añadirBeca());
        
        // Botón guardar
        $('#btnGuardarMatricula').on('click', () => this.guardarMatricula());
        
        // Eventos de la tabla
        $(document).on('click', '.verDetalles', (e) => {
            this.verDetallesMatricula($(e.currentTarget).data('id'));
        });
        
        $(document).on('click', '.editar', (e) => {
            this.editarMatricula($(e.currentTarget).data('id'));
        });
        
        // Al cerrar modal, resetear
        $('#modalNuevaMatricula').on('hidden.bs.modal', () => {
            this.resetearModal();
        });
    }

    // ========== NAVEGACIÓN DEL MODAL ==========
    siguienteSeccion() {
        if (this.seccionActual < this.totalSecciones) {
            // Validar sección actual antes de avanzar
            if (!this.validarSeccionActual()) {
                return;
            }
            
            this.seccionActual++;
            u_matricula.cambiarSeccion(this.seccionActual, 'siguiente');
            this.actualizarBotonesNavegacion();
        }
    }

    anteriorSeccion() {
        if (this.seccionActual > 1) {
            this.seccionActual--;
            u_matricula.cambiarSeccion(this.seccionActual, 'anterior');
            this.actualizarBotonesNavegacion();
        }
    }

    actualizarBotonesNavegacion() {
        u_matricula.actualizarBotonesNavegacion(
            this.seccionActual, 
            this.totalSecciones,
            this.modoEdicion
        );
    }

    validarSeccionActual() {
        if (this.seccionActual === 1) {
            return this.validarSeccionDatosPersonales();
        } else if (this.seccionActual === 2) {
            return this.validarSeccionDatosMatricula();
        }
        return true;
    }

    validarSeccionDatosPersonales() {
        // Validar campos obligatorios de la sección 1
        const nombre = $('#nombreEstudianteMatricula').val().trim();
        const apellidos = $('#apellidosEstudianteMatricula').val().trim();
        const dip = $('#dipEstudianteMatricula').val().trim();
        
        if (!nombre || !apellidos || !dip) {
            Alerta.advertencia('Campos incompletos', 'Complete los datos personales');
            return false;
        }
        return true;
    }

    validarSeccionDatosMatricula() {
        // Validar campos obligatorios de la sección 2
        const curso = $('#cursoAcademicoMatricula').val().trim();
        const fecha = $('#fechaMatricula').val();
        const modalidad = $('#modalidadMatricula').val();
        const plan = $('#comboPlanEstudioMatricula').data('id-seleccionado');
        
        if (!curso || !fecha || !modalidad || modalidad === 'Ninguno' || !plan) {
            Alerta.advertencia('Campos incompletos', 'Complete los datos de matrícula');
            return false;
        }
        return true;
    }

    // ========== FUNCIONES DE BÚSQUEDA ==========
    seleccionarCarrera(id) {
        // Filtrar estudiantes por carrera
        const estudiantesFiltrados = this.estudiantes.filter(e => e.idCarrera == id);
        u_matricula.actualizarComboEstudiantes(estudiantesFiltrados);
    }

    async buscarEstudiante(id) {
        try {
            const estudiante = this.estudiantes.find(e => e.idEstudiante == id);
            if (!estudiante) return;
            
            this.estudianteActual = estudiante;
            
            // Cargar datos del estudiante en el formulario
            u_matricula.cargarDatosEstudiante(estudiante);
            
            // Cargar familiares del estudiante
            const familiares = await m_familiar.obtenerFamiliarResponsablePorEstudiante(id);
            this.contactosFamiliares = familiares || [];
            u_matricula.cargarFamiliares(this.contactosFamiliares);
            
            // Cargar becas del estudiante
            const becasEstudiante = await m_estudianteBeca.obtenerEstudiantes() || [];
            this.becasEstudiante = becasEstudiante.filter(b => b.idEstudiante == id);
            if (this.becasEstudiante.length > 0) {
                $('#esBecario').prop('checked', true);
                u_matricula.mostrarSeccionBecas(true);
                u_matricula.cargarBecas(this.becasEstudiante);
            }
        } catch (error) {
            Alerta.error('Error', 'No se pudo cargar el estudiante');
        }
    }

    seleccionarPlanEstudio(id) {
        const plan = this.planesEstudio.find(p => p.idPlanEstudio == id);
        if (plan) {
            // Aquí se podría cargar información adicional del plan
            console.log('Plan seleccionado:', plan);
        }
    }

    // ========== FUNCIONES PARA AÑADIR ELEMENTOS ==========
    añadirContactoFamiliar() {
        u_matricula.añadirContactoFamiliar((data) => {
            this.contactosFamiliares.push(data);
        });
    }

    añadirBeca() {
        u_matricula.añadirBeca(this.becas, (data) => {
            this.becasEstudiante.push(data);
        });
    }

    // ========== OPERACIONES CRUD ==========
    async guardarMatricula() {
        if (!this.validarFormularioCompleto()) {
            Alerta.advertencia('Campos incompletos', 'Complete todos los campos requeridos');
            return;
        }
        
        try {
            // 1. Guardar o actualizar estudiante
            const estudianteData = u_matricula.obtenerDatosEstudiante();
            let idEstudiante;
            
            if (this.modoNuevo || !this.estudianteActual) {
                // Generar código de estudiante
                estudianteData.codigoEstudiante = u_matricula.generarCodigoEstudiante(
                    estudianteData.nombre, 
                    estudianteData.carrera
                );
                
                const resultado = await m_estudiante.insertarEstudiante(estudianteData);
                idEstudiante = resultado.idEstudiante;
            } else {
                estudianteData.idEstudiante = this.estudianteActual.idEstudiante;
                await m_estudiante.actualizarEstudiante(estudianteData);
                idEstudiante = this.estudianteActual.idEstudiante;
            }
            
            // 2. Guardar familiares
            const familiaresData = u_matricula.obtenerDatosFamiliares();
            for (const familiar of familiaresData) {
                familiar.idEstudiante = idEstudiante;
                await m_familiar.insertarFamiliar(familiar);
            }
            
            // 3. Guardar datos de matrícula
            const matriculaData = u_matricula.obtenerDatosMatricula();
            matriculaData.idEstudiante = idEstudiante;
            matriculaData.cursoAcademico = u_matricula.generarCursoAcademico();
            
            let idMatricula;
            if (this.modoEdicion && this.matriculaActual) {
                matriculaData.idMatricula = this.matriculaActual.idMatricula;
                await m_matricula.actualizarMatricula(matriculaData);
                idMatricula = this.matriculaActual.idMatricula;
            } else {
                const resultado = await m_matricula.insertarMatricula(matriculaData);
                idMatricula = resultado.idMatricula;
            }
            
            // 4. Guardar becas si aplica
            if ($('#esBecario').is(':checked')) {
                const becasData = u_matricula.obtenerDatosBecas();
                for (const beca of becasData) {
                    beca.idEstudiante = idEstudiante;
                    await m_estudianteBeca.insertarEstudiante(beca);
                }
            }
            
            // 5. Guardar pago
            const pagoData = u_matricula.obtenerDatosPago();
            pagoData.idMatricula = idMatricula;
            
            // Buscar familiar responsable
            const responsable = this.contactosFamiliares.find(f => f.esResponsablePago === 'Sí');
            if (responsable) {
                pagoData.idFamiliar = familiarResponsable.idFamiliar;
            }
            
            await m_pago.insertarPago(pagoData);
            
            // 6. Guardar usuario y foto
            const usuarioData = u_matricula.obtenerDatosUsuario();
            usuarioData.rol = 'Estudiante';
            const resultadoUsuario = await m_usuario.insertarUsuario(usuarioData);
            
            // Subir foto si hay
            const archivo = $('#campoArchivoFotoPerfil')[0].files[0];
            if (archivo) {
                const archivoData = {
                    url: await u_matricula.subirFoto(archivo),
                    tipoArchivo: 'foto',
                    idReferencia: resultadoUsuario.idUsuario,
                    tablaReferencia: 'usuarios'
                };
                await m_archivo.insertarArchivo(archivoData);
            }
            
            // Recargar datos
            await this.cargarDatosIniciales();
            
            // Cerrar modal
            $('#modalNuevaMatricula').modal('hide');
            
            Alerta.exito('Éxito', 'Matrícula guardada correctamente');
            
        } catch (error) {
            Alerta.error('Error', 'No se pudo guardar la matrícula');
        }
    }

    validarFormularioCompleto() {
        return this.validarSeccionDatosPersonales() && 
               this.validarSeccionDatosMatricula();
    }

    async verDetallesMatricula(id) {
        try {
            const matricula = this.matriculas.find(m => m.idMatricula == id);
            if (!matricula) return;
            
            const estudiante = this.estudiantes.find(e => e.idEstudiante == matricula.idEstudiante);
            
            u_matricula.mostrarDetalles(matricula, estudiante);
            
        } catch (error) {
            Alerta.error('Error', 'No se pudieron cargar los detalles');
        }
    }

    async editarMatricula(id) {
        try {
            const matricula = this.matriculas.find(m => m.idMatricula == id);
            if (!matricula) return;
            
            this.modoEdicion = true;
            this.matriculaActual = matricula;
            
            // Cargar datos en el modal
            const estudiante = this.estudiantes.find(e => e.idEstudiante == matricula.idEstudiante);
            if (estudiante) {
                u_matricula.cargarDatosEstudiante(estudiante);
            }
            
            u_matricula.cargarDatosMatricula(matricula);
            
            // Abrir modal en modo edición
            this.modoNuevo = false; // Para que muestre los datos cargados
            u_matricula.mostrarBusquedaEstudiante(false);
            u_matricula.abrirModalNuevo();
            
        } catch (error) {
            Alerta.error('Error', 'No se pudo cargar la matrícula');
        }
    }

    // ========== FUNCIONES DE LIMPIEZA ==========
    limpiarModal() {
        u_matricula.limpiarFormulario();
        this.seccionActual = 1;
        this.estudianteActual = null;
        this.matriculaActual = null;
        this.contactosFamiliares = [];
        this.becasEstudiante = [];
        u_matricula.cambiarSeccion(1);
        this.actualizarBotonesNavegacion();
    }

    resetearModal() {
        this.limpiarModal();
        this.modoEdicion = false;
        this.modoNuevo = true;
    }

    actualizarTabla() {
        u_matricula.actualizarTabla(this.dataTable, this.matriculas, this.estudiantes);
    }
}

// INICIALIZAR
$(document).ready(async function() {
    const controlador = new c_matricula();
    await controlador.inicializar();
});
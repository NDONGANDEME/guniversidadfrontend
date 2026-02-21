// c_curso.js - Controlador de cursos
import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_curso } from "../modelo/m_curso.js";
import { u_curso } from "../utilidades/u_curso.js";

export class c_curso 
{
    constructor() {
        this.cursos = [];
        this.cursoActual = null;
        this.modoEdicion = false;
        this.dataTable = null;
        this.actor = null;
        
        // Estados de validación
        this.validaciones = {
            nombre: false,
            nivel: false
        };
    }

    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    async inicializar() {
        try {
            // Verificar sesión
            sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Inicializar DataTable
            this.inicializarDataTable();
            
            // Cargar cursos
            await this.cargarCursos();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            Alerta.error('Error', `No se pudo inicializar el módulo de cursos: ${error}`);
        }
    }

    // Inicializar DataTable
    inicializarDataTable() {
        if ($.fn.dataTable.isDataTable('.tabla')) {
            $('.tabla').DataTable().destroy();
        }
        
        this.dataTable = $('.tabla').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            columnDefs: [
                { orderable: false, targets: [2] } // No ordenar por acciones
            ]
        });
    }

    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    async cargarCursos() {
        try {
            const cursosBackend = await m_curso.obtenerCursos();
            
            if (cursosBackend && cursosBackend.length > 0) {
                this.cursos = cursosBackend.map(c => 
                    new m_curso(
                        c.idCurso,
                        c.nombreCurso,
                        c.nivel
                    )
                );
                
                this.actualizarTabla();
            } else {
                this.cursos = [];
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar cursos: ${error}`);
        }
    }

    // Actualizar tabla
    actualizarTabla() {
        u_curso.actualizarTabla(
            this.dataTable, 
            this.cursos,
            (id, estado) => u_curso.crearBotonesAccion(id, estado)
        );
        
        // Asignar eventos a los botones después de dibujar la tabla
        this.asignarEventosBotones();
    }
    
    // Asignar eventos a los botones de la tabla
    asignarEventosBotones() {
        // Usar delegación de eventos para los botones
        $(document).off('click', '.editar').on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.editarCurso(id);
        });
        
        $(document).off('click', '.btn-toggle-estado').on('click', '.btn-toggle-estado', (e) => {
            const id = $(e.currentTarget).data('id');
            this.cambiarEstadoCurso(id);
        });
    }

    // ============================================
    // CONFIGURACIÓN DE EVENTOS Y VALIDACIONES
    // ============================================
    
    configurarValidaciones() {
        // Validar nombre del curso
        $('#nombreCurso').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.validaciones.nombre = u_curso.validarNombre(valor);
            u_utiles.colorearCampo(
                this.validaciones.nombre,
                '#nombreCurso',
                '#errorNombreCurso',
                'El nombre debe tener entre 5 y 100 caracteres'
            );
        });
        
        // Validar nivel del curso
        $('#nivelCurso').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.validaciones.nivel = u_curso.validarNivel(valor);
            u_utiles.colorearCampo(
                this.validaciones.nivel,
                '#nivelCurso',
                '#errorNivelCurso',
                'El nivel debe ser un número mayor o igual a 0'
            );
        });
    }

    configurarEventos() {
        // Botón guardar
        $('.btnGuardarCurso').on('click', () => this.guardarCurso());
        
        // Botón cancelar edición (delegación)
        $(document).on('click', '#btnCancelarEdicion', () => {
            this.cancelarEdicion();
        });
    }

    // ============================================
    // VALIDACIÓN DE FORMULARIO
    // ============================================
    
    validarFormulario() {
        // En modo edición, permitir campos vacíos pero validar los que tienen contenido
        if (this.modoEdicion) {
            const nombreValido = $('#nombreCurso').val().trim() === '' || this.validaciones.nombre;
            const nivelValido = $('#nivelCurso').val().trim() === '' || this.validaciones.nivel;
            return nombreValido && nivelValido;
        }
        
        // En modo nuevo, todos los campos son obligatorios
        return this.validaciones.nombre && this.validaciones.nivel;
    }

    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarCurso() {
        if (!this.validarFormulario()) {
            Alerta.advertencia(
                'Campos incompletos', 
                this.modoEdicion ? 
                'Complete correctamente los campos que desea actualizar' : 
                'Complete todos los campos correctamente'
            );
            return;
        }
        
        try {
            const datos = u_curso.obtenerDatosFormulario();
            
            // Crear objeto curso
            const cursoData = {
                nombreCurso: datos.nombre,
                nivel: parseInt(datos.nivel)
            };
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar curso existente
                cursoData.idCurso = this.cursoActual.idCurso;
                resultado = await m_curso.actualizarCurso(cursoData);
            } else {
                // Insertar nuevo curso
                resultado = await m_curso.insertarCurso(cursoData);
            }
            
            if (resultado) {
                // Recargar cursos
                await this.cargarCursos();
                
                // Limpiar formulario y resetear modo edición
                this.limpiarFormulario();
                this.cancelarEdicion();
                
                Alerta.exito(
                    this.modoEdicion ? 'Curso actualizado' : 'Curso creado',
                    `El curso se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo guardar el curso: ${error}`);
        }
    }
    
    async editarCurso(id) {
        try {
            const curso = this.cursos.find(c => c.idCurso == id);
            
            if (curso) {
                this.modoEdicion = true;
                this.cursoActual = curso;
                
                // Cargar datos en el formulario
                u_curso.cargarFormularioEdicion(curso);
                u_curso.configurarModoEdicion(true);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cargar el curso para editar: ${error}`);
        }
    }
    
    async cambiarEstadoCurso(id) {
        try {
            const curso = this.cursos.find(c => c.idCurso == id);
            if (!curso) return;
            
            // Determinar el estado actual (asumiendo que el modelo tiene un campo habilitado)
            // Si no existe, asumimos que está habilitado
            const habilitado = curso.habilitado !== 0;
            const accion = habilitado ? 'deshabilitar' : 'habilitar';
            
            const confirmacion = await Alerta.confirmar(
                'Confirmar',
                `¿Está seguro de ${accion} este curso?`
            );
            
            if (confirmacion) {
                let resultado;
                if (habilitado) {
                    resultado = await m_curso.deshabilitarCurso(id);
                } else {
                    resultado = await m_curso.habilitarCurso(id);
                }
                
                if (resultado) {
                    // Actualizar estado local
                    curso.habilitado = habilitado ? 0 : 1;
                    
                    // Actualizar visualmente la fila
                    const fila = $(`#tablaCursos tbody tr`).filter(function() {
                        return $(this).find('.btn-toggle-estado').data('id') == id;
                    });
                    
                    if (fila.length) {
                        u_curso.actualizarEstadoFila(fila[0], !habilitado);
                    }
                    
                    Alerta.exito('Éxito', `Curso ${accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'} correctamente`);
                }
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cambiar el estado del curso: ${error}`);
        }
    }
    
    cancelarEdicion() {
        this.modoEdicion = false;
        this.cursoActual = null;
        this.limpiarFormulario();
        u_curso.configurarModoEdicion(false);
    }
    
    limpiarFormulario() {
        u_curso.limpiarFormulario();
        
        // Resetear validaciones
        this.validaciones = {
            nombre: false,
            nivel: false
        };
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_curso();
    await controlador.inicializar();
});
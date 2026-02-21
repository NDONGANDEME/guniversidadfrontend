import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_asignatura } from "../modelo/m_asignatura.js";
import { u_asignatura } from "../utilidades/u_asignatura.js";

export class c_asignatura 
{
    constructor() {
        this.asignaturas = [];
        this.asignaturaActual = null;
        this.modoEdicion = false;
        this.dataTable = null;
        this.actor = null;
        this.codigosExistentes = [];
        
        // Estados de validación
        this.validaciones = {
            nombre: false,
            descripcion: false
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
            
            // Cargar actor
            const usuarioActual = sessionStorage.getItem('usuarioActual');
            this.actor = usuarioActual ? JSON.parse(usuarioActual) : null;
            
            // Inicializar DataTable
            this.inicializarDataTable();
            
            // Cargar asignaturas
            await this.cargarAsignaturas();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            Alerta.error('Error', `No se pudo inicializar el módulo de asignaturas: ${error}`);
        }
    }

    // Inicializar DataTable
    inicializarDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaAsignaturas')) {
            $('#tablaAsignaturas').DataTable().destroy();
        }
        
        this.dataTable = $('#tablaAsignaturas').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            columnDefs: [
                { orderable: false, targets: [3] } // No ordenar por acciones
            ]
        });
    }

    // ============================================
    // CARGA DE DATOS
    // ============================================
    
    async cargarAsignaturas() {
        try {
            const asignaturasBackend = await m_asignatura.obtenerAsignaturas();
            
            if (asignaturasBackend && asignaturasBackend.length > 0) {
                this.asignaturas = asignaturasBackend.map(a => 
                    new m_asignatura(
                        a.idAsignatura,
                        a.codigoAsignatura,
                        a.nombreAsignatura,
                        a.descripcion
                    )
                );
                
                // Recopilar códigos existentes para evitar duplicados
                this.codigosExistentes = this.asignaturas.map(a => a.codigoAsignatura).filter(c => c);
                
                this.actualizarTabla();
            } else {
                this.asignaturas = [];
                this.codigosExistentes = [];
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar asignaturas: ${error}`);
        }
    }

    // Actualizar tabla
    actualizarTabla() {
        u_asignatura.actualizarTabla(
            this.dataTable, 
            this.asignaturas,
            (id, estado) => u_asignatura.crearBotonesAccion(id, estado)
        );
        
        // Asignar eventos a los botones después de dibujar la tabla
        this.asignarEventosBotones();
    }
    
    // Asignar eventos a los botones de la tabla
    asignarEventosBotones() {
        // Usar delegación de eventos para los botones
        $(document).off('click', '.editar').on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.editarAsignatura(id);
        });
        
        $(document).off('click', '.btn-toggle-estado').on('click', '.btn-toggle-estado', (e) => {
            const id = $(e.currentTarget).data('id');
            this.cambiarEstadoAsignatura(id);
        });
    }

    // ============================================
    // CONFIGURACIÓN DE EVENTOS Y VALIDACIONES
    // ============================================
    
    configurarValidaciones() {
        // Validar nombre de la asignatura
        $('#nombreAsignatura').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.validaciones.nombre = u_asignatura.validarNombre(valor);
            u_utiles.colorearCampo(
                this.validaciones.nombre,
                '#nombreAsignatura',
                '#errorNombreAsignatura',
                'El nombre debe tener entre 5 y 100 caracteres'
            );
        });
        
        // Validar descripción de la asignatura
        $('#descripcionAsignatura').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.validaciones.descripcion = u_asignatura.validarDescripcion(valor);
            u_utiles.colorearCampo(
                this.validaciones.descripcion,
                '#descripcionAsignatura',
                '#errorDescripcionAsignatura',
                'La descripción debe tener entre 10 y 500 caracteres'
            );
        });
    }

    configurarEventos() {
        // Botón guardar
        $('.btnGuardarAsignatura').on('click', () => this.guardarAsignatura());
        
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
            const nombreValido = $('#nombreAsignatura').val().trim() === '' || this.validaciones.nombre;
            const descripcionValida = $('#descripcionAsignatura').val().trim() === '' || this.validaciones.descripcion;
            return nombreValido && descripcionValida;
        }
        
        // En modo nuevo, todos los campos son obligatorios
        return this.validaciones.nombre && this.validaciones.descripcion;
    }

    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarAsignatura() {
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
            const datos = u_asignatura.obtenerDatosFormulario();
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar asignatura existente
                const asignaturaData = {
                    idAsignatura: this.asignaturaActual.idAsignatura,
                    nombreAsignatura: datos.nombre,
                    descripcion: datos.descripcion
                };
                
                resultado = await m_asignatura.actualizarAsignatura(asignaturaData);
            } else {
                // Generar código único para la nueva asignatura
                const codigo = u_asignatura.generarCodigoAsignatura(datos.nombre, this.codigosExistentes);
                
                // Crear nueva asignatura
                const asignaturaData = {
                    codigoAsignatura: codigo,
                    nombreAsignatura: datos.nombre,
                    descripcion: datos.descripcion
                };
                
                resultado = await m_asignatura.insertarAsignatura(asignaturaData);
                
                // Agregar el nuevo código a la lista de existentes
                this.codigosExistentes.push(codigo);
            }
            
            if (resultado) {
                // Recargar asignaturas
                await this.cargarAsignaturas();
                
                // Limpiar formulario y resetear modo edición
                this.limpiarFormulario();
                this.cancelarEdicion();
                
                Alerta.exito(
                    this.modoEdicion ? 'Asignatura actualizada' : 'Asignatura creada',
                    `La asignatura se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo guardar la asignatura: ${error}`);
        }
    }
    
    async editarAsignatura(id) {
        try {
            const asignatura = this.asignaturas.find(a => a.idAsignatura == id);
            
            if (asignatura) {
                this.modoEdicion = true;
                this.asignaturaActual = asignatura;
                
                // Cargar datos en el formulario
                u_asignatura.cargarFormularioEdicion(asignatura);
                u_asignatura.configurarModoEdicion(true);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cargar la asignatura para editar: ${error}`);
        }
    }
    
    async cambiarEstadoAsignatura(id) {
        try {
            const asignatura = this.asignaturas.find(a => a.idAsignatura == id);
            if (!asignatura) return;
            
            // Determinar el estado actual (asumiendo que el modelo tiene un campo habilitado)
            const habilitado = asignatura.habilitado !== 0;
            const accion = habilitado ? 'deshabilitar' : 'habilitar';
            
            const confirmacion = await Alerta.confirmar(
                'Confirmar',
                `¿Está seguro de ${accion} esta asignatura?`
            );
            
            if (confirmacion) {
                let resultado;
                if (habilitado) {
                    resultado = await m_asignatura.deshabilitarAsignatura(id);
                } else {
                    resultado = await m_asignatura.habilitarAsignatura(id);
                }
                
                if (resultado) {
                    // Actualizar estado local
                    asignatura.habilitado = habilitado ? 0 : 1;
                    
                    // Actualizar visualmente la fila
                    const fila = $(`#tablaAsignaturas tbody tr`).filter(function() {
                        return $(this).find('.btn-toggle-estado').data('id') == id;
                    });
                    
                    if (fila.length) {
                        u_asignatura.actualizarEstadoFila(fila[0], !habilitado);
                    }
                    
                    Alerta.exito('Éxito', `Asignatura ${accion === 'deshabilitar' ? 'deshabilitada' : 'habilitada'} correctamente`);
                }
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cambiar el estado de la asignatura: ${error}`);
        }
    }
    
    cancelarEdicion() {
        this.modoEdicion = false;
        this.asignaturaActual = null;
        this.limpiarFormulario();
        u_asignatura.configurarModoEdicion(false);
    }
    
    limpiarFormulario() {
        u_asignatura.limpiarFormulario();
        
        // Resetear validaciones
        this.validaciones = {
            nombre: false,
            descripcion: false
        };
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_asignatura();
    await controlador.inicializar();
});
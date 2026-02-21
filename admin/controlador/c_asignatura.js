import { sesiones } from "../../public/core/sesiones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_asignatura } from "../modelo/m_asignatura.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_asignatura } from "../utilidades/u_asignatura.js";

export class c_asignatura
{
    constructor() {
        this.asignaturas = [];
        this.asignaturaActual = null;
        this.modoEdicion = false;
        this.dataTable = null;
        this.nombreValido = false;
    }

    // Método principal para iniciar todo
    inicializar() {
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
    }

    // Configurar validaciones
    configurarValidaciones() {
        u_asignatura.configurarValidaciones((valido) => this.nombreValido = valido);
    }

    // Inicializar DataTable
    inicializarDataTable() {
        this.dataTable = u_asignatura.inicializarDataTable('#tablaAsignaturas');
    }

    // Cargar datos desde el backend
    async cargarDatosIniciales() {
        try {
            u_asignatura.mostrarCargando();
            
            const asignaturasBackend = await m_asignatura.obtenerAsignaturas();
            
            if (asignaturasBackend && asignaturasBackend.length > 0) {
                this.asignaturas = asignaturasBackend.map(a => 
                    new m_asignatura(a.idAsignatura, a.nombreAsignatura)
                );
                
                // Añadir propiedad habilitado si viene del backend
                this.asignaturas.forEach((a, index) => {
                    a.habilitado = asignaturasBackend[index].habilitado !== 0;
                });

                this.inicializarDataTable();
                this.actualizarTabla();
            } else {
                this.asignaturas = [];
                u_asignatura.mostrarMensajeSinDatos();
            }
        } catch (error) {
            Alerta.notificarError(`Error al cargar datos: ${error}`, 3000);
            u_asignatura.mostrarMensajeError();
        }
    }

    // Configurar eventos del DOM
    configurarEventos() {
        $('.btnGuardarAsignatura').on('click', () => this.guardarAsignatura());
        
        // Evento para el botón Nueva (limpiar formulario)
        $('.btn-success.nueva').on('click', () => {
            this.cancelarEdicion();
        });
        
        $(document).on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.prepararEdicion(id);
        });
        
        $(document).on('click', '.btn-toggle-estado', (e) => {
            const id = $(e.currentTarget).data('id');
            this.toggleEstadoAsignatura(id);
        });

        $(document).on('click', '#btnCancelarEdicion', () => {
            this.cancelarEdicion();
        });
    }

    // Actualizar tabla
    actualizarTabla() {
        u_asignatura.actualizarTabla(
            this.dataTable,
            this.asignaturas,
            (id, habilitado) => u_asignatura.generarBotonesAccion(id, habilitado)
        );
    }

    // Validar formulario
    validarFormulario() {
        return this.nombreValido;
    }

    // Guardar asignatura (Insertar/Editar)
    async guardarAsignatura() {
        if (!this.validarFormulario()) {
            Alerta.notificarAdvertencia('El nombre de la asignatura no es válido.', 3000);
            return;
        }
        
        try {
            const nombre = $('#nombreAsignatura').val().trim();
            
            if (this.modoEdicion) {
                await this.actualizarAsignaturaExistente(nombre);
            } else {
                await this.crearNuevaAsignatura(nombre);
            }
            
            // Recargar datos
            await this.cargarDatosIniciales();
            this.limpiarFormulario();
            
        } catch (error) {
            Alerta.notificarError(`Error al guardar: ${error}`, 3000);
        }
    }

    // Actualizar asignatura existente
    async actualizarAsignaturaExistente(nombre) {
        const asignaturaActualizada = new m_asignatura(this.asignaturaActual.idAsignatura, nombre);
        const resultado = await m_asignatura.actualizarAsignatura(asignaturaActualizada);
        
        if (resultado) {
            Alerta.notificarExito('Asignatura actualizada correctamente', 3000);
            this.cancelarEdicion();
        }
    }

    // Crear nueva asignatura
    async crearNuevaAsignatura(nombre) {
        const nuevaAsignatura = new m_asignatura(null, nombre);
        const idGenerado = await m_asignatura.insertarAsignatura(nuevaAsignatura);
        
        if (idGenerado) {
            Alerta.notificarExito('Asignatura creada correctamente', 3000);
        }
    }

    // Toggle estado de asignatura
    async toggleEstadoAsignatura(idAsignatura) {
        try {
            const asignatura = this.asignaturas.find(a => a.idAsignatura == idAsignatura);
            if (!asignatura) return;
            
            const nuevoEstado = !asignatura.habilitado;
            let resultado;
            
            if (nuevoEstado) {
                resultado = await m_asignatura.habilitarAsignatura(idAsignatura);
            } else {
                resultado = await m_asignatura.deshabilitarAsignatura(idAsignatura);
            }
            
            if (resultado) {
                asignatura.habilitado = nuevoEstado;
                
                // Actualizar visualmente la fila
                const fila = $(`#tablaAsignaturas tbody tr`).filter(function() {
                    return $(this).find('.btn-toggle-estado').data('id') == idAsignatura;
                });
                
                if (fila.length) {
                    u_asignatura.actualizarEstadoFila(fila[0], nuevoEstado);
                }
                
                Alerta.notificarExito(`Asignatura ${nuevoEstado ? 'habilitada' : 'deshabilitada'} correctamente`, 2000);
            }
        } catch (error) {
            Alerta.notificarError(`Error al cambiar estado: ${error}`, 3000);
        }
    }

    // Preparar edición
    prepararEdicion(idAsignatura) {
        const asignatura = this.asignaturas.find(a => a.idAsignatura == idAsignatura);
        
        if (asignatura) {
            this.modoEdicion = true;
            this.asignaturaActual = asignatura;
            
            u_asignatura.cargarFormularioEdicion(asignatura);
            u_asignatura.configurarModoEdicion(true, idAsignatura);
        }
    }

    // Cancelar edición
    cancelarEdicion() {
        this.modoEdicion = false;
        this.asignaturaActual = null;
        this.limpiarFormulario();
        u_asignatura.configurarModoEdicion(false);
    }

    // Limpiar formulario
    limpiarFormulario() {
        u_asignatura.limpiarFormulario();
        this.nombreValido = false;
    }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Verificamos que existe sesion
    sesiones.verificarExistenciaSesion();
    u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionAdministrador();
    
    // Inicializar el controlador de asignaturas
    const controladorAsignatura = new c_asignatura();
    setTimeout(() => {
        controladorAsignatura.inicializar();
    }, 100);
});
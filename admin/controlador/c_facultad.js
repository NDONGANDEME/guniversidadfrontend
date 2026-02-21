/**
 * Maneja la lógica de negocio y utiliza u_facultad para operaciones de DOM
 */

import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { u_facultad } from "../utilidades/u_facultad.js";

export class c_facultad
{
    constructor() {
        this.facultades = [];
        this.facultadActual = null;
        this.modoEdicion = false;
        this.dataTable = null;
        this.actor = null;
        
        // Estados de validación
        this.validaciones = {
            nombre: false,
            direccion: false,
            correo: false,
            telefono: false
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
            u_utiles.botonesNavegacionAdministrador();
            
            // Inicializar DataTable
            this.inicializarDataTable();
            
            // Cargar datos
            await this.cargarDatosIniciales();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            this.configurarValidaciones();
        } catch (error) {
            Alerta.error('Error', `No se pudo inicializar el módulo de facultades: ${error}`);
        }
    }

    // Inicializar DataTable
    inicializarDataTable() {
        if ($.fn.dataTable.isDataTable('#tablaFacultades')) {
            $('#tablaFacultades').DataTable().destroy();
        }
        
        this.dataTable = $('#tablaFacultades').DataTable({
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
    
    async cargarDatosIniciales() {
        try {
            const facultadesBackend = await m_facultad.obtenerFacultades();
            
            if (facultadesBackend && facultadesBackend.length > 0) {
                this.facultades = facultadesBackend.map(f => 
                    new m_facultad(
                        f.idFacultad, 
                        f.nombreFacultad, 
                        f.direccionFacultad,
                        f.correo,
                        f.telefono
                    )
                );
                
                this.actualizarTabla();
            } else {
                this.facultades = [];
            }
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar facultades: ${error}`);
        }
    }

    // Actualizar tabla
    actualizarTabla() {
        u_facultad.actualizarTabla(
            this.dataTable, 
            this.facultades, 
            (id, estado) => u_facultad.generarBotonesAccion(id, estado)
        );
    }

    // ============================================
    // CONFIGURACIÓN DE EVENTOS Y VALIDACIONES
    // ============================================
    
    configurarValidaciones() {
        u_facultad.configurarValidaciones({
            onNombreValidado: (valido) => this.validaciones.nombre = valido,
            onDireccionValidada: (valido) => this.validaciones.direccion = valido,
            onCorreoValidado: (valido) => this.validaciones.correo = valido,
            onTelefonoValidado: (valido) => this.validaciones.telefono = valido
        });
    }

    configurarEventos() {
        // Botón guardar
        $('.btnGuardarFacultad').on('click', () => this.guardarFacultad());
        
        // Eventos de botones en la tabla (usando delegación)
        $(document).on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.editarFacultad(id);
        });
        
        $(document).on('click', '.btn-toggle-estado', (e) => {
            const id = $(e.currentTarget).data('id');
            this.cambiarEstadoFacultad(id);
        });
        
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
            // Verificar que al menos un campo tenga contenido válido
            const nombreValido = $('#nombreFacultad').val().trim() === '' || this.validaciones.nombre;
            const direccionValida = $('#direccionFacultad').val().trim() === '' || this.validaciones.direccion;
            const correoValido = $('#correoFacultad').val().trim() === '' || this.validaciones.correo;
            const telefonoValido = $('#telefonoFacultad').val().trim() === '' || this.validaciones.telefono;
            
            return nombreValido && direccionValida && correoValido && telefonoValido;
        }
        
        // En modo nuevo, todos los campos son obligatorios
        return this.validaciones.nombre && this.validaciones.direccion || (this.validaciones.correo || this.validaciones.telefono);
    }

    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarFacultad() {
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
            const datos = u_facultad.obtenerDatosFormulario();
            
            // Crear objeto facultad
            const facultadData = {
                nombreFacultad: datos.nombre,
                direccionFacultad: datos.direccion,
                correo: datos.correo,
                telefono: datos.telefono
            };
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar facultad existente
                facultadData.idFacultad = this.facultadActual.idFacultad;
                resultado = await m_facultad.actualizarFacultad(facultadData);
            } else {
                // Insertar nueva facultad
                resultado = await m_facultad.insertarFacultad(facultadData);
            }
            
            if (resultado) {
                // Recargar facultades
                await this.cargarDatosIniciales();
                
                // Limpiar formulario y resetear modo edición
                this.limpiarFormulario();
                this.cancelarEdicion();
                
                Alerta.exito(
                    this.modoEdicion ? 'Facultad actualizada' : 'Facultad creada',
                    `La facultad se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo guardar la facultad: ${error}`);
        }
    }
    
    async editarFacultad(id) {
        try {
            const facultad = this.facultades.find(f => f.idFacultad == id);
            
            if (facultad) {
                this.modoEdicion = true;
                this.facultadActual = facultad;
                
                // Cargar datos en el formulario
                u_facultad.cargarFormularioEdicion(facultad);
                u_facultad.configurarModoEdicion(true);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cargar la facultad para editar: ${error}`);
        }
    }
    
    async cambiarEstadoFacultad(id) {
        try {
            const facultad = this.facultades.find(f => f.idFacultad == id);
            if (!facultad) return;
            
            const accion = facultad.habilitado ? 'deshabilitar' : 'habilitar';
            
            const confirmacion = await Alerta.confirmar(
                'Confirmar',
                `¿Está seguro de ${accion} esta facultad?`
            );
            
            if (confirmacion) {
                let resultado;
                if (facultad.habilitado) {
                    resultado = await m_facultad.deshabilitarFacultad(id);
                } else {
                    resultado = await m_facultad.habilitarFacultad(id);
                }
                
                if (resultado) {
                    // Actualizar estado local
                    facultad.habilitado = facultad.habilitado ? 0 : 1;
                    
                    // Actualizar visualmente la fila
                    const fila = $(`#tablaFacultades tbody tr`).filter(function() {
                        return $(this).find('.btn-toggle-estado').data('id') == id;
                    });
                    
                    if (fila.length) {
                        u_facultad.actualizarEstadoFila(fila[0], facultad.habilitado);
                    }
                    
                    Alerta.exito('Éxito', `Facultad ${accion === 'deshabilitar' ? 'deshabilitada' : 'habilitada'} correctamente`);
                }
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo cambiar el estado de la facultad: ${error}`);
        }
    }
    
    cancelarEdicion() {
        this.modoEdicion = false;
        this.facultadActual = null;
        this.limpiarFormulario();
        u_facultad.configurarModoEdicion(false);
    }
    
    limpiarFormulario() {
        u_facultad.limpiarFormulario();
        
        // Resetear validaciones
        this.validaciones = {
            nombre: false,
            direccion: false,
            correo: false,
            telefono: false
        };
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_facultad();
    await controlador.inicializar();
});
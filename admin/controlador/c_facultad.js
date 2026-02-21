/**
 * Este archivo maneja la lógica de negocio y utiliza u_facultad para las operaciones de DOM:
*/

import { sesiones } from "../../public/core/sesiones.js";
import { m_contacto } from "../../public/modelo/m_contacto.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { u_facultad } from "../utilidades/u_facultad.js";

export class c_facultad
{
    constructor() {
        this.facultades = [];
        this.contactos = []; // Todos los contactos
        this.contactosActuales = []; // Contactos de la facultad actual en edición
        this.facultadActual = null;
        this.modoEdicion = false;
        this.dataTable = null;
        
        // Estados de validación
        this.nombreValido = false;
        this.direccionValida = false;
        this.contactoValido = false;
    }

    // Método principal para iniciar todo
    inicializar() {
        this.cargarDatosIniciales();
        this.configurarEventos();
        this.configurarValidaciones();
    }

    // Configurar validaciones (delega en u_facultad)
    configurarValidaciones() {
        u_facultad.configurarValidaciones({
            onNombreValidado: (valido) => this.nombreValido = valido,
            onDireccionValidada: (valido) => this.direccionValida = valido,
            onContactoValidado: (valido) => {
                // En modo edición, si hay contactos existentes, consideramos válido
                if (this.modoEdicion && this.contactosActuales.length > 0) {
                    // Verificar si al menos un contacto tiene valor válido
                    let algunValido = false;
                    $('.contacto-input').each(function() {
                        const valor = $(this).val().trim();
                        if (valor !== '' && (u_verificaciones.validarTelefono(valor) || u_verificaciones.validarCorreo(valor))) {
                            algunValido = true;
                        }
                    });
                    this.contactoValido = algunValido;
                } else {
                    this.contactoValido = valido;
                }
            }
        });
    }

    // Inicializar DataTable
    inicializarDataTable() {
        this.dataTable = u_utiles.inicializarDataTable('#tablaFacultades');
    }

    // Cargar datos desde el backend
    async cargarDatosIniciales() {
        try {
            u_facultad.mostrarCargando();
        
            const facultadesBackend = await m_facultad.obtenerFacultades();
            
            if (facultadesBackend && facultadesBackend.length > 0) {
                this.facultades = facultadesBackend.map(f => 
                    new m_facultad(f.idFacultad, f.nombreFacultad, f.direccionFacultad)
                );
                
                const contactosBackend = await  m_contacto.obtenerContactos();
                
                if (contactosBackend && contactosBackend.length > 0) {
                    this.contactos = contactosBackend.map(c => 
                        new m_contacto(c.idContacto, c.contacto, c.tipo, c.idStatic, c.idFacultad, c.idDepartamento, c.idProfesor, c.idEstudiante, c.idAdministrativo, c.idResponsablePago, c.idFamiliar)
                    );
                }

                this.inicializarDataTable();
                this.actualizarTabla();
            } else {
                this.facultades = [];
                this.contactos = [];
                u_facultad.mostrarMensajeSinDatos();
            }
        } catch (error) {
            Alerta.notificarError(`Error al cargar datos: ${error}`, 3000);
            u_facultad.mostrarMensajeError();
        }
    }

    // Configurar eventos del DOM
    configurarEventos() {
        $('#btnGuardarFacultad').on('click', () => this.guardarFacultad());
        
        // Evento para añadir contacto - PASAR CALLBACKS
        $(document).on('click', '#btnAgregarContacto', (e) => {
            e.preventDefault();
            u_facultad.agregarCampoContacto({
                onContactoValidado: (valido) => this.contactoValido = valido
            });
            this.actualizarVisibilidadBotonesEliminar();
        });
        
        // Evento para eliminar contacto - PASAR CALLBACKS
        $(document).on('click', '.eliminar-contacto', (e) => {
            e.preventDefault();
            u_facultad.eliminarCampoContacto(e, {
                onContactoValidado: (valido) => this.contactoValido = valido
            });
            this.actualizarVisibilidadBotonesEliminar();
        });
        
        $(document).on('click', '.editar', (e) => {
            const id = $(e.currentTarget).data('id');
            this.prepararEdicion(id);
        });
        
        $(document).on('click', '.btn-toggle-estado', (e) => {
            const id = $(e.currentTarget).data('id');
            this.toggleEstadoFacultad(id);
        });

        $(document).on('click', '#btnCancelarEdicion', () => {
            this.cancelarEdicion();
        });
    }

    // Actualizar tabla (delega en u_facultad)
    actualizarTabla() {
        u_facultad.actualizarTabla(
            this.dataTable, 
            this.facultades, 
            this.contactos, 
            (id) => {
                // Buscar la facultad para saber si está habilitada
                const facultad = this.facultades.find(f => f.idFacultad == id);
                const habilitado = facultad ? facultad.habilitado !== 0 : true;
                return u_facultad.generarBotonesAccion(id, habilitado);
            }
        );
    }

    // Validar formulario completo
    validarFormulario() {
        // Validar nombre y dirección
        if (!this.nombreValido || !this.direccionValida) {
            return false;
        }
        
        // Validar que al menos un contacto sea válido O que estemos en modo edición con contactos existentes
        let alMenosUnContactoValido = false;
        $('.contacto-input').each(function() {
            const valor = $(this).val().trim();
            if (valor !== '' && (u_verificaciones.validarTelefono(valor) || u_verificaciones.validarCorreo(valor))) {
                alMenosUnContactoValido = true;
            }
        });
        
        // Si estamos en modo edición y hay contactos guardados, permitir campos vacíos
        if (this.modoEdicion && this.contactosActuales.length > 0) {
            return this.nombreValido && this.direccionValida;
        }
        
        return alMenosUnContactoValido;
    }

    // Guardar facultad (Insertar/Editar)
    async guardarFacultad() {
        if (!this.validarFormulario()) {
            Alerta.notificarAdvertencia('Complete correctamente todos los campos. Al menos un contacto válido es requerido.', 3000);
            return;
        }
        
        try {
            const nombre = $('#nombreFacultad').val().trim();
            const direccion = $('#direccionFacultad').val().trim();
            const contactosValores = u_facultad.obtenerContactosFormulario();
            
            if (this.modoEdicion) {
                await this.actualizarFacultadExistente(nombre, direccion, contactosValores);
            } else {
                await this.crearNuevaFacultad(nombre, direccion, contactosValores);
            }
            
            // Recargar datos para actualizar todo
            await this.cargarDatosIniciales();
            this.limpiarFormulario();
            
            // Cerrar modal
            $('#modalNuevaFacultad').modal('hide');
        } catch (error) {
            Alerta.notificarError(`Error al guardar: ${error}`, 3000);
        }
    }

    // Actualizar facultad existente
    async actualizarFacultadExistente(nombre, direccion, contactosValores) {
        // Actualizar datos de la facultad
        const facultadActualizada = new m_facultad(this.facultadActual.idFacultad, nombre, direccion);
        await m_facultad.actualizarFacultad(facultadActualizada);
        
        // Obtener contactos actuales de esta facultad
        const contactosExistentes = this.contactos.filter(c => c.idFacultad == this.facultadActual.idFacultad);
        
        // Actualizar o crear contactos
        for (let i = 0; i < contactosValores.length; i++) {
            const valor = contactosValores[i];
            const tipo = u_verificaciones.validarCorreo(valor) ? 'Correo' : 'Teléfono';
            
            if (i < contactosExistentes.length) {
                // Actualizar contacto existente
                const contactoExistente = contactosExistentes[i];
                const contactoActualizado = new m_contacto(
                    contactoExistente.idContacto,
                    valor,
                    tipo,
                    null,
                    this.facultadActual.idFacultad,
                    null, null, null, null, null, null
                );
                await m_contacto.actualizarContacto(contactoActualizado);
            } else {
                // Crear nuevo contacto
                const nuevoContacto = new m_contacto(
                    null,
                    valor,
                    tipo,
                    null,
                    this.facultadActual.idFacultad,
                    null, null, null, null, null, null
                );
                await m_contacto.insertarContacto(nuevoContacto);
            }
        }
        
        // Eliminar contactos sobrantes (si había más antes y ahora menos)
        if (contactosExistentes.length > contactosValores.length) {
            for (let i = contactosValores.length; i < contactosExistentes.length; i++) {
                await m_contacto.eliminarContacto(contactosExistentes[i].idContacto);
            }
        }
        
        Alerta.notificarExito('Facultad actualizada correctamente', 3000);
        this.cancelarEdicion();
    }

    // Crear nueva facultad
    async crearNuevaFacultad(nombre, direccion, contactosValores) {
        // Crear la facultad primero
        const nuevaFacultad = new m_facultad(null, nombre, direccion);
        const idFacultadGenerado = await m_facultad.insertarFacultad(nuevaFacultad);
        
        if (idFacultadGenerado) {
            // Crear todos los contactos asociados
            for (const valor of contactosValores) {
                const tipo = u_verificaciones.validarCorreo(valor) ? 'Correo' : 'Teléfono';
                const nuevoContacto = new m_contacto(
                    null,
                    valor,
                    tipo,
                    null,
                    idFacultadGenerado,
                    null, null, null, null, null, null
                );
                await m_contacto.insertarContacto(nuevoContacto);
            }
            
            Alerta.notificarExito('Facultad creada correctamente', 3000);
        }
    }

    // Determinar tipo de contacto
    determinarTipoContacto(valor) {
        return u_verificaciones.validarCorreo(valor) ? 'Correo' : 'Teléfono';
    }

    // Preparar edición
    async prepararEdicion(idFacultad) {
        try {
            const facultad = this.facultades.find(f => f.idFacultad == idFacultad);
            
            if (facultad) {
                this.modoEdicion = true;
                this.facultadActual = facultad;
                
                // Obtener TODOS los contactos de esta facultad
                const contactosFacultad = this.contactos.filter(c => c.idFacultad == idFacultad);
                this.contactosActuales = [...contactosFacultad];
                
                // Cargar valores en el formulario
                $('#nombreFacultad').val(facultad.NombreFacultad);
                $('#direccionFacultad').val(facultad.DireccionFacultad || '');
                
                // Cargar contactos CON CALLBACKS
                u_facultad.cargarContactosFormulario(contactosFacultad, {
                    onContactoValidado: (valido) => this.contactoValido = valido
                });
                
                // Forzar validaciones
                $('#nombreFacultad').trigger('input');
                $('#direccionFacultad').trigger('input');
                
                u_facultad.configurarModoEdicion(true);
                this.actualizarVisibilidadBotonesEliminar();
            }
        } catch (error) {
            Alerta.notificarError(`No se pudo cargar la facultad para editar. ${error}`, 3000);
        }
    }

    // Cancelar edición
    cancelarEdicion() {
        this.modoEdicion = false;
        this.facultadActual = null;
        this.contactosActuales = [];
        this.limpiarFormulario();
        u_facultad.configurarModoEdicion(false);
    }

    // Limpiar formulario (delega en u_facultad)
    limpiarFormulario() {
        $('#nombreFacultad').val('');
        $('#direccionFacultad').val('');
        u_facultad.limpiarContactosFormulario({
            onContactoValidado: (valido) => this.contactoValido = valido
        });
        
        $('.form-control').removeClass('border-success border-danger');
        $('.errorMensaje').text('').hide();
        
        this.nombreValido = false;
        this.direccionValida = false;
        this.contactoValido = false;
        this.actualizarVisibilidadBotonesEliminar();
    }

    /**
     * Actualiza la visibilidad de los botones eliminar contacto
     * (solo se muestran si hay más de 1 contacto)
     */
    actualizarVisibilidadBotonesEliminar() {
        const totalContactos = $('.contacto-item').length;
        $('.eliminar-contacto').each(function() {
            if (totalContactos > 1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    }

    // Toggle estado de facultad
    async toggleEstadoFacultad(idFacultad) {
        try {
            const facultad = this.facultades.find(f => f.idFacultad == idFacultad);
            if (!facultad) return;
            
            const nuevoEstado = !facultad.habilitado;
            let resultado;
            
            if (nuevoEstado) {
                resultado = await m_facultad.habilitarFacultad(idFacultad);
            } else {
                resultado = await m_facultad.deshabilitarFacultad(idFacultad);
            }
            
            if (resultado) {
                facultad.habilitado = nuevoEstado ? 1 : 0;
                
                // Actualizar visualmente la fila
                const fila = $(`#tablaFacultades tbody tr`).filter(function() {
                    return $(this).find('.btn-toggle-estado').data('id') == idFacultad;
                });
                
                if (fila.length) {
                    u_facultad.actualizarEstadoFila(fila[0], nuevoEstado);
                }
                
                Alerta.notificarExito(`Facultad ${nuevoEstado ? 'habilitada' : 'deshabilitada'} correctamente`, 2000);
            }
        } catch (error) {
            Alerta.notificarError(`Error al cambiar estado: ${error}`, 3000);
        }
    }
}


document.addEventListener('DOMContentLoaded', function()
{
    // Verificamos que existe sesion
    sesiones.verificarExistenciaSesion();
    u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utiles.botonesNavegacionAdministrador();
    
    // Inicializar el controlador de facultades
    const controladorFacultad = new c_facultad();
    setTimeout(() => {
        controladorFacultad.inicializar();
    }, 100);
});
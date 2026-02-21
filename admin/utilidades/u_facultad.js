/**
 * Este archivo maneja TODO lo relacionado con el DOM y la interfaz de usuario:
 */

import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_facultad
{
    /**
     * Actualiza la tabla con los datos proporcionados
     * @param {Object} dataTable - Instancia de DataTable
     * @param {Array} facultades - Lista de facultades
     * @param {Array} contactos - Lista de contactos
     * @param {Function} generadorBotones - Función que genera los botones de acción
     */
    static actualizarTabla(dataTable, facultades, contactos, generadorBotones) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (facultades.length === 0) {
            dataTable.draw();
            return;
        }
        
        facultades.forEach(facultad => {
            const contacto = contactos.find(c => c.idContacto === facultad.idContacto);
            const contactoString = contacto ? contacto.contacto : 'Sin contacto';
            
            dataTable.row.add([
                facultad.NombreFacultad,
                facultad.DireccionFacultad || 'Sin dirección',
                contactoString,
                generadorBotones(facultad.idFacultad)
            ]);
        });
        
        dataTable.draw();
    }

    /**
     * Genera los botones de acción para la tabla
     * @param {number|string} idFacultad - ID de la facultad
     * @returns {string} HTML de los botones
     */
    static generarBotonesAccion(idFacultad) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar"
                        title="Editar" 
                        data-id="${idFacultad}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger deshabilitar" 
                        data-id="${idFacultad}" 
                        title="Deshabilitar">
                    <i class="fas fa-toggle-on"></i>
                </button>
            </div>
        `;
    }

    /**
     * Configura las validaciones de los campos del formulario
     * @param {Object} callbacks - Objeto con las funciones callback para actualizar estados
     */
    static configurarValidaciones(callbacks) {
        // Validar nombre (igual)
        $('#nombreFacultad').on('input', () => {
            const valor = $('#nombreFacultad').val().trim();
            const valido = u_verificaciones.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreFacultad', '#errorNombreFacultad', 'El nombre debe tener entre 3 y 50 caracteres');
            if (callbacks.onNombreValidado) callbacks.onNombreValidado(valido);
            this.validarTodosLosContactos(callbacks); // Re-validar contactos al cambiar nombre
        });

        // Validar dirección (igual)
        $('#direccionFacultad').on('input', () => {
            const valor = $('#direccionFacultad').val().trim();
            const valido = u_verificaciones.validarTexto(valor);
            u_utiles.colorearCampo(valido, '#direccionFacultad', '#errorDireccionFacultad', 'La dirección debe tener entre 5 y 100 caracteres');
            if (callbacks.onDireccionValidada) callbacks.onDireccionValidada(valido);
            this.validarTodosLosContactos(callbacks); // Re-validar contactos al cambiar dirección
        });

        // Validar contactos (NUEVO: configuración inicial)
        this.configurarValidacionesContactos(callbacks);
    }

    /**
     * Configura las validaciones para todos los campos de contacto (NUEVO)
     * @param {Object} callbacks - Objeto con funciones callback
     */
    static configurarValidacionesContactos(callbacks) {
        // Usar delegación de eventos para campos de contacto (incluso los añadidos dinámicamente)
        $(document).off('input', '.contacto-input').on('input', '.contacto-input', () => {
            this.validarTodosLosContactos(callbacks);
        });
    }

    /**
     * Valida todos los campos de contacto y actualiza el estado general (NUEVO)
     * @param {Object} callbacks - Objeto con funciones callback
     * @returns {boolean} True si al menos un contacto es válido
     */
    static validarTodosLosContactos(callbacks) {
        let alMenosUnValido = false;
        let todosVacios = true;
        
        $('.contacto-input').each(function() {
            const valor = $(this).val().trim();
            const $campo = $(this);
            const $item = $campo.closest('.contacto-item');
            const $errorMsj = $('#errorContactoFacultad');
            
            // Quitar clases anteriores
            $campo.removeClass('border-success border-danger');
            
            if (valor === '') {
                // Campo vacío - no marcar como error, solo quitar clases
                todosVacios = todosVacios && true;
            } else {
                todosVacios = false;
                const valido = u_verificaciones.validarTelefono(valor) || u_verificaciones.validarCorreo(valor);
                
                if (valido) {
                    $campo.addClass('border-success');
                    alMenosUnValido = true;
                } else {
                    $campo.addClass('border-danger');
                }
            }
        });
        
        // Mostrar mensaje de error general si no hay ningún contacto válido y no están todos vacíos
        if (!alMenosUnValido && !todosVacios) {
            $('#errorContactoFacultad').text('Al menos un contacto debe ser válido (email o teléfono)').show();
        } else {
            $('#errorContactoFacultad').text('').hide();
        }
        
        // Llamar al callback si existe
        if (callbacks.onContactoValidado) {
            callbacks.onContactoValidado(alMenosUnValido || todosVacios);
        }
        
        return alMenosUnValido || todosVacios;
    }

    /**
     * Carga los valores en el formulario para edición
     * @param {Object} facultad - Datos de la facultad
     * @param {Object} contacto - Datos del contacto
     */
    static cargarFormularioEdicion(facultad, contacto) {
        $('#nombreFacultad').val(facultad.NombreFacultad);
        $('#direccionFacultad').val(facultad.DireccionFacultad || '');
        $('#contactoFacultad').val(contacto ? contacto.contacto : '');
        
        // Forzar validaciones
        $('#nombreFacultad').trigger('input');
        $('#direccionFacultad').trigger('input');
        $('#contactoFacultad').trigger('input');
    }

    /**
     * Configura el modo edición en el formulario
     * @param {boolean} modoEdicion - Si está en modo edición
     */
    static configurarModoEdicion(modoEdicion) {
        if (modoEdicion) {
            $('#btnGuardarFacultad').text('Actualizar Facultad');
            if ($('#btnCancelarEdicion').length === 0) {
                $('#btnGuardarFacultad').after(`
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicion">
                        Cancelar
                    </button>
                `);
            }
        } else {
            $('#btnGuardarFacultad').text('Guardar Facultad');
            $('#btnCancelarEdicion').remove();
        }
    }

    /**
     * Limpia el formulario y resetea los estilos
     */
    static limpiarFormulario() {
        $('#nombreFacultad').val('');
        $('#direccionFacultad').val('');
        $('#contactoFacultad').val('');
        
        $('.form-control').removeClass('border-success border-danger');
        $('.errorMensaje').text('').hide();
    }

    /**
     * Muestra mensaje de error en la tabla
     */
    static mostrarMensajeError() {
        if ($('#tablaFacultades tbody').length) {
            $('#tablaFacultades tbody').html(`
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <div class="alert alert-danger mb-0">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Error al cargar las facultades. Intente nuevamente.
                        </div>
                    </td>
                </tr>
            `);
        }
    }

    /**
     * Muestra mensaje cuando no hay datos
     */
    static mostrarMensajeSinDatos() {
        if ($('#tablaFacultades tbody').length) {
            $('#tablaFacultades tbody').html(`
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <div class="alert alert-info mb-0">
                            <i class="fas fa-info-circle me-2"></i>
                            No hay facultades disponibles en la base de datos
                        </div>
                    </td>
                </tr>
            `);
        }
    }

    /**
     * Muestra indicador de carga
     */
    static mostrarCargando() {
        if ($('#tablaFacultades tbody').length) {
            $('#tablaFacultades tbody').html(`
                <tr>
                    <td colspan="4" class="text-center py-4">
                        <div class="spinner-border text-warning" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted">Cargando facultades...</p>
                    </td>
                </tr>
            `);
        }
    }

    /**
     * Añade un nuevo campo de contacto al formulario (VERSIÓN ACTUALIZADA)
     * @param {Object} callbacks - Objeto con funciones callback para validaciones
     */
    static agregarCampoContacto(callbacks = null) {
        const contenedor = $('#contactosContainer');
        const nuevoIndex = contenedor.children().length;
        
        const nuevoCampo = `
            <div class="input-group mb-2 contacto-item" data-index="${nuevoIndex}">
                <input type="text" class="form-control contacto-input" 
                       placeholder="Ej: +240 222 123 456 o facultad@email.com">
                <button class="btn btn-outline-danger btn-sm eliminar-contacto" type="button" title="Eliminar contacto">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        contenedor.append(nuevoCampo);
        
        // Enfocar el nuevo campo
        setTimeout(() => {
            contenedor.children().last().find('.contacto-input').focus();
        }, 100);
        
        // Re-validar todos los contactos después de añadir
        if (callbacks) {
            this.validarTodosLosContactos(callbacks);
        }
    }

    /**
     * Elimina un campo de contacto (VERSIÓN ACTUALIZADA)
     * @param {Event} e - Evento del click
     * @param {Object} callbacks - Objeto con funciones callback para validaciones
     */
    static eliminarCampoContacto(e, callbacks = null) {
        $(e.currentTarget).closest('.contacto-item').remove();
        
        // Re-validar todos los contactos después de eliminar
        if (callbacks) {
            this.validarTodosLosContactos(callbacks);
        }
    }

    /**
     * Obtiene todos los valores de los contactos del formulario
     * @returns {Array} Array de strings con los contactos
     */
    static obtenerContactosFormulario() {
        const contactos = [];
        $('.contacto-input').each(function() {
            const valor = $(this).val().trim();
            if (valor !== '') {
                contactos.push(valor);
            }
        });
        return contactos;
    }

    /**
     * Carga múltiples contactos en el formulario para edición (VERSIÓN ACTUALIZADA)
     * @param {Array} contactos - Lista de objetos contacto
     * @param {Object} callbacks - Objeto con funciones callback para validaciones
     */
    static cargarContactosFormulario(contactos, callbacks = null) {
        const contenedor = $('#contactosContainer');
        contenedor.empty();
        
        if (contactos && contactos.length > 0) {
            contactos.forEach((contacto, index) => {
                const campoHtml = `
                    <div class="input-group mb-2 contacto-item" data-index="${index}" data-idcontacto="${contacto.idContacto}">
                        <input type="text" class="form-control contacto-input" 
                               value="${contacto.contacto}" placeholder="Ej: +240 222 123 456 o facultad@email.com">
                        <button class="btn btn-outline-danger btn-sm eliminar-contacto" type="button" title="Eliminar contacto">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                contenedor.append(campoHtml);
            });
        } else {
            // Si no hay contactos, añadir un campo vacío
            this.agregarCampoContacto(callbacks);
        }
        
        // Validar después de cargar
        if (callbacks) {
            this.validarTodosLosContactos(callbacks);
        }
    }

    /**
     * Limpia el contenedor de contactos y deja un campo vacío (VERSIÓN ACTUALIZADA)
     * @param {Object} callbacks - Objeto con funciones callback para validaciones
     */
    static limpiarContactosFormulario(callbacks = null) {
        $('#contactosContainer').empty();
        this.agregarCampoContacto(callbacks);
        
        // Ocultar mensaje de error
        $('#errorContactoFacultad').text('').hide();
    }

    /**
     * Actualiza el estado visual de una fila (habilitado/deshabilitado)
     * @param {HTMLElement} fila - Fila de la tabla
     * @param {boolean} habilitado - Estado de la fila
     */
    static actualizarEstadoFila(fila, habilitado) {
        const $fila = $(fila);
        const $boton = $fila.find('.btn-toggle-estado');
        const $icono = $boton.find('i');
        
        if (habilitado) {
            $fila.removeClass('text-muted bg-light');
            $fila.find('td:not(:last-child)').css('opacity', '1');
            $boton.removeClass('btn-outline-success').addClass('btn-outline-danger');
            $boton.attr('title', 'Deshabilitar');
            $icono.removeClass('fa-toggle-off').addClass('fa-toggle-on');
        } else {
            $fila.addClass('text-muted bg-light');
            $fila.find('td:not(:last-child)').css('opacity', '0.6');
            $boton.removeClass('btn-outline-danger').addClass('btn-outline-success');
            $boton.attr('title', 'Habilitar');
            $icono.removeClass('fa-toggle-on').addClass('fa-toggle-off');
        }
    }

    /**
     * Genera los botones de acción para la tabla (VERSIÓN ACTUALIZADA con toggle)
     * @param {number|string} idFacultad - ID de la facultad
     * @param {boolean} habilitado - Estado actual de la facultad
     * @returns {string} HTML de los botones
     */
    static generarBotonesAccion(idFacultad, habilitado = true) {
        const claseBoton = habilitado ? 'btn-outline-danger' : 'btn-outline-success';
        const icono = habilitado ? 'fa-toggle-on' : 'fa-toggle-off';
        const titulo = habilitado ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar"
                        title="Editar" 
                        data-id="${idFacultad}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseBoton} btn-toggle-estado" 
                        data-id="${idFacultad}" 
                        title="${titulo}">
                    <i class="fas ${icono}"></i>
                </button>
            </div>
        `;
    }
}
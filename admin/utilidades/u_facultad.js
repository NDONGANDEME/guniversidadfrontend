/**
 * Este archivo maneja TODO lo relacionado con el DOM y la interfaz de usuario
 */

import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_facultad
{
    // ============================================
    // VALIDACIONES DE CAMPOS
    // ============================================
    
    // Validar nombre de facultad
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    // Validar dirección
    static validarDireccion(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    // Validar teléfono
    static validarTelefono(valor) {
        return u_verificaciones.validarTelefono(valor);
    }
    
    // Validar correo
    static validarCorreo(valor) {
        return u_verificaciones.validarCorreo(valor);
    }
    
    // Determinar tipo de contacto
    static determinarTipoContacto(valor) {
        if (this.validarCorreo(valor)) return 'Correo';
        if (this.validarTelefono(valor)) return 'Teléfono';
        return 'Desconocido';
    }
    
    // ============================================
    // CONFIGURACIÓN DE VALIDACIONES
    // ============================================
    
    /**
     * Configura las validaciones de los campos del formulario
     * @param {Object} callbacks - Objeto con las funciones callback para actualizar estados
     */
    static configurarValidaciones(callbacks) {
        // Validar nombre
        $('#nombreFacultad').on('input', () => {
            const valor = $('#nombreFacultad').val().trim();
            const valido = this.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreFacultad', '#errorNombreFacultad', 'El nombre debe tener entre 3 y 50 caracteres');
            if (callbacks.onNombreValidado) callbacks.onNombreValidado(valido);
        });

        // Validar dirección
        $('#direccionFacultad').on('input', () => {
            const valor = $('#direccionFacultad').val().trim();
            const valido = this.validarDireccion(valor);
            u_utiles.colorearCampo(valido, '#direccionFacultad', '#errorDireccionFacultad', 'La dirección debe tener entre 5 y 100 caracteres');
            if (callbacks.onDireccionValidada) callbacks.onDireccionValidada(valido);
        });

        // Validar correo
        $('#correoFacultad').on('input', () => {
            const valor = $('#correoFacultad').val().trim();
            const valido = this.validarCorreo(valor);
            u_utiles.colorearCampo(valido, '#correoFacultad', '#errorCorreoFacultad', 'Ingrese un correo válido');
            if (callbacks.onCorreoValidado) callbacks.onCorreoValidado(valido);
        });

        // Validar teléfono
        $('#telefonoFacultad').on('input', () => {
            const valor = $('#telefonoFacultad').val().trim();
            const valido = this.validarTelefono(valor);
            u_utiles.colorearCampo(valido, '#telefonoFacultad', '#errorTelefonoFacultad', 'Formato: +240 222 123 456');
            if (callbacks.onTelefonoValidado) callbacks.onTelefonoValidado(valido);
        });
    }
    
    // ============================================
    // MANEJO DE FORMULARIO
    // ============================================
    
    // Limpiar formulario
    static limpiarFormulario() {
        $('#formFacultad')[0].reset();
        
        // Limpiar clases de validación
        $('#formFacultad input, #formFacultad select').removeClass('border-success border-danger');
        
        // Limpiar mensajes de error
        $('.errorMensaje').text('').hide();
    }
    
    // Obtener datos del formulario
    static obtenerDatosFormulario() {
        return {
            nombre: $('#nombreFacultad').val().trim(),
            direccion: $('#direccionFacultad').val().trim(),
            correo: $('#correoFacultad').val().trim(),
            telefono: $('#telefonoFacultad').val().trim()
        };
    }
    
    // Cargar datos en el formulario para edición
    static cargarFormularioEdicion(facultad) {
        $('#nombreFacultad').val(facultad.nombreFacultad || '');
        $('#direccionFacultad').val(facultad.direccionFacultad || '');
        $('#correoFacultad').val(facultad.correo || '');
        $('#telefonoFacultad').val(facultad.telefono || '');
        
        // Forzar validaciones
        $('#nombreFacultad').trigger('input');
        $('#direccionFacultad').trigger('input');
        $('#correoFacultad').trigger('input');
        $('#telefonoFacultad').trigger('input');
    }
    
    // Configurar modo edición
    static configurarModoEdicion(modoEdicion) {
        if (modoEdicion) {
            $('.btnGuardarFacultad').text('Actualizar Facultad');
            if ($('#btnCancelarEdicion').length === 0) {
                $('.btnGuardarFacultad').after(`
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicion">
                        <i class="fas fa-times me-1"></i> Cancelar
                    </button>
                `);
            }
        } else {
            $('.btnGuardarFacultad').text('Guardar Facultad');
            $('#btnCancelarEdicion').remove();
        }
    }
    
    // ============================================
    // UTILIDADES PARA LA TABLA
    // ============================================
    
    // Generar botones de acción para la tabla
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
    
    // Actualizar estado visual de una fila
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
    
    // Actualizar tabla
    static actualizarTabla(dataTable, facultades, generadorBotones) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (facultades.length === 0) {
            dataTable.draw();
            return;
        }
        
        facultades.forEach(facultad => {
            // Formatear contacto combinado
            let contactoStr = '';
            if (facultad.correo && facultad.telefono) {
                contactoStr = `${facultad.correo} / ${facultad.telefono}`;
            } else if (facultad.correo) {
                contactoStr = facultad.correo;
            } else if (facultad.telefono) {
                contactoStr = facultad.telefono;
            } else {
                contactoStr = '<span class="text-muted">Sin contacto</span>';
            }
            
            const estado = facultad.habilitado !== 0; // Asumiendo que existe campo habilitado
            
            dataTable.row.add([
                facultad.nombreFacultad || 'Sin nombre',
                facultad.direccionFacultad || 'Sin dirección',
                contactoStr,
                generadorBotones(facultad.idFacultad, estado)
            ]);
        });
        
        dataTable.draw();
    }
}
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_asignatura
{
    /**
     * Inicializa la tabla con DataTable
     * @param {string} idTabla - ID de la tabla
     * @returns {Object} Instancia de DataTable
     */
    static inicializarDataTable(idTabla) {
        if ($.fn.dataTable.isDataTable(idTabla)) {
            return $(idTabla).DataTable();
        } else {
            return $(idTabla).DataTable({
                language: {
                    url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
                }
            });
        }
    }

    /**
     * Actualiza la tabla con los datos proporcionados
     * @param {Object} dataTable - Instancia de DataTable
     * @param {Array} asignaturas - Lista de asignaturas
     * @param {Function} generadorBotones - Función que genera los botones de acción
     */
    static actualizarTabla(dataTable, asignaturas, generadorBotones) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (asignaturas.length === 0) {
            dataTable.draw();
            return;
        }
        
        asignaturas.forEach(asignatura => {
            dataTable.row.add([
                asignatura.nombreAsignatura,
                generadorBotones(asignatura.idAsignatura, asignatura.habilitado)
            ]);
        });
        
        dataTable.draw();
    }

    /**
     * Genera los botones de acción para la tabla
     * @param {number|string} idAsignatura - ID de la asignatura
     * @param {boolean} habilitado - Estado actual de la asignatura
     * @returns {string} HTML de los botones
     */
    static generarBotonesAccion(idAsignatura, habilitado = true) {
        const claseBoton = habilitado ? 'btn-outline-danger' : 'btn-outline-success';
        const icono = habilitado ? 'fa-toggle-on' : 'fa-toggle-off';
        const titulo = habilitado ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar"
                        title="Editar" 
                        data-id="${idAsignatura}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseBoton} btn-toggle-estado" 
                        data-id="${idAsignatura}" 
                        title="${titulo}">
                    <i class="fas ${icono}"></i>
                </button>
            </div>
        `;
    }

    /**
     * Configura las validaciones del campo nombre
     * @param {Function} callback - Función callback para actualizar estado de validación
     */
    static configurarValidaciones(callback) {
        $('#nombreAsignatura').on('input', () => {
            const valor = $('#nombreAsignatura').val().trim();
            const valido = u_verificaciones.validarNombre(valor, 2, 100);
            u_utiles.colorearCampo(valido, '#nombreAsignatura', '#errorNombreAsignatura', 'El nombre debe tener entre 3 y 50 caracteres');
            if (callback) callback(valido);
        });
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
     * Carga los valores en el formulario para edición
     * @param {Object} asignatura - Datos de la asignatura
     */
    static cargarFormularioEdicion(asignatura) {
        $('#nombreAsignatura').val(asignatura.nombreAsignatura);
        $('#nombreAsignatura').trigger('input');
    }

    /**
     * Limpia el formulario
     */
    static limpiarFormulario() {
        $('#nombreAsignatura').val('');
        $('#nombreAsignatura').removeClass('border-success border-danger');
        $('#errorNombreAsignatura').text('').hide();
    }

    /**
     * Configura el modo edición en el formulario
     * @param {boolean} modoEdicion - Si está en modo edición
     * @param {number|string} idAsignatura - ID de la asignatura en edición
     */
    static configurarModoEdicion(modoEdicion, idAsignatura = null) {
        if (modoEdicion) {
            $('.btnGuardarAsignatura').html('<span class="icon text-white-50"> <i class="fas fa-pen"></i> </span> <span class="text"> Actualizar </span>');
            if ($('#btnCancelarEdicion').length === 0) {
                $('.btnGuardarAsignatura').after(`
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicion">
                        Cancelar
                    </button>
                `);
            }
            // Guardar ID en el botón
            $('.btnGuardarAsignatura').data('id', idAsignatura);
        } else {
            $('.btnGuardarAsignatura').html('<span class="icon text-white-50"> <i class="fas fa-save"></i> </span> <span class="text"> Guardar </span>');
            $('.btnGuardarAsignatura').removeData('id');
            $('#btnCancelarEdicion').remove();
        }
    }

    /**
     * Muestra mensaje de error en la tabla
     */
    static mostrarMensajeError() {
        if ($('#tablaAsignaturas tbody').length) {
            $('#tablaAsignaturas tbody').html(`
                <tr>
                    <td colspan="2" class="text-center py-4">
                        <div class="alert alert-danger mb-0">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Error al cargar las asignaturas. Intente nuevamente.
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
        if ($('#tablaAsignaturas tbody').length) {
            $('#tablaAsignaturas tbody').html(`
                <tr>
                    <td colspan="2" class="text-center py-4">
                        <div class="alert alert-info mb-0">
                            <i class="fas fa-info-circle me-2"></i>
                            No hay asignaturas disponibles en la base de datos
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
        if ($('#tablaAsignaturas tbody').length) {
            $('#tablaAsignaturas tbody').html(`
                <tr>
                    <td colspan="2" class="text-center py-4">
                        <div class="spinner-border text-warning" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted">Cargando asignaturas...</p>
                    </td>
                </tr>
            `);
        }
    }
}
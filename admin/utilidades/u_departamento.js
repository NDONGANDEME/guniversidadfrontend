/* Utilidades de Departamentos y Carreras. Maneja todo lo relacionado con el DOM */

import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_departamento 
{    
    // ========== VALIDACIONES ==========
    static validarNombre(valor) { return u_verificaciones.validarNombre(valor); }
    
    static validarFacultad(valor) { return valor && valor !== 'Ninguno' && valor !== ''; }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validar nombre del departamento
        $('#nombreDepartamento').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_departamento.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreDepartamento', '#errorNombreDepartamento', 'Mínimo 3 caracteres');
        });

        // Validar facultad seleccionada
        $('#facultadesDepartamento').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_departamento.validarFacultad(valor);
            u_utiles.colorearCampo(valido, '#facultadesDepartamento', '#errorFacultadesDepartamento', 'Seleccione una facultad');
        });

        // Validar nombre de carrera
        $('#nombreCarrera').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_departamento.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreCarrera', '#errorNombreCarrera', 'Mínimo 3 caracteres');
        });
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo, tipo) {
        if (tipo === 'departamento') {
            if (activo) {
                $('#btnGuardarDepartamento').text('Actualizar');
                if ($('#btnCancelarEdicionDepartamento').length === 0) {
                    $('#btnGuardarDepartamento').after(`
                        <button type="button" class="mt-1 btn btn-secondary ms-2" id="btnCancelarEdicionDepartamento">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    `);
                }
            } else {
                $('#btnGuardarDepartamento').text('Guardar');
                $('#btnCancelarEdicionDepartamento').remove();
            }
        } else if (tipo === 'carrera') {
            if (activo) {
                $('#btnGuardarCarrera').text('Actualizar');
                if ($('#btnCancelarEdicionCarrera').length === 0) {
                    $('#btnGuardarCarrera').after(`
                        <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicionCarrera">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    `);
                }
            } else {
                $('#btnGuardarCarrera').text('Guardar');
                $('#btnCancelarEdicionCarrera').remove();
            }
        }
    }

    // ========== SELECT DE FACULTADES ==========
    static cargarSelectFacultades(selector, facultades) {
        const $select = $(selector);
        $select.empty();
        $select.append('<option value="Ninguno">Seleccione la facultad ...</option>');
        
        facultades.forEach(f => {
            $select.append(`<option value="${f.idFacultad}">${f.nombreFacultad || f.nombre}</option>`);
        });
    }

    // ========== COMBO DE DEPARTAMENTOS PARA CARRERAS ==========
    
    /**
     * Configura el combo input para seleccionar departamentos
     */
    static configurarComboDepartamentos(departamentos, onSeleccionar) {
        const $input = $('#comboDepartamentoCarrera');
        const $opciones = $('#opcionesDepartamentosCarrera');
        
        // Guardar departamentos en un data attribute para acceder desde cualquier método
        $input.data('departamentos', departamentos);
        
        // Limpiar eventos anteriores para evitar duplicados
        $input.off('focus click input');
        $opciones.off('click');
        
        // Al hacer focus en el input, mostrar opciones
        $input.on('focus click', function(e) {
            e.stopPropagation();
            const busqueda = $(this).val().toLowerCase();
            u_departamento.mostrarOpcionesDepartamentos(busqueda, departamentos, $opciones, onSeleccionar);
        });
        
        // Filtrar mientras escribe
        $input.on('input', function() {
            const busqueda = $(this).val().toLowerCase();
            u_departamento.mostrarOpcionesDepartamentos(busqueda, departamentos, $opciones, onSeleccionar);
        });
        
        // Prevenir que el click en las opciones cierre el dropdown
        $opciones.on('click', function(e) {
            e.stopPropagation();
        });
        
        // Ocultar al hacer click fuera
        $(document).off('click', u_departamento.ocultarOpciones);
        $(document).on('click', u_departamento.ocultarOpciones);
    }

    static ocultarOpciones(e) {
        if (!$(e.target).closest('.combo-input-wrapper').length) {
            $('#opcionesDepartamentosCarrera').hide();
        }
    }

    /**
     * Muestra las opciones filtradas del dropdown con mensajes de "no encontrado"
     */
    static mostrarOpcionesDepartamentos(busqueda, departamentos, $opciones, onSeleccionar) {
        // Si no hay departamentos
        if (!departamentos || departamentos.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No hay departamentos disponibles</div>').show();
            return;
        }
        
        // Filtrar departamentos por la búsqueda
        let filtrados = [];
        if (!busqueda || busqueda === '') {
            filtrados = departamentos;
        } else {
            filtrados = departamentos.filter(d => 
                d.nombreDepartamento && d.nombreDepartamento.toLowerCase().includes(busqueda)
            );
        }
        
        // Si no hay resultados
        if (filtrados.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No se encontraron resultados</div>').show();
            return;
        }
        
        // Generar HTML de las opciones encontradas
        let html = '';
        filtrados.forEach(d => {
            html += `<div class="dropdown-option" data-id="${d.idDepartamento}">${d.nombreDepartamento}</div>`;
        });
        
        $opciones.html(html).show();
        
        // Asignar eventos a las opciones
        u_departamento.asignarEventosOpciones($opciones, onSeleccionar);
    }

    /**
     * Asigna eventos click a las opciones del dropdown
     */
    static asignarEventosOpciones($opciones, onSeleccionar) {
        $opciones.find('.dropdown-option').off('click').on('click', function() {
            // Solo procesar si no es un mensaje de "no results"
            if (!$(this).hasClass('no-results')) {
                const id = $(this).data('id');
                const nombre = $(this).text();
                
                // Actualizar input y guardar ID seleccionado
                $('#comboDepartamentoCarrera').val(nombre).data('id-seleccionado', id);
                
                // Marcar como válido
                $('#comboDepartamentoCarrera').removeClass('border-danger').addClass('border-success');
                
                // Ocultar opciones
                $opciones.hide();
                
                // Llamar callback si existe
                if (onSeleccionar) onSeleccionar(id);
            }
        });
    }

    /**
     * Limpia el combo de departamentos
     */
    static limpiarComboDepartamentos() {
        $('#comboDepartamentoCarrera').val('').removeData('id-seleccionado');
        $('#comboDepartamentoCarrera').removeClass('border-success border-danger');
        $('#opcionesDepartamentosCarrera').empty().hide();
    }

    // ========== TABLA DE DEPARTAMENTOS ==========
    static generarBotonesDepartamento(id) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-departamento" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    static actualizarTablaDepartamentos(dataTable, departamentos, facultades) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        departamentos.forEach(d => {
            const nombreFacultad = u_departamento.obtenerNombreFacultad(facultades, d.idFacultad);
            
            const fila = [
                d.nombreDepartamento || 'Sin nombre',
                nombreFacultad,
                this.generarBotonesDepartamento(d.idDepartamento)
            ];
            
            dataTable.row.add(fila).draw();
        });
        
        dataTable.draw();
    }

    static obtenerNombreFacultad(facultades, idFacultad) {
        if (!idFacultad || idFacultad === 'Ninguno') return '<span class="text-muted">Ninguna</span>';
        const f = facultades.find(f => f.idFacultad == idFacultad);
        return f ? (f.nombreFacultad || f.nombre) : '<span class="text-muted">Desconocida</span>';
    }

    // ========== TABLA DE CARRERAS ==========
    static generarBotonesCarrera(id, estado) {
        const iconoToggle = estado == 1 ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = estado == 1 ? 'btn-outline-danger' : 'btn-outline-success';
        const textoToggle = estado == 1 ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-carrera" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    static actualizarTablaCarreras(dataTable, carreras) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        carreras.forEach(c => {
            const nombreDepto = c.nombreDepartamento || 'Sin departamento';
            const estadoTexto = c.estado == 'Habilitado' ? 'Habilitado' : 'Deshabilitado';
            
            const fila = [
                c.nombreCarrera || 'Sin nombre',
                nombreDepto,
                estadoTexto,
                this.generarBotonesCarrera(c.idCarrera, c.estado)
            ];
            
            const nodoFila = dataTable.row.add(fila).draw().node();
            
            if (c.estado == 0) {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }
        });
        
        dataTable.draw();
    }
}
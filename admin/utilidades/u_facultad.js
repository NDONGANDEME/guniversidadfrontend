import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_facultad {
    
    // ========== VALIDACIONES ==========
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarDireccion(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    static validarTelefono(valor) {
        return u_verificaciones.validarTelefono(valor);
    }
    
    static validarCorreo(valor) {
        return u_verificaciones.validarCorreo(valor);
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validaciones de facultades
        $('#nombreFacultad').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_facultad.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreFacultad', '#errorNombreFacultad', 'Mínimo 3 caracteres');
        });

        $('#direccionFacultad').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_facultad.validarDireccion(valor);
            u_utiles.colorearCampo(valido, '#direccionFacultad', '#errorDireccionFacultad', 'Mínimo 5 caracteres');
        });

        $('#correoFacultad').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_facultad.validarCorreo(valor);
            u_utiles.colorearCampo(valido, '#correoFacultad', '#errorCorreoFacultad', 'Correo inválido');
        });

        $('#telefonoFacultad').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_facultad.validarTelefono(valor);
            u_utiles.colorearCampo(valido, '#telefonoFacultad', '#errorTelefonoFacultad', 'Formato: +240 222 123 456');
        });

        // Validaciones de aulas
        $('#nombreAula').on('input', function() {
            const valor = $(this).val().trim();
            const valido = valor.length >= 2;
            u_utiles.colorearCampo(valido, '#nombreAula', '#errorNombreAula', 'Mínimo 2 caracteres');
        });

        $('#capacidadAula').on('input', function() {
            const valor = $(this).val();
            const valido = valor > 0;
            u_utiles.colorearCampo(valido, '#capacidadAula', '#errorCapacidadAula', 'Debe ser mayor a 0');
        });

        $('#facultadesAula').on('change', function() {
            const valor = $(this).val();
            const valido = valor && valor !== '';
            u_utiles.colorearCampo(valido, '#facultadesAula', '#errorFacultadesAula', 'Seleccione una facultad');
        });
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo, tipo) {
        if (tipo === 'facultad') {
            if (activo) {
                $('#btnGuardarFacultad').text('Actualizar');
                if ($('#btnCancelarEdicionFacultad').length === 0) {
                    $('#btnGuardarFacultad').after(`
                        <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicionFacultad">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    `);
                }
            } else {
                $('#btnGuardarFacultad').text('Guardar');
                $('#btnCancelarEdicionFacultad').remove();
            }
        } else if (tipo === 'aula') {
            if (activo) {
                $('#btnGuardarAula').text('Actualizar');
                if ($('#btnCancelarEdicionAula').length === 0) {
                    $('#btnGuardarAula').after(`
                        <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicionAula">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                    `);
                }
            } else {
                $('#btnGuardarAula').text('Guardar');
                $('#btnCancelarEdicionAula').remove();
            }
        }
    }

    // ========== TABLA DE FACULTADES ==========
    static generarBotonesFacultad(id, habilitado) {
        const iconoToggle = habilitado == 1 ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = habilitado == 1 ? 'btn-outline-danger' : 'btn-outline-success';
        const textoToggle = habilitado == 1 ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-facultad" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseToggle} toggle-estado-facultad" title="${textoToggle}" data-id="${id}">
                    <i class="fas ${iconoToggle}"></i>
                </button>
            </div>
        `;
    }

    static actualizarTablaFacultades(dataTable, facultades) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        facultades.forEach(f => {
            let contacto = '';
            if (f.correo && f.telefono) contacto = `${f.correo} / ${f.telefono}`;
            else if (f.correo) contacto = f.correo;
            else if (f.telefono) contacto = f.telefono;
            else contacto = '<span class="text-muted">Sin contacto</span>';
            
            const fila = [
                f.nombreFacultad || 'Sin nombre',
                f.direccionFacultad || 'Sin dirección',
                contacto,
                this.generarBotonesFacultad(f.idFacultad, f.habilitado)
            ];
            
            const nodoFila = dataTable.row.add(fila).draw().node();
            
            if (f.habilitado == 0) {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }
        });
        
        dataTable.draw();
    }

    // ========== TABLA DE AULAS ==========
    static generarBotonesAula(id, estado) {
        const iconoToggle = estado == 1 ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = estado == 1 ? 'btn-outline-dark' : 'btn-outline-success';
        const textoToggle = estado == 1 ? 'Deshabilitar' : 'Habilitar';
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-aula" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm ${claseToggle} toggle-estado-aula" title="${textoToggle}" data-id="${id}">
                    <i class="fas ${iconoToggle}"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger eliminar-aula" title="Eliminar" data-id="${id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    static actualizarTablaAulas(dataTable, aulas, facultades) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        aulas.forEach(a => {
            // Buscar nombre de la facultad
            const facultad = facultades.find(f => f.idFacultad == a.idFacultad);
            const nombreFacultad = facultad ? facultad.nombreFacultad : '<span class="text-muted">Sin facultad</span>';
            
            const fila = [
                a.nombreAula || 'Sin nombre',
                a.capacidad || '0',
                nombreFacultad,
                a.estado == 1 ? 'Habilitado' : 'Deshabilitado',
                this.generarBotonesAula(a.idAula, a.estado)
            ];
            
            const nodoFila = dataTable.row.add(fila).draw().node();
            
            if (a.estado == 0) {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }
        });
        
        dataTable.draw();
    }
}
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_asignatura {
    
    // ========== VALIDACIONES ==========
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarDescripcion(valor) {
        return valor.length >= 10; // Mínimo 10 caracteres para la descripción
    }
    
    static validarFacultad(valor) {
        return valor && valor !== 'Ninguno';
    }

    // ========== GENERAR CÓDIGO DE ASIGNATURA ==========
    static generarCodigoAsignatura(nombreFacultad, nombreAsignatura, numero) {
        // Obtener las iniciales de la facultad (máx 2 letras)
        let siglasFacultad = '';
        const palabrasFacultad = nombreFacultad.split(' ');
        
        if (palabrasFacultad.length === 1) {
            // Si es una sola palabra, tomar las 2 primeras letras
            siglasFacultad = nombreFacultad.substring(0, 2).toUpperCase();
        } else {
            // Si son varias palabras, tomar primera letra de cada una (máx 2)
            for (let i = 0; i < Math.min(palabrasFacultad.length, 2); i++) {
                siglasFacultad += palabrasFacultad[i].charAt(0).toUpperCase();
            }
        }
        
        // Obtener las iniciales de la asignatura (máx 3 letras)
        let siglasAsignatura = '';
        const palabrasAsignatura = nombreAsignatura.split(' ');
        
        if (palabrasAsignatura.length === 1) {
            // Si es una sola palabra, tomar las 3 primeras letras
            siglasAsignatura = nombreAsignatura.substring(0, 3).toUpperCase();
        } else {
            // Si son varias palabras, tomar primera letra de cada una (máx 3)
            for (let i = 0; i < Math.min(palabrasAsignatura.length, 3); i++) {
                siglasAsignatura += palabrasAsignatura[i].charAt(0).toUpperCase();
            }
        }
        
        // Formatear número con 3 dígitos (001, 002, etc.)
        const numeroFormateado = numero.toString().padStart(3, '0');
        
        return `${siglasFacultad}-${numeroFormateado}-${siglasAsignatura}`;
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validación del nombre de la asignatura
        $('#nombreAsignatura').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_asignatura.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreAsignatura', '#errorNombreAsignatura', 'Mínimo 3 caracteres');
        });

        // Validación de la descripción
        $('#descripcionAsignatura').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_asignatura.validarDescripcion(valor);
            u_utiles.colorearCampo(valido, '#descripcionAsignatura', '#errorDescripcionAsignatura', 'Mínimo 10 caracteres');
        });

        // Validación de la facultad
        $('#facultadesDepartamento').on('change', function() {
            const valor = $(this).val();
            const valido = u_asignatura.validarFacultad(valor);
            u_utiles.colorearCampo(valido, '#facultadesDepartamento', '#errorFacultadesDepartamento', 'Seleccione una facultad');
        });
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#btnGuardarAsignatura').text('Actualizar');
            if ($('#btnCancelarEdicionAsignatura').length === 0) {
                $('#btnGuardarAsignatura').after(`
                    <button type="button" class="btn btn-secondary ms-2" id="btnCancelarEdicionAsignatura">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                `);
            }
        } else {
            $('#btnGuardarAsignatura').text('Guardar');
            $('#btnCancelarEdicionAsignatura').remove();
        }
    }

    // ========== GENERAR BOTONES PARA ASIGNATURA ==========
    static generarBotonesAsignatura(id) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-asignatura" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    // ========== ACTUALIZAR TABLA DE ASIGNATURAS ==========
    static actualizarTablaAsignaturas(dataTable, asignaturas, facultades) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        asignaturas.forEach(a => {
            // Buscar el nombre de la facultad
            const facultad = facultades.find(f => f.idFacultad == a.idFacultad);
            const nombreFacultad = facultad ? facultad.nombreFacultad : 'Desconocida';
            
            const fila = [
                a.codigoAsignatura || 'Sin código',
                a.nombreAsignatura || 'Sin nombre',
                a.descripcion || 'Sin descripción',
                nombreFacultad,
                this.generarBotonesAsignatura(a.idAsignatura)
            ];
            
            dataTable.row.add(fila).draw();
        });
        
        dataTable.draw();
    }

    // ========== CARGAR FACULTADES EN EL SELECT ==========
    static cargarFacultadesEnSelect(facultades) {
        const select = $('#facultadesDepartamento');
        select.empty();
        select.append('<option value="Ninguno">Seleccione la facultad ...</option>');
        
        facultades.forEach(f => {
            select.append(`<option value="${f.idFacultad}">${f.nombreFacultad}</option>`);
        });
    }

    // ========== LIMPIAR FORMULARIO ==========
    static limpiarFormulario() {
        $('#formAsignatura')[0].reset();
        $('#facultadesDepartamento').val('Ninguno');
        $('.errorMensaje').text('').hide();
        $('#formAsignatura input, #formAsignatura textarea, #formAsignatura select').removeClass('border-success border-danger');
    }

    // ========== ENCONTRAR SIGUIENTE NÚMERO PARA CÓDIGO ==========
    static encontrarSiguienteNumero(asignaturas, idFacultad) {
        // Filtrar asignaturas de la misma facultad
        const asignaturasFacultad = asignaturas.filter(a => a.idFacultad == idFacultad);
        
        if (asignaturasFacultad.length === 0) {
            return 1; // Primera asignatura de esta facultad
        }
        
        // Extraer los números de los códigos existentes
        const numeros = [];
        asignaturasFacultad.forEach(a => {
            if (a.codigoAsignatura) {
                // El formato es: FAC-001-ASIG
                const partes = a.codigoAsignatura.split('-');
                if (partes.length >= 2) {
                    const numero = parseInt(partes[1], 10);
                    if (!isNaN(numero)) {
                        numeros.push(numero);
                    }
                }
            }
        });
        
        if (numeros.length === 0) {
            return 1;
        }
        
        // Encontrar el número máximo y sumar 1
        return Math.max(...numeros) + 1;
    }
}
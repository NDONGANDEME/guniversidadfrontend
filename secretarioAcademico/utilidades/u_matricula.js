/**
 * Utilidades de Matrículas - Versión simplificada
 * Maneja todo lo relacionado con el DOM
 */

import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class u_matricula {
    
    // ========== VALIDACIONES ==========
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarApellidos(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarDip(valor) {
        return /^\d{3}\s?\d{3}\s?\d{3}$/.test(valor);
    }
    
    static validarEmail(valor) {
        return u_verificaciones.validarCorreo(valor);
    }
    
    static validarTelefono(valor) {
        return u_verificaciones.validarTelefono(valor);
    }
    
    static validarCursoAcademico(valor) {
        return /^\d{4}\/\d{4}$/.test(valor);
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validaciones de estudiante
        $('#nombreEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarNombre($(this).val().trim());
            u_utiles.colorearCampo(valido, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula', 'Mínimo 3 caracteres');
        });
        
        $('#apellidosEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarApellidos($(this).val().trim());
            u_utiles.colorearCampo(valido, '#apellidosEstudianteMatricula', '#errorApellidosEstudianteMatricula', 'Mínimo 3 caracteres');
        });
        
        $('#dipEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarDip($(this).val().trim());
            u_utiles.colorearCampo(valido, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula', 'Formato: 000 000 000');
        });
        
        $('#correoEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarEmail($(this).val().trim());
            u_utiles.colorearCampo(valido, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula', 'Correo inválido');
        });
        
        $('#telefonoEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarTelefono($(this).val().trim());
            u_utiles.colorearCampo(valido, '#telefonoEstudianteMatricula', '#errorTelefonoEstudianteMatricula', 'Formato: +240 222 123 456');
        });
        
        // Validaciones de familiar
        $('#nombreEstudianteFamiliar').on('input', function() {
            const valido = u_matricula.validarNombre($(this).val().trim());
            u_utiles.colorearCampo(valido, '#nombreEstudianteFamiliar', '#errorNombreEstudianteFamiliar', 'Mínimo 3 caracteres');
        });
        
        // Validaciones de matrícula
        $('#cursoAcademicoMatricula').on('input', function() {
            const valido = u_matricula.validarCursoAcademico($(this).val().trim());
            u_utiles.colorearCampo(valido, '#cursoAcademicoMatricula', '#errorCursoAcademicoMatricula', 'Formato: 2025/2026');
        });
    }

    // ========== FUNCIONES DEL MODAL ==========
    static abrirModalNuevo() {
        $('#modalNuevaMatricula').modal('show');
    }

    static cambiarSeccion(seccion, direccion = null) {
        $('.seccion').removeClass('active anim-in anim-out izquierda derecha');
        
        if (direccion === 'siguiente') {
            $(`#seccion${seccion-1}`).addClass('anim-out');
            setTimeout(() => {
                $(`#seccion${seccion}`).addClass('active anim-in');
            }, 300);
        } else if (direccion === 'anterior') {
            $(`#seccion${seccion+1}`).addClass('anim-out izquierda');
            setTimeout(() => {
                $(`#seccion${seccion}`).addClass('active anim-in');
            }, 300);
        } else {
            $(`#seccion${seccion}`).addClass('active');
        }
    }

    static actualizarBotonesNavegacion(seccionActual, totalSecciones, modoEdicion) {
        if (seccionActual === 1) {
            $('#anterior').hide();
            $('#siguiente').show();
            $('#btnGuardarMatricula').hide();
        } else if (seccionActual === totalSecciones) {
            $('#anterior').show();
            $('#siguiente').hide();
            $('#btnGuardarMatricula').show().text(modoEdicion ? 'Actualizar Matrícula' : 'Guardar Matrícula');
        } else {
            $('#anterior').show();
            $('#siguiente').show();
            $('#btnGuardarMatricula').hide();
        }
    }

    static mostrarBusquedaEstudiante(mostrar) {
        if (mostrar) {
            $('#ContBusquedaMatricula').removeClass('d-none');
        } else {
            $('#ContBusquedaMatricula').addClass('d-none');
        }
    }

    static mostrarSeccionBecas(mostrar) {
        if (mostrar) {
            $('.datos-becario').show();
        } else {
            $('.datos-becario').hide();
        }
    }

    // ========== COMBOS ==========
    static cargarComboCarreras(carreras) {
        const $input = $('#comboCarrerasMatricula');
        $input.data('carreras', carreras);
    }

    static configurarComboCarreras(carreras, onSeleccionar) {
        const $input = $('#comboCarrerasMatricula');
        const $opciones = $('#opcionesCarrerasMatricula');
        
        $input.on('focus click', function(e) {
            e.stopPropagation();
            u_matricula.mostrarOpcionesCarreras($(this).val(), carreras, $opciones, onSeleccionar);
        });
        
        $input.on('input', function() {
            u_matricula.mostrarOpcionesCarreras($(this).val(), carreras, $opciones, onSeleccionar);
        });
        
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.combo-input-wrapper').length) {
                $opciones.hide();
            }
        });
    }

    static mostrarOpcionesCarreras(busqueda, carreras, $opciones, onSeleccionar) {
        if (!carreras || carreras.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No hay carreras disponibles</div>').show();
            return;
        }
        
        const busquedaLower = busqueda.toLowerCase();
        const filtradas = carreras.filter(c => 
            c.nombreCarrera.toLowerCase().includes(busquedaLower)
        );
        
        if (filtradas.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No se encontraron resultados</div>').show();
            return;
        }
        
        let html = '';
        filtradas.forEach(c => {
            html += `<div class="dropdown-option" data-id="${c.idCarrera}">${c.nombreCarrera}</div>`;
        });
        
        $opciones.html(html).show();
        
        $opciones.find('.dropdown-option').off('click').on('click', function() {
            const id = $(this).data('id');
            const nombre = $(this).text();
            $('#comboCarrerasMatricula').val(nombre).data('id-seleccionado', id);
            $opciones.hide();
            if (onSeleccionar) onSeleccionar(id);
        });
    }

    static actualizarComboEstudiantes(estudiantes) {
        const $input = $('#comboEstudiantesMatricula');
        $input.data('estudiantes', estudiantes);
        $input.val('');
    }

    static cargarComboEstudiantes(estudiantes) {
        const $input = $('#comboEstudiantesMatricula');
        $input.data('estudiantes', estudiantes);
    }

    static configurarComboEstudiantes(estudiantes, onSeleccionar) {
        const $input = $('#comboEstudiantesMatricula');
        const $opciones = $('#opcionesEstudiantesMatricula');
        
        $input.on('focus click', function(e) {
            e.stopPropagation();
            const estudiantesData = $(this).data('estudiantes') || [];
            u_matricula.mostrarOpcionesEstudiantes($(this).val(), estudiantesData, $opciones, onSeleccionar);
        });
        
        $input.on('input', function() {
            const estudiantesData = $(this).data('estudiantes') || [];
            u_matricula.mostrarOpcionesEstudiantes($(this).val(), estudiantesData, $opciones, onSeleccionar);
        });
    }

    static mostrarOpcionesEstudiantes(busqueda, estudiantes, $opciones, onSeleccionar) {
        if (!estudiantes || estudiantes.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No hay estudiantes disponibles</div>').show();
            return;
        }
        
        const busquedaLower = busqueda.toLowerCase();
        const filtrados = estudiantes.filter(e => 
            e.nombre.toLowerCase().includes(busquedaLower) || 
            e.apellidos.toLowerCase().includes(busquedaLower) ||
            e.codigoEstudiante.toLowerCase().includes(busquedaLower)
        );
        
        if (filtrados.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No se encontraron resultados</div>').show();
            return;
        }
        
        let html = '';
        filtrados.forEach(e => {
            html += `<div class="dropdown-option" data-id="${e.idEstudiante}">${e.nombre} ${e.apellidos} (${e.codigoEstudiante})</div>`;
        });
        
        $opciones.html(html).show();
        
        $opciones.find('.dropdown-option').off('click').on('click', function() {
            const id = $(this).data('id');
            const nombre = $(this).text();
            $('#comboEstudiantesMatricula').val(nombre).data('id-seleccionado', id);
            $opciones.hide();
            if (onSeleccionar) onSeleccionar(id);
        });
    }

    static cargarComboPlanesEstudio(planes) {
        const $input = $('#comboPlanEstudioMatricula');
        $input.data('planes', planes);
    }

    static configurarComboPlanesEstudio(planes, onSeleccionar) {
        const $input = $('#comboPlanEstudioMatricula');
        const $opciones = $('#opcionesPlanEstudioMatricula');
        
        $input.on('focus click', function(e) {
            e.stopPropagation();
            u_matricula.mostrarOpcionesPlanesEstudio($(this).val(), planes, $opciones, onSeleccionar);
        });
        
        $input.on('input', function() {
            u_matricula.mostrarOpcionesPlanesEstudio($(this).val(), planes, $opciones, onSeleccionar);
        });
    }

    static mostrarOpcionesPlanesEstudio(busqueda, planes, $opciones, onSeleccionar) {
        if (!planes || planes.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No hay planes de estudio</div>').show();
            return;
        }
        
        const busquedaLower = busqueda.toLowerCase();
        const filtrados = planes.filter(p => 
            p.nombre.toLowerCase().includes(busquedaLower)
        );
        
        if (filtrados.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No se encontraron resultados</div>').show();
            return;
        }
        
        let html = '';
        filtrados.forEach(p => {
            html += `<div class="dropdown-option" data-id="${p.idPlanEstudio}">${p.nombre}</div>`;
        });
        
        $opciones.html(html).show();
        
        $opciones.find('.dropdown-option').off('click').on('click', function() {
            const id = $(this).data('id');
            const nombre = $(this).text();
            $('#comboPlanEstudioMatricula').val(nombre).data('id-seleccionado', id);
            $opciones.hide();
            if (onSeleccionar) onSeleccionar(id);
        });
    }

    static cargarSelectSemestres(selector, semestres) {
        const $select = $(selector);
        $select.empty();
        $select.append('<option value="Ninguno">Seleccione...</option>');
        
        semestres.forEach(s => {
            $select.append(`<option value="${s.idSemestre}">${s.numeroSemestre} - ${s.tipoSemestre}</option>`);
        });
    }

    // ========== COMBOS DE PAÍSES, CENTROS, UNIVERSIDADES ==========
    static configurarComboPaises() {
        const paises = [
            'Guinea Ecuatorial', 'España', 'Francia', 'Portugal', 
            'Brasil', 'Angola', 'Mozambique', 'Cabo Verde'
        ];
        
        u_matricula.configurarComboGenerico(
            '#comboPaisesEstudianteMatricula', 
            '#opcionesEstudianteMatricula', 
            paises
        );
    }

    static configurarComboCentros() {
        const centros = [
            'Colegio Nacional', 'Instituto de Bachillerato', 
            'Centro de Formación Profesional', 'Otro'
        ];
        
        u_matricula.configurarComboGenerico(
            '#comboCentroEstudianteMatricula', 
            '#opcionesCentroEstudianteMatricula', 
            centros
        );
    }

    static configurarComboUniversidades() {
        const universidades = [
            'Universidad Nacional de Guinea Ecuatorial',
            'Universidad de Alcalá', 'Universidad Complutense',
            'Universidad de Lisboa', 'Otra'
        ];
        
        u_matricula.configurarComboGenerico(
            '#comboUniversidadEstudianteMatricula', 
            '#opcionesUniversidadEstudianteMatricula', 
            universidades
        );
    }

    static configurarComboGenerico(inputSelector, opcionesSelector, opciones) {
        const $input = $(inputSelector);
        const $opciones = $(opcionesSelector);
        
        $input.on('focus click', function(e) {
            e.stopPropagation();
            u_matricula.mostrarOpcionesGenericas($(this).val(), opciones, $opciones, (valor) => {
                $input.val(valor).data('id-seleccionado', valor);
                $opciones.hide();
            });
        });
        
        $input.on('input', function() {
            u_matricula.mostrarOpcionesGenericas($(this).val(), opciones, $opciones, (valor) => {
                $input.val(valor).data('id-seleccionado', valor);
                $opciones.hide();
            });
        });
        
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.combo-input-wrapper').length) {
                $opciones.hide();
            }
        });
    }

    static mostrarOpcionesGenericas(busqueda, opciones, $opciones, onSeleccionar) {
        const busquedaLower = busqueda.toLowerCase();
        const filtradas = opciones.filter(o => 
            o.toLowerCase().includes(busquedaLower)
        );
        
        if (filtradas.length === 0) {
            $opciones.html('<div class="dropdown-option no-results">No se encontraron resultados</div>').show();
            return;
        }
        
        let html = '';
        filtradas.forEach(o => {
            html += `<div class="dropdown-option">${o}</div>`;
        });
        
        $opciones.html(html).show();
        
        $opciones.find('.dropdown-option').off('click').on('click', function() {
            onSeleccionar($(this).text());
        });
    }

    // ========== FUNCIONES PARA AÑADIR ELEMENTOS ==========
    static añadirContactoFamiliar(onAñadir) {
        // Clonar el primer familiar
        const $original = $('.datos-familiar:first');
        const $clon = $original.clone();
        
        // Limpiar valores del clon
        $clon.find('input, select').val('');
        $clon.find('.errorMensaje').text('').hide();
        $clon.find('input, select').removeClass('border-success border-danger');
        
        // Añadir botón de eliminar
        $clon.find('.row:first').prepend(`
            <div class="col-12 text-end mb-2">
                <button type="button" class="btn btn-sm btn-outline-danger eliminar-familiar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
        
        // Añadir al DOM
        $original.parent().append($clon);
        
        // Evento para eliminar
        $clon.find('.eliminar-familiar').on('click', function() {
            $clon.remove();
        });
        
        // Obtener datos del familiar
        const datos = u_matricula.obtenerDatosFamiliar($clon);
        if (onAñadir) onAñadir(datos);
    }

    static añadirBeca(becas, onAñadir) {
        // Clonar el primer becario
        const $original = $('.datos-becario:first');
        const $clon = $original.clone();
        
        // Limpiar valores del clon
        $clon.find('input, select').val('Ninguno');
        $clon.find('.errorMensaje').text('').hide();
        $clon.find('input, select').removeClass('border-success border-danger');
        
        // Añadir botón de eliminar
        $clon.find('.row:first').prepend(`
            <div class="col-12 text-end mb-2">
                <button type="button" class="btn btn-sm btn-outline-danger eliminar-beca">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `);
        
        // Añadir al DOM
        $original.parent().append($clon);
        
        // Evento para eliminar
        $clon.find('.eliminar-beca').on('click', function() {
            $clon.remove();
        });
        
        // Obtener datos de la beca
        const datos = u_matricula.obtenerDatosBeca($clon);
        if (onAñadir) onAñadir(datos);
    }

    // ========== CARGA DE DATOS EN FORMULARIO ==========
    static cargarDatosEstudiante(estudiante) {
        $('#nombreEstudianteMatricula').val(estudiante.nombre || '');
        $('#apellidosEstudianteMatricula').val(estudiante.apellidos || '');
        $('#dipEstudianteMatricula').val(estudiante.dipEstudiante || '');
        $('#fechaNacimientoEstudianteMatricula').val(estudiante.fechaNacimiento || '');
        $('#nacionalidadEstudianteMatricula').val(estudiante.nacionalidad || '');
        $('#generosEstudianteMatricula').val(estudiante.sexo || 'Ninguno');
        $('#direccionEstudianteMatricula').val(estudiante.direccion || '');
        $('#localidadEstudianteMatricula').val(estudiante.localidad || '');
        $('#provinciaEstudianteMatricula').val(estudiante.provincia || '');
        $('#comboPaisesEstudianteMatricula').val(estudiante.pais || '');
        $('#correoEstudianteMatricula').val(estudiante.correoEstudiante || '');
        $('#telefonoEstudianteMatricula').val(estudiante.telefono || '');
        $('#comboCentroEstudianteMatricula').val(estudiante.centroProcedencia || '');
        $('#comboUniversidadEstudianteMatricula').val(estudiante.universidadProcedencia || '');
        $('#esBecario').prop('checked', estudiante.esBecado === 'Sí');
    }

    static cargarDatosMatricula(matricula) {
        $('#cursoAcademicoMatricula').val(matricula.cursoAcademico || u_matricula.generarCursoAcademico());
        $('#fechaMatricula').val(matricula.fechaMatricula || '');
        $('#modalidadMatricula').val(matricula.modalidadMatricula || 'Ninguno');
        $('#creditosTotalesMatricula').val(matricula.totalCreditos || 0);
        $('#estadosMatricula').val(matricula.estado || 'Ninguno');
    }

    static cargarFamiliares(familiares) {
        // Limpiar familiares existentes excepto el primero
        $('.datos-familiar:not(:first)').remove();
        
        if (familiares.length > 0) {
            // Cargar el primer familiar
            const f = familiares[0];
            $('.datos-familiar:first').find('#nombreEstudianteFamiliar').val(f.nombre || '');
            $('.datos-familiar:first').find('#apellidosEstudianteFamiliar').val(f.apellidos || '');
            $('.datos-familiar:first').find('#dipEstudianteFamiliar').val(f.dipFamiliar || '');
            $('.datos-familiar:first').find('#direccionEstudianteFamiliar').val(f.direccion || '');
            $('.datos-familiar:first').find('#correoEstudianteFamiliar').val(f.correoFamiliar || '');
            $('.datos-familiar:first').find('#telefonoEstudianteFamiliar').val(f.telefono || '');
            $('.datos-familiar:first').find('#parentezcoEstudianteFamiliar').val(f.parentesco || '');
            $('.datos-familiar:first').find('#contactoIncidenteEstudianteFamiliar').val(f.esContactoIncidentes || 'Ninguno');
            $('.datos-familiar:first').find('#responsablePagoEstudianteFamiliar').val(f.esResponsablePago || 'Ninguno');
            
            // Cargar familiares adicionales
            for (let i = 1; i < familiares.length; i++) {
                u_matricula.añadirContactoFamiliar(() => {});
                const $nuevo = $(`.datos-familiar:eq(${i})`);
                const f = familiares[i];
                $nuevo.find('#nombreEstudianteFamiliar').val(f.nombre || '');
                $nuevo.find('#apellidosEstudianteFamiliar').val(f.apellidos || '');
                $nuevo.find('#dipEstudianteFamiliar').val(f.dipFamiliar || '');
                $nuevo.find('#direccionEstudianteFamiliar').val(f.direccion || '');
                $nuevo.find('#correoEstudianteFamiliar').val(f.correoFamiliar || '');
                $nuevo.find('#telefonoEstudianteFamiliar').val(f.telefono || '');
                $nuevo.find('#parentezcoEstudianteFamiliar').val(f.parentesco || '');
                $nuevo.find('#contactoIncidenteEstudianteFamiliar').val(f.esContactoIncidentes || 'Ninguno');
                $nuevo.find('#responsablePagoEstudianteFamiliar').val(f.esResponsablePago || 'Ninguno');
            }
        }
    }

    static cargarBecas(becas) {
        // Limpiar becas existentes excepto la primera
        $('.datos-becario:not(:first)').remove();
        
        if (becas.length > 0) {
            // Cargar la primera beca
            const b = becas[0];
            $('.datos-becario:first').find('#nombreInstitucionBeca').val(b.institucionBeca || '');
            $('.datos-becario:first').find('#tiposBeca').val(b.tipoBeca || 'Ninguno');
            $('.datos-becario:first').find('#fechaInicioBeca').val(b.fechaInicio || '');
            $('.datos-becario:first').find('#fechaFinBeca').val(b.fechaFinal || '');
            $('.datos-becario:first').find('#estadosBeca').val(b.estado || 'Ninguno');
            $('.datos-becario:first').find('#observacionesBeca').val(b.observaciones || '');
            
            // Cargar becas adicionales
            for (let i = 1; i < becas.length; i++) {
                u_matricula.añadirBeca([], () => {});
                const $nuevo = $(`.datos-becario:eq(${i})`);
                const b = becas[i];
                $nuevo.find('#nombreInstitucionBeca').val(b.institucionBeca || '');
                $nuevo.find('#tiposBeca').val(b.tipoBeca || 'Ninguno');
                $nuevo.find('#fechaInicioBeca').val(b.fechaInicio || '');
                $nuevo.find('#fechaFinBeca').val(b.fechaFinal || '');
                $nuevo.find('#estadosBeca').val(b.estado || 'Ninguno');
                $nuevo.find('#observacionesBeca').val(b.observaciones || '');
            }
        }
    }

    // ========== OBTENCIÓN DE DATOS ==========
    static obtenerDatosEstudiante() {
        return {
            nombre: $('#nombreEstudianteMatricula').val().trim(),
            apellidos: $('#apellidosEstudianteMatricula').val().trim(),
            dipEstudiante: $('#dipEstudianteMatricula').val().trim(),
            fechaNacimiento: $('#fechaNacimientoEstudianteMatricula').val(),
            sexo: $('#generosEstudianteMatricula').val(),
            nacionalidad: $('#nacionalidadEstudianteMatricula').val().trim(),
            direccion: $('#direccionEstudianteMatricula').val().trim(),
            localidad: $('#localidadEstudianteMatricula').val().trim(),
            provincia: $('#provinciaEstudianteMatricula').val().trim(),
            pais: $('#comboPaisesEstudianteMatricula').val().trim(),
            correoEstudiante: $('#correoEstudianteMatricula').val().trim(),
            telefono: $('#telefonoEstudianteMatricula').val().trim(),
            centroProcedencia: $('#comboCentroEstudianteMatricula').val().trim(),
            universidadProcedencia: $('#comboUniversidadEstudianteMatricula').val().trim(),
            esBecado: $('#esBecario').is(':checked') ? 'Sí' : 'No'
        };
    }

    static obtenerDatosFamiliar($container = null) {
        if ($container) {
            return {
                nombre: $container.find('#nombreEstudianteFamiliar').val().trim(),
                apellidos: $container.find('#apellidosEstudianteFamiliar').val().trim(),
                dipFamiliar: $container.find('#dipEstudianteFamiliar').val().trim(),
                direccion: $container.find('#direccionEstudianteFamiliar').val().trim(),
                correoFamiliar: $container.find('#correoEstudianteFamiliar').val().trim(),
                telefono: $container.find('#telefonoEstudianteFamiliar').val().trim(),
                parentesco: $container.find('#parentezcoEstudianteFamiliar').val().trim(),
                esContactoIncidentes: $container.find('#contactoIncidenteEstudianteFamiliar').val(),
                esResponsablePago: $container.find('#responsablePagoEstudianteFamiliar').val()
            };
        }
        
        const familiares = [];
        $('.datos-familiar').each(function() {
            familiares.push({
                nombre: $(this).find('#nombreEstudianteFamiliar').val().trim(),
                apellidos: $(this).find('#apellidosEstudianteFamiliar').val().trim(),
                dipFamiliar: $(this).find('#dipEstudianteFamiliar').val().trim(),
                direccion: $(this).find('#direccionEstudianteFamiliar').val().trim(),
                correoFamiliar: $(this).find('#correoEstudianteFamiliar').val().trim(),
                telefono: $(this).find('#telefonoEstudianteFamiliar').val().trim(),
                parentesco: $(this).find('#parentezcoEstudianteFamiliar').val().trim(),
                esContactoIncidentes: $(this).find('#contactoIncidenteEstudianteFamiliar').val(),
                esResponsablePago: $(this).find('#responsablePagoEstudianteFamiliar').val()
            });
        });
        return familiares;
    }

    static obtenerDatosMatricula() {
        return {
            cursoAcademico: $('#cursoAcademicoMatricula').val().trim(),
            fechaMatricula: $('#fechaMatricula').val(),
            modalidadMatricula: $('#modalidadMatricula').val(),
            idPlanEstudio: $('#comboPlanEstudioMatricula').data('id-seleccionado'),
            idSemestre: $('#semestresMatricula').val(),
            totalCreditos: parseInt($('#creditosTotalesMatricula').val()) || 0,
            estado: $('#estadosMatricula').val()
        };
    }

    static obtenerDatosBeca($container = null) {
        if ($container) {
            return {
                institucionBeca: $container.find('#nombreInstitucionBeca').val().trim(),
                tipoBeca: $container.find('#tiposBeca').val(),
                fechaInicio: $container.find('#fechaInicioBeca').val(),
                fechaFinal: $container.find('#fechaFinBeca').val(),
                estado: $container.find('#estadosBeca').val(),
                observaciones: $container.find('#observacionesBeca').val().trim()
            };
        }
        
        const becas = [];
        $('.datos-becario').each(function() {
            becas.push({
                institucionBeca: $(this).find('#nombreInstitucionBeca').val().trim(),
                tipoBeca: $(this).find('#tiposBeca').val(),
                fechaInicio: $(this).find('#fechaInicioBeca').val(),
                fechaFinal: $(this).find('#fechaFinBeca').val(),
                estado: $(this).find('#estadosBeca').val(),
                observaciones: $(this).find('#observacionesBeca').val().trim()
            });
        });
        return becas;
    }

    static obtenerDatosPago() {
        return {
            cuota: parseInt($('#cuotaEstudiante').val()) || 0,
            monto: parseInt($('#montoEstudiante').val()) || 0,
            fechaPago: $('#fechaPagoEstudiante').val()
        };
    }

    static obtenerDatosUsuario() {
        return {
            nombreUsuario: $('#nombreOCorreoUsuario').val().trim(),
            correo: $('#nombreOCorreoUsuario').val().trim(),
            contrasena: '123456', // Contraseña por defecto
            rol: 'Estudiante',
            estado: 1
        };
    }

    // ========== FUNCIONES UTILITARIAS ==========
    static generarCodigoEstudiante(nombre, carrera) {
        // Ejemplo: FI-0001-INF
        const prefijoFacultad = 'FI'; // Esto debería venir de la facultad seleccionada
        const numero = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
        const prefijoCarrera = carrera.substring(0, 3).toUpperCase();
        
        return `${prefijoFacultad}-${numero}-${prefijoCarrera}`;
    }

    static generarCursoAcademico() {
        const fecha = new Date();
        const añoActual = fecha.getFullYear();
        const añoSiguiente = añoActual + 1;
        return `${añoActual}/${añoSiguiente}`;
    }

    static async subirFoto(archivo) {
        // Simulación de subida de foto
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(URL.createObjectURL(archivo));
            }, 500);
        });
    }

    static limpiarFormulario() {
        $('#formMatricula')[0].reset();
        $('.errorMensaje').text('').hide();
        $('input, select, textarea').removeClass('border-success border-danger');
        
        // Limpiar combos
        $('#comboCarrerasMatricula').val('').removeData('id-seleccionado');
        $('#comboEstudiantesMatricula').val('').removeData('id-seleccionado');
        $('#comboPaisesEstudianteMatricula').val('');
        $('#comboCentroEstudianteMatricula').val('');
        $('#comboUniversidadEstudianteMatricula').val('');
        $('#comboPlanEstudioMatricula').val('').removeData('id-seleccionado');
        
        // Resetear selects
        $('#generosEstudianteMatricula').val('Ninguno');
        $('#modalidadMatricula').val('Ninguno');
        $('#semestresMatricula').val('Ninguno');
        $('#estadosMatricula').val('Ninguno');
        $('#tiposBeca').val('Ninguno');
        $('#estadosBeca').val('Ninguno');
        
        // Ocultar secciones
        u_matricula.mostrarSeccionBecas(false);
        
        // Establecer curso académico por defecto
        $('#cursoAcademicoMatricula').val(u_matricula.generarCursoAcademico());
        
        // Limpiar familiares y becas excepto el primero
        $('.datos-familiar:not(:first)').remove();
        $('.datos-becario:not(:first)').remove();
    }

    // ========== TABLA DE MATRÍCULAS ==========
    static generarBotonesMatricula(id) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-info verDetalles" title="Ver detalles" data-id="${id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning editar" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    static actualizarTabla(dataTable, matriculas, estudiantes) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        matriculas.forEach(m => {
            const estudiante = estudiantes.find(e => e.idEstudiante == m.idEstudiante);
            const nombreEstudiante = estudiante ? `${estudiante.nombre} ${estudiante.apellidos}` : 'Desconocido';
            
            const fila = [
                nombreEstudiante,
                m.cursoAcademico || 'Sin curso',
                m.fechaMatricula || 'Sin fecha',
                m.modalidadMatricula || 'Sin modalidad',
                m.totalCreditos || '0',
                m.estado || 'Sin estado',
                this.generarBotonesMatricula(m.idMatricula)
            ];
            
            dataTable.row.add(fila).draw();
        });
        
        dataTable.draw();
    }

    // ========== DETALLES DE MATRÍCULA ==========
    static mostrarDetalles(matricula, estudiante) {
        // Aquí se implementaría la lógica para mostrar detalles en el modal
        // Por ahora solo mostramos una alerta
        console.log('Mostrar detalles de matrícula:', matricula, estudiante);
    }
}
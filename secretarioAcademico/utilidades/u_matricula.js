import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class u_matricula {
    
    static paises = [
        'Guinea Ecuatorial', 'España', 'Francia', 'Portugal', 'Angola', 
        'Camerún', 'Gabón', 'Nigeria', 'Brasil', 'México',
        'Argentina', 'Colombia', 'Chile', 'Perú', 'Venezuela',
        'Estados Unidos', 'Canadá', 'Reino Unido', 'Alemania', 'Italia',
        'China', 'Japón', 'Corea del Sur', 'India', 'Marruecos',
        'Senegal', 'Costa de Marfil', 'Ghana', 'Sudáfrica', 'Egipto'
    ];

    static planesEstudio = [];

    static cargarPaises() {
        const $input = $('#comboPaisesEstudianteMatricula');
        const $opciones = $('#opcionesEstudianteMatricula');
        
        if (!$input.length) return;
        
        $input.off().on('focus', function() {
            u_matricula.mostrarOpcionesPaises($(this), $opciones);
        }).on('input', function() {
            const texto = $(this).val().toLowerCase();
            const filtradas = u_matricula.paises.filter(p => p.toLowerCase().includes(texto));
            u_matricula.mostrarOpcionesPaises($(this), $opciones, filtradas);
        });
        
        $(document).on('click', function(e) {
            if (!$input.is(e.target) && !$opciones.is(e.target)) {
                $opciones.hide();
            }
        });
    }

    static mostrarOpcionesPaises($input, $contenedor, opciones = null) {
        const lista = opciones || u_matricula.paises;
        
        if (lista.length === 0) {
            $contenedor.html('<div class="dropdown-item text-muted">No hay resultados</div>');
        } else {
            let html = '';
            lista.forEach(pais => {
                html += `<div class="dropdown-item" data-value="${pais}">${pais}</div>`;
            });
            $contenedor.html(html);
        }
        
        const pos = $input.position();
        const altura = $input.outerHeight();
        
        $contenedor.css({
            'position': 'absolute',
            'top': pos.top + altura + 'px',
            'left': pos.left + 'px',
            'width': $input.outerWidth() + 'px',
            'max-height': '200px',
            'overflow-y': 'auto',
            'z-index': '9999',
            'display': 'block',
            'background': 'white',
            'border': '1px solid #ccc',
            'border-radius': '4px',
            'box-shadow': '0 4px 8px rgba(0,0,0,0.1)'
        });
        
        $contenedor.find('.dropdown-item').off().on('click', function() {
            $input.val($(this).data('value'));
            $contenedor.hide();
            $input.trigger('change');
        });
    }

    static configurarComboCentros(callbackAñadir) {
        const $input = $('#comboCentroEstudianteMatricula');
        const $opciones = $('#opcionesCentroEstudianteMatricula');
        
        if (!$input.length) return;
        
        $input.off().on('focus', function() {
            u_matricula.mostrarOpcionesCentros($(this), $opciones, callbackAñadir);
        });
        
        $(document).on('click', function(e) {
            if (!$input.is(e.target) && !$opciones.is(e.target)) {
                $opciones.hide();
            }
        });
    }

    static mostrarOpcionesCentros($input, $contenedor, callbackAñadir) {
        const centros = ['Ninguno', 'Instituto Nacional', 'Centro de Bachillerato', 'Colegio Salesiano'];
        
        let html = '<div class="dropdown-item fw-bold text-success" data-value="añadir">➕ Añadir nuevo centro</div>';
        centros.forEach(c => {
            html += `<div class="dropdown-item" data-value="${c}">${c}</div>`;
        });
        
        $contenedor.html(html);
        
        const pos = $input.position();
        const altura = $input.outerHeight();
        
        $contenedor.css({
            'position': 'absolute',
            'top': pos.top + altura + 'px',
            'left': pos.left + 'px',
            'width': $input.outerWidth() + 'px',
            'max-height': '200px',
            'overflow-y': 'auto',
            'z-index': '9999',
            'display': 'block',
            'background': 'white',
            'border': '1px solid #ccc',
            'border-radius': '4px',
            'box-shadow': '0 4px 8px rgba(0,0,0,0.1)'
        });
        
        $contenedor.find('.dropdown-item').off().on('click', function() {
            const valor = $(this).data('value');
            if (valor === 'añadir') {
                callbackAñadir();
            } else {
                $input.val(valor);
                $contenedor.hide();
                $input.trigger('change');
            }
        });
    }

    static configurarComboUniversidades(callbackAñadir) {
        const $input = $('#comboUniversidadEstudianteMatricula');
        const $opciones = $('#opcionesUniversidadEstudianteMatricula');
        
        if (!$input.length) return;
        
        $input.off().on('focus', function() {
            u_matricula.mostrarOpcionesUniversidades($(this), $opciones, callbackAñadir);
        });
        
        $(document).on('click', function(e) {
            if (!$input.is(e.target) && !$opciones.is(e.target)) {
                $opciones.hide();
            }
        });
    }

    static mostrarOpcionesUniversidades($input, $contenedor, callbackAñadir) {
        const universidades = ['Ninguno', 'UNED', 'UAM', 'UC3M', 'Universidad Complutense'];
        
        let html = '<div class="dropdown-item fw-bold text-success" data-value="añadir">➕ Añadir nueva universidad</div>';
        universidades.forEach(u => {
            html += `<div class="dropdown-item" data-value="${u}">${u}</div>`;
        });
        
        $contenedor.html(html);
        
        const pos = $input.position();
        const altura = $input.outerHeight();
        
        $contenedor.css({
            'position': 'absolute',
            'top': pos.top + altura + 'px',
            'left': pos.left + 'px',
            'width': $input.outerWidth() + 'px',
            'max-height': '200px',
            'overflow-y': 'auto',
            'z-index': '9999',
            'display': 'block'
        });
        
        $contenedor.find('.dropdown-item').off().on('click', function() {
            const valor = $(this).data('value');
            if (valor === 'añadir') {
                callbackAñadir();
            } else {
                $input.val(valor);
                $contenedor.hide();
                $input.trigger('change');
            }
        });
    }

    static generarContrasena(longitud = 10) {
        const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const minusculas = 'abcdefghijklmnopqrstuvwxyz';
        const numeros = '0123456789';
        const especiales = '!@#$%^&*';
        let contrasena = '';
        
        contrasena += mayusculas[Math.floor(Math.random() * mayusculas.length)];
        contrasena += minusculas[Math.floor(Math.random() * minusculas.length)];
        contrasena += numeros[Math.floor(Math.random() * numeros.length)];
        contrasena += especiales[Math.floor(Math.random() * especiales.length)];
        
        const todos = mayusculas + minusculas + numeros + especiales;
        for (let i = 4; i < longitud; i++) {
            contrasena += todos[Math.floor(Math.random() * todos.length)];
        }
        
        contrasena = contrasena.split('').sort(() => 0.5 - Math.random()).join('');
        
        $('#formMatricula').data('contrasena-generada', contrasena);
        Alerta.informacion('Contraseña generada', `La contraseña es: ${contrasena}`);
        
        return contrasena;
    }

    static obtenerContrasenaGenerada() {
        return $('#formMatricula').data('contrasena-generada');
    }

    static validarNombre(valor) {
        return valor && valor.length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(valor);
    }
    
    static validarDip(valor) {
        return valor && /^\d{3}\s?\d{3}\s?\d{3}$/.test(valor);
    }
    
    static validarFecha(valor) {
        if (!valor) return false;
        const fecha = new Date(valor);
        const hoy = new Date();
        return fecha < hoy;
    }
    
    static validarSelect(valor) {
        return valor && valor !== 'Ninguno' && valor !== '';
    }
    
    static validarCorreo(valor) {
        return valor && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    }
    
    static validarTelefono(valor) {
        return valor && /^\+?\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,4}$/.test(valor);
    }
    
    static validarCursoAcademico(valor) {
        return valor && /^\d{4}\/\d{4}$/.test(valor);
    }
    
    static validarNumero(valor) {
        return valor && !isNaN(valor) && parseFloat(valor) > 0;
    }

    static colorearCampo(valido, selectorCampo, selectorError, mensaje) {
        const $campo = $(selectorCampo);
        const $error = $(selectorError);
        
        if (valido) {
            $campo.removeClass('border-danger').addClass('border-success');
            $error.text('').addClass('d-none');
        } else {
            $campo.removeClass('border-success').addClass('border-danger');
            $error.text(mensaje).removeClass('d-none');
        }
    }

    static configurarValidaciones() {
        $('#nombreEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarNombre($(this).val());
            u_matricula.colorearCampo(valido, '#nombreEstudianteMatricula', '#errorNombreEstudianteMatricula', 'Mínimo 3 letras');
        });

        $('#apellidosEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarNombre($(this).val());
            u_matricula.colorearCampo(valido, '#apellidosEstudianteMatricula', '#errorApellidosEstudianteMatricula', 'Mínimo 3 letras');
        });

        $('#dipEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarDip($(this).val());
            u_matricula.colorearCampo(valido, '#dipEstudianteMatricula', '#errorDipEstudianteMatricula', 'Formato: 000 000 000');
        });

        $('#fechaNacimientoEstudianteMatricula').on('change', function() {
            const valido = u_matricula.validarFecha($(this).val());
            u_matricula.colorearCampo(valido, '#fechaNacimientoEstudianteMatricula', '#errorFechaNacimientoEstudianteMatricula', 'Fecha inválida o futura');
        });

        $('#nacionalidadEstudianteMatricula').on('input', function() {
            const valido = $(this).val().length >= 3;
            u_matricula.colorearCampo(valido, '#nacionalidadEstudianteMatricula', '#errorNacionalidadEstudianteMatricula', 'Mínimo 3 caracteres');
        });

        $('#generosEstudianteMatricula').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#generosEstudianteMatricula', '#errorGenerosEstudianteMatricula', 'Seleccione una opción');
        });

        $('#direccionEstudianteMatricula').on('input', function() {
            const valido = $(this).val().length >= 5;
            u_matricula.colorearCampo(valido, '#direccionEstudianteMatricula', '#errorDireccionEstudianteMatricula', 'Mínimo 5 caracteres');
        });

        $('#localidadEstudianteMatricula').on('input', function() {
            const valido = $(this).val().length >= 3;
            u_matricula.colorearCampo(valido, '#localidadEstudianteMatricula', '#errorLocalidadEstudianteMatricula', 'Mínimo 3 caracteres');
        });

        $('#provinciaEstudianteMatricula').on('input', function() {
            const valido = $(this).val().length >= 3;
            u_matricula.colorearCampo(valido, '#provinciaEstudianteMatricula', '#errorProvinciaEstudianteMatricula', 'Mínimo 3 caracteres');
        });

        $('#comboPaisesEstudianteMatricula').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#comboPaisesEstudianteMatricula', '#errorPaisesEstudianteMatricula', 'Seleccione un país');
        });

        $('#correoEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarCorreo($(this).val());
            u_matricula.colorearCampo(valido, '#correoEstudianteMatricula', '#errorCorreoEstudianteMatricula', 'Correo inválido');
        });

        $('#telefonoEstudianteMatricula').on('input', function() {
            const valido = u_matricula.validarTelefono($(this).val());
            u_matricula.colorearCampo(valido, '#telefonoEstudianteMatricula', '#errorTelefonoEstudianteMatricula', 'Formato: +240 222 123 456');
        });

        $('#nombreEstudianteFamiliar').on('input', function() {
            const valido = u_matricula.validarNombre($(this).val());
            u_matricula.colorearCampo(valido, '#nombreEstudianteFamiliar', '#errorNombreEstudianteFamiliar', 'Mínimo 3 letras');
        });

        $('#apellidosEstudianteFamiliar').on('input', function() {
            const valido = u_matricula.validarNombre($(this).val());
            u_matricula.colorearCampo(valido, '#apellidosEstudianteFamiliar', '#errorApellidosEstudianteFamiliar', 'Mínimo 3 letras');
        });

        $('#dipEstudianteFamiliar').on('input', function() {
            const valido = u_matricula.validarDip($(this).val());
            u_matricula.colorearCampo(valido, '#dipEstudianteFamiliar', '#errorDipEstudianteFamiliar', 'Formato: 000 000 000');
        });

        $('#direccionEstudianteFamiliar').on('input', function() {
            const valido = $(this).val().length >= 5;
            u_matricula.colorearCampo(valido, '#direccionEstudianteFamiliar', '#errorDireccionEstudianteFamiliar', 'Mínimo 5 caracteres');
        });

        $('#correoEstudianteFamiliar').on('input', function() {
            const valido = u_matricula.validarCorreo($(this).val());
            u_matricula.colorearCampo(valido, '#correoEstudianteFamiliar', '#errorCorreoEstudianteFamiliar', 'Correo inválido');
        });

        $('#telefonoEstudianteFamiliar').on('input', function() {
            const valido = u_matricula.validarTelefono($(this).val());
            u_matricula.colorearCampo(valido, '#telefonoEstudianteFamiliar', '#errorTelefonoEstudianteFamiliar', 'Teléfono inválido');
        });

        $('#parentezcoEstudianteFamiliar').on('input', function() {
            const valido = $(this).val().length >= 3;
            u_matricula.colorearCampo(valido, '#parentezcoEstudianteFamiliar', '#errorParentezcoEstudianteFamiliar', 'Mínimo 3 caracteres');
        });

        $('#contactoIncidenteEstudianteFamiliar').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#contactoIncidenteEstudianteFamiliar', '#errorContactoIncidenteFamiliar', 'Seleccione una opción');
        });

        $('#responsablePagoEstudianteFamiliar').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#responsablePagoEstudianteFamiliar', '#errorResponsablePagoFamiliar', 'Seleccione una opción');
        });

        $('#cursoAcademicoMatricula').on('input', function() {
            const valido = u_matricula.validarCursoAcademico($(this).val());
            u_matricula.colorearCampo(valido, '#cursoAcademicoMatricula', '#errorCursoAcademicoMatricula', 'Formato: 2025/2026');
        });

        $('#fechaMatricula').on('change', function() {
            const valido = $(this).val() !== '';
            u_matricula.colorearCampo(valido, '#fechaMatricula', '#errorFechaMatricula', 'Seleccione una fecha');
        });

        $('#modalidadMatricula').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#modalidadMatricula', '#errorModalidadMatricula', 'Seleccione una modalidad');
        });

        $('#comboPlanEstudioMatricula').on('change', function() {
            const idPlan = u_matricula.getIdPlanSeleccionado();
            const valido = idPlan && idPlan !== 'Ninguno';
            u_matricula.colorearCampo(valido, '#comboPlanEstudioMatricula', '#errorPlanEstudioMatricula', 'Seleccione un plan');
        });

        $('#semestresMatricula').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#semestresMatricula', '#errorSemestresMatricula', 'Seleccione un semestre');
        });

        $('#estadosMatricula').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#estadosMatricula', '#errorestadosMatricula', 'Seleccione un estado');
        });

        $('#comboNombreInstitucionBeca').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#comboNombreInstitucionBeca', '#errorNombreInstitucionBeca', 'Seleccione una institución');
        });

        $('#tiposBeca').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#tiposBeca', '#errorTiposBeca', 'Seleccione un tipo');
        });

        $('#fechaInicioBeca').on('change', function() {
            const valido = $(this).val() !== '';
            u_matricula.colorearCampo(valido, '#fechaInicioBeca', '#errorFechaInicioBeca', 'Seleccione una fecha');
        });

        $('#fechaFinBeca').on('change', function() {
            const valido = $(this).val() !== '';
            u_matricula.colorearCampo(valido, '#fechaFinBeca', '#errorFechaFinBeca', 'Seleccione una fecha');
        });

        $('#estadosBeca').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#estadosBeca', '#errorEstadosBeca', 'Seleccione un estado');
        });

        $('#responsablePagoEstudiante').on('input', function() {
            const valido = $(this).val().length >= 3;
            u_matricula.colorearCampo(valido, '#responsablePagoEstudiante', '#errorResponsablePagoEstudiante', 'Mínimo 3 caracteres');
        });

        $('#cuotaEstudiante').on('input', function() {
            const valido = u_matricula.validarNumero($(this).val());
            u_matricula.colorearCampo(valido, '#cuotaEstudiante', '#errorCuotaEstudiante', 'Número positivo');
        });

        $('#fechaPagoEstudiante').on('change', function() {
            const valido = $(this).val() !== '';
            u_matricula.colorearCampo(valido, '#fechaPagoEstudiante', '#errorFechaPagoEstudiante', 'Seleccione una fecha');
        });

        $('#montoEstudiante').on('input', function() {
            const valido = u_matricula.validarNumero($(this).val());
            u_matricula.colorearCampo(valido, '#montoEstudiante', '#errorMontoEstudiante', 'Monto positivo');
        });

        $('#nombreOCorreoUsuario').on('input', function() {
            const valor = $(this).val();
            const esCorreo = valor.includes('@');
            let valido;
            
            if (esCorreo) {
                valido = u_matricula.validarCorreo(valor);
            } else {
                valido = valor.length >= 3;
            }
            
            u_matricula.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 'Mínimo 3 caracteres o correo válido');
        });

        $('#rolUsuario').on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, '#rolUsuario', '#errorRolUsuario', 'Seleccione un rol');
        });
    }

    static validarSeccion1() {
        let ok = true;
        
        if (!this.validarNombre($('#nombreEstudianteMatricula').val())) ok = false;
        if (!this.validarNombre($('#apellidosEstudianteMatricula').val())) ok = false;
        if (!this.validarDip($('#dipEstudianteMatricula').val())) ok = false;
        if (!this.validarFecha($('#fechaNacimientoEstudianteMatricula').val())) ok = false;
        if ($('#nacionalidadEstudianteMatricula').val().length < 3) ok = false;
        if (!this.validarSelect($('#generosEstudianteMatricula').val())) ok = false;
        if ($('#direccionEstudianteMatricula').val().length < 5) ok = false;
        if ($('#localidadEstudianteMatricula').val().length < 3) ok = false;
        if ($('#provinciaEstudianteMatricula').val().length < 3) ok = false;
        if (!this.validarSelect($('#comboPaisesEstudianteMatricula').val())) ok = false;
        if (!this.validarCorreo($('#correoEstudianteMatricula').val())) ok = false;
        if (!this.validarTelefono($('#telefonoEstudianteMatricula').val())) ok = false;
        
        if (!this.validarNombre($('#nombreEstudianteFamiliar').val())) ok = false;
        if (!this.validarNombre($('#apellidosEstudianteFamiliar').val())) ok = false;
        if (!this.validarDip($('#dipEstudianteFamiliar').val())) ok = false;
        if ($('#direccionEstudianteFamiliar').val().length < 5) ok = false;
        if (!this.validarCorreo($('#correoEstudianteFamiliar').val())) ok = false;
        if (!this.validarTelefono($('#telefonoEstudianteFamiliar').val())) ok = false;
        if ($('#parentezcoEstudianteFamiliar').val().length < 3) ok = false;
        if (!this.validarSelect($('#contactoIncidenteEstudianteFamiliar').val())) ok = false;
        if (!this.validarSelect($('#responsablePagoEstudianteFamiliar').val())) ok = false;
        
        return ok;
    }

    static validarSeccion2(esBecario) {
        let ok = true;

        if (!this.validarCursoAcademico($('#cursoAcademicoMatricula').val())) ok = false;
        if (!$('#fechaMatricula').val()) ok = false;
        if (!this.validarSelect($('#modalidadMatricula').val())) ok = false;

        const idPlan = this.getIdPlanSeleccionado();
        if (!idPlan || idPlan === 'Ninguno') {
            this.colorearCampo(false, '#comboPlanEstudioMatricula', '#errorPlanEstudioMatricula', 'Seleccione un plan de estudio');
            ok = false;
        }

        if (!this.validarSelect($('#semestresMatricula').val())) ok = false;
        if (!this.validarSelect($('#estadosMatricula').val())) ok = false;
        
        if (esBecario) {
            if (!this.validarSelect($('#comboNombreInstitucionBeca').val())) ok = false;
            if (!this.validarSelect($('#tiposBeca').val())) ok = false;
            if (!$('#fechaInicioBeca').val()) ok = false;
            if (!$('#fechaFinBeca').val()) ok = false;
            if (!this.validarSelect($('#estadosBeca').val())) ok = false;
        }
        
        return ok;
    }

    static validarSeccion3() {
        let ok = true;
        
        if ($('#responsablePagoEstudiante').val().length < 3) ok = false;
        if (!this.validarNumero($('#cuotaEstudiante').val())) ok = false;
        if (!$('#fechaPagoEstudiante').val()) ok = false;
        if (!this.validarNumero($('#montoEstudiante').val())) ok = false;
        
        const nombreOCorreo = $('#nombreOCorreoUsuario').val();
        const rol = $('#rolUsuario').val();
        
        if (nombreOCorreo || rol !== 'Ninguno') {
            const esCorreo = nombreOCorreo.includes('@');
            if (esCorreo) {
                if (!this.validarCorreo(nombreOCorreo)) ok = false;
            } else {
                if (nombreOCorreo.length < 3) ok = false;
            }
            if (!this.validarSelect(rol)) ok = false;
        }
        
        return ok;
    }

    static validarFormularioExistente() {
        let ok = true;
        
        const modal = $('#modalNuevaMatriculaRealizar');
        
        if (!this.validarCursoAcademico(modal.find('#cursoAcademicoMatricula').val())) ok = false;
        if (!modal.find('#fechaMatricula').val()) ok = false;
        if (!this.validarSelect(modal.find('#modalidadMatricula').val())) ok = false;
        if (!this.validarSelect(modal.find('#comboPlanEstudioMatricula').val())) ok = false;
        if (!this.validarSelect(modal.find('#semestresMatricula').val())) ok = false;
        if (!this.validarSelect(modal.find('#estadosMatricula').val())) ok = false;
        
        if (modal.find('#responsablePagoEstudiante').val().length < 3) ok = false;
        if (!this.validarNumero(modal.find('#cuotaEstudiante').val())) ok = false;
        if (!modal.find('#fechaPagoEstudiante').val()) ok = false;
        if (!this.validarNumero(modal.find('#montoEstudiante').val())) ok = false;
        
        return ok;
    }

    static limpiarModal(modalId) {
        $(`${modalId} form`)[0]?.reset();
        $(`${modalId} .errorMensaje`).text('').addClass('d-none');
        $(`${modalId} input, ${modalId} select`).removeClass('border-success border-danger');
        
        $(`${modalId} .seccion`).hide();
        $(`${modalId} #seccion1`).show();
        
        $(`${modalId} #anterior`).hide();
        $(`${modalId} #siguiente`).show();
        $(`${modalId} #btnGuardarMatricula`).hide();
        
        $('#contDatosBecario').addClass('d-none');
        $('#esBecario').prop('checked', false);
        
        this.limpiarImagen();
        
        $('.contacto-adicional, .beca-adicional').remove();
        $('#contactosAdicionales, #becasAdicionales').remove();
    }

    static limpiarCamposBeca() {
        $('#comboNombreInstitucionBeca').val('');
        $('#tiposBeca').val('Ninguno');
        $('#fechaInicioBeca').val('');
        $('#fechaFinBeca').val('');
        $('#estadosBeca').val('Ninguno');
        $('#observacionesBeca').val('');
    }

    static mostrarSeccion(numero) {
        $(`#seccion${numero}`).show();
        
        if (numero === 1) $('#anterior').hide();
        else $('#anterior').show();
        
        if (numero === 3) {
            $('#siguiente').hide();
            $('#btnGuardarMatricula').show();
        } else {
            $('#siguiente').show();
            $('#btnGuardarMatricula').hide();
        }
    }

    static ocultarSeccion(numero) {
        $(`#seccion${numero}`).hide();
    }

    static configurarSubidaImagen() {
        $('#añadirImagen').off('click').on('click', function() {
            $('#campoArchivoFotoPerfil').click();
        });

        $('#campoArchivoFotoPerfil').off('change').on('change', function(e) {
            const archivo = e.target.files[0];
            if (!archivo) return;
            
            if (!archivo.type.startsWith('image/')) {
                Alerta.notificarAdvertencia('Solo se permiten imágenes', 1500);
                return;
            }
            
            if (archivo.size > 2 * 1024 * 1024) {
                Alerta.notificarAdvertencia('La imagen no debe superar los 2MB', 1500);
                return;
            }
            
            $('#formMatricula').data('imagen-perfil', archivo);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#contenedorFotoPerfil').html(`
                    <div style="position: relative; display: inline-block;">
                        <img src="${e.target.result}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #ffc107;">
                        <button type="button" id="btnQuitarImagen" style="position: absolute; top: -5px; right: -5px; width: 24px; height: 24px; border-radius: 50%; background: #dc3545; color: white; border: none; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `);
                
                $('#btnQuitarImagen').on('click', function() {
                    u_matricula.limpiarImagen();
                });
            };
            reader.readAsDataURL(archivo);
        });
    }

    static limpiarImagen() {
        $('#contenedorFotoPerfil').html(`
            <div style="width: 120px; height: 120px; background: #f8f9fa; border: 2px dashed #ccc; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-user" style="font-size: 48px; color: #999;"></i>
            </div>
        `);
        $('#campoArchivoFotoPerfil').val('');
        $('#formMatricula').removeData('imagen-perfil');
    }

    static obtenerImagenParaSubir() {
        return $('#formMatricula').data('imagen-perfil');
    }

    static generarCamposContacto(indice) {
        return `
            <div class="contacto-adicional mt-3 p-3 border rounded">
                <div class="text-end mb-2">
                    <button type="button" class="btn btn-sm btn-danger eliminar-contacto">
                        <i class="fas fa-times"></i> Eliminar contacto
                    </button>
                </div>
                <div class="row">
                    <div class="col-4">
                        <label>Nombre</label>
                        <input type="text" class="form-control" id="nombreEstudianteFamiliar${indice}" placeholder="Nombre">
                        <label id="errorNombreEstudianteFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-4">
                        <label>Apellidos</label>
                        <input type="text" class="form-control" id="apellidosEstudianteFamiliar${indice}" placeholder="Apellidos">
                        <label id="errorApellidosEstudianteFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-4">
                        <label>DIP</label>
                        <input type="text" class="form-control" id="dipEstudianteFamiliar${indice}" placeholder="000 000 000">
                        <label id="errorDipEstudianteFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-4">
                        <label>Dirección</label>
                        <input type="text" class="form-control" id="direccionEstudianteFamiliar${indice}" placeholder="Dirección">
                        <label id="errorDireccionEstudianteFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-4">
                        <label>Correo</label>
                        <input type="email" class="form-control" id="correoEstudianteFamiliar${indice}" placeholder="correo@email.com">
                        <label id="errorCorreoEstudianteFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-4">
                        <label>Teléfono</label>
                        <input type="tel" class="form-control" id="telefonoEstudianteFamiliar${indice}" placeholder="+240 222 123 456">
                        <label id="errorTelefonoEstudianteFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-4">
                        <label>Parentesco</label>
                        <input type="text" class="form-control" id="parentezcoEstudianteFamiliar${indice}" placeholder="Padre/Madre/etc">
                        <label id="errorParentezcoEstudianteFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-4">
                        <label>Contacto incidentes?</label>
                        <select class="form-select" id="contactoIncidenteEstudianteFamiliar${indice}">
                            <option value="Ninguno">Seleccione...</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        <label id="errorContactoIncidenteFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-4">
                        <label>Responsable pago?</label>
                        <select class="form-select" id="responsablePagoEstudianteFamiliar${indice}">
                            <option value="Ninguno">Seleccione...</option>
                            <option value="Sí">Sí</option>
                            <option value="No">No</option>
                        </select>
                        <label id="errorResponsablePagoFamiliar${indice}" class="errorMensaje d-none"></label>
                    </div>
                </div>
            </div>
        `;
    }

    static generarCamposBeca(indice, becas) {
        let opciones = '<option value="Ninguno">Seleccione...</option>';
        if (becas && becas.length) {
            becas.forEach(b => {
                opciones += `<option value="${b.idBeca}">${b.institucionBeca} - ${b.tipoBeca}</option>`;
            });
        }
        
        return `
            <div class="beca-adicional mt-3 p-3 border rounded">
                <div class="text-end mb-2">
                    <button type="button" class="btn btn-sm btn-danger eliminar-beca">
                        <i class="fas fa-times"></i> Eliminar beca
                    </button>
                </div>
                <div class="row">
                    <div class="col-12">
                        <label>Institución</label>
                        <select class="form-select" id="comboNombreInstitucionBeca${indice}">
                            ${opciones}
                        </select>
                        <label id="errorNombreInstitucionBeca${indice}" class="errorMensaje d-none"></label>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-3">
                        <label>Tipo</label>
                        <select class="form-select" id="tiposBeca${indice}">
                            <option value="Ninguno">Seleccione...</option>
                            <option value="Externa">Externa</option>
                            <option value="Interna">Interna</option>
                        </select>
                        <label id="errorTiposBeca${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-3">
                        <label>Fecha inicio</label>
                        <input type="date" class="form-control" id="fechaInicioBeca${indice}">
                        <label id="errorFechaInicioBeca${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-3">
                        <label>Fecha fin</label>
                        <input type="date" class="form-control" id="fechaFinBeca${indice}">
                        <label id="errorFechaFinBeca${indice}" class="errorMensaje d-none"></label>
                    </div>
                    <div class="col-3">
                        <label>Estado</label>
                        <select class="form-select" id="estadosBeca${indice}">
                            <option value="Ninguno">Seleccione...</option>
                            <option value="Vigente">Vigente</option>
                            <option value="No vigente">No vigente</option>
                        </select>
                        <label id="errorEstadosBeca${indice}" class="errorMensaje d-none"></label>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12">
                        <label>Observaciones</label>
                        <textarea class="form-control" id="observacionesBeca${indice}" rows="2"></textarea>
                        <label id="errorObservacionesBeca${indice}" class="errorMensaje d-none"></label>
                    </div>
                </div>
            </div>
        `;
    }

    static configurarValidacionesContacto(indice) {
        $(`#nombreEstudianteFamiliar${indice}`).on('input', function() {
            const valido = u_matricula.validarNombre($(this).val());
            u_matricula.colorearCampo(valido, `#nombreEstudianteFamiliar${indice}`, `#errorNombreEstudianteFamiliar${indice}`, 'Mínimo 3 letras');
        });
        
        $(`#apellidosEstudianteFamiliar${indice}`).on('input', function() {
            const valido = u_matricula.validarNombre($(this).val());
            u_matricula.colorearCampo(valido, `#apellidosEstudianteFamiliar${indice}`, `#errorApellidosEstudianteFamiliar${indice}`, 'Mínimo 3 letras');
        });
        
        $(`#dipEstudianteFamiliar${indice}`).on('input', function() {
            const valido = u_matricula.validarDip($(this).val());
            u_matricula.colorearCampo(valido, `#dipEstudianteFamiliar${indice}`, `#errorDipEstudianteFamiliar${indice}`, 'Formato: 000 000 000');
        });
        
        $(`#correoEstudianteFamiliar${indice}`).on('input', function() {
            const valido = u_matricula.validarCorreo($(this).val());
            u_matricula.colorearCampo(valido, `#correoEstudianteFamiliar${indice}`, `#errorCorreoEstudianteFamiliar${indice}`, 'Correo inválido');
        });
        
        $(`#telefonoEstudianteFamiliar${indice}`).on('input', function() {
            const valido = u_matricula.validarTelefono($(this).val());
            u_matricula.colorearCampo(valido, `#telefonoEstudianteFamiliar${indice}`, `#errorTelefonoEstudianteFamiliar${indice}`, 'Teléfono inválido');
        });
    }

    static configurarValidacionesBeca(indice) {
        $(`#comboNombreInstitucionBeca${indice}`).on('change', function() {
            const valido = u_matricula.validarSelect($(this).val());
            u_matricula.colorearCampo(valido, `#comboNombreInstitucionBeca${indice}`, `#errorNombreInstitucionBeca${indice}`, 'Seleccione una institución');
        });
    }

    static cargarPlanesEstudio(planes) {
        this.setPlanesEstudio(planes);
        
        const $input = $('#comboPlanEstudioMatricula');
        if ($input.length) {
            $input.val('');
            $input.removeData('id-plan');
            $input.attr('placeholder', planes?.length ? 'Buscar o seleccionar plan de estudio' : 'No hay planes disponibles');
        }
    }

    static cargarSemestres(semestres) {
        const $select = $('#semestresMatricula');
        $select.empty().append('<option value="Ninguno">Seleccione un semestre...</option>');
        
        if (semestres?.length) {
            semestres.forEach(s => {
                $select.append(`<option value="${s.idSemestre}">Semestre ${s.numeroSemestre}</option>`);
            });
        }
    }

    static cargarBecas(becas) {
        const $select = $('#comboNombreInstitucionBeca');
        $select.empty().append('<option value="Ninguno">Seleccione una institución...</option>');
        
        if (becas?.length) {
            becas.forEach(b => {
                $select.append(`<option value="${b.idBeca}">${b.institucionBeca} - ${b.tipoBeca}</option>`);
            });
        }
    }

    static configurarComboPlanes() {
        const $input = $('#comboPlanEstudioMatricula');
        const $opciones = $('#opcionesPlanEstudioMatricula');
        
        if (!$input.length) return;
        
        $input.off().on('focus', function() {
            u_matricula.mostrarOpcionesPlanes($(this), $opciones);
        }).on('input', function() {
            const texto = $(this).val().toLowerCase();
            u_matricula.filtrarOpcionesPlanes(texto, $opciones);
        }).on('keydown', function(e) {
            if (e.key === 'Escape') $opciones.hide();
        });
        
        $(document).on('click', function(e) {
            if (!$input.is(e.target) && !$opciones.is(e.target)) {
                $opciones.hide();
            }
        });
    }

    static setPlanesEstudio(planes) {
        this.planesEstudio = planes || [];
    }

    static mostrarOpcionesPlanes($input, $contenedor) {
        if (!this.planesEstudio?.length) {
            $contenedor.html('<div class="dropdown-item text-muted">No hay planes disponibles</div>');
        } else {
            let html = '';
            this.planesEstudio.forEach(plan => {
                const nombrePlan = plan.nombre || plan.nombrePlan || 'Plan sin nombre';
                const idPlan = plan.idPlanEstudio;
                html += `<div class="dropdown-item" data-value="${idPlan}" data-text="${nombrePlan}">${nombrePlan}</div>`;
            });
            $contenedor.html(html);
        }
        
        const pos = $input.position();
        const altura = $input.outerHeight();
        
        $contenedor.css({
            'position': 'absolute',
            'top': pos.top + altura + 'px',
            'left': pos.left + 'px',
            'width': $input.outerWidth() + 'px',
            'max-height': '200px',
            'overflow-y': 'auto',
            'z-index': '9999',
            'display': 'block',
            'background': 'white',
            'border': '1px solid #ccc',
            'border-radius': '4px',
            'box-shadow': '0 4px 8px rgba(0,0,0,0.1)'
        });
        
        $contenedor.find('.dropdown-item').off().on('click', function() {
            const valor = $(this).data('value');
            const texto = $(this).data('text');
            $input.val(texto);
            $input.data('id-plan', valor);
            $contenedor.hide();
            $input.trigger('change');
        });
    }

    static filtrarOpcionesPlanes(texto, $contenedor) {
        if (!this.planesEstudio?.length) {
            $contenedor.html('<div class="dropdown-item text-muted">No hay planes disponibles</div>');
        } else {
            const filtrados = this.planesEstudio.filter(plan => 
                (plan.nombre || plan.nombrePlan || '').toLowerCase().includes(texto)
            );
            
            if (filtrados.length === 0) {
                $contenedor.html('<div class="dropdown-item text-muted">No hay resultados</div>');
            } else {
                let html = '';
                filtrados.forEach(plan => {
                    const nombrePlan = plan.nombre || plan.nombrePlan || 'Plan sin nombre';
                    const idPlan = plan.idPlanEstudio;
                    html += `<div class="dropdown-item" data-value="${idPlan}" data-text="${nombrePlan}">${nombrePlan}</div>`;
                });
                $contenedor.html(html);
            }
        }
        
        const $input = $('#comboPlanEstudioMatricula');
        const pos = $input.position();
        const altura = $input.outerHeight();
        
        $contenedor.css({
            'top': pos.top + altura + 'px',
            'left': pos.left + 'px',
            'display': 'block'
        });
        
        $contenedor.find('.dropdown-item').off().on('click', function() {
            const valor = $(this).data('value');
            const texto = $(this).data('text');
            $input.val(texto);
            $input.data('id-plan', valor);
            $contenedor.hide();
            $input.trigger('change');
        });
    }

    static getIdPlanSeleccionado() {
        return $('#comboPlanEstudioMatricula').data('id-plan') || 'Ninguno';
    }
}
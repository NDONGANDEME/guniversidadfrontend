import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";

export class u_comprobante {
    
    // ========== VALIDACIONES ==========
    static validarNombreCompleto(valor) {
        if (!valor) return false;
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarDipOPasaporte(valor) {
        if (!valor) return false;
        // Acepta DIP (000 000 000) o pasaporte (letras y números)
        return /^[a-zA-Z0-9\s]{6,20}$/.test(valor);
    }
    
    static validarSelect(valor) {
        return valor && valor !== 'Ninguno' && valor !== '';
    }

    // ========== CONFIGURAR VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        $('#nombreCompletoComprobante').off('input').on('input', function() {
            const valido = u_comprobante.validarNombreCompleto($(this).val().trim());
            u_utiles.colorearCampo(valido, '#nombreCompletoComprobante', '#errorNombreCompletoComprobante', 'Mínimo 3 caracteres, solo letras');
        });

        $('#dipOPasaporteComprobante').off('input').on('input', function() {
            const valido = u_comprobante.validarDipOPasaporte($(this).val().trim());
            u_utiles.colorearCampo(valido, '#dipOPasaporteComprobante', '#errorDipOPasaporteComprobante', 'Formato inválido (6-20 caracteres)');
        });

        $('#añoAcademicoComprobante').off('change').on('change', function() {
            const valido = u_comprobante.validarSelect($(this).val());
            u_utiles.colorearCampo(valido, '#añoAcademicoComprobante', '#errorAñoAcademicoComprobante', 'Seleccione un año académico');
        });

        $('#cursoComprobante').off('change').on('change', function() {
            const valido = u_comprobante.validarSelect($(this).val());
            u_utiles.colorearCampo(valido, '#cursoComprobante', '#errorCursoComprobante', 'Seleccione un curso');
        });

        $('#carreraComprobante').off('change').on('change', function() {
            const valido = u_comprobante.validarSelect($(this).val());
            u_utiles.colorearCampo(valido, '#carreraComprobante', '#errorCarreraComprobante', 'Seleccione una carrera');
        });
    }

    // ========== CARGAR DATOS EN COMBOS ==========
    static cargarAñosAcademicos(años) {
        const select = $('#añoAcademicoComprobante');
        select.empty();
        select.append('<option value="Ninguno">Seleccione...</option>');
        
        años.forEach(año => {
            select.append(`<option value="${año}">${año}</option>`);
        });
    }

    static cargarCursos(cursos) {
        const select = $('#cursoComprobante');
        select.empty();
        select.append('<option value="Ninguno">Seleccione...</option>');
        
        cursos.forEach(curso => {
            select.append(`<option value="${curso.idCurso}">${curso.nombreCurso}</option>`);
        });
    }

    static cargarCarreras(carreras) {
        const select = $('#carreraComprobante');
        select.empty();
        select.append('<option value="Ninguno">Seleccione...</option>');
        
        carreras.forEach(carrera => {
            select.append(`<option value="${carrera.idCarrera}">${carrera.nombreCarrera}</option>`);
        });
    }

    // ========== CARGAR DATOS GUARDADOS EN FORMULARIO ==========
    static cargarDatosEnFormulario(datos) {
        if (datos.nombreCompleto) {
            $('#nombreCompletoComprobante').val(datos.nombreCompleto);
        }
        
        if (datos.dip) {
            $('#dipOPasaporteComprobante').val(datos.dip);
        }
        
        if (datos.añoAcademico) {
            $('#añoAcademicoComprobante').val(datos.añoAcademico);
        }
        
        if (datos.curso) {
            // Buscar el option que tenga el texto igual al curso guardado
            $('#cursoComprobante option').each(function() {
                if ($(this).text() === datos.curso) {
                    $('#cursoComprobante').val($(this).val());
                }
            });
        }
        
        if (datos.carrera) {
            $('#carreraComprobante option').each(function() {
                if ($(this).text() === datos.carrera) {
                    $('#carreraComprobante').val($(this).val());
                }
            });
        }
    }

    // ========== VALIDAR FORMULARIO COMPLETO ==========
    static validarFormulario() {
        let valido = true;
        
        if (!this.validarNombreCompleto($('#nombreCompletoComprobante').val().trim())) {
            $('#nombreCompletoComprobante').trigger('input');
            valido = false;
        }
        
        if (!this.validarDipOPasaporte($('#dipOPasaporteComprobante').val().trim())) {
            $('#dipOPasaporteComprobante').trigger('input');
            valido = false;
        }
        
        if (!this.validarSelect($('#añoAcademicoComprobante').val())) {
            $('#añoAcademicoComprobante').trigger('change');
            valido = false;
        }
        
        if (!this.validarSelect($('#cursoComprobante').val())) {
            $('#cursoComprobante').trigger('change');
            valido = false;
        }
        
        if (!this.validarSelect($('#carreraComprobante').val())) {
            $('#carreraComprobante').trigger('change');
            valido = false;
        }
        
        return valido;
    }
}
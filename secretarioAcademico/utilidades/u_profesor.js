import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class u_profesor {
    
    static archivosSeleccionados = [];
    static departamentosDisponibles = [];
    static filteredDepartamentos = [];
    static currentSection = 0;
    static secciones = ['#seccion1', '#seccion2', '#seccion3'];

    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarApellidos(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarDIP(valor) {
        const regex = /^\d{3}\s?\d{3}\s?\d{3}$/;
        return regex.test(valor.trim());
    }
    
    static validarNacionalidad(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarGenero(valor) {
        return valor && valor !== 'Ninguno';
    }
    
    static validarCorreo(valor) {
        return u_verificaciones.validarCorreo(valor);
    }
    
    static validarTelefono(valor) {
        return u_verificaciones.validarTelefono(valor);
    }
    
    static validarInstitucion(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarTipoFormacion(valor) {
        return valor && valor !== 'Ninguno';
    }
    
    static validarNivelFormacion(valor) {
        return valor && valor !== 'Ninguno';
    }
    
    static validarTitulo(valor) {
        return u_verificaciones.validarDescripcion(valor);
    }
    
    static validarDepartamento(valor) {
        return valor && valor !== '' && valor !== 'Ninguno' && valor !== null;
    }
    
    static validarResponsabilidad(valor) {
        return valor && valor !== 'Ninguno';
    }
    
    static validarEspecialidad(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    static validarGradoEstudio(valor) {
        return u_verificaciones.validarTexto(valor);
    }
    
    static validarNombreOCorreo(valor) {
        return u_verificaciones.validarNombreOCorreo(valor);
    }
    
    static validarRol(valor) {
        return valor && valor !== 'Ninguno' && valor === 'Profesor';
    }

    static configurarValidaciones() {
        $('#nombreProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreProfesor', '#errorNombreProfesor', 'Mínimo 3 caracteres, solo letras');
        });

        $('#apellidosProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarApellidos(valor);
            u_utiles.colorearCampo(valido, '#apellidosProfesor', '#errorApellidosProfesor', 'Mínimo 3 caracteres, solo letras');
        });

        $('#dipProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarDIP(valor);
            u_utiles.colorearCampo(valido, '#dipProfesor', '#errorDipProfesor', 'Formato: 000 000 000');
        });

        $('#nacionalidadProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarNacionalidad(valor);
            u_utiles.colorearCampo(valido, '#nacionalidadProfesor', '#errorNacionalidadProfesor', 'Mínimo 3 caracteres, solo letras');
        });

        $('#generosProfesor').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_profesor.validarGenero(valor);
            u_utiles.colorearCampo(valido, '#generosProfesor', '#errorGenerosProfesor', 'Seleccione un género');
        });

        $('#correoProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarCorreo(valor);
            u_utiles.colorearCampo(valido, '#correoProfesor', '#errorCorreoProfesor', 'Correo inválido (ej: usuario@dominio.com)');
        });

        $('#telefonoProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarTelefono(valor);
            u_utiles.colorearCampo(valido, '#telefonoProfesor', '#errorTelefonoProfesor', 'Formato: +240 222 123 456');
        });

        $('#institucionFormacionProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarInstitucion(valor);
            u_utiles.colorearCampo(valido, '#institucionFormacionProfesor', '#errorInstitucionFormacionProfesor', 'Mínimo 3 caracteres');
        });

        $('#tiposFormacionesProfesor').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_profesor.validarTipoFormacion(valor);
            u_utiles.colorearCampo(valido, '#tiposFormacionesProfesor', '#errorTiposFormacionesProfesor', 'Seleccione un tipo');
        });

        $('#nivelesFormacionesProfesor').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_profesor.validarNivelFormacion(valor);
            u_utiles.colorearCampo(valido, '#nivelesFormacionesProfesor', '#errorNivelesFormacionesProfesor', 'Seleccione un nivel');
        });

        $('#titulosProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarTitulo(valor);
            u_utiles.colorearCampo(valido, '#titulosProfesor', '#errorTitulosProfesor', 'Mínimo 10 caracteres');
        });

        $('#comboDepartamentosProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            u_profesor.filtrarDepartamentos(valor);
            
            if (valor === '') {
                $(this).removeData('selected');
                u_utiles.colorearCampo(false, '#comboDepartamentosProfesor', '#errorDepartamentosProfesor', 'Seleccione un departamento');
            }
        });

        $('#responsabilidadProfesor').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_profesor.validarResponsabilidad(valor);
            u_utiles.colorearCampo(valido, '#responsabilidadProfesor', '#errorResponsabilidadProfesor', 'Seleccione una responsabilidad');
        });

        $('#especialidadFormacionProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarEspecialidad(valor);
            u_utiles.colorearCampo(valido, '#especialidadFormacionProfesor', '#errorEspecialidadFormacionProfesor', 'Mínimo 5 caracteres');
        });

        $('#gradoFormacionProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarGradoEstudio(valor);
            u_utiles.colorearCampo(valido, '#gradoFormacionProfesor', '#errorGradoFormacionProfesor', 'Mínimo 5 caracteres');
        });

        $('#nombreOCorreoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const esCorreo = valor.includes('@');
            let valido;
            let mensaje;
            
            if (esCorreo) {
                valido = u_profesor.validarCorreo(valor);
                mensaje = 'Correo inválido (ej: usuario@dominio.com)';
            } else {
                valido = u_profesor.validarNombreOCorreo(valor);
                mensaje = 'Mínimo 3 caracteres, solo letras y números';
            }
            
            u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', mensaje);
        });

        $('#rolUsuario').off('change').on('change', function() {
            const valor = $(this).val();
            if (valor !== 'Profesor') {
                $(this).val('Profesor');
            }
            const valido = u_profesor.validarRol('Profesor');
            u_utiles.colorearCampo(valido, '#rolUsuario', '#errorRolUsuario', 'Debe seleccionar Profesor');
        });
    }

    static validarSeccion1() {
        return u_profesor.validarNombre($('#nombreProfesor').val().trim()) &&
               u_profesor.validarApellidos($('#apellidosProfesor').val().trim()) &&
               u_profesor.validarDIP($('#dipProfesor').val().trim()) &&
               u_profesor.validarNacionalidad($('#nacionalidadProfesor').val().trim()) &&
               u_profesor.validarGenero($('#generosProfesor').val()) &&
               u_profesor.validarCorreo($('#correoProfesor').val().trim()) &&
               u_profesor.validarTelefono($('#telefonoProfesor').val().trim());
    }

    static validarSeccion2() {
        return u_profesor.validarInstitucion($('#institucionFormacionProfesor').val().trim()) &&
               u_profesor.validarTipoFormacion($('#tiposFormacionesProfesor').val()) &&
               u_profesor.validarNivelFormacion($('#nivelesFormacionesProfesor').val()) &&
               u_profesor.validarTitulo($('#titulosProfesor').val().trim()) &&
               this.validarDepartamentoSeleccionado() && 
               u_profesor.validarResponsabilidad($('#responsabilidadProfesor').val()) &&
               u_profesor.validarEspecialidad($('#especialidadFormacionProfesor').val().trim()) &&
               u_profesor.validarGradoEstudio($('#gradoFormacionProfesor').val().trim());
    }

    static validarSeccion3() {
        return u_profesor.validarNombreOCorreo($('#nombreOCorreoUsuario').val().trim()) &&
               u_profesor.validarRol($('#rolUsuario').val());
    }

    static mostrarSeccion(index) {
        u_profesor.secciones.forEach(sec => {
            $(sec).removeClass('active').hide();
        });

        $(u_profesor.secciones[index]).addClass('active').show();

        if (index === 0) {
            $('#anterior').hide();
            $('#siguiente').show().text('Siguiente');
            $('#btnGuardarProfesor').hide();
        } else if (index === u_profesor.secciones.length - 1) {
            $('#anterior').show();
            $('#siguiente').hide();
            $('#btnGuardarProfesor').show();
        } else {
            $('#anterior').show();
            $('#siguiente').show().text('Siguiente');
            $('#btnGuardarProfesor').hide();
        }
    }

    static irSiguiente() {
        if (u_profesor.currentSection < u_profesor.secciones.length - 1) {
            let valida = false;
            let mensaje = '';
            
            switch(u_profesor.currentSection) {
                case 0:
                    valida = u_profesor.validarSeccion1();
                    mensaje = 'Complete todos los campos de la sección correctamente';
                    break;
                case 1:
                    valida = u_profesor.validarSeccion2();
                    mensaje = 'Complete todos los campos de la sección correctamente';
                    break;
            }
            
            if (valida) {
                u_profesor.currentSection++;
                u_profesor.mostrarSeccion(u_profesor.currentSection);
            } else {
                Alerta.advertencia('Campos incompletos', mensaje);
            }
        }
    }

    static irAnterior() {
        if (u_profesor.currentSection > 0) {
            u_profesor.currentSection--;
            u_profesor.mostrarSeccion(u_profesor.currentSection);
        }
    }

    static reiniciarSecciones() {
        u_profesor.currentSection = 0;
        u_profesor.mostrarSeccion(0);
    }

    static inicializarComboDepartamentos(departamentos) {
        console.log('Inicializando combo con departamentos:', departamentos);
        
        this.departamentosDisponibles = departamentos || [];
        this.filteredDepartamentos = this.departamentosDisponibles;
        
        this.renderizarDropdownDepartamentos();

        const input = $('#comboDepartamentosProfesor');
        
        input.off('focus').on('focus', () => {
            this.mostrarDropdownDepartamentos();
        });

        input.off('input').on('input', (e) => {
            const valor = $(e.target).val().trim();
            this.filtrarDepartamentos(valor);
            
            if (valor === '') {
                $(e.target).removeData('selected');
                u_utiles.colorearCampo(false, '#comboDepartamentosProfesor', '#errorDepartamentosProfesor', 'Seleccione un departamento');
            }
        });

        input.off('keyup').on('keyup', (e) => {
            if (e.key === 'Escape') {
                this.ocultarDropdownDepartamentos();
            }
        });

        $(document).off('click').on('click', (e) => {
            if (!$(e.target).closest('.combo-input-wrapper').length) {
                this.ocultarDropdownDepartamentos();
            }
        });
    }

    static filtrarDepartamentos(searchTerm) {
        if (!searchTerm) {
            this.filteredDepartamentos = this.departamentosDisponibles;
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredDepartamentos = this.departamentosDisponibles.filter(d => 
                d.nombre && d.nombre.toLowerCase().includes(term)
            );
        }
        this.renderizarDropdownDepartamentos();
        this.mostrarDropdownDepartamentos();
    }

    static renderizarDropdownDepartamentos() {
        const dropdown = $('#opcionesDepartamentosProfesor');
        dropdown.empty();

        if (!this.filteredDepartamentos || this.filteredDepartamentos.length === 0) {
            dropdown.append('<div class="dropdown-option no-results">No se encontraron departamentos</div>');
        } else {
            this.filteredDepartamentos.forEach(d => {
                if (d.idDepartamento && d.nombre) {
                    const option = $(`<div class="dropdown-option" data-id="${d.idDepartamento}">${d.nombre}</div>`);
                    option.on('click', () => {
                        this.seleccionarDepartamento(d.idDepartamento, d.nombre);
                    });
                    dropdown.append(option);
                }
            });
        }
    }

    static mostrarDropdownDepartamentos() {
        $('#opcionesDepartamentosProfesor').addClass('active');
    }

    static ocultarDropdownDepartamentos() {
        $('#opcionesDepartamentosProfesor').removeClass('active');
    }

    static seleccionarDepartamento(id, nombre) {
        $('#comboDepartamentosProfesor').val(nombre);
        $('#comboDepartamentosProfesor').data('selected', id);
        this.ocultarDropdownDepartamentos();
        
        u_utiles.colorearCampo(true, '#comboDepartamentosProfesor', '#errorDepartamentosProfesor', '');
        $('#comboDepartamentosProfesor').trigger('change');
    }

    static getDepartamentoSeleccionado() {
        return $('#comboDepartamentosProfesor').data('selected') || null;
    }

    static setDepartamentoSeleccionado(id, nombre) {
        if (id && nombre) {
            $('#comboDepartamentosProfesor').val(nombre);
            $('#comboDepartamentosProfesor').data('selected', id);
            u_utiles.colorearCampo(true, '#comboDepartamentosProfesor', '#errorDepartamentosProfesor', '');
        }
    }

    static limpiarDepartamentoSeleccionado() {
        $('#comboDepartamentosProfesor').val('').removeData('selected');
        u_utiles.colorearCampo(false, '#comboDepartamentosProfesor', '#errorDepartamentosProfesor', 'Seleccione un departamento');
    }

    static validarDepartamentoSeleccionado() {
        const id = this.getDepartamentoSeleccionado();
        const valido = id !== null && id !== undefined && id !== '';
        
        if (!valido) {
            u_utiles.colorearCampo(false, '#comboDepartamentosProfesor', '#errorDepartamentosProfesor', 'Seleccione un departamento');
        }
        
        return valido;
    }

    static configurarSubidaArchivos() {
        $('#fileDropArea').off('click').on('click', function() {
            $('#campoArchivoFoto').click();
        });

        $('#fileDropArea').off('dragover').on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('drag-over border-success');
        });

        $('#fileDropArea').off('dragleave').on('dragleave', function(e) {
            e.preventDefault();
            $(this).removeClass('drag-over border-success');
        });

        $('#fileDropArea').off('drop').on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('drag-over border-success');
            
            const archivos = e.originalEvent.dataTransfer.files;
            u_profesor.procesarArchivos(archivos);
        });

        $('#campoArchivoFoto').off('change').on('change', function(e) {
            const archivos = e.target.files;
            u_profesor.procesarArchivos(archivos);
        });

        $('#btnLimpiarArchivos').off('click').on('click', function() {
            u_profesor.limpiarArchivos();
        });
    }

    static procesarArchivos(archivos) {
        if (!archivos || archivos.length === 0) return;

        if (u_profesor.archivosSeleccionados.length + archivos.length > 10) {
            Alerta.advertencia('Límite de archivos', 'Solo puede seleccionar hasta 10 archivos');
            return;
        }

        const formatosPermitidos = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        for (let archivo of archivos) {
            if (!formatosPermitidos.includes(archivo.type) && !archivo.type.startsWith('image/')) {
                Alerta.advertencia('Formato no permitido', `Formato no permitido: ${archivo.name}`);
                continue;
            }

            if (archivo.size > 5 * 1024 * 1024) {
                Alerta.advertencia('Archivo muy grande', `El archivo ${archivo.name} supera los 5MB`);
                continue;
            }

            let preview = '';
            if (archivo.type.startsWith('image/')) {
                preview = URL.createObjectURL(archivo);
            }

            u_profesor.archivosSeleccionados.push({
                archivo: archivo,
                nombre: archivo.name,
                tipo: archivo.type,
                tamaño: archivo.size,
                preview: preview
            });
        }

        u_profesor.actualizarPrevisualizacion();
    }

    static actualizarPrevisualizacion() {
        const contador = $('#contadorArchivos');
        const previewContainer = $('#previewArchivos');
        
        contador.text(`${u_profesor.archivosSeleccionados.length} archivos seleccionados`);
        
        if (u_profesor.archivosSeleccionados.length === 0) {
            previewContainer.html('<p class="text-muted">No hay archivos seleccionados</p>');
            return;
        }

        let html = '<div class="row">';
        
        u_profesor.archivosSeleccionados.forEach((archivo, index) => {
            let previewHtml = '';
            if (archivo.preview) {
                previewHtml = `<img src="${archivo.preview}" class="img-fluid rounded" style="height: 80px; width: 100%; object-fit: cover;">`;
            } else if (archivo.tipo.includes('pdf')) {
                previewHtml = `<i class="fas fa-file-pdf fa-3x text-danger"></i>`;
            } else {
                previewHtml = `<i class="fas fa-file-word fa-3x text-primary"></i>`;
            }

            html += `
                <div class="col-md-3 col-sm-4 col-6 mb-3" data-index="${index}">
                    <div class="position-relative">
                        <div class="text-center">
                            ${previewHtml}
                        </div>
                        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 btn-eliminar-archivo" data-index="${index}">
                            <i class="fas fa-times"></i>
                        </button>
                        <small class="d-block text-truncate mt-1">${archivo.nombre}</small>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        previewContainer.html(html);

        $('.btn-eliminar-archivo').off('click').on('click', function() {
            const index = $(this).data('index');
            u_profesor.eliminarArchivo(index);
        });
    }

    static eliminarArchivo(index) {
        if (u_profesor.archivosSeleccionados[index].preview) {
            URL.revokeObjectURL(u_profesor.archivosSeleccionados[index].preview);
        }
        
        u_profesor.archivosSeleccionados.splice(index, 1);
        u_profesor.actualizarPrevisualizacion();
    }

    static limpiarArchivos() {
        u_profesor.archivosSeleccionados.forEach(archivo => {
            if (archivo.preview) {
                URL.revokeObjectURL(archivo.preview);
            }
        });
        
        u_profesor.archivosSeleccionados = [];
        $('#campoArchivoFoto').val('');
        u_profesor.actualizarPrevisualizacion();
    }

    static obtenerArchivosParaEnviar() {
        return u_profesor.archivosSeleccionados.map(item => item.archivo);
    }

    static configurarSubidaImagen() {
        $('#añadirImagen').off('click').on('click', function() {
            $('#campoArchivoFotoPerfil').click();
        });

        $('#campoArchivoFotoPerfil').off('change').on('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                if (!archivo.type.match('image.*')) {
                    Alerta.advertencia('Formato no válido', 'Solo se permiten imágenes PNG, JPG o JPEG');
                    $(this).val('');
                    return;
                }
                
                if (archivo.size > 2 * 1024 * 1024) {
                    Alerta.advertencia('Imagen muy grande', 'La imagen no debe superar los 2MB');
                    $(this).val('');
                    return;
                }
                
                $('#formProfesor').data('imagen-perfil', archivo);
                
                const lector = new FileReader();
                lector.onload = function(e) {
                    $('#contenedorFotoPerfil').html(`
                        <div class="position-relative">
                            <img src="${e.target.result}" class="img-fluid rounded-3 border border-2 border-warning" 
                                style="width: 120px; height: 120px; object-fit: cover;">
                            <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0" 
                                    style="width: 24px; height: 24px;" id="btnEliminarImagenTemp">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `);
                    
                    $('#btnEliminarImagenTemp').off('click').on('click', function() {
                        u_profesor.limpiarImagen();
                    });
                };
                lector.readAsDataURL(archivo);
            }
        });
    }

    static obtenerImagenParaSubir() { 
        return $('#formProfesor').data('imagen-perfil'); 
    }

    static limpiarImagen() {
        $('#contenedorFotoPerfil').html(`
            <div class="d-flex justify-content-center align-items-center bg-light rounded-3 border" 
                style="width: 120px; height: 120px;">
                <i class="fas fa-user text-secondary" style="font-size: 3rem;"></i>
            </div>
        `);
        $('#campoArchivoFotoPerfil').val('');
        $('#formProfesor').removeData('imagen-perfil');
    }

    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevoProfesorLabel').text('Editar profesor');
            $('#btnGuardarProfesor').text('Actualizar Profesor');
        } else {
            $('#modalNuevoProfesorLabel').text('Agregar nuevo profesor');
            $('#btnGuardarProfesor').text('Guardar Profesor');
        }
    }

    static limpiarModal() {
        $('#formProfesor')[0].reset();
        
        $('#generosProfesor').val('Ninguno');
        $('#tiposFormacionesProfesor').val('Ninguno');
        $('#nivelesFormacionesProfesor').val('Ninguno');
        $('#responsabilidadProfesor').val('Ninguno');
        $('#rolUsuario').val('Profesor');
        
        this.limpiarDepartamentoSeleccionado();
        
        $('.errorMensaje').text('').addClass('d-none');
        
        $('#formProfesor input, #formProfesor select, #formProfesor textarea')
            .removeClass('border-success border-danger');
        
        u_profesor.limpiarArchivos();
        u_profesor.limpiarImagen();
        
        u_profesor.reiniciarSecciones();
        
        $('#formProfesor').removeData('contrasena-generada');
    }

    static prepararNuevoUsuario() {
        const nuevaContrasena = u_profesor.generarContrasena(10);
        $('#formProfesor').data('contrasena-generada', nuevaContrasena);
    }

    static generarContrasena(longitud = 10) {
        const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const minusculas = 'abcdefghijklmnopqrstuvwxyz';
        const numeros = '0123456789';
        const especiales = '!@#$%^&*';
        let contrasena = '';
        
        contrasena += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
        contrasena += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
        contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));
        contrasena += especiales.charAt(Math.floor(Math.random() * especiales.length));
        
        const todos = mayusculas + minusculas + numeros + especiales;
        for (let i = 4; i < longitud; i++) {
            contrasena += todos.charAt(Math.floor(Math.random() * todos.length));
        }
        
        return contrasena.split('').sort(() => 0.5 - Math.random()).join('');
    }

    static obtenerContrasenaGenerada() { 
        return $('#formProfesor').data('contrasena-generada'); 
    }

    static validarFormularioCompleto(modoEdicion = false) {
        const seccion1Valida = u_profesor.validarSeccion1();
        const seccion2Valida = u_profesor.validarSeccion2();
        const seccion3Valida = u_profesor.validarSeccion3();
        
        if (modoEdicion) {
            return seccion1Valida && seccion2Valida && seccion3Valida;
        }
        
        const contrasenaGenerada = u_profesor.obtenerContrasenaGenerada();
        return seccion1Valida && seccion2Valida && seccion3Valida && contrasenaGenerada;
    }

    static generarBotonesProfesor(id) {
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-info ver-detalles-profesor" title="Ver detalles" data-id="${id}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning editar-profesor" title="Editar" data-id="${id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    static actualizarTablaProfesores(dataTable, profesores, departamentos) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (!profesores || profesores.length === 0) {
            dataTable.draw();
            return;
        }

        profesores.forEach(p => {
            const depto = departamentos.find(d => d.idDepartamento == p.idDepartamento);
            const nombreDepto = depto ? depto.nombre : 'Sin departamento';
            
            const fila = [
                `${p.nombreProfesor || ''} ${p.apellidosProfesor || ''}`,
                p.responsabilidad || 'Ninguna',
                nombreDepto,
                u_profesor.generarBotonesProfesor(p.idProfesor)
            ];
            
            dataTable.row.add(fila).draw(false);
        });
        
        dataTable.draw();
    }

    static generarDetallesProfesorHTML(profesor, usuario, formacion, departamento) {
        let fechaIngreso = 'No disponible';
        if (usuario?.fechaCreacion) {
            try {
                fechaIngreso = new Date(usuario.fechaCreacion).toLocaleDateString();
            } catch (e) {
                fechaIngreso = usuario.fechaCreacion;
            }
        }

        const fotoPerfil = usuario?.foto ? 
            `/guniversidadfrontend/public/img/${usuario.foto}` : 
            '../../../public/img/undraw_profile.svg';

        return `
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="imgCarnet">
                    <img src="${fotoPerfil}" alt="Foto profesor" class="img-fluid rounded-circle" 
                         onerror="this.onerror=null; this.src='../../../public/img/undraw_profile.svg';">
                </div>
                <div>
                    <span class="fs-4 fw-bold">${profesor.nombreProfesor || ''} ${profesor.apellidosProfesor || ''}</span><br>
                    <span class="fs-6 text-muted">${usuario?.correo || profesor.correoProfesor || 'Sin correo'}</span>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <h6 class="bg-warning p-2 rounded">Datos Personales</h6>
                    <table class="table table-sm">
                        <tr><th>DIP:</th><td>${profesor.dipProfesor || 'No disponible'}</td></tr>
                        <tr><th>Nacionalidad:</th><td>${profesor.nacionalidad || 'No disponible'}</td></tr>
                        <tr><th>Género:</th><td>${profesor.genero || 'No disponible'}</td></tr>
                        <tr><th>Teléfono:</th><td>${profesor.telefonoProfesor || 'No disponible'}</td></tr>
                    </table>
                </div>
                
                <div class="col-md-6">
                    <h6 class="bg-warning p-2 rounded">Datos de Formación</h6>
                    <table class="table table-sm">
                        <tr><th>Institución:</th><td>${formacion?.institucion || 'No disponible'}</td></tr>
                        <tr><th>Tipo/Nivel:</th><td>${formacion?.tipoFormacion || ''} - ${formacion?.nivel || ''}</td></tr>
                        <tr><th>Título:</th><td>${formacion?.titulo || 'No disponible'}</td></tr>
                        <tr><th>Especialidad:</th><td>${profesor.especialidad || 'No disponible'}</td></tr>
                        <tr><th>Grado:</th><td>${profesor.gradoEstudio || 'No disponible'}</td></tr>
                    </table>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-12">
                    <h6 class="bg-warning p-2 rounded">Datos Laborales</h6>
                    <table class="table table-sm">
                        <tr><th>Departamento:</th><td>${departamento?.nombre || 'No asignado'}</td></tr>
                        <tr><th>Responsabilidad:</th><td>${profesor.responsabilidad || 'Ninguna'}</td></tr>
                        <tr><th>Fecha de ingreso:</th><td>${fechaIngreso}</td></tr>
                    </table>
                </div>
            </div>
        `;
    }

    static cargarDatosEnModal(profesor, usuario, formacion, departamento, facultades) {
        this.limpiarModal();

        const baseUrl = '/guniversidadfrontend/public/img/';
        
        $('#nombreProfesor').val(profesor.nombreProfesor || '');
        $('#apellidosProfesor').val(profesor.apellidosProfesor || '');
        $('#dipProfesor').val(profesor.dipProfesor || '');
        $('#nacionalidadProfesor').val(profesor.nacionalidad || '');
        $('#generosProfesor').val(profesor.genero || 'Ninguno');
        $('#correoProfesor').val(profesor.correoProfesor || '');
        $('#telefonoProfesor').val(profesor.telefonoProfesor || '');
        
        $('#nombreProfesor, #apellidosProfesor, #dipProfesor, #nacionalidadProfesor, #correoProfesor, #telefonoProfesor').trigger('input');
        $('#generosProfesor').trigger('change');
        
        if (formacion) {
            $('#institucionFormacionProfesor').val(formacion.institucion || '');
            $('#tiposFormacionesProfesor').val(formacion.tipoFormacion || 'Ninguno');
            $('#nivelesFormacionesProfesor').val(formacion.nivel || 'Ninguno');
            $('#titulosProfesor').val(formacion.titulo || '');
        }
        
        $('#especialidadFormacionProfesor').val(profesor.especialidad || '');
        $('#gradoFormacionProfesor').val(profesor.gradoEstudio || '');
        
        if (departamento) {
            this.setDepartamentoSeleccionado(departamento.idDepartamento, departamento.nombre);
        }
        
        $('#responsabilidadProfesor').val(profesor.responsabilidad || 'Ninguno');
        
        $('#institucionFormacionProfesor, #titulosProfesor, #especialidadFormacionProfesor, #gradoFormacionProfesor').trigger('input');
        $('#tiposFormacionesProfesor, #nivelesFormacionesProfesor, #responsabilidadProfesor').trigger('change');
        
        if (usuario) {
            if (usuario.correo && usuario.correo.includes('@')) {
                $('#nombreOCorreoUsuario').val(usuario.correo);
            } else {
                $('#nombreOCorreoUsuario').val(usuario.nombreUsuario || '');
            }
            
            $('#rolUsuario').val('Profesor');
            
            if (usuario.foto) {
                const fotoNombre = baseUrl + usuario.foto;
                $('#contenedorFotoPerfil').html(`
                    <div class="position-relative">
                        <img src="${fotoNombre}" class="img-fluid rounded-3 border border-2 border-warning" 
                            style="width: 120px; height: 120px; object-fit: cover;"
                            onerror="this.onerror=null; this.src='../../../public/img/undraw_profile.svg';">
                    </div>
                `);
            }
        }
        
        $('#nombreOCorreoUsuario').trigger('input');
        $('#rolUsuario').trigger('change');
        
        $('#formProfesor').removeData('contrasena-generada');
    }
}
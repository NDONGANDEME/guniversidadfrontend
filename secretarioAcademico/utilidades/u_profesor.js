import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class u_profesor {
    
    // ========== VARIABLES ESTÁTICAS ==========
    static archivosSeleccionados = [];
    static departamentosDisponibles = [];
    static filteredDepartamentos = [];
    static currentSection = 0;
    static secciones = ['#seccion1', '#seccion2', '#seccion3'];

    // ========== VALIDACIONES ==========
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarApellidos(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarDIP(valor) {
        // Formato: 000 000 000
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
        return valor && valor !== '';
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

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Sección 1 - Datos personales
        $('#nombreProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreProfesor', '#errorNombreProfesor', 'Mínimo 3 caracteres');
        });

        $('#apellidosProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarApellidos(valor);
            u_utiles.colorearCampo(valido, '#apellidosProfesor', '#errorApellidosProfesor', 'Mínimo 3 caracteres');
        });

        $('#dipProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarDIP(valor);
            u_utiles.colorearCampo(valido, '#dipProfesor', '#errorDipProfesor', 'Formato: 000 000 000');
        });

        $('#nacionalidadProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarNacionalidad(valor);
            u_utiles.colorearCampo(valido, '#nacionalidadProfesor', '#errorNacionalidadProfesor', 'Mínimo 3 caracteres');
        });

        $('#generosProfesor').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_profesor.validarGenero(valor);
            u_utiles.colorearCampo(valido, '#generosProfesor', '#errorGenerosProfesor', 'Seleccione un género');
        });

        $('#correoProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarCorreo(valor);
            u_utiles.colorearCampo(valido, '#correoProfesor', '#errorCorreoProfesor', 'Correo inválido');
        });

        $('#telefonoProfesor').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarTelefono(valor);
            u_utiles.colorearCampo(valido, '#telefonoProfesor', '#errorTelefonoProfesor', 'Formato: +240 222 123 456');
        });

        // Sección 2 - Datos de formación
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

        // Sección 3 - Datos de usuario
        $('#nombreOCorreoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_profesor.validarNombreOCorreo(valor);
            u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 'Nombre de usuario o correo inválido');
        });

        $('#rolUsuario').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_profesor.validarRol(valor);
            u_utiles.colorearCampo(valido, '#rolUsuario', '#errorRolUsuario', 'Debe seleccionar Profesor');
        });
    }

    // ========== VALIDAR SECCIÓN COMPLETA ==========
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
               u_profesor.validarDepartamento($('#comboDepartamentosProfesor').data('selected')) &&
               u_profesor.validarResponsabilidad($('#responsabilidadProfesor').val()) &&
               u_profesor.validarEspecialidad($('#especialidadFormacionProfesor').val().trim()) &&
               u_profesor.validarGradoEstudio($('#gradoFormacionProfesor').val().trim());
    }

    static validarSeccion3() {
        return u_profesor.validarNombreOCorreo($('#nombreOCorreoUsuario').val().trim()) &&
               u_profesor.validarRol($('#rolUsuario').val());
    }

    // ========== MANEJO DE SECCIONES ==========
    static mostrarSeccion(index) {
        // Ocultar todas las secciones
        u_profesor.secciones.forEach(sec => {
            $(sec).removeClass('active').hide();
        });

        // Mostrar la sección actual
        $(u_profesor.secciones[index]).addClass('active').show();

        // Actualizar botones
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
            // Validar sección actual antes de avanzar
            let valida = false;
            switch(u_profesor.currentSection) {
                case 0:
                    valida = u_profesor.validarSeccion1();
                    if (!valida) Alerta.advertencia('Campos incompletos', 'Complete todos los campos de la sección correctamente');
                    break;
                case 1:
                    valida = u_profesor.validarSeccion2();
                    if (!valida) Alerta.advertencia('Campos incompletos', 'Complete todos los campos de la sección correctamente');
                    break;
            }
            
            if (valida) {
                u_profesor.currentSection++;
                u_profesor.mostrarSeccion(u_profesor.currentSection);
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

    // ========== MANEJO DE DEPARTAMENTOS (COMBO) ==========
    static inicializarComboDepartamentos() {
        const input = $('#comboDepartamentosProfesor');
        const dropdown = $('#opcionesDepartamentosProfesor');

        input.off('focus').on('focus', function() {
            u_profesor.mostrarDropdownDepartamentos();
        });

        input.off('keyup').on('keyup', function(e) {
            if (e.key === 'Escape') {
                u_profesor.ocultarDropdownDepartamentos();
            } else {
                u_profesor.filtrarDepartamentos($(this).val());
            }
        });

        // Cerrar al hacer clic fuera
        $(document).off('click').on('click', function(e) {
            if (!$(e.target).closest('.combo-input-wrapper').length) {
                u_profesor.ocultarDropdownDepartamentos();
            }
        });
    }

    static cargarDepartamentos(departamentos) {
        u_profesor.departamentosDisponibles = departamentos;
        u_profesor.filteredDepartamentos = departamentos;
        u_profesor.renderizarDropdownDepartamentos();
    }

    static filtrarDepartamentos(searchTerm) {
        const term = searchTerm.toLowerCase();
        u_profesor.filteredDepartamentos = u_profesor.departamentosDisponibles.filter(d => 
            d.nombre.toLowerCase().includes(term)
        );
        u_profesor.renderizarDropdownDepartamentos();
        u_profesor.mostrarDropdownDepartamentos();
    }

    static renderizarDropdownDepartamentos() {
        const dropdown = $('#opcionesDepartamentosProfesor');
        dropdown.empty();

        if (u_profesor.filteredDepartamentos.length === 0) {
            dropdown.append('<div class="dropdown-option no-results">No se encontraron departamentos</div>');
        } else {
            u_profesor.filteredDepartamentos.forEach(d => {
                const option = $(`<div class="dropdown-option" data-id="${d.idDepartamento}">${d.nombre}</div>`);
                option.on('click', function() {
                    u_profesor.seleccionarDepartamento(d.idDepartamento, d.nombre);
                });
                dropdown.append(option);
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
        u_profesor.ocultarDropdownDepartamentos();
        
        // Validar campo
        u_utiles.colorearCampo(true, '#comboDepartamentosProfesor', '#errorDepartamentosProfesor', '');
    }

    static getDepartamentoSeleccionado() {
        return $('#comboDepartamentosProfesor').data('selected');
    }

    // ========== MANEJO DE ARCHIVOS ==========
    static configurarSubidaArchivos() {
        // Al hacer clic en el área de drop
        $('#fileDropArea').off('click').on('click', function() {
            $('#campoArchivoFoto').click();
        });

        // Eventos de arrastrar y soltar
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

        // Cuando se seleccionan archivos con el input
        $('#campoArchivoFoto').off('change').on('change', function(e) {
            const archivos = e.target.files;
            u_profesor.procesarArchivos(archivos);
        });

        // Botón limpiar archivos
        $('#btnLimpiarArchivos').off('click').on('click', function() {
            u_profesor.limpiarArchivos();
        });
    }

    static procesarArchivos(archivos) {
        if (!archivos || archivos.length === 0) return;

        // Verificar límite de archivos (máx 10)
        if (u_profesor.archivosSeleccionados.length + archivos.length > 10) {
            alert('Solo puede seleccionar hasta 10 archivos');
            return;
        }

        // Formatos permitidos
        const formatosPermitidos = ['application/pdf', 'image/png', 'image/jpeg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        
        for (let archivo of archivos) {
            if (!formatosPermitidos.includes(archivo.type) && !archivo.type.startsWith('image/')) {
                alert(`Formato no permitido: ${archivo.name}`);
                continue;
            }

            // Crear preview según tipo
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

        // Agregar eventos a los botones de eliminar
        $('.btn-eliminar-archivo').off('click').on('click', function() {
            const index = $(this).data('index');
            u_profesor.eliminarArchivo(index);
        });
    }

    static eliminarArchivo(index) {
        // Liberar la URL del objeto si es imagen
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

    // ========== MANEJO DE IMAGEN DE PERFIL ==========
    static configurarSubidaImagen() {
        $('#añadirImagen').off('click').on('click', function() {
            $('#campoArchivoFotoPerfil').click();
        });

        $('#campoArchivoFotoPerfil').off('change').on('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                const lector = new FileReader();
                lector.onload = function(e) {
                    $('#contenedorFotoPerfil').html(`<img src="${e.target.result}" class="img-fluid rounded-3" style="max-height: 100px;">`);
                };
                lector.readAsDataURL(archivo);
            }
        });
    }

    static limpiarImagen() {
        $('#contenedorFotoPerfil').html('<i class="fas fa-user"></i>');
        $('#campoArchivoFotoPerfil').val('');
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevoProfesorLabel').text('Editar profesor');
            $('#btnGuardarProfesor').text('Actualizar Profesor');
        } else {
            $('#modalNuevoProfesorLabel').text('Agregar nuevo profesor');
            $('#btnGuardarProfesor').text('Guardar Profesor');
        }
    }

    // ========== LIMPIAR MODAL ==========
    static limpiarModal() {
        $('#formMatricula')[0].reset();
        
        // Limpiar selects
        $('#generosProfesor').val('Ninguno');
        $('#tiposFormacionesProfesor').val('Ninguno');
        $('#nivelesFormacionesProfesor').val('Ninguno');
        $('#responsabilidadProfesor').val('Ninguno');
        $('#rolUsuario').val('Ninguno');
        
        // Limpiar combo departamentos
        $('#comboDepartamentosProfesor').val('').removeData('selected');
        
        // Limpiar mensajes de error
        $('.errorMensaje').text('').hide();
        
        // Limpiar clases de validación
        $('#formMatricula input, #formMatricula select, #formMatricula textarea')
            .removeClass('border-success border-danger');
        
        // Limpiar archivos
        u_profesor.limpiarArchivos();
        u_profesor.limpiarImagen();
        
        // Reiniciar secciones
        u_profesor.reiniciarSecciones();
    }

    // ========== CARGAR FACULTADES EN SELECT ==========
    static cargarFacultadesEnSelect(facultades, selectId) {
        const select = $(selectId);
        select.empty();
        select.append('<option value="">Seleccione facultad...</option>');
        
        facultades.forEach(f => {
            select.append(`<option value="${f.idFacultad}">${f.nombreFacultad}</option>`);
        });
    }

    // ========== GENERAR BOTONES PARA TABLA ==========
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

    // ========== ACTUALIZAR TABLA DE PROFESORES ==========
    static actualizarTablaProfesores(dataTable, profesores, departamentos) {
        if (!dataTable) return;
        
        dataTable.clear();
        
        if (!profesores || profesores.length === 0) {
            dataTable.draw();
            return;
        }

        profesores.forEach(p => {
            // Buscar nombre del departamento
            const depto = departamentos.find(d => d.idDepartamento == p.idDepartamento);
            const nombreDepto = depto ? depto.nombre : 'Sin departamento';
            
            const fila = [
                `${p.nombreProfesor || ''} ${p.apellidosProfesor || ''}`,
                p.responsabilidad || 'Ninguna',
                nombreDepto,
                u_profesor.generarBotonesProfesor(p.idProfesor)
            ];
            
            const nodoFila = dataTable.row.add(fila).draw(false).node();
        });
        
        dataTable.draw();
    }

    // ========== GENERAR HTML PARA DETALLES ==========
    static generarDetallesProfesorHTML(profesor, usuario, formacion, departamento) {
        // Formatear fecha si existe
        let fechaIngreso = 'No disponible';
        if (usuario?.ultimoAcceso) {
            try {
                fechaIngreso = new Date(usuario.ultimoAcceso).toLocaleDateString();
            } catch (e) {
                fechaIngreso = usuario.ultimoAcceso;
            }
        }

        return `
            <div class="d-flex align-items-center gap-3 mb-4">
                <div class="imgCarnet">
                    ${usuario?.foto ? 
                        `<img src="${usuario.foto}" alt="Foto profesor" class="img-fluid rounded-circle">` : 
                        `<img src="../../../public/img/undraw_profile.svg" alt="Foto carnet">`
                    }
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
                        <tr>
                            <th>DIP:</th>
                            <td>${profesor.dipProfesor || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Nacionalidad:</th>
                            <td>${profesor.nacionalidad || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Género:</th>
                            <td>${profesor.genero || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Teléfono:</th>
                            <td>${profesor.telefonoProfesor || 'No disponible'}</td>
                        </tr>
                    </table>
                </div>
                
                <div class="col-md-6">
                    <h6 class="bg-warning p-2 rounded">Datos de Formación</h6>
                    <table class="table table-sm">
                        <tr>
                            <th>Institución:</th>
                            <td>${formacion?.institucion || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Tipo/Nivel:</th>
                            <td>${formacion?.tipoFormacion || ''} - ${formacion?.nivel || ''}</td>
                        </tr>
                        <tr>
                            <th>Título:</th>
                            <td>${formacion?.titulo || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Especialidad:</th>
                            <td>${profesor.especialidad || 'No disponible'}</td>
                        </tr>
                        <tr>
                            <th>Grado:</th>
                            <td>${profesor.gradoEstudio || 'No disponible'}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-12">
                    <h6 class="bg-warning p-2 rounded">Datos Laborales</h6>
                    <table class="table table-sm">
                        <tr>
                            <th>Departamento:</th>
                            <td>${departamento?.nombre || 'No asignado'}</td>
                        </tr>
                        <tr>
                            <th>Responsabilidad:</th>
                            <td>${profesor.responsabilidad || 'Ninguna'}</td>
                        </tr>
                        <tr>
                            <th>Fecha de ingreso:</th>
                            <td>${fechaIngreso}</td>
                        </tr>
                    </table>
                </div>
            </div>
        `;
    }
}
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_rol } from "../modelo/m_permiso.js";

export class u_usuario {
    
    // ========== ARCHIVOS ==========
    static fotoSeleccionada = null;
    static fotoPreview = null;

    // ========== VALIDACIONES ==========
    static validarNombreOCorreo(valor) {
        return u_verificaciones.validarNombreOCorreo(valor);
    }
    
    static validarRol(valor) {
        return valor && valor !== 'Ninguno';
    }
    
    static validarNombre(valor) {
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarApellidos(valor) {
        return valor.trim().length >= 3;
    }
    
    static validarCorreo(valor) {
        return u_verificaciones.validarCorreo(valor);
    }
    
    static validarTelefono(valor) {
        return u_verificaciones.validarTelefono(valor);
    }

    static requiereDatosPersonales(rol) {
        return !['Ninguno', 'Estudiante', 'Profesor'].includes(rol);
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        // Validación del nombre o correo
        $('#nombreOCorreoUsuario').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarNombreOCorreo(valor);
            u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 'Nombre de usuario o correo inválido');
        });

        // Validación del rol
        $('#rolUsuario').on('change', function() {
            const valor = $(this).val();
            const valido = u_usuario.validarRol(valor);
            u_utiles.colorearCampo(valido, '#rolUsuario', '#errorRolUsuario', 'Seleccione un rol');
        });

        // Validaciones del panel de datos personales
        $('#nombreUsuario').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarNombre(valor);
            u_utiles.colorearCampo(valido, '#nombreUsuario', '#errorNombreUsuario', 'Nombre inválido (mínimo 3 caracteres)');
        });

        $('#apellidosUsuario').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarApellidos(valor);
            u_utiles.colorearCampo(valido, '#apellidosUsuario', '#errorApellidosUsuario', 'Apellidos inválidos (mínimo 3 caracteres)');
        });

        $('#correoUsuario').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarCorreo(valor);
            u_utiles.colorearCampo(valido, '#correoUsuario', '#errorCorreoUsuario', 'Correo inválido');
        });

        $('#telefonoUsuario').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarTelefono(valor);
            u_utiles.colorearCampo(valido, '#telefonoUsuario', '#errorTelefonoUsuario', 'Teléfono inválido (ej: +240 222 123 456)');
        });

        $('#facultadesUsuario').on('change', function() {
            const valor = $(this).val();
            const valido = valor && valor !== '';
            u_utiles.colorearCampo(valido, '#facultadesUsuario', '#errorFacultadesUsuario', 'Seleccione una facultad');
        });
    }

    // ========== MOSTRAR/OCULTAR PANEL DATOS PERSONALES ==========
    static mostrarOcultarPanelDatosPersonales(rol) {
        if (u_usuario.requiereDatosPersonales(rol)) {
            $('#panelDatosPersonales').removeClass('d-none');
            
            // Hacer requeridos los campos
            $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').prop('required', true);
        } else {
            $('#panelDatosPersonales').addClass('d-none');
            
            // Quitar requerido
            $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').prop('required', false);
        }
    }

    // ========== CARGAR FACULTADES EN SELECT ==========
    static cargarFacultadesEnSelect(facultades) {
        const select = $('#facultadesUsuario');
        select.empty();
        select.append('<option value="">Seleccione una facultad...</option>');
        
        facultades.forEach(facultad => {
            select.append(`<option value="${facultad.idFacultad}">${facultad.nombreFacultad}</option>`);
        });
    }

    // ========== CARGAR ROLES EN SELECT ==========
    static async cargarRolesEnSelect() {
        try {
            const roles = await m_rol.obtenerRoles();
            const select = $('#rolUsuario');
            select.empty();
            select.append('<option value="Ninguno">Seleccione...</option>');
            
            roles.forEach(rol => {
                select.append(`<option value="${rol.idRol}">${rol.nombreRol}</option>`);
            });
        } catch (error) {
            console.error('Error al cargar roles:', error);
            Alerta.error('Error', 'No se pudieron cargar los roles');
        }
    }

    // ========== CONFIGURAR SUBIDA DE ARCHIVOS ==========
    static configurarSubidaArchivos() {
        // Al hacer clic en el área de añadir imagen
        $('#añadirImagen').on('click', function() {
            $('#campoArchivoFotoPerfil').click();
        });

        // Cuando se selecciona un archivo
        $('#campoArchivoFotoPerfil').on('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                u_usuario.procesarFoto(archivo);
            }
        });

        // Drag and drop sobre el contenedor de foto
        $('#contenedorFotoPerfil').on('dragover', function(e) {
            e.preventDefault();
            $(this).addClass('border-success');
        });

        $('#contenedorFotoPerfil').on('dragleave', function(e) {
            e.preventDefault();
            $(this).removeClass('border-success');
        });

        $('#contenedorFotoPerfil').on('drop', function(e) {
            e.preventDefault();
            $(this).removeClass('border-success');
            
            const archivo = e.originalEvent.dataTransfer.files[0];
            if (archivo) {
                u_usuario.procesarFoto(archivo);
                // También actualizar el input file
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(archivo);
                $('#campoArchivoFotoPerfil')[0].files = dataTransfer.files;
            }
        });
    }

    static procesarFoto(archivo) {
        // Validar formato
        const formatosPermitidos = ['image/png', 'image/jpeg', 'image/jpg'];
        
        if (!formatosPermitidos.includes(archivo.type)) {
            Alerta.notificarAdvertencia('Formato no permitido. Solo PNG, JPG, JPEG', 2000);
            return;
        }

        // Validar tamaño (máx 2MB)
        if (archivo.size > 2 * 1024 * 1024) {
            Alerta.notificarAdvertencia('La imagen no debe superar los 2MB', 2000);
            return;
        }

        // Guardar archivo
        u_usuario.fotoSeleccionada = archivo;

        // Crear preview
        if (u_usuario.fotoPreview) {
            URL.revokeObjectURL(u_usuario.fotoPreview);
        }
        
        u_usuario.fotoPreview = URL.createObjectURL(archivo);
        
        // Actualizar vista
        const contenedor = $('#contenedorFotoPerfil');
        contenedor.html(`
            <img src="${u_usuario.fotoPreview}" class="img-fluid rounded-3" style="width: 120px; height: 120px; object-fit: cover;">
        `);
    }

    static obtenerFotoParaEnviar() {
        return u_usuario.fotoSeleccionada;
    }

    static limpiarArchivos() {
        if (u_usuario.fotoPreview) {
            URL.revokeObjectURL(u_usuario.fotoPreview);
        }
        u_usuario.fotoSeleccionada = null;
        u_usuario.fotoPreview = null;
        $('#campoArchivoFotoPerfil').val('');
        
        // Restaurar ícono por defecto
        $('#contenedorFotoPerfil').html(`
            <div class="d-flex justify-content-center align-items-center bg-light rounded-3 border w-100" style="width: 120px; height: 120px;">
                <i class="fas fa-user text-secondary" style="font-size: 3rem;"></i>
            </div>
        `);
    }

    // ========== GENERAR CONTRASEÑA ALEATORIA ==========
    static generarContraseñaAleatoria(longitud = 10) {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let contraseña = '';
        for (let i = 0; i < longitud; i++) {
            contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return contraseña;
    }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevoUsuarioLabel').text('Editar usuario');
            $('#btnGuardarUsuario').text('Actualizar Usuario');
        } else {
            $('#modalNuevoUsuarioLabel').text('Nuevo usuario');
            $('#btnGuardarUsuario').text('Guardar Usuario');
        }
    }

    // ========== GENERAR HTML PARA TARJETAS ==========
    static crearTarjetaUsuarioHTML(usuario) {
        // Foto de perfil
        let fotoHtml = '<i class="fas fa-user-circle fa-4x text-muted"></i>';
        
        if (usuario.foto) {
            const fotoUrl = usuario.foto.url_completa || (usuario.foto.nombre ? `/guniversidadfrontend/public/img/usuarios/${usuario.foto.nombre}` : '');
            if (fotoUrl) {
                fotoHtml = `<img src="${fotoUrl}" class="card-img-top rounded-circle" style="width: 80px; height: 80px; object-fit: cover; margin: 0 auto;" onerror="this.src='/guniversidadfrontend/public/img/escudo_AAUCA.jpg'">`;
            }
        }

        // Badge de estado
        const estadoBadge = usuario.estado === 'Activo' 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm usuario-card" data-id="${usuario.idUsuario}">
                    <div class="card-body text-center">
                        <div class="mb-3 d-flex justify-content-center">
                            ${fotoHtml}
                        </div>
                        <h5 class="card-title">${usuario.nombreUsuario}</h5>
                        <p class="card-text text-muted small">${usuario.correo || 'Sin correo'}</p>
                        <div class="d-flex justify-content-center gap-2 mb-2">
                            <span class="badge bg-warning text-dark">${usuario.rol}</span>
                            ${estadoBadge}
                        </div>
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            <button class="btn btn-sm btn-outline-info ver-detalles-usuario" title="Ver detalles" data-id="${usuario.idUsuario}" data-bs-toggle="modal" data-bs-target="#modalVerUsuario">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning editar-usuario" title="Editar" data-id="${usuario.idUsuario}" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-${usuario.estado === 'Activo' ? 'danger' : 'success'} eliminar-usuario" title="${usuario.estado === 'Activo' ? 'Deshabilitar' : 'Habilitar'}" data-id="${usuario.idUsuario}">
                                <i class="fas fa-${usuario.estado === 'Activo' ? 'ban' : 'check-circle'}"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== GENERAR HTML PARA LISTA ==========
    static crearFilaListaHTML(usuario) {
        const estadoBadge = usuario.estado === 'Activo' 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        return `
            <tr>
                <td>${usuario.idUsuario}</td>
                <td>${usuario.nombreUsuario}</td>
                <td>${usuario.correo || '-'}</td>
                <td><span class="badge bg-warning text-dark">${usuario.rol}</span></td>
                <td>${estadoBadge}</td>
                <td>${usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleDateString() : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info ver-detalles-usuario" title="Ver detalles" data-id="${usuario.idUsuario}" data-bs-toggle="modal" data-bs-target="#modalVerUsuario">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning editar-usuario" title="Editar" data-id="${usuario.idUsuario}" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-${usuario.estado === 'Activo' ? 'danger' : 'success'} eliminar-usuario" title="${usuario.estado === 'Activo' ? 'Deshabilitar' : 'Habilitar'}" data-id="${usuario.idUsuario}">
                        <i class="fas fa-${usuario.estado === 'Activo' ? 'ban' : 'check-circle'}"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    // ========== RENDERIZAR TARJETAS ==========
    static renderizarTarjetas(usuarios, contenedorId = '#contenedorUsuarios') {
        const contenedor = $(contenedorId);
        contenedor.empty();
        
        if (!usuarios || usuarios.length === 0) {
            contenedor.html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-users-slash fa-4x text-muted mb-3"></i>
                    <h3 class="text-muted">No hay usuarios disponibles</h3>
                </div>
            `);
            return;
        }

        usuarios.forEach(usuario => {
            contenedor.append(this.crearTarjetaUsuarioHTML(usuario));
        });
    }

    // ========== RENDERIZAR LISTA ==========
    static renderizarLista(usuarios, contenedorId = '#contenedorUsuarios') {
        const contenedor = $(contenedorId);
        contenedor.empty();
        
        if (!usuarios || usuarios.length === 0) {
            contenedor.html(`
                <div class="col-12 text-center py-5">
                    <i class="fas fa-users-slash fa-4x text-muted mb-3"></i>
                    <h3 class="text-muted">No hay usuarios disponibles</h3>
                </div>
            `);
            return;
        }

        let html = `
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Usuario</th>
                            <th>Correo</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Último acceso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        usuarios.forEach(usuario => {
            html += this.crearFilaListaHTML(usuario);
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        contenedor.html(html);
    }

    // ========== PAGINACIÓN ==========
    static renderizarPaginacion(paginaActual, totalPaginas, callback, contenedorId = '#paginacion') {
        const contenedor = $(contenedorId);
        
        if (totalPaginas <= 1) {
            contenedor.empty();
            return;
        }

        let html = '<ul class="pagination justify-content-center">';

        // Botón anterior
        html += this.crearBotonPaginacion('«', paginaActual - 1, paginaActual === 1);

        // Botones de números
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
                html += this.crearBotonPaginacion(i, i, false, i === paginaActual);
            } else if (i === paginaActual - 3 || i === paginaActual + 3) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Botón siguiente
        html += this.crearBotonPaginacion('»', paginaActual + 1, paginaActual === totalPaginas);

        html += '</ul>';
        
        contenedor.html(html);

        // Agregar eventos
        contenedor.find('.page-link').on('click', function(e) {
            e.preventDefault();
            if ($(this).closest('.disabled').length) return;
            
            const nuevaPagina = parseInt($(this).data('pagina'));
            if (!isNaN(nuevaPagina) && callback) {
                callback(nuevaPagina);
            }
        });
    }

    static crearBotonPaginacion(texto, pagina, deshabilitado = false, activo = false) {
        let clases = 'page-item';
        if (deshabilitado) clases += ' disabled';
        if (activo) clases += ' active';

        return `
            <li class="${clases}">
                <a class="page-link" href="#" data-pagina="${pagina}" ${deshabilitado ? 'tabindex="-1"' : ''}>
                    ${texto}
                </a>
            </li>
        `;
    }

    // ========== LIMPIAR MODAL ==========
    static limpiarModal() {
        $('#formUsuario')[0].reset();
        $('#rolUsuario').val('Ninguno');
        $('.errorMensaje').text('').hide();
        $('#formUsuario input, #formUsuario textarea, #formUsuario select').removeClass('border-success border-danger');
        this.limpiarArchivos();
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    static cargarDatosEnModal(usuario) {
        $('#nombreOCorreoUsuario').val(usuario.nombreUsuario || '');
        $('#rolUsuario').val(usuario.rol || 'Ninguno');
        
        // Si hay datos administrativos
        if (usuario.datosAdministrativos) {
            $('#nombreUsuario').val(usuario.datosAdministrativos.nombre || '');
            $('#apellidosUsuario').val(usuario.datosAdministrativos.apellidos || '');
            $('#correoUsuario').val(usuario.datosAdministrativos.correo || '');
            $('#telefonoUsuario').val(usuario.datosAdministrativos.telefono || '');
            $('#facultadesUsuario').val(usuario.datosAdministrativos.idFacultad || '');
        }
        
        // Si hay foto
        if (usuario.foto) {
            const fotoUrl = usuario.foto.url_completa || (usuario.foto.nombre ? `/guniversidadfrontend/public/img/usuarios/${usuario.foto.nombre}` : '');
            if (fotoUrl) {
                $('#contenedorFotoPerfil').html(`
                    <img src="${fotoUrl}" class="img-fluid rounded-3" style="width: 120px; height: 120px; object-fit: cover;">
                `);
            }
        }
    }

    // ========== CONVERTIR DATOS DEL BACKEND ==========
    static async convertirAUsuarios(datosBackend) {
        if (!datosBackend || !Array.isArray(datosBackend)) return [];
        
        const baseUrl = '/guniversidadfrontend/public/img/usuarios/';
        
        return datosBackend.map(item => {
            let fotoProcesada = null;

            if (item.foto) {
                if (typeof item.foto === 'string') {
                    fotoProcesada = {
                        url: item.foto,
                        url_completa: baseUrl + item.foto,
                        nombre: item.foto
                    };
                } else if (item.foto && typeof item.foto === 'object') {
                    fotoProcesada = {
                        ...item.foto,
                        url_completa: item.foto.url ? baseUrl + item.foto.url : null
                    };
                }
            }
            
            return {
                idUsuario: item.idUsuario || item.id,
                nombreUsuario: item.nombreUsuario,
                contrasena: item.contrasena,
                correo: item.correo,
                rol: item.rol,
                foto: fotoProcesada,
                estado: item.estado || 'Activo',
                ultimoAcceso: item.ultimoAcceso,
                datosAdministrativos: item.datosAdministrativos || null
            };
        });
    }

    // ========== GENERAR HTML PARA DETALLES DE USUARIO ==========
    static crearDetallesUsuarioHTML(usuario) {
        let fotoHtml = '<i class="fas fa-user-circle fa-5x text-muted"></i>';
        
        if (usuario.foto) {
            const fotoUrl = usuario.foto.url_completa || (usuario.foto.nombre ? `/guniversidadfrontend/public/img/usuarios/${usuario.foto.nombre}` : '');
            if (fotoUrl) {
                fotoHtml = `<img src="${fotoUrl}" class="rounded-circle img-thumbnail" style="width: 120px; height: 120px; object-fit: cover;">`;
            }
        }

        const estadoBadge = usuario.estado === 'Activo' 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        let datosPersonalesHtml = '';
        if (usuario.datosAdministrativos) {
            datosPersonalesHtml = `
                <div class="mt-4">
                    <h6 class="border-bottom pb-2">Datos personales</h6>
                    <p><strong>Nombre completo:</strong> ${usuario.datosAdministrativos.nombre} ${usuario.datosAdministrativos.apellidos}</p>
                    <p><strong>Correo personal:</strong> ${usuario.datosAdministrativos.correo || '-'}</p>
                    <p><strong>Teléfono:</strong> ${usuario.datosAdministrativos.telefono || '-'}</p>
                    <p><strong>Facultad:</strong> ${usuario.datosAdministrativos.facultad || 'No asignada'}</p>
                </div>
            `;
        }

        return `
            <div class="text-center mb-3">
                ${fotoHtml}
            </div>
            <div class="text-center mb-3">
                <h4>${usuario.nombreUsuario}</h4>
                <p class="text-muted">${usuario.correo || 'Sin correo'}</p>
                <div class="d-flex justify-content-center gap-2">
                    <span class="badge bg-warning text-dark fs-6">${usuario.rol}</span>
                    ${estadoBadge}
                </div>
            </div>
            <div class="mt-3">
                <p><strong>ID de usuario:</strong> ${usuario.idUsuario}</p>
                <p><strong>Último acceso:</strong> ${usuario.ultimoAcceso ? new Date(usuario.ultimoAcceso).toLocaleString() : 'Nunca'}</p>
            </div>
            ${datosPersonalesHtml}
        `;
    }
}
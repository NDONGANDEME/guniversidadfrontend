import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { m_rol } from "../modelo/m_permiso.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class u_usuario 
{    
    // ========== ARCHIVOS ==========
    static fotoSeleccionada = null;
    static fotoPreview = null;
    static rolIncluido = '';
    static administrativoSeleccionado = null;
    static urlBase = '/guniversidadfrontend/public/img';

    // ========== FUNCIONES DE GENERACIÓN ==========
    /**
     * Genera un correo para la tabla USUARIO a partir de un nombre
     * @param {string} nombre - Nombre del usuario
     * @returns {string} Correo generado con dominio @sistema.com
     */
    static generarCorreoUsuario(nombre) {
        if (!nombre || typeof nombre !== 'string') return '';
        
        // Limpiar el nombre
        let nombreLimpio = nombre.trim().toLowerCase();
        
        // Eliminar tildes
        nombreLimpio = nombreLimpio.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        // Reemplazar espacios y caracteres especiales por puntos
        nombreLimpio = nombreLimpio
            .replace(/\s+/g, '.')           // espacios por puntos
            .replace(/[^a-z0-9.]/g, '')      // eliminar caracteres no alfanuméricos
            .replace(/\.+/g, '.')             // múltiples puntos por uno solo
            .replace(/^\.|\.$/g, '');         // eliminar puntos al inicio y final
        
        if (!nombreLimpio) nombreLimpio = 'usuario';
        
        return `${nombreLimpio}@sistema.com`;
    }

    /**
     * Genera un nombre de usuario a partir de un correo
     * @param {string} correo - Correo electrónico
     * @returns {string} Nombre de usuario formateado
     */
    static generarNombreUsuario(correo) {
        if (!correo || typeof correo !== 'string') return '';
        
        // Extraer la parte antes del @
        const partes = correo.trim().split('@');
        let nombreUsuario = partes[0];
        
        // Limpiar: reemplazar puntos y guiones por espacios
        nombreUsuario = nombreUsuario.replace(/[._-]/g, ' ').replace(/\s+/g, ' ').trim();
        
        // Capitalizar palabras
        nombreUsuario = nombreUsuario.split(' ').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
            .join(' ');
        
        return nombreUsuario || 'Usuario';
    }

    /**
     * Determina si el texto ingresado es correo o nombre y genera los campos
     */
    static generarCamposDesdeNombreOCorreo() {
        const texto = $('#nombreOCorreoUsuario').val().trim();
        if (!texto) return;

        const esCorreo = u_verificaciones.validarCorreo(texto);
        
        if (esCorreo) {
            const nombreGenerado = this.generarNombreUsuario(texto);
            $('#nombreOCorreoUsuario').val(nombreGenerado);
        }
    }

    // ========== VALIDACIONES ==========
    static validarNombreOCorreo(valor) { return u_verificaciones.validarNombreOCorreo(valor); }
    
    static validarRol(valor) { return valor && valor !== 'Ninguno' && valor !== ''; }
    
    static validarNombre(valor) { return u_verificaciones.validarNombre(valor); }
    
    static validarApellidos(valor) { return u_verificaciones.validarNombre(valor); }
    
    static validarCorreo(valor) { return u_verificaciones.validarCorreo(valor); }
    
    static validarTelefono(valor) { return u_verificaciones.validarTelefono(valor); }

    static async requiereDatosPersonales(rol) {
        if (!rol || rol === 'Ninguno') return false;
        
        const roles = await m_rol.obtenerRoles();
        let nombreRol = '';

        roles.forEach(r => {
            if (r.idRol == rol) {
                nombreRol = r.nombreRol;
            }
        });

        // Los roles que NO requieren datos personales
        const rolesSinDatosPersonales = ['Ninguno', 'Estudiante', 'Profesor', ''];
        return !rolesSinDatosPersonales.includes(nombreRol);
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static configurarValidaciones() {
        $('#nombreOCorreoUsuario').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarNombreOCorreo(valor);
            u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', 'Nombre de usuario o correo inválido');
        });

        $('#rolUsuario').on('change', function() {
            const valor = $(this).val();
            const valido = u_usuario.validarRol(valor);
            u_utiles.colorearCampo(valido, '#rolUsuario', '#errorRolUsuario', 'Seleccione un rol');
        });

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
    static async mostrarOcultarPanelDatosPersonales(rol) {
        if (!rol || rol === 'Ninguno') {
            $('#panelDatosPersonales').addClass('d-none');
            $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').prop('required', false);
            return;
        }
        
        const bool = await u_usuario.requiereDatosPersonales(rol);

        if (bool) {
            $('#panelDatosPersonales').removeClass('d-none');
            $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').prop('required', true);
        } else {
            $('#panelDatosPersonales').addClass('d-none');
            $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').prop('required', false);
        }
    }

    // ========== CARGAR FACULTADES ==========
    static cargarFacultadesEnSelect(facultades) {
        const select = $('#facultadesUsuario');
        select.empty();
        select.append('<option value="">Seleccione una facultad...</option>');
        
        facultades.forEach(facultad => {
            select.append(`<option value="${facultad.idFacultad}">${facultad.nombreFacultad}</option>`);
        });
    }

    // ========== CARGAR ROLES ==========
    static async cargarRolesEnSelect() {
        try {
            const roles = await m_rol.obtenerRoles();
            const select = $('#rolUsuario');
            const filtroRol = $('#filtroRol');

            select.empty();
            select.append('<option value="Ninguno">Seleccione...</option>');
            filtroRol.empty();
            filtroRol.append('<option value="">Todos los roles</option>');
            
            roles.forEach(rol => {
                select.append(`<option value="${rol.idRol}">${rol.nombreRol}</option>`);
                filtroRol.append(`<option value="${rol.idRol}">${rol.nombreRol}</option>`);
            });
        } catch (error) {
            Alerta.error('Error', `No se pudieron cargar los roles: ${error}`);
        }
    }

    // ========== CONFIGURAR SUBIDA DE ARCHIVOS ==========
    static configurarSubidaArchivos() {
        $('#añadirImagen').on('click', () => $('#campoArchivoFotoPerfil').click());

        $('#campoArchivoFotoPerfil').on('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) u_usuario.procesarFoto(archivo);
        });

        $('#contenedorFotoPerfil').on('dragover', (e) => {
            e.preventDefault();
            $(e.currentTarget).addClass('border-success');
        });

        $('#contenedorFotoPerfil').on('dragleave', (e) => {
            e.preventDefault();
            $(e.currentTarget).removeClass('border-success');
        });

        $('#contenedorFotoPerfil').on('drop', (e) => {
            e.preventDefault();
            $(e.currentTarget).removeClass('border-success');
            
            const archivo = e.originalEvent.dataTransfer.files[0];
            if (archivo) {
                u_usuario.procesarFoto(archivo);
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(archivo);
                $('#campoArchivoFotoPerfil')[0].files = dataTransfer.files;
            }
        });
    }

    static procesarFoto(archivo) {
        const formatosPermitidos = ['image/png', 'image/jpeg', 'image/jpg'];
        
        if (!formatosPermitidos.includes(archivo.type)) {
            Alerta.notificarAdvertencia('Formato no permitido. Solo PNG, JPG, JPEG', 2000);
            return;
        }

        if (archivo.size > 2 * 1024 * 1024) {
            Alerta.notificarAdvertencia('La imagen no debe superar los 2MB', 2000);
            return;
        }
        
        u_usuario.fotoSeleccionada = archivo;

        if (u_usuario.fotoPreview) URL.revokeObjectURL(u_usuario.fotoPreview);
        
        u_usuario.fotoPreview = URL.createObjectURL(archivo);
        
        $('#contenedorFotoPerfil').html(`
            <img src="${u_usuario.fotoPreview}" class="img-fluid rounded-3" style="width: 120px; height: 120px; object-fit: cover;">
        `);
    }

    static obtenerFotoParaEnviar() {
        if (u_usuario.fotoSeleccionada instanceof File) {
            return u_usuario.fotoSeleccionada;
        }

        return null;
    }

    static limpiarArchivos() {
        if (u_usuario.fotoPreview) URL.revokeObjectURL(u_usuario.fotoPreview);
        u_usuario.fotoSeleccionada = null;
        u_usuario.fotoPreview = null;
        $('#campoArchivoFotoPerfil').val('');
        
        $('#contenedorFotoPerfil').html(`
            <div class="d-flex justify-content-center align-items-center bg-light rounded-3 border" style="width: 120px; height: 120px;">
                <i class="fas fa-user text-secondary" style="font-size: 3rem;"></i>
            </div>
        `);
    }

    // ========== GENERAR CONTRASEÑA ==========
    static generarContraseñaAleatoria(longitud = 10) {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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

    // ========== GENERAR TARJETA ==========
    static crearTarjetaUsuarioHTML(usuario) {
        let fotoHtml = '<i class="fas fa-user-circle fa-4x text-muted"></i>';
        
        if (usuario.foto) {
            const fotoUrl = usuario.foto.url_completa || '';
            if (fotoUrl) {
                fotoHtml = `<img src="${fotoUrl}" alt="${usuario.foto.nombre}" class="rounded-circle" style="width: 80px; height: 80px; object-fit: cover; margin: 0 auto;" onerror="this.src='/guniversidadfrontend/public/img/escudo_AAUCA.jpg'">`;
            }
        }

        const esActivo = usuario.estado == 'activo';
        const estadoBadge = esActivo ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>';
        
        const toggleButton = esActivo
            ? '<button class="btn btn-sm btn-outline-success toggle-estado-usuario" title="Deshabilitar" data-id="' + usuario.idUsuario + '"><i class="fas fa-toggle-on"></i></button>'
            : '<button class="btn btn-sm btn-outline-warning toggle-estado-usuario" title="Habilitar" data-id="' + usuario.idUsuario + '"><i class="fas fa-toggle-off"></i></button>';

        return `
            <div class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 shadow-sm usuario-card">
                    <div class="card-body text-center">
                        <div class="mb-3 d-flex justify-content-center">
                            ${fotoHtml}
                        </div>
                        <h5 class="card-title">${usuario.nombreUsuario}</h5>
                        <p class="card-text text-muted small">${usuario.correo || 'Sin correo'}</p>
                        <div class="d-flex justify-content-center gap-2 mb-2">
                            <span class="badge bg-warning text-dark">${usuario.nombreRol}</span>
                            ${estadoBadge}
                        </div>
                        <div class="d-flex justify-content-center gap-2 mt-3">
                            <button class="btn btn-sm btn-outline-info ver-detalles-usuario" title="Ver detalles" data-id="${usuario.idUsuario}" data-bs-toggle="modal" data-bs-target="#modalVerUsuario">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning editar-usuario" title="Editar" data-id="${usuario.idUsuario}" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${toggleButton}
                            <button class="btn btn-sm btn-outline-danger eliminar-usuario" title="Eliminar" data-id="${usuario.idUsuario}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========== GENERAR FILA LISTA ==========
    static crearFilaListaHTML(usuario) {
        const esActivo = usuario.estado == 'activo';
        const estadoBadge = esActivo ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-secondary">Inactivo</span>';
        
        const toggleButton = esActivo
            ? '<button class="btn btn-sm btn-outline-secondary toggle-estado-usuario" title="Deshabilitar" data-id="' + usuario.idUsuario + '"><i class="fas fa-toggle-off"></i></button>'
            : '<button class="btn btn-sm btn-outline-success toggle-estado-usuario" title="Habilitar" data-id="' + usuario.idUsuario + '"><i class="fas fa-toggle-on"></i></button>';

        return `
            <tr>
                <td>${usuario.idUsuario}</td>
                <td>${usuario.nombreUsuario}</td>
                <td>${usuario.correo || '-'}</td>
                <td><span class="badge bg-warning text-dark">${usuario.rol}</span></td>
                <td>${estadoBadge}</td>
                <td>${usuario.ultimoAcceso ? usuario.ultimoAcceso : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info ver-detalles-usuario" title="Ver detalles" data-id="${usuario.idUsuario}" data-bs-toggle="modal" data-bs-target="#modalVerUsuario">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning editar-usuario" title="Editar" data-id="${usuario.idUsuario}" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${toggleButton}
                    <button class="btn btn-sm btn-outline-danger eliminar-usuario" title="Eliminar" data-id="${usuario.idUsuario}">
                        <i class="fas fa-trash"></i>
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

    // ========== LIMPIAR MODAL ==========
    static limpiarModal() {
        $('#formUsuario')[0].reset();
        $('#rolUsuario').val('Ninguno');
        $('.errorMensaje').text('').hide();
        $('#formUsuario input, #formUsuario textarea, #formUsuario select').removeClass('border-success border-danger');
        this.limpiarArchivos();
    }

    // ========== CARGAR DATOS EN MODAL ==========
    static async cargarDatosEnModal(usuario, administrativo) {
        // Limpiar primero
        $('#nombreOCorreoUsuario').val(usuario.nombreUsuario || '');
        
        // Establecer el rol en el select de forma directa
        if (usuario.idRol) {
            $('#rolUsuario').val(usuario.idRol);
        } else {
            $('#rolUsuario').val('Ninguno');
        }
        
        // Forzar la actualización del select (por si acaso)
        $('#rolUsuario').trigger('change');
        
        // Cargar datos administrativos si existen
        if (administrativo) {
            $('#nombreUsuario').val(administrativo.nombreAdministrativo || '');
            $('#apellidosUsuario').val(administrativo.apellidosAdministrativo || '');
            $('#correoUsuario').val(administrativo.correo || '');
            $('#telefonoUsuario').val(administrativo.telefono || '');
            $('#facultadesUsuario').val(administrativo.idFacultad || '');
        } else {
            // Limpiar campos administrativos si no hay
            $('#nombreUsuario').val('');
            $('#apellidosUsuario').val('');
            $('#correoUsuario').val('');
            $('#telefonoUsuario').val('');
            $('#facultadesUsuario').val('');
        }
        
        // Cargar foto si existe
        if (usuario.foto && usuario.foto.url_completa) {
            const fotoUrl = usuario.foto.url_completa;
            $('#contenedorFotoPerfil').html(`
                <img src="${fotoUrl}" class="img-fluid rounded-3" style="width: 120px; height: 120px; object-fit: cover;">
            `);
        } else {
            // Restaurar icono por defecto si no hay foto
            u_usuario.limpiarArchivos();
        }
    }

    // ========== CONVERTIR DATOS ==========
    static async convertirAUsuarios(datosBackend, administrativos) {
        if (!datosBackend || !Array.isArray(datosBackend)) return [];
        if (!administrativos || !Array.isArray(administrativos)) return [];
        // Crear un Map para acceso rápido a administrativos por idUsuario
        const administrativosMap = new Map(
            administrativos.map(a => [a.idUsuario, a])
        );
        // Mapear todos los usuarios
        const usuarios = datosBackend.map(item => {
            let fotoProcesada = null;
            if (item.foto) {
                if (typeof item.foto === 'string') {
                    fotoProcesada = {
                        url_completa: this.urlBase + '/' + item.foto,
                        nombre: item.foto
                    };
                } else if (typeof item.foto === 'object') {
                    fotoProcesada = {
                        ...item.foto,
                        url_completa: item.foto ? this.urlBase + '/' + item.foto : null
                    };
                }
            }
            // Buscar si el usuario tiene datos administrativos
            const adminData = administrativosMap.get(item.idUsuario);
            // Si tiene datos administrativos, combinarlos
            if (adminData) {
                return {
                    idUsuario: item.idUsuario,
                    nombreUsuario: item.nombreUsuario,
                    contrasena: item.contrasena,
                    correo: item.correo,
                    idRol: item.idRol,
                    nombreRol: item.nombreRol,
                    foto: fotoProcesada,
                    estado: item.estado || 'Activo',
                    ultimoAcceso: item.ultimoAcceso,
                    idAdministrativo: adminData.idAdministrativo,
                    nombre: adminData.nombreAdministrativo,
                    apellidos: adminData.apellidosAdministrativo,
                    correoPersonal: adminData.correo,
                    telefono: adminData.telefono,
                    idFacultad: adminData.idFacultad,
                    facultad: adminData.facultad
                };
            }
            // Si solo es usuario (no administrativo)
            return {
                idUsuario: item.idUsuario,
                nombreUsuario: item.nombreUsuario,
                contrasena: item.contrasena,
                correo: item.correo,
                idRol: item.idRol,
                nombreRol: item.nombreRol,
                foto: fotoProcesada,
                estado: item.estado || 'Activo',
                ultimoAcceso: item.ultimoAcceso
            };
        });
        return usuarios;
    }

    // ========== GENERAR HTML DETALLES ==========
    static crearDetallesUsuarioHTML(usuario, administrativo) {
        let fotoHtml = '<i class="fas fa-user-circle fa-5x text-muted"></i>';
        
        if (usuario.foto) {
            const fotoUrl = usuario.foto.url_completa || '';
            if (fotoUrl) {
                fotoHtml = `<img src="${fotoUrl}" class="rounded-circle img-thumbnail" style="width: 120px; height: 120px; object-fit: cover;">`;
            }
        }

        const estadoBadge = usuario.estado == 'activo' 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';

        let datosPersonalesHtml = '';
        if (administrativo) {
            datosPersonalesHtml = `
                <div class="mt-4">
                    <h6 class="border-bottom pb-2">Datos personales</h6>
                    <p><strong>Nombre completo:</strong> ${administrativo.nombreAdministrativo} ${administrativo.apellidosAdministrativo}</p>
                    <p><strong>Correo personal:</strong> ${administrativo.correo || '-'}</p>
                    <p><strong>Teléfono:</strong> ${administrativo.telefono || '-'}</p>
                    <p><strong>Facultad:</strong> ${administrativo.nombreFacultad || 'No asignada'}</p>
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
                    <span class="badge bg-warning text-dark fs-6">${usuario.nombreRol}</span>
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
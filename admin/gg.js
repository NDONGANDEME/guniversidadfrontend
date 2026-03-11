import { sesiones } from "../../public/core/sesiones.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { m_administrativo } from "../modelo/m_administrativo.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_usuario } from "../utilidades/u_usuario.js";

export class c_usuario {
    constructor() {
        // Usuarios
        this.usuarios = [];
        this.usuarioActual = null;
        this.modoEdicion = false;
        this.dataTableUsuarios = null;
        
        // Administrativos
        this.administrativos = [];
        this.administrativoActual = null;
        this.dataTableAdministrativos = null;
        
        // Facultades
        this.facultades = [];
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            // Verificar sesión
            sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Inicializar DataTables
            this.inicializarDataTables();
            
            // Cargar datos
            await this.cargarFacultades();
            await this.cargarUsuarios();
            await this.cargarAdministrativos();
            
            // Configurar eventos y validaciones
            this.configurarEventos();
            this.configurarValidaciones();
            
            // Configurar subida de imagen
            u_usuario.configurarSubidaImagen();
            
        } catch (error) {
            Alerta.error('Error', `No se pudo inicializar el módulo: ${error}`);
        }
    }

    // ========== DATATABLES ==========
    inicializarDataTables() {
        // DataTable de usuarios
        if ($.fn.dataTable.isDataTable('#tablaUsuarios')) {
            $('#tablaUsuarios').DataTable().destroy();
        }
        this.dataTableUsuarios = $('#tablaUsuarios').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' },
            columnDefs: [{ orderable: false, targets: [0, 6] }] // Imagen y acciones no se ordenan
        });

        // DataTable de administrativos
        if ($.fn.dataTable.isDataTable('#tablaAdministrativos')) {
            $('#tablaAdministrativos').DataTable().destroy();
        }
        this.dataTableAdministrativos = $('#tablaAdministrativos').DataTable({
            language: { url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json' }
        });
    }

    // ========== CARGA DE DATOS ==========
    async cargarFacultades() {
        try {
            const datos = await m_facultad.obtenerFacultades();
            this.facultades = datos || [];
            u_usuario.cargarFacultadesEnSelect(this.facultades);
        } catch (error) {
            Alerta.notificarError(`Error al cargar facultades: ${error}`, 1500);
            this.facultades = [];
        }
    }

    async cargarUsuarios() {
        try {
            const datos = await m_usuario.obtenerUsuarios();
            this.usuarios = datos || [];
            this.actualizarTablaUsuarios();
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar usuarios: ${error}`);
            this.usuarios = [];
        }
    }

    async cargarAdministrativos() {
        try {
            const datos = await m_administrativo.obtenerAdministrativos();
            this.administrativos = datos || [];
            this.actualizarTablaAdministrativos();
        } catch (error) {
            Alerta.error('Error', `Fallo al cargar administrativos: ${error}`);
            this.administrativos = [];
        }
    }

    // ========== VALIDACIONES ==========
    configurarValidaciones() { 
        u_usuario.configurarValidaciones(); 
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Botón nuevo usuario
        $('.nuevo').off('click').on('click', () => {
            this.modoEdicion = false;
            this.usuarioActual = null;
            this.administrativoActual = null;
            u_usuario.limpiarModal();
            u_usuario.configurarModoEdicion(false);
            
            // Generar contraseña para el nuevo usuario (no se muestra)
            u_usuario.prepararNuevoUsuario();
        });

        // Guardar usuario
        $('#btnGuardarUsuario').off('click').on('click', () => this.guardarUsuario());

        // Eventos de la tabla de usuarios
        $(document).off('click', '.editar-usuario').on('click', '.editar-usuario', (e) => {
            this.editarUsuario($(e.currentTarget).data('id'));
        });
        
        $(document).off('click', '.toggle-estado-usuario').on('click', '.toggle-estado-usuario', (e) => {
            this.cambiarEstadoUsuario($(e.currentTarget).data('id'));
        });

        // Filtros
        $('#filtroPorRol, #filtroPorEstado').off('change').on('change', () => this.aplicarFiltros());
        $('#btnLimpiarFiltros').off('click').on('click', () => this.limpiarFiltros());

        // Cuando se cierra el modal, limpiar
        $('#modalNuevoUsuario').off('hidden.bs.modal').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_usuario.limpiarModal();
            }
        });
    }

    // ========== FUNCIONES PARA USUARIOS ==========
    
    async guardarUsuario() {
        // Validar formulario
        if (!u_usuario.validarFormularioCompleto(this.modoEdicion)) {
            Alerta.notificarAdvertencia('Complete correctamente todos los campos', 1500);
            return;
        }
        
        try {
            const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
            const rol = $('#rolUsuario').val();
            
            const esCorreo = nombreOCorreo.includes('@');
            
            // Crear FormData para enviar los datos al backend
            const formData = new FormData();
            
            // Añadir datos del usuario al FormData
            formData.append('nombreUsuario', esCorreo ? nombreOCorreo.split('@')[0] : nombreOCorreo);
            formData.append('correo', esCorreo ? nombreOCorreo : `${nombreOCorreo}@sistema.com`);
            formData.append('rol', rol);
            formData.append('estado', 'activo');
            
            // Si es modo edición, añadir el ID
            if (this.modoEdicion && this.usuarioActual) {
                formData.append('idUsuario', this.usuarioActual.idUsuario);
            }
            
            // Si es nuevo usuario, añadir contraseña
            if (!this.modoEdicion) {
                const contrasenaGenerada = u_usuario.obtenerContrasenaGenerada();
                if (!contrasenaGenerada) {
                    Alerta.notificarError('Error al generar la contraseña', 1000);
                    return;
                }
                formData.append('contrasena', contrasenaGenerada);
            }
            
            // Añadir imagen si existe (solo si hay un archivo nuevo)
            const archivoImagen = u_usuario.obtenerImagenParaSubir();
            if (archivoImagen) {
                formData.append('foto', archivoImagen);
            }
            
            /*console.log('FormData a enviar:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }*/
            
            let resultado;
            let idUsuario;
            
            if (this.modoEdicion) {
                // Actualizar usuario
                resultado = await m_usuario.actualizarUsuario(formData);
                idUsuario = this.usuarioActual.idUsuario;
                
            } else {
                // Insertar nuevo usuario
                resultado = await m_usuario.insertarUsuario(formData);
                idUsuario = resultado?.idUsuario || resultado;
            }
            
            // Guardar datos personales si es administrativo
            if ((rol === 'Secretario') && idUsuario) {
                const formDataAdmin = new FormData();
                formDataAdmin.append('idUsuario', idUsuario);
                formDataAdmin.append('nombreAdministrativo', $('#nombreUsuario').val().trim());
                formDataAdmin.append('apellidosAdministrativo', $('#apellidosUsuario').val().trim());
                formDataAdmin.append('correo', $('#correoUsuario').val().trim());
                formDataAdmin.append('telefono', $('#telefonoUsuario').val().trim());
                formDataAdmin.append('idFacultad', $('#facultadesUsuario').val());

                
                
                if (this.modoEdicion && this.administrativoActual) {
                    formDataAdmin.append('idAdministrativo', this.administrativoActual.idAdministrativos);
                    await m_administrativo.actualizarAdministrativo(formDataAdmin);
                } else {
                    await m_administrativo.insertarAdministrativo(formDataAdmin);
                }
            }
            
            if (resultado) {
                // Mostrar contraseña solo si es nuevo usuario
                if (!this.modoEdicion) {
                    const contrasenaGenerada = u_usuario.obtenerContrasenaGenerada();
                    await Alerta.informacion(
                        'Usuario creado correctamente', 
                        `La contraseña para el usuario es: ${contrasenaGenerada}\n\nGuárdala en un lugar seguro.`
                    );
                }
                
                // Recargar datos
                await this.cargarUsuarios();
                await this.cargarAdministrativos();
                
                // Cerrar modal
                $('#modalNuevoUsuario').modal('hide');
                
                // Mostrar mensaje de éxito
                Alerta.exito('Éxito', this.modoEdicion ? 'Usuario actualizado' : 'Usuario creado');
            }
        } catch (error) {
            console.error('Error en guardarUsuario:', error);
            Alerta.notificarError(`No se pudo guardar el usuario: ${error}`, 1500);
        }
    }

    async editarUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        this.modoEdicion = true;
        this.usuarioActual = usuario;
        this.administrativoActual = this.administrativos.find(a => a.idUsuario == id);
        
        u_usuario.cargarDatosEnModal(usuario, this.administrativoActual, this.facultades);
        u_usuario.configurarModoEdicion(true);
    }

    /*async cambiarEstadoUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        const nuevoEstado = usuario.estado == 1 ? 0 : 1;
        const accion = nuevoEstado == 1 ? 'habilitar' : 'deshabilitar';
        
        const confirmacion = await Alerta.confirmar('Confirmar', `¿${accion} este usuario?`);
        if (!confirmacion) return;
        
        try {
            let resultado;
            if (nuevoEstado == 1) {
                resultado = await m_usuario.habilitarUsuario(id);
            } else {
                resultado = await m_usuario.deshabilitarUsuario(id);
            }
            
            if (resultado) {
                usuario.estado = nuevoEstado;
                this.actualizarTablaUsuarios();
                Alerta.notificarExito(`Usuario ${accion}do`, 1000);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo ${accion} el usuario: ${error}`);
        }
    }*/

    actualizarTablaUsuarios() { 
        u_usuario.actualizarTablaUsuarios(this.dataTableUsuarios, this.usuarios); 
    }

    // ========== FUNCIONES PARA ADMINISTRATIVOS ==========
    actualizarTablaAdministrativos() {
        u_usuario.actualizarTablaAdministrativos(
            this.dataTableAdministrativos, 
            this.administrativos, 
            this.usuarios, 
            this.facultades
        );
    }

    // ========== FILTROS ==========
    aplicarFiltros() {
        const rol = $('#filtroPorRol').val();
        const estado = $('#filtroPorEstado').val();
        
        // Limpiar filtros anteriores
        this.dataTableUsuarios.search('').columns().search('').draw();
        
        // Aplicar filtros personalizados
        if (rol !== 'Ninguno' || estado !== 'Ninguno') {
            $.fn.dataTable.ext.search.push(
                function(_settings, data) {
                    const rolUsuario = data[4]; // Columna del rol
                    const estadoUsuario = data[5]; // Columna del estado
                    
                    if (rol !== 'Ninguno' && rolUsuario !== rol) return false;
                    if (estado !== 'Ninguno' && estadoUsuario !== estado) return false;
                    
                    return true;
                }.bind(this)
            );
            
            this.dataTableUsuarios.draw();
            $.fn.dataTable.ext.search.pop();
        }
    }

    limpiarFiltros() {
        $('#filtroPorRol').val('Ninguno');
        $('#filtroPorEstado').val('Ninguno');
        this.dataTableUsuarios.search('').columns().search('').draw();
    }
}

// ========== INICIALIZAR CUANDO EL DOCUMENTO ESTÉ LISTO ==========
$(document).ready(async function() {
    const controlador = new c_usuario();
    await controlador.inicializar();
});




import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class u_usuario {
    
    // ========== GENERAR CONTRASEÑA ALEATORIA DE 10 CARACTERES ==========
    static generarContrasena(longitud = 10) {
        const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const minusculas = 'abcdefghijklmnopqrstuvwxyz';
        const numeros = '0123456789';
        const especiales = '!@#$%^&*';
        let contrasena = '';
        
        // Asegurar al menos un carácter de cada tipo
        contrasena += mayusculas.charAt(Math.floor(Math.random() * mayusculas.length));
        contrasena += minusculas.charAt(Math.floor(Math.random() * minusculas.length));
        contrasena += numeros.charAt(Math.floor(Math.random() * numeros.length));
        contrasena += especiales.charAt(Math.floor(Math.random() * especiales.length));
        
        // Completar el resto de la longitud (hasta 10)
        const todos = mayusculas + minusculas + numeros + especiales;
        for (let i = 4; i < longitud; i++) {
            contrasena += todos.charAt(Math.floor(Math.random() * todos.length));
        }
        
        // Mezclar la contraseña para que no siempre empiece con los mismos tipos
        return contrasena.split('').sort(() => 0.5 - Math.random()).join('');
    }
    
    // ========== VALIDACIONES ==========
    static validarNombreUsuario(valor) {
        if (!valor) return false;
        return u_verificaciones.validarNombreOCorreo(valor);
    }
    
    static validarCorreo(valor) {
        if (!valor) return false;
        return u_verificaciones.validarCorreo(valor);
    }
    
    static validarRol(valor) {
        return valor && valor !== 'Ninguno';
    }
    
    static validarNombrePersona(valor) {
        if (!valor) return false;
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarApellidos(valor) {
        if (!valor) return false;
        return u_verificaciones.validarNombre(valor);
    }
    
    static validarTelefono(valor) {
        if (!valor) return false;
        return u_verificaciones.validarTelefono(valor);
    }
    
    static validarFacultad(valor) {
        return valor && valor !== '';
    }

    // ========== VALIDACIONES EN TIEMPO REAL ==========
    static  configurarValidaciones() {
        // Validación del nombre de usuario o correo
        $('#nombreOCorreoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const esCorreo = valor.includes('@');
            let valido;
            let mensaje;
            
            if (esCorreo) {
                valido = u_usuario.validarCorreo(valor);
                mensaje = 'Correo inválido (ej: usuario@dominio.com)';
            } else {
                valido = u_usuario.validarNombreUsuario(valor);
                mensaje = 'Mínimo 3 caracteres, solo letras y números';
            }
            
            u_utiles.colorearCampo(valido, '#nombreOCorreoUsuario', '#errorNombreOCorreoUsuario', mensaje);
        });

        // Validación del rol
        $('#rolUsuario').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_usuario.validarRol(valor);
            u_utiles.colorearCampo(valido, '#rolUsuario', '#errorRolUsuario', 'Seleccione un rol');
            
            // Mostrar u ocultar panel de datos personales según el rol
            if (valor === 'Secretario') {
                $('#panelDatosPersonales').removeClass('d-none');
                // Activar validaciones de datos personales
                $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').trigger('input');
            } else {
                $('#panelDatosPersonales').addClass('d-none');
                // Limpiar validaciones de datos personales
                $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').removeClass('border-success border-danger');
                $('#errorNombreUsuario, #errorApellidosUsuario, #errorCorreoUsuario, #errorTelefonoUsuario, #errorFacultadesUsuario').text('').addClass('d-none');
            }
        });

        // Validaciones de datos personales
        $('#nombreUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarNombrePersona(valor);
            u_utiles.colorearCampo(valido, '#nombreUsuario', '#errorNombreUsuario', 'Mínimo 3 caracteres, solo letras');
        });

        $('#apellidosUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarApellidos(valor);
            u_utiles.colorearCampo(valido, '#apellidosUsuario', '#errorApellidosUsuario', 'Mínimo 3 caracteres, solo letras');
        });

        $('#correoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarCorreo(valor);
            u_utiles.colorearCampo(valido, '#correoUsuario', '#errorCorreoUsuario', 'Correo inválido (ej: usuario@dominio.com)');
        });

        $('#telefonoUsuario').off('input').on('input', function() {
            const valor = $(this).val().trim();
            const valido = u_usuario.validarTelefono(valor);
            u_utiles.colorearCampo(valido, '#telefonoUsuario', '#errorTelefonoUsuario', 'Formato: +240 222 123 456');
        });

        $('#facultadesUsuario').off('change').on('change', function() {
            const valor = $(this).val();
            const valido = u_usuario.validarFacultad(valor);
            u_utiles.colorearCampo(valido, '#facultadesUsuario', '#errorFacultadesUsuario', 'Seleccione una facultad');
        });
    }

    // ========== MANEJO DE IMAGEN ==========
    static configurarSubidaImagen() {
        $('#añadirImagen').off('click').on('click', function() {
            $('#campoArchivoFotoPerfil').click();
        });

        $('#campoArchivoFotoPerfil').off('change').on('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                // Validar que sea imagen
                if (!archivo.type.match('image.*')) {
                    Alerta.notificarAdvertencia('Solo se permiten imágenes PNG, JPG o JPEG', 1500);
                    $(this).val('');
                    return;
                }
                
                // Validar tamaño (máximo 2MB)
                if (archivo.size > 2 * 1024 * 1024) {
                    Alerta.notificarAdvertencia('La imagen no debe superar los 2MB', 1500);
                    $(this).val('');
                    return;
                }
                
                // Guardar el archivo en el data del formulario para usarlo después
                $('#formUsuario').data('imagen-perfil', archivo);
                
                // Mostrar preview con mejor estilo
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
                    
                    // Botón para eliminar la imagen temporal
                    $('#btnEliminarImagenTemp').off('click').on('click', function() {
                        u_usuario.limpiarImagen();
                    });
                };
                lector.readAsDataURL(archivo);
            }
        });
    }

    static limpiarImagen() {
        $('#contenedorFotoPerfil').html(`
            <div class="d-flex justify-content-center align-items-center bg-light rounded-3 border" 
                style="width: 120px; height: 120px;">
                <i class="fas fa-user text-secondary" style="font-size: 3rem;"></i>
            </div>
        `);
        $('#campoArchivoFotoPerfil').val('');
        $('#formUsuario').removeData('imagen-perfil');
    }

    // ========== OBTENER IMAGEN PARA SUBIR ==========
    static obtenerImagenParaSubir() { return $('#formUsuario').data('imagen-perfil'); }

    // ========== MODO EDICIÓN ==========
    static configurarModoEdicion(activo) {
        if (activo) {
            $('#modalNuevoUsuarioLabel').text('Editar usuario');
            $('#btnGuardarUsuario').text('Actualizar Usuario');
        } else {
            $('#modalNuevoUsuarioLabel').text('Agregar nuevo usuario');
            $('#btnGuardarUsuario').text('Guardar Usuario');
        }
    }

    // ========== GENERAR BOTONES PARA USUARIO ==========
    static generarBotonesUsuario(id, estado) {
        const iconoToggle = estado === 'activo' ? 'fa-toggle-on' : 'fa-toggle-off';
        const claseToggle = estado === 'activo' ? 'btn-outline-danger' : 'btn-outline-success';
        const textoToggle = estado === 'activo' ? 'Habilitar' : 'Deshabilitar';

        /*<button class="btn btn-sm ${claseToggle} toggle-estado-usuario" title="${textoToggle}" data-id="${id}">
                    <i class="fas ${iconoToggle}"></i>
                </button>*/
        
        return `
            <div class="d-flex justify-content-center gap-1">
                <button class="btn btn-sm btn-outline-warning editar-usuario" title="Editar" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modalNuevoUsuario">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    // ========== ACTUALIZAR TABLA DE USUARIOS ==========
    static actualizarTablaUsuarios(dataTable, usuarios) {
        if (!dataTable) return;

        const baseUrl = '/guniversidadfrontend/public/img/';
        
        dataTable.clear();
        
        usuarios.forEach(u => {
            let fotoNombre = baseUrl +  u.foto;
            const estadoTexto = u.estado == 'activo' ? 'Activo' : 'Inactivo';
            
            let imagenHtml = '<span class="text-muted">Sin imagen</span>';
            if (fotoNombre) {
                imagenHtml = `<img src="${fotoNombre}" class="img-thumbnail" style="max-width: 40px; max-height: 40px;">`;
            }
            
            const fila = [
                imagenHtml, u.nombreUsuario || 'Sin nombre', u.correo || 'Sin correo', '**********',
                u.rol || 'Sin rol', estadoTexto, this.generarBotonesUsuario(u.idUsuario, estadoTexto)
            ];
            
            const nodoFila = dataTable.row.add(fila).draw().node();
            
            if (u.estado == 0) {
                $(nodoFila).addClass('text-muted bg-light');
                $(nodoFila).find('td:not(:last-child)').css('opacity', '0.6');
            }
        });
        
        dataTable.draw();
    }

    // ========== ACTUALIZAR TABLA DE ADMINISTRATIVOS ==========
    static actualizarTablaAdministrativos(dataTable, administrativos, usuarios, facultades) {
        if (!dataTable) return;

        const baseUrl = '/guniversidadfrontend/public/img/';
        
        dataTable.clear();
        
        administrativos.forEach(a => {
            const usuario = usuarios.find(u => u.idUsuario == a.idUsuario);
            const facultad = facultades.find(f => f.idFacultad == a.idFacultad);
            let fotoNombre = baseUrl + usuario.foto;
            const nombreFacultad = facultad ? facultad.nombreFacultad : 'Ninguna';
            
            let imagenHtml = '<span class="text-muted">Sin imagen</span>';
            if (usuario && fotoNombre) {
                imagenHtml = `<img src="${fotoNombre}" class="img-thumbnail" style="max-width: 40px; max-height: 40px;">`;
            }
            
            const fila = [
                imagenHtml, `${a.nombreAdministrativo || ''} ${a.apellidosAdministrativo || ''}`, 
                a.correo || usuario?.correo || 'Sin correo', a.telefono || 'Sin teléfono', usuario?.rol || 'Sin rol', nombreFacultad
            ];
            
            dataTable.row.add(fila).draw();
        });
        
        dataTable.draw();
    }

    // ========== CARGAR FACULTADES EN EL SELECT ==========
    static cargarFacultadesEnSelect(facultades) {
        const select = $('#facultadesUsuario');
        select.empty();
        select.append('<option value="">Seleccione...</option>');
        
        facultades.forEach(f => {
            select.append(`<option value="${f.idFacultad}">${f.nombreFacultad}</option>`);
        });
    }

    // ========== LIMPIAR MODAL ==========
    static limpiarModal() {
        $('#formUsuario')[0].reset();
        $('#panelDatosPersonales').addClass('d-none');
        $('#rolUsuario').val('Ninguno');
        
        // Limpiar todos los mensajes de error
        $('.errorMensaje').text('').addClass('d-none');
        
        // Quitar clases de validación de todos los campos
        $('#formUsuario input, #formUsuario select').removeClass('border-success border-danger');
        
        // Limpiar imagen
        this.limpiarImagen();
        
        // Eliminar cualquier contraseña generada previamente
        $('#formUsuario').removeData('contrasena-generada');
    }

    // ========== CARGAR DATOS EN MODAL PARA EDICIÓN ==========
    static cargarDatosEnModal(usuario, administrativo, facultades) {
        // Limpiar primero
        this.limpiarModal();

        const baseUrl = '/guniversidadfrontend/public/img/';
        
        // Cargar datos básicos
        $('#nombreOCorreoUsuario').val(usuario.nombreUsuario || '');
        $('#rolUsuario').val(usuario.rol || 'Ninguno');
        
        // Validar campos cargados (para que se pongan en verde)
        $('#nombreOCorreoUsuario').trigger('input');
        $('#rolUsuario').trigger('change');
        
        // Mostrar imagen existente con mejor estilo
        if (usuario.foto) {
            const fotoNombre = baseUrl + usuario.foto;
            $('#contenedorFotoPerfil').html(`
                <div class="position-relative">
                    <img src="${fotoNombre}" class="img-fluid rounded-3 border border-2 border-warning" 
                        style="width: 120px; height: 120px; object-fit: cover;"
                        onerror="this.onerror=null; this.src=''; this.parentElement.innerHTML='<div class=\'d-flex justify-content-center align-items-center bg-light rounded-3 border\' style=\'width: 120px; height: 120px;\'><i class=\'fas fa-user text-secondary\' style=\'font-size: 3rem;\'></i></div>';">
                </div>
            `);
        }
        
        // Si es administrativo, cargar datos personales
        if ((usuario.rol === 'Secretario') && administrativo) {
            $('#nombreUsuario').val(administrativo.nombreAdministrativo || '');
            $('#apellidosUsuario').val(administrativo.apellidosAdministrativo || '');
            $('#correoUsuario').val(administrativo.correo || '');
            $('#telefonoUsuario').val(administrativo.telefono || '');
            
            // Cargar facultades primero
            this.cargarFacultadesEnSelect(facultades);
            $('#facultadesUsuario').val(administrativo.idFacultad || '');
            
            // Validar campos cargados
            $('#nombreUsuario, #apellidosUsuario, #correoUsuario, #telefonoUsuario, #facultadesUsuario').trigger('input');
        }
        
        // En edición, no generamos nueva contraseña
        $('#formUsuario').removeData('contrasena-generada');
    }

    // ========== GENERAR CONTRASEÑA SOLO PARA NUEVO USUARIO ==========
    static prepararNuevoUsuario() {
        // Generar contraseña pero no mostrarla
        const nuevaContrasena = this.generarContrasena(10);
        $('#formUsuario').data('contrasena-generada', nuevaContrasena);
    }

    // ========== OBTENER CONTRASEÑA GENERADA ==========
    static obtenerContrasenaGenerada() { return $('#formUsuario').data('contrasena-generada'); }

    // ========== VALIDAR FORMULARIO COMPLETO ==========
    static validarFormularioCompleto(_modoEdicion = false) {
        const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
        const rol = $('#rolUsuario').val();
        
        // Validar nombre o correo
        const esCorreo = nombreOCorreo.includes('@');
        let validoNombreOCorreo;
        
        if (esCorreo) {
            validoNombreOCorreo = u_usuario.validarCorreo(nombreOCorreo);
        } else {
            validoNombreOCorreo = u_usuario.validarNombreUsuario(nombreOCorreo);
        }
        
        if (!validoNombreOCorreo) return false;
        if (!u_usuario.validarRol(rol)) return false;
        
        // Si es administrativo, validar datos personales
        if (rol === 'Secretario') {
            const nombre = $('#nombreUsuario').val().trim();
            const apellidos = $('#apellidosUsuario').val().trim();
            const correo = $('#correoUsuario').val().trim();
            const telefono = $('#telefonoUsuario').val().trim();
            const facultad = $('#facultadesUsuario').val();
            
            if (!u_usuario.validarNombrePersona(nombre)) return false;
            if (!u_usuario.validarApellidos(apellidos)) return false;
            if (!u_usuario.validarCorreo(correo)) return false;
            if (!u_usuario.validarTelefono(telefono)) return false;
            if (!u_usuario.validarFacultad(facultad)) return false;
        }
        
        return true;
    }
}
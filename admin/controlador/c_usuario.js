import { sesiones } from "../../public/core/sesiones.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_administrativo } from "../modelo/m_administrativo.js";
import { m_facultad } from "../modelo/m_facultad.js";
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
            
            // Cargar componentes HTML
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            
            // Configurar navegación
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
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
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
            console.error('Error al cargar facultades:', error);
            this.facultades = [];
        }
    }

    async cargarUsuarios() {
        try {
            const datos = await m_usuario.obtenerUsuarios();
            this.usuarios = datos || [];
            this.actualizarTablaUsuarios();
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            Alerta.error('Error', 'Fallo al cargar usuarios');
            this.usuarios = [];
        }
    }

    async cargarAdministrativos() {
        try {
            const datos = await m_administrativo.obtenerAdministrativos();
            this.administrativos = datos || [];
            this.actualizarTablaAdministrativos();
        } catch (error) {
            console.error('Error al cargar administrativos:', error);
            Alerta.error('Error', 'Fallo al cargar administrativos');
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
            Alerta.advertencia('Campos inválidos', 'Complete correctamente todos los campos');
            return;
        }
        
        try {
            const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
            const rol = $('#rolUsuario').val();
            
            const esCorreo = nombreOCorreo.includes('@');
            
            // Preparar datos del usuario
            const datosUsuario = {
                nombreUsuario: esCorreo ? nombreOCorreo.split('@')[0] : nombreOCorreo,
                correo: esCorreo ? nombreOCorreo : `${nombreOCorreo}@sistema.com`,
                rol: rol,
                estado: 1
            };
            
            // Si es nuevo usuario, usar la contraseña generada
            if (!this.modoEdicion) {
                const contrasenaGenerada = u_usuario.obtenerContrasenaGenerada();
                if (!contrasenaGenerada) {
                    Alerta.error('Error', 'Error al generar la contraseña');
                    return;
                }
                datosUsuario.contrasena = contrasenaGenerada;
            } else {
                // En edición, mantener la contraseña actual
                datosUsuario.contrasena = this.usuarioActual.contrasena;
            }
            
            // Procesar imagen si existe (simplificado)
            const archivoImagen = $('#campoArchivoFotoPerfil')[0].files[0];
            if (archivoImagen) {
                // Aquí iría la lógica para subir la imagen al servidor
                // Por ahora, simulamos que se guarda la imagen en base64
                const lector = new FileReader();
                datosUsuario.foto = await new Promise((resolve) => {
                    lector.onload = (e) => resolve(e.target.result);
                    lector.readAsDataURL(archivoImagen);
                });
            }
            
            let resultado;
            let idUsuario;
            
            if (this.modoEdicion) {
                datosUsuario.idUsuario = this.usuarioActual.idUsuario;
                resultado = await m_usuario.actualizarUsuario(datosUsuario);
                idUsuario = this.usuarioActual.idUsuario;
            } else {
                resultado = await m_usuario.insertarUsuario(datosUsuario);
                idUsuario = resultado?.idUsuario || resultado;
            }
            
            // Guardar datos personales si es administrativo
            if ((rol === 'Secretario' || rol === 'Administrador') && idUsuario) {
                const datosAdministrativo = {
                    idUsuario: idUsuario,
                    nombreAdministrativo: $('#nombreUsuario').val().trim(),
                    apellidosAdministrativo: $('#apellidosUsuario').val().trim(),
                    correo: $('#correoUsuario').val().trim(),
                    telefono: $('#telefonoUsuario').val().trim(),
                    idFacultad: $('#facultadesUsuario').val()
                };
                
                if (this.modoEdicion && this.administrativoActual) {
                    datosAdministrativo.idAdministrativos = this.administrativoActual.idAdministrativos;
                    await m_administrativo.actualizarAdministrativo(datosAdministrativo);
                } else {
                    await m_administrativo.insertarAdministrativo(datosAdministrativo);
                }
            }
            
            if (resultado) {
                // SOLO AHORA, después de guardar en BDD, mostramos la contraseña si es nuevo usuario
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
            console.error('Error al guardar usuario:', error);
            Alerta.error('Error', 'No se pudo guardar el usuario');
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

    async cambiarEstadoUsuario(id) {
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
                Alerta.exito('Éxito', `Usuario ${accion}do`);
            }
        } catch (error) {
            console.error(`Error al ${accion} usuario:`, error);
            Alerta.error('Error', `No se pudo ${accion} el usuario`);
        }
    }

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
                function(settings, data, dataIndex) {
                    const row = $(this.dataTableUsuarios.row(dataIndex).node());
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
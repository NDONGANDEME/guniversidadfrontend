import { sesiones } from "../../public/core/sesiones.js";
//import { m_administrativo } from "../modelo/m_usuario.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_usuario } from "../utilidades/u_usuario.js";
import { m_facultad } from "../modelo/m_academico.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";

export class c_usuario {
    constructor() {
        // Usuarios
        this.usuarios = [];
        this.usuarioActual = null;
        this.modoEdicion = false;
        
        // Paginación (21 por página como solicitaste)
        this.paginaActual = 1;
        this.totalPaginas = 1;
        this.usuariosPorPagina = 21;
        
        // Filtros
        this.filtros = {
            rol: '',
            estado: '',
            busqueda: ''
        };
        
        // Modal
        this.modalInstance = null;
        
        // Datos adicionales
        this.facultades = [];
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            //sesiones.verificarExistenciaSesion();
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Inicializar modal de Bootstrap
            const modalElement = document.getElementById('modalNuevoUsuario');
            if (modalElement) {
                this.modalInstance = new bootstrap.Modal(modalElement);
            }
            
            // Cargar facultades para los selectores
            await this.cargarFacultades();
            await u_usuario.cargarRolesEnSelect();
            
            // Cargar usuarios
            await this.cargarUsuarios();
            
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarSubidaArchivos();
            this.configurarCambioVista();
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    // ========== CARGA DE DATOS ==========
    async cargarFacultades() {
        try {
            this.facultades = await m_facultad.obtenerFacultades() || [];
            u_usuario.cargarFacultadesEnSelect(this.facultades);
        } catch (error) {
            console.error('Error al cargar facultades:', error);
            this.facultades = [];
        }
    }

    async cargarUsuarios() {
        try {
            // Cargar usuarios desde el backend (21 por página)
            const datosBackend = await m_usuario.obtenerUsuarios(this.paginaActual, this.usuariosPorPagina, this.filtros);
            
            if (!datosBackend || !datosBackend.usuarios) {
                this.usuarios = [];
                this.totalPaginas = 1;
                this.actualizarVista();
                return;
            }

            // Convertir a objetos usuario
            this.usuarios = await u_usuario.convertirAUsuarios(datosBackend.usuarios);
            
            // Total de páginas desde el backend
            this.totalPaginas = datosBackend.totalPaginas || 1;
            
            this.actualizarVista();

        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            Alerta.error('Error', 'Fallo al cargar usuarios');
            this.usuarios = [];
            this.actualizarVista();
        }
    }

    // ========== VALIDACIONES ==========
    configurarValidaciones() {
        u_usuario.configurarValidaciones();
        
        // Mostrar/ocultar panel de datos personales según el rol
        $('#rolUsuario').on('change', (e) => {
            const rol = e.target.value;
            u_usuario.mostrarOcultarPanelDatosPersonales(rol);
        });
    }

    // ========== CONFIGURAR SUBIDA DE ARCHIVOS ==========
    configurarSubidaArchivos() {
        u_usuario.configurarSubidaArchivos();
    }

    // ========== CAMBIO DE VISTA (TARJETAS/LISTA) ==========
    configurarCambioVista() {
        $('#vistaTarjetas').on('click', () => {
            $('#vistaTarjetas').addClass('active');
            $('#vistaLista').removeClass('active');
            this.actualizarVista();
        });

        $('#vistaLista').on('click', () => {
            $('#vistaLista').addClass('active');
            $('#vistaTarjetas').removeClass('active');
            this.actualizarVista();
        });
    }

    // ========== EVENTOS ==========
    configurarEventos() {
        // Botón nuevo usuario
        $('#btnNuevoUsuario').on('click', () => {
            this.modoEdicion = false;
            this.usuarioActual = null;
            u_usuario.limpiarModal();
            u_usuario.configurarModoEdicion(false);
            $('#panelDatosPersonales').addClass('d-none');
        });

        // Guardar usuario
        $('#btnGuardarUsuario').on('click', () => this.guardarUsuario());

        // Editar usuario
        $(document).on('click', '.editar-usuario', (e) => {
            e.stopPropagation();
            this.editarUsuario($(e.currentTarget).data('id'));
        });

        // Eliminar/Deshabilitar usuario
        $(document).on('click', '.eliminar-usuario', (e) => {
            e.stopPropagation();
            this.cambiarEstadoUsuario($(e.currentTarget).data('id'));
        });

        // Ver detalles de usuario
        $(document).on('click', '.ver-detalles-usuario', (e) => {
            e.stopPropagation();
            this.verDetallesUsuario($(e.currentTarget).data('id'));
        });

        // Filtros y búsqueda
        $('#filtroRol, #filtroEstado').on('change', (e) => {
            this.filtros[e.target.id === 'filtroRol' ? 'rol' : 'estado'] = e.target.value;
            this.paginaActual = 1;
            this.cargarUsuarios();
        });

        $('#buscadorUsuario').on('keyup', u_utiles.debounce(() => {
            this.filtros.busqueda = $('#buscadorUsuario').val();
            this.paginaActual = 1;
            this.cargarUsuarios();
        }, 500));

        $('#btnLimpiarFiltros').on('click', () => {
            $('#filtroRol').val('');
            $('#filtroEstado').val('');
            $('#buscadorUsuario').val('');
            this.filtros = { rol: '', estado: '', busqueda: '' };
            this.paginaActual = 1;
            this.cargarUsuarios();
        });

        // Volver al panel principal
        $('#btnVolverPanelPrincipal').on('click', () => {
            window.location.href = '/guniversidadfrontend/admin/index.html';
        });

        // Cuando se cierra el modal, limpiar
        $('#modalNuevoUsuario').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) {
                u_usuario.limpiarModal();
            }
        });

        // Generar contraseña aleatoria
        $('#generarContraseña').on('change', function() {
            if ($(this).is(':checked')) {
                const contraseña = u_usuario.generarContraseñaAleatoria();
                // Aquí podrías mostrar la contraseña generada o guardarla en un campo oculto
                console.log('Contraseña generada:', contraseña);
                Alerta.notificarInfo('Contraseña generada: ' + contraseña);
            }
        });
    }

    // ========== FUNCIONES PARA USUARIOS ==========

    // ========== VER DETALLES DE USUARIO ==========
    async verDetallesUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        try {
            const detallesHtml = u_usuario.crearDetallesUsuarioHTML(usuario);
            $('#modalVerUsuario .modal-body').html(detallesHtml);
            $('#modalVerUsuario').modal('show');
        } catch (error) {
            console.error('Error al ver detalles:', error);
            Alerta.error('Error', 'No se pudieron cargar los detalles');
        }
    }
    
    formularioUsuarioEsValido() {
        const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
        const rol = $('#rolUsuario').val();
        
        // Validaciones básicas
        if (!u_usuario.validarNombreOCorreo(nombreOCorreo)) return false;
        if (!u_usuario.validarRol(rol)) return false;
        
        // Si el rol requiere datos personales (no es Ninguno, Estudiante ni Profesor)
        if (u_usuario.requiereDatosPersonales(rol)) {
            const nombre = $('#nombreUsuario').val().trim();
            const apellidos = $('#apellidosUsuario').val().trim();
            const correo = $('#correoUsuario').val().trim();
            const telefono = $('#telefonoUsuario').val().trim();
            const facultad = $('#facultadesUsuario').val();
            
            if (!u_usuario.validarNombre(nombre)) return false;
            if (!u_usuario.validarApellidos(apellidos)) return false;
            if (!u_usuario.validarCorreo(correo)) return false;
            if (!u_usuario.validarTelefono(telefono)) return false;
            //if (!facultad || facultad === '') return false;
        }
        
        return true;
    }

    async guardarUsuario() {
        if (!this.formularioUsuarioEsValido()) {
            Alerta.notificarAdvertencia('Complete correctamente los campos', 1500);
            return;
        }
        
        try {
            // ===== 1. DATOS DE USUARIO (tabla usuario) =====
            const formDataUsuario = new FormData();
            
            formDataUsuario.append('nombreUsuario', $('#nombreOCorreoUsuario').val().trim());
            formDataUsuario.append('rol', $('#rolUsuario').val());
            
            // Contraseña
            if ($('#generarContraseña').is(':checked')) {
                const contraseñaGenerada = u_usuario.generarContraseñaAleatoria();
                formDataUsuario.append('contrasena', contraseñaGenerada);
                Alerta.informacion('Info', 'Contraseña generada automáticamente');
            } else {
                formDataUsuario.append('contrasena', 'contraseña123');
            }
            
            // Foto
            const foto = u_usuario.obtenerFotoParaEnviar();
            if (foto) {
                formDataUsuario.append('foto', foto);
            }
            
            let idUsuario;
            let resultadoUsuario;
            
            if (this.modoEdicion) {
                formDataUsuario.append('idUsuario', this.usuarioActual.idUsuario);
                resultadoUsuario = await m_usuario.actualizarUsuario(formDataUsuario);
                idUsuario = this.usuarioActual.idUsuario;
            } else {
                resultadoUsuario = await m_usuario.insertarUsuario(formDataUsuario);
                idUsuario = resultadoUsuario.idUsuario; // El backend debe devolver el ID insertado
            }
            
            if (!resultadoUsuario) {
                throw new Error('Error al guardar el usuario');
            }
            
            // ===== 2. DATOS PERSONALES (tabla administrativo) =====
            const rol = $('#rolUsuario').val();
            if (u_usuario.requiereDatosPersonales(rol)) {
                const formDataAdmin = new FormData();
                
                formDataAdmin.append('idUsuario', idUsuario);
                formDataAdmin.append('nombre', $('#nombreUsuario').val().trim());
                formDataAdmin.append('apellidos', $('#apellidosUsuario').val().trim());
                formDataAdmin.append('correo', $('#correoUsuario').val().trim());
                formDataAdmin.append('telefono', $('#telefonoUsuario').val().trim());
                formDataAdmin.append('idFacultad', $('#facultadesUsuario').val());
                
                // Si estamos en edición y ya tiene datos administrativos
                if (this.modoEdicion && this.usuarioActual.datosAdministrativos) {
                    formDataAdmin.append('idAdministrativo', this.usuarioActual.datosAdministrativos.idAdministrativo);
                    await m_administrativo.actualizarAdministrativo(formDataAdmin);
                } else {
                    await m_administrativo.insertarAdministrativo(formDataAdmin);
                }
            }
            
            // ===== 3. FINALIZAR =====
            u_usuario.limpiarArchivos();
            await this.cargarUsuarios();
            
            if (this.modalInstance) {
                this.modalInstance.hide();
            }
            
            Alerta.exito('Éxito', this.modoEdicion ? 'Usuario actualizado' : 'Usuario creado');
            
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            Alerta.notificarError(`No se pudo guardar el usuario: ${error}`, 1500);
        }
    }

    async editarUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        this.modoEdicion = true;
        this.usuarioActual = usuario;
        
        // Cargar datos en el modal
        u_usuario.cargarDatosEnModal(usuario);
        u_usuario.configurarModoEdicion(true);
        
        // Mostrar panel de datos personales si corresponde
        u_usuario.mostrarOcultarPanelDatosPersonales(usuario.rol);
        
        // Abrir el modal
        if (this.modalInstance) {
            this.modalInstance.show();
        }
    }

    async cambiarEstadoUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        const accion = usuario.estado === 'Activo' ? 'deshabilitar' : 'habilitar';
        const confirmacion = await Alerta.confirmar('Confirmar', `¿${accion === 'deshabilitar' ? 'Deshabilitar' : 'Habilitar'} al usuario "${usuario.nombreUsuario}"?`);
        
        if (!confirmacion) return;
        
        try {
            let resultado;
            
            if (usuario.estado === 'Activo') {
                resultado = await m_usuario.deshabilitarUsuario(id);
            } else {
                resultado = await m_usuario.habilitarUsuario(id);
            }
            
            if (resultado) {
                await this.cargarUsuarios();
                Alerta.exito('Éxito', `Usuario ${accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'}`);
            }
        } catch (error) {
            console.error('Error al cambiar estado del usuario:', error);
            Alerta.error('Error', 'No se pudo cambiar el estado del usuario');
        }
    }

    // ========== ACTUALIZAR VISTA ==========
    actualizarVista() {
        const vistaActual = $('#vistaTarjetas').hasClass('active') ? 'tarjetas' : 'lista';
        
        if (vistaActual === 'tarjetas') {
            u_usuario.renderizarTarjetas(this.usuarios);
        } else {
            u_usuario.renderizarLista(this.usuarios);
        }
        
        // Renderizar paginación
        u_usuario.renderizarPaginacion(
            this.paginaActual,
            this.totalPaginas,
            (nuevaPagina) => this.cambiarPagina(nuevaPagina)
        );
    }

    // ========== CAMBIAR PÁGINA ==========
    cambiarPagina(nuevaPagina) {
        if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas || nuevaPagina === this.paginaActual) return;
        
        this.paginaActual = nuevaPagina;
        this.cargarUsuarios(); // Recargar desde backend con la nueva página
        
        // Hacer scroll hacia arriba suavemente
        const contenedor = document.getElementById('contenedorUsuarios');
        if (contenedor) contenedor.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    const controlador = new c_usuario();
    await controlador.inicializar();
});
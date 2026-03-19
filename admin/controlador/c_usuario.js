import { sesiones } from "../../public/core/sesiones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_usuario } from "../utilidades/u_usuario.js";
import { m_facultad } from "../modelo/m_academico.js";
import { m_administrativo, m_usuario } from "../../public/modelo/m_usuario.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";

export class c_usuario 
{
    constructor() {
        // Usuarios
        this.usuarios = [];
        this.usuarioActual = null;
        this.modoEdicion = false;
        this.administrativos = null;
        
        this.paginaActual = 1;
        this.totalPaginas = 1;
        
        // Modal
        this.modalInstance = null;
        
        // Datos adicionales
        this.facultades = [];
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            sesiones.verificarExistenciaSesion();
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Inicializar modal de Bootstrap
            const modalElement = document.getElementById('modalNuevoUsuario');
            if (modalElement) {
                this.modalInstance = new bootstrap.Modal(modalElement);
            }
            
            // Cargar datos iniciales
            await this.cargarFacultades();
            await u_usuario.cargarRolesEnSelect();
            
            // Cargar usuarios
            await this.cargarUsuarios();

            // Total de paginas
            this.totalPaginas = await m_usuario.obtenerTotalPaginasUsuario();
            
            this.configurarEventos();
            this.configurarValidaciones();
            this.configurarSubidaArchivos();
            this.configurarCambioVista();
            this.inicializarPaginacion();
            this.configurarFiltrosBusqueda();
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo inicializar el módulo');
        }
    }

    // Inicializa los eventos de paginación
    inicializarPaginacion() {
        document.getElementById('btnAnteriorUsuarios')?.addEventListener('click', () => this.irAPaginaAnterior());
        document.getElementById('btnSiguienteUsuarios')?.addEventListener('click', () => this.irAPaginaSiguiente());
        this.actualizarEstadoBotonesPaginacion();
    }

    // Navega a la página anterior
    async irAPaginaAnterior() {
        if (this.paginaActual > 1) {
            this.paginaActual--;
            await this.cargarUsuarios();
        }
    }

    // Navega a la página siguiente
    async irAPaginaSiguiente() {
        if (this.paginaActual < this.totalPaginas.total_paginas) {
            this.paginaActual++;
            await this.cargarUsuarios();
        }
    }

    // ========== CARGA DE DATOS ==========
    async cargarFacultades() {
        try {
            this.facultades = await m_facultad.obtenerFacultades();
            u_usuario.cargarFacultadesEnSelect(this.facultades);
        } catch (error) {
            console.error('Error al cargar facultades:', error);
            this.facultades = [];
        }
    }

    async cargarUsuarios() {
        try {
            // Mostrar indicador de carga
            $('#contenedorUsuarios').html(`
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2">Cargando usuarios...</p>
                </div>
            `);

            // Cargar usuarios desde el backend con paginación
            this.administrativos = await m_administrativo.obtenerAdministrativos();
            const datosBackend = await m_usuario.obtenerUsuariosAPaginar(this.paginaActual);

            if (this.administrativos.length == 0) return;
            
            if (!datosBackend || !datosBackend.usuarios) {
                this.usuarios = [];
                this.totalPaginas = { total_paginas: 1 };
                this.actualizarVista();
                this.actualizarEstadoBotonesPaginacion();
                this.actualizarIndicadorPagina();
                return;
            }

            // Convertir a objetos usuario
            this.usuarios = await u_usuario.convertirAUsuarios(datosBackend.usuarios, this.administrativos);
            
            // Obtener total de páginas
            const totalPaginasObj = await m_usuario.obtenerTotalPaginasUsuario();
            this.totalPaginas = totalPaginasObj || { total_paginas: 1 };
            
            this.actualizarVista();
            this.actualizarEstadoBotonesPaginacion();
            this.actualizarIndicadorPagina();

        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            Alerta.error('Error', 'Fallo al cargar usuarios');
            this.usuarios = [];
            this.totalPaginas = { total_paginas: 1 };
            this.actualizarVista();
            this.actualizarEstadoBotonesPaginacion();
            this.actualizarIndicadorPagina();
        }
    }

    // actualizarEstadoBotonesPaginacion
    actualizarEstadoBotonesPaginacion() {
        const btnAnterior = document.getElementById('btnAnteriorUsuarios');
        const btnSiguiente = document.getElementById('btnSiguienteUsuarios');
        
        // Asegurar que totalPaginas tenga la estructura correcta
        const totalPaginas = this.totalPaginas?.total_paginas || 1;
        
        if (btnAnterior) btnAnterior.disabled = this.paginaActual <= 1;
        if (btnSiguiente) btnSiguiente.disabled = this.paginaActual >= totalPaginas;
    }

    // actualizarIndicadorPagina
    actualizarIndicadorPagina() {
        const indicador = document.getElementById('paginaActualUsuarios');
        if (indicador) {
            const totalPaginas = this.totalPaginas?.total_paginas || 1;
            indicador.textContent = `Página ${this.paginaActual} de ${totalPaginas}`;
        }
    }

    // ========== VALIDACIONES ==========
    configurarValidaciones() {
        u_usuario.configurarValidaciones();
        
        // Mostrar/ocultar panel de datos personales según el rol
        $('#rolUsuario').on('change', async (e) => {
            const rol = e.target.value;
            await u_usuario.mostrarOcultarPanelDatosPersonales(rol);
        });

        // Validación del campo nombreOCorreo con generación automática
        $('#nombreOCorreoUsuario').on('blur', () => {
            u_usuario.generarCamposDesdeNombreOCorreo();
        });
    }

    // ========== CONFIGURAR SUBIDA DE ARCHIVOS ==========
    configurarSubidaArchivos() {
        u_usuario.configurarSubidaArchivos();
    }

    // ========== CAMBIO DE VISTA ==========
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

        // Cambiar estado (habilitar/deshabilitar)
        $(document).on('click', '.toggle-estado-usuario', (e) => {
            e.stopPropagation();
            this.cambiarEstadoUsuario($(e.currentTarget).data('id'));
        });

        // Eliminar permanentemente
        $(document).on('click', '.eliminar-usuario', (e) => {
            e.stopPropagation();
            this.eliminarUsuario($(e.currentTarget).data('id'));
        });

        // Ver detalles
        $(document).on('click', '.ver-detalles-usuario', (e) => {
            e.stopPropagation();
            this.verDetallesUsuario($(e.currentTarget).data('id'));
        });

        // Volver al panel principal
        $('#btnVolverPanelPrincipal').on('click', () => {
            window.location.href = '/guniversidadfrontend/admin/index.html';
        });

        // Al cerrar modal, limpiar
        $('#modalNuevoUsuario').on('hidden.bs.modal', () => {
            if (!this.modoEdicion) u_usuario.limpiarModal();
        });

        // Generar contraseña aleatoria
        $('#generarContraseña').on('change', function() {
            if ($(this).is(':checked')) {
                const contraseña = u_usuario.generarContraseñaAleatoria();
                Alerta.notificarInfo(`Contraseña generada: ${contraseña}`, 10000);
            }
        });
    }

    // ========== VER DETALLES ==========
    async verDetallesUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        // Buscar administrativo por idUsuario, no por coincidencia directa
        const administrativo = this.administrativos?.find(a => a.idUsuario == id);

        if (!usuario) return;
        
        try {
            const detallesHtml = u_usuario.crearDetallesUsuarioHTML(usuario, administrativo); 
            $('#modalVerUsuario .modal-body').html(detallesHtml);
            $('#modalVerUsuario').modal('show');
        } catch (error) {
            console.error('Error al ver detalles:', error);
            Alerta.error('Error', 'No se pudieron cargar los detalles');
        }
    }
    
    // ========== VALIDACIÓN DE FORMULARIO ==========
    async formularioUsuarioEsValido() {
        const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
        const rol = $('#rolUsuario').val();
        let bool = await u_usuario.requiereDatosPersonales(rol)
        
        if (!u_usuario.validarNombreOCorreo(nombreOCorreo)) return false;
        if (!u_usuario.validarRol(rol)) return false;
        
        if (bool) {
            const nombre = $('#nombreUsuario').val().trim();
            const apellidos = $('#apellidosUsuario').val().trim();
            const correo = $('#correoUsuario').val().trim();
            const telefono = $('#telefonoUsuario').val().trim();
            const facultad = $('#facultadesUsuario').val();
            
            if (!u_usuario.validarNombre(nombre)) return false;
            if (!u_usuario.validarApellidos(apellidos)) return false;
            if (!u_usuario.validarCorreo(correo)) return false;
            if (!u_usuario.validarTelefono(telefono)) return false;
            if (!facultad || facultad == '' || facultad == 'Ninguna') return false;
        }
        
        return true;
    }

    // ========== GUARDAR USUARIO ==========
    async guardarUsuario() {
        let validar = await this.formularioUsuarioEsValido();
        if (!validar) {
            Alerta.notificarAdvertencia('Complete correctamente los campos', 1500);
            return;
        }
        
        try {
            const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
            const rol = $('#rolUsuario').val();
            
            // Determinar si es correo o nombre y generar el campo correspondiente
            let nombreUsuario = nombreOCorreo;
            let correoUsuario = null;
            
            if (u_verificaciones.validarCorreo(nombreOCorreo)) {
                nombreUsuario = u_usuario.generarNombreUsuario(nombreOCorreo);
                correoUsuario = nombreOCorreo;
            } else {
                correoUsuario = u_usuario.generarCorreoUsuario(nombreOCorreo);
            }
            
            let idUsuario;
            const formData = new FormData();
            const foto = u_usuario.obtenerFotoParaEnviar();
            
            formData.append('nombreUsuario', nombreUsuario);
            formData.append('correo', correoUsuario);
            formData.append('contrasena', $('#generarContraseña').is(':checked') ? u_usuario.generarContraseñaAleatoria() : 'contraseña123');
            formData.append('rol', rol);
            formData.append('estado', 'activo');
            
            if (foto && foto instanceof File) {
                formData.append('foto', foto);
            }
            
            if (this.modoEdicion) {
                formData.append('idUsuario', this.usuarioActual.idUsuario);
                let actualizado = await m_usuario.actualizarUsuario(formData);

                if (actualizado==null) return;

                idUsuario = this.usuarioActual.idUsuario;
            } else {
                const resultado = await m_usuario.insertarUsuario(formData);

                if (resultado==null) return;

                idUsuario = resultado.idUsuario;
            }
            
            // Si el rol requiere datos personales, guardar en administrativo
            let bool = await u_usuario.requiereDatosPersonales(rol);
            if (bool) {
                const adminFormData = new FormData();
                adminFormData.append('idUsuario', idUsuario);
                adminFormData.append('nombreAdministrativo', $('#nombreUsuario').val().trim());
                adminFormData.append('apellidosAdministrativo', $('#apellidosUsuario').val().trim());
                adminFormData.append('correo', $('#correoUsuario').val().trim());
                adminFormData.append('telefono', $('#telefonoUsuario').val().trim());
                adminFormData.append('idFacultad', $('#facultadesUsuario').val() || 1);
                
                // BUSCAR SI EL USUARIO YA TIENE UN REGISTRO ADMINISTRATIVO
                const administrativoExistente = this.administrativos?.find(a => a.idUsuario == idUsuario);
                
                if (this.modoEdicion && administrativoExistente) {
                    adminFormData.append('idAdministrativo', administrativoExistente.idAdministrativos);
                    let actualizado = await m_administrativo.actualizarAdministrativo(adminFormData);

                    if (actualizado==null) return;
                } else {
                    let insertado = await m_administrativo.insertarAdministrativo(adminFormData);

                    if (insertado==null) return;
                }
            }
            
            u_usuario.limpiarArchivos();
            await this.cargarUsuarios();
            
            if (this.modalInstance) this.modalInstance.hide();
            
            Alerta.notificarExito(this.modoEdicion ? 'Usuario actualizado' : 'Usuario creado', 1500);
            
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            Alerta.notificarError(`No se pudo guardar el usuario: ${error.message}`, 1500);
        }
    }

    // ========== EDITAR USUARIO ==========
    async editarUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        // Buscar administrativo por idUsuario (puede ser null si no existe)
        const administrativo = this.administrativos?.find(a => a.idUsuario == id);

        if (!usuario) return;
        
        this.modoEdicion = true;
        this.usuarioActual = usuario;
        
        // Cargar datos en el modal
        await u_usuario.cargarDatosEnModal(usuario, administrativo); // ← Añadir await
        u_usuario.configurarModoEdicion(true);
        
        // Usar idRol en lugar de rol
        await u_usuario.mostrarOcultarPanelDatosPersonales(usuario.idRol);
        
        // Abrir el modal
        if (this.modalInstance) this.modalInstance.show();
    }

    // ========== CAMBIAR ESTADO ==========
    async cambiarEstadoUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        const esActivo = usuario.estado == 'activo';
        const confirmacion = await Alerta.confirmar(
            'Confirmar', 
            `¿${esActivo ? 'Deshabilitar' : 'Habilitar'} al usuario "${usuario.nombreUsuario}"?`
        );
        
        if (!confirmacion) return;
        
        try {
            const resultado = esActivo 
                ? await m_usuario.deshabilitarUsuario(id)
                : await m_usuario.habilitarUsuario(id);
            
            if (resultado) {
                await this.cargarUsuarios();
                Alerta.notificarExito(`Usuario ${esActivo ? 'deshabilitado' : 'habilitado'} correctamente`, 1000);
            }
        } catch (error) {
            console.error('Error al cambiar estado:', error);
            Alerta.error('Error', `No se pudo ${esActivo ? 'deshabilitar' : 'habilitar'} el usuario`);
        }
    }

    // ========== ELIMINAR USUARIO ==========
    async eliminarUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        const confirmacion = await Alerta.confirmar(
            'Eliminar usuario',
            `¿Está seguro de eliminar permanentemente al usuario "${usuario.nombreUsuario}"? Esta acción no se puede deshacer.`
        );
        
        if (!confirmacion) return;
        
        try {
            const resultado = await m_usuario.eliminarUsuario(id);
            
            if (resultado) {
                await this.cargarUsuarios();
                Alerta.notificarExito('Usuario eliminado permanentemente', 1500);
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            Alerta.error('Error', 'No se pudo eliminar el usuario');
        }
    }

    // ========== FILTROS Y BÚSQUEDA ==========
    configurarFiltrosBusqueda() {
        // Búsqueda en tiempo real
        let timeoutId;
        $('#buscadorUsuario').on('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => this.aplicarFiltros(), 500);
        });
        
        // Filtros por cambio en selects
        $('#filtroRol, #filtroEstado').on('change', () => this.aplicarFiltros());
        
        // Botón limpiar filtros
        $('#btnLimpiarFiltros').on('click', () => this.limpiarFiltros());
    }

    // Aplica los filtros y búsqueda
    async aplicarFiltros() {
        try {
            const termino = $('#buscadorUsuario').val().trim();
            const rol = $('#filtroRol').val();
            const estado = $('#filtroEstado').val();
            
            // Mostrar indicador de carga
            $('#contenedorUsuarios').html(`
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Filtrando...</span>
                    </div>
                    <p class="mt-2">Filtrando usuarios...</p>
                </div>
            `);
            
            // Si no hay filtros, cargar usuarios normales con paginación
            if (!termino && !rol && !estado) {
                this.paginaActual = 1;
                await this.cargarUsuarios();
                return;
            }
            
            // Aplicar filtros combinados
            const filtros = { termino, rol, estado };
            const resultados = await m_usuario.buscarYFiltrarUsuarios(filtros);
            
            // Convertir a objetos usuario
            this.usuarios = await u_usuario.convertirAUsuarios(resultados, this.administrativos);
            
            // Ocultar paginación cuando hay filtros
            $('#btnAnteriorUsuarios, #btnSiguienteUsuarios, #paginaActualUsuarios').parent().parent().hide();
            
            this.actualizarVista();
            
        } catch (error) {
            console.error('Error al aplicar filtros:', error);
            Alerta.error('Error', 'Error al filtrar usuarios');
        }
    }

    // Limpia todos los filtros y recarga
    async limpiarFiltros() {
        $('#buscadorUsuario').val('');
        $('#filtroRol').val('');
        $('#filtroEstado').val('');
        
        // Mostrar paginación de nuevo
        $('#btnAnteriorUsuarios, #btnSiguienteUsuarios, #paginaActualUsuarios').parent().parent().show();
        
        this.paginaActual = 1;
        await this.cargarUsuarios();
    }

    // ========== ACTUALIZAR VISTA ==========
    actualizarVista() {
        const vistaActual = $('#vistaTarjetas').hasClass('active') ? 'tarjetas' : 'lista';
        
        if (vistaActual === 'tarjetas') {
            u_usuario.renderizarTarjetas(this.usuarios);
        } else {
            u_usuario.renderizarLista(this.usuarios);
        }
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    const controlador = new c_usuario();
    await controlador.inicializar();
});
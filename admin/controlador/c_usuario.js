// c_gestion_usuarios.js
import { sesiones } from "../../public/core/sesiones.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { m_administrativo } from "../modelo/m_administrativo.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { m_departamento } from "../modelo/m_departamento.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_gestion_usuarios } from "../utilidades/u_usuario.js";

export class c_gestion_usuarios {
    constructor() {
        // Usuarios
        this.usuarios = [];
        this.usuarioActual = null;
        this.modoEdicion = false;
        this.vistaActual = 'tarjetas'; // 'tarjetas' o 'lista'
        
        // Datos personales según rol
        this.personasData = new Map(); // Mapa idUsuario -> datos personales
        
        // Filtros
        this.filtros = {
            busqueda: '',
            rol: '',
            estado: ''
        };
        
        // Facultades y departamentos
        this.facultades = [];
        this.departamentos = [];
    }

    // ========== INICIALIZACIÓN ==========
    async inicializar() {
        try {
            // Verificar sesión
            //sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await this.cargarComponentes();
            
            // Ajustar modal para navbar fija
            u_gestion_usuarios.ajustarModalParaNavbarFija();
            
            // Cargar datos necesarios
            await this.cargarFacultades();
            await this.cargarDepartamentos();
            await this.cargarUsuarios();
            
            // Configurar eventos
            this.configurarEventos();
            this.configurarValidaciones();
            
            // Configurar subida de imagen
            u_gestion_usuarios.configurarSubidaImagen();
            
        } catch (error) {
            console.error('Error en inicialización:', error);
            Alerta.error('Error', `No se pudo inicializar el módulo: ${error}`);
        }
    }

    async cargarComponentes() {
        await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
        await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
        u_utiles.botonesNavegacionAdministrador();
    }

    // ========== CARGA DE DATOS ==========
    
    async cargarFacultades() {
        try {
            const datos = await m_facultad.obtenerFacultades();
            this.facultades = datos || [];
        } catch (error) {
            console.error('Error cargando facultades:', error);
            this.facultades = [];
        }
    }

    async cargarDepartamentos() {
        try {
            const datos = await m_departamento.obtenerDepartamentos();
            this.departamentos = datos || [];
        } catch (error) {
            console.error('Error cargando departamentos:', error);
            this.departamentos = [];
        }
    }

    async cargarUsuarios() {
        try {
            const datos = await m_usuario.obtenerUsuarios();
            this.usuarios = datos || [];
            
            // Cargar datos personales según el rol
            await this.cargarDatosPersonales();
            
            this.renderizarUsuarios();
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            this.usuarios = [];
            this.renderizarUsuarios();
        }
    }

    async cargarDatosPersonales() {
        // Limpiar mapa de datos personales
        this.personasData.clear();
        
        // Cargar administrativos (incluye Secretario)
        try {
            const administrativos = await m_administrativo.obtenerAdministrativos() || [];
            administrativos.forEach(adm => {
                this.personasData.set(adm.idUsuario, {
                    tipo: 'administrativo',
                    id: adm.idAdministrativo,
                    nombre: adm.nombreAdministrativo,
                    apellidos: adm.apellidosAdministrativo,
                    correo: adm.correo,
                    telefono: adm.telefono,
                    idFacultad: adm.idFacultad
                });
            });
        } catch (error) {
            console.error('Error cargando administrativos:', error);
        }
        
        // Aquí puedes cargar otros tipos (Profesor, Estudiante) si existen
    }

    // ========== RENDERIZADO ==========
    
    renderizarUsuarios() {
        const contenedor = document.getElementById('contenedorUsuarios');
        if (!contenedor) return;

        // Aplicar filtros
        let usuariosFiltrados = this.aplicarFiltros();

        if (usuariosFiltrados.length === 0) {
            contenedor.innerHTML = u_gestion_usuarios.renderizarVacia();
            return;
        }

        let html = '';
        
        if (this.vistaActual === 'tarjetas') {
            contenedor.className = 'row g-4';
            usuariosFiltrados.forEach(usuario => {
                const personaData = this.personasData.get(usuario.idUsuario);
                html += u_gestion_usuarios.generarTarjetaUsuario(usuario, personaData, 'tarjetas');
            });
        } else {
            contenedor.className = 'vista-lista row g-3';
            usuariosFiltrados.forEach(usuario => {
                const personaData = this.personasData.get(usuario.idUsuario);
                html += u_gestion_usuarios.generarTarjetaUsuario(usuario, personaData, 'lista');
            });
        }

        contenedor.innerHTML = html;
    }

    // ========== FILTROS ==========
    
    aplicarFiltros() {
        return this.usuarios.filter(usuario => {
            // Filtro de búsqueda
            if (this.filtros.busqueda) {
                const busqueda = this.filtros.busqueda.toLowerCase();
                const personaData = this.personasData.get(usuario.idUsuario);
                const nombreCompleto = personaData ? 
                    `${personaData.nombre} ${personaData.apellidos}`.toLowerCase() : '';
                
                if (!usuario.nombreUsuario.toLowerCase().includes(busqueda) && 
                    !usuario.correo.toLowerCase().includes(busqueda) &&
                    !nombreCompleto.includes(busqueda)) {
                    return false;
                }
            }
            
            // Filtro por rol
            if (this.filtros.rol && usuario.rol !== this.filtros.rol) {
                return false;
            }
            
            // Filtro por estado
            if (this.filtros.estado && usuario.estado !== this.filtros.estado) {
                return false;
            }
            
            return true;
        });
    }

    // ========== VALIDACIONES ==========
    
    configurarValidaciones() { 
        u_gestion_usuarios.configurarValidaciones(); 
        
        // Cargar facultades en el select cuando se muestre
        $('#facultadPersona').off('change').on('change', (e) => {
            const idFacultad = e.target.value;
            this.filtrarDepartamentosPorFacultad(idFacultad);
        });
    }

    filtrarDepartamentosPorFacultad(idFacultad) {
        const departamentosFiltrados = this.departamentos.filter(d => d.idFacultad == idFacultad);
        u_gestion_usuarios.cargarDepartamentosEnSelect(departamentosFiltrados);
    }

    // ========== EVENTOS ==========
    
    configurarEventos() {
        // Cambio de vista
        $('#vistaTarjetas').off('click').on('click', () => {
            this.vistaActual = 'tarjetas';
            $('#vistaTarjetas').addClass('active');
            $('#vistaLista').removeClass('active');
            this.renderizarUsuarios();
        });

        $('#vistaLista').off('click').on('click', () => {
            this.vistaActual = 'lista';
            $('#vistaLista').addClass('active');
            $('#vistaTarjetas').removeClass('active');
            this.renderizarUsuarios();
        });

        // Botón nuevo usuario
        $('#btnNuevoUsuario').off('click').on('click', () => {
            this.modoEdicion = false;
            this.usuarioActual = null;
            u_gestion_usuarios.limpiarModal();
            u_gestion_usuarios.configurarModoEdicion(false);
            
            // Cargar facultades en el select
            u_gestion_usuarios.cargarFacultadesEnSelect(this.facultades);
            
            // Generar contraseña para el nuevo usuario
            u_gestion_usuarios.prepararNuevoUsuario();
        });

        // Guardar usuario
        $('#btnGuardarUsuario').off('click').on('click', () => this.guardarUsuario());

        // Eventos de las tarjetas (delegación)
        $(document).off('click', '.ver-usuario').on('click', '.ver-usuario', (e) => {
            const tarjeta = $(e.target).closest('.usuario-tarjeta');
            this.verUsuario(tarjeta.data('id'));
        });

        $(document).off('click', '.editar-usuario').on('click', '.editar-usuario', (e) => {
            const tarjeta = $(e.target).closest('.usuario-tarjeta');
            this.editarUsuario(tarjeta.data('id'));
        });

        $(document).off('click', '.cambiar-estado').on('click', '.cambiar-estado', (e) => {
            const tarjeta = $(e.target).closest('.usuario-tarjeta');
            this.cambiarEstadoUsuario(tarjeta.data('id'));
        });

        // Filtros
        $('#buscadorUsuario').off('input').on('input', (e) => {
            this.filtros.busqueda = e.target.value;
            this.renderizarUsuarios();
        });

        $('#filtroRol').off('change').on('change', (e) => {
            this.filtros.rol = e.target.value;
            this.renderizarUsuarios();
        });

        $('#filtroEstado').off('change').on('change', (e) => {
            this.filtros.estado = e.target.value;
            this.renderizarUsuarios();
        });

        $('#btnLimpiarFiltros').off('click').on('click', () => {
            $('#buscadorUsuario').val('');
            $('#filtroRol').val('');
            $('#filtroEstado').val('');
            this.filtros = { busqueda: '', rol: '', estado: '' };
            this.renderizarUsuarios();
        });

        // Confirmar cambio de estado
        $('#confirmarCambioEstado').off('click').on('click', () => {
            this.confirmarCambioEstado();
        });

        // Cuando se abre el modal, ajustar para navbar fija
        $('#modalUsuario').on('show.bs.modal', function() {
            $(this).css('padding-top', '70px');
        });
    }

    // ========== CRUD DE USUARIOS ==========
    
    async guardarUsuario() {
        console.log('eeeeeeeeeeee')
        // Validar formulario
        if (!u_gestion_usuarios.validarFormularioCompleto(this.modoEdicion)) {
            Alerta.notificarAdvertencia('Complete correctamente todos los campos', 1500);
            return;
        }
        
        try {
            const nombreOCorreo = $('#nombreOCorreoUsuario').val().trim();
            const rol = $('#rolUsuario').val();
            
            const esCorreo = nombreOCorreo.includes('@');
            
            // Crear FormData
            const formData = new FormData();
            
            // Datos del usuario
            formData.append('nombreUsuario', esCorreo ? nombreOCorreo.split('@')[0] : nombreOCorreo);
            formData.append('correo', esCorreo ? nombreOCorreo : `${nombreOCorreo}@sistema.com`);
            formData.append('rol', rol);
            formData.append('estado', 'Activo');
            
            // Si es modo edición, añadir el ID
            if (this.modoEdicion && this.usuarioActual) {
                formData.append('idUsuario', this.usuarioActual.idUsuario);
            }
            
            // Si es nuevo usuario, añadir contraseña
            if (!this.modoEdicion) {
                const contrasenaGenerada = u_gestion_usuarios.obtenerContrasenaGenerada();
                if (!contrasenaGenerada) {
                    Alerta.notificarError('Error al generar la contraseña', 1000);
                    return;
                }
                formData.append('contrasena', contrasenaGenerada);
            }
            
            // Añadir imagen si existe
            const archivoImagen = u_gestion_usuarios.obtenerImagenParaSubir();
            if (archivoImagen) {
                formData.append('foto', archivoImagen);
            }
            
            let resultado;
            let idUsuario;
            
            if (this.modoEdicion) {
                resultado = await m_usuario.actualizarUsuario(formData);
                idUsuario = this.usuarioActual.idUsuario;
            } else {
                resultado = await m_usuario.insertarUsuario(formData);
                idUsuario = resultado?.idUsuario || resultado;
            }
            
            // Guardar datos personales si el rol lo requiere
            if (u_gestion_usuarios.esRolConDatosPersonales(rol) && idUsuario) {
                await this.guardarDatosPersonales(idUsuario, rol);
            }
            
            if (resultado) {
                // Mostrar contraseña solo si es nuevo usuario
                if (!this.modoEdicion) {
                    const contrasenaGenerada = u_gestion_usuarios.obtenerContrasenaGenerada();
                    await Alerta.informacion(
                        'Usuario creado correctamente', 
                        `La contraseña para el usuario es: ${contrasenaGenerada}\n\nGuárdala en un lugar seguro.`
                    );
                }
                
                // Recargar datos
                await this.cargarUsuarios();
                
                // Cerrar modal
                $('#modalUsuario').modal('hide');
                
                // Mostrar mensaje de éxito
                Alerta.exito('Éxito', this.modoEdicion ? 'Usuario actualizado' : 'Usuario creado');
            }
            console.log('eeeeeeeeeeee')
        } catch (error) {
            console.error('Error en guardarUsuario:', error);
            Alerta.notificarError(`No se pudo guardar el usuario: ${error}`, 1500);
        }
    }

    async guardarDatosPersonales(idUsuario, rol) {
        const formData = new FormData();
        formData.append('idUsuario', idUsuario);
        formData.append('nombre', $('#nombrePersona').val().trim());
        formData.append('apellidos', $('#apellidosPersona').val().trim());
        formData.append('correo', $('#correoPersonal').val().trim());
        formData.append('telefono', $('#telefonoPersona').val().trim());
        formData.append('idFacultad', $('#facultadPersona').val());
        formData.append('idDepartamento', $('#departamentoPersona').val());

        const personaExistente = this.personasData.get(idUsuario);
        
        if (personaExistente && personaExistente.id) {
            formData.append('id', personaExistente.id);
            
            // Según el rol, llamar al servicio correspondiente
            if (rol === 'Secretario' || rol === 'Administrativo') {
                await m_administrativo.actualizarAdministrativo(formData);
            }
            // Aquí puedes añadir más condiciones para Profesor, Estudiante, etc.
        } else {
            if (rol === 'Secretario' || rol === 'Administrativo') {
                await m_administrativo.insertarAdministrativo(formData);
            }
            // Aquí puedes añadir más condiciones
        }
    }

    async editarUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        this.modoEdicion = true;
        this.usuarioActual = usuario;
        
        const personaData = this.personasData.get(id);
        
        await u_gestion_usuarios.cargarDatosEnModal(
            usuario, 
            personaData, 
            this.facultades, 
            this.departamentos
        );
        
        u_gestion_usuarios.configurarModoEdicion(true);
        
        // Si tiene facultad seleccionada, filtrar departamentos
        if (personaData && personaData.idFacultad) {
            this.filtrarDepartamentosPorFacultad(personaData.idFacultad);
        }
    }

    async verUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;
        
        const personaData = this.personasData.get(id);
        
        // Llenar modal de detalles
        $('#detalleFoto').attr('src', usuario.foto || '../../public/img/default-avatar.png');
        $('#detalleUsuario').text(usuario.nombreUsuario);
        $('#detalleCorreo').text(usuario.correo);
        $('#detalleRol').text(usuario.rol);
        
        const estadoBadge = usuario.estado === 'Activo' 
            ? '<span class="badge bg-success">Activo</span>' 
            : '<span class="badge bg-secondary">Inactivo</span>';
        $('#detalleEstado').html(estadoBadge);
        
        $('#detalleUltimoAcceso').text(usuario.ultimoAcceso || 'Nunca');
        
        // Mostrar datos personales si existen
        if (personaData) {
            $('#detalleNombreCompleto').text(`${personaData.nombre || ''} ${personaData.apellidos || ''}`.trim() || 'No especificado');
            $('#detalleTelefono').text(personaData.telefono || 'No especificado');
            
            const facultad = this.facultades.find(f => f.idFacultad == personaData.idFacultad);
            $('#detalleFacultad').text(facultad?.nombreFacultad || 'No especificada');
            
            const departamento = this.departamentos.find(d => d.idDepartamento == personaData.idDepartamento);
            $('#detalleDepartamento').text(departamento?.nombreDepartamento || 'No especificado');
            
            $('#detalleDatosPersonales').removeClass('d-none');
        } else {
            $('#detalleDatosPersonales').addClass('d-none');
        }
        
        $('#modalVerUsuario').modal('show');
    }

    async cambiarEstadoUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        if (!usuario) return;

        this.usuarioSeleccionado = usuario;
        const accion = usuario.estado === 'Activo' ? 'deshabilitar' : 'habilitar';
        $('#mensajeConfirmacion').text(`¿Estás seguro que deseas ${accion} al usuario "${usuario.nombreUsuario}"?`);
        
        $('#modalConfirmarEstado').modal('show');
    }

    async confirmarCambioEstado() {
        if (!this.usuarioSeleccionado) return;

        try {
            let resultado;
            if (this.usuarioSeleccionado.estado === 'Activo') {
                resultado = await m_usuario.deshabilitarUsuario(this.usuarioSeleccionado.idUsuario);
            } else {
                resultado = await m_usuario.habilitarUsuario(this.usuarioSeleccionado.idUsuario);
            }

            if (resultado && resultado.success) {
                Alerta.notificarExito('Estado actualizado correctamente', 1500);
                await this.cargarUsuarios();
            } else {
                Alerta.notificarError(resultado?.mensaje || 'Error al cambiar estado', 1500);
            }
        } catch (error) {
            console.error('Error cambiando estado:', error);
            Alerta.notificarError('Error al cambiar estado', 1500);
        }

        $('#modalConfirmarEstado').modal('hide');
        this.usuarioSeleccionado = null;
    }
}

// ========== INICIALIZAR ==========
$(document).ready(async function() {
    const controlador = new c_gestion_usuarios();
    await controlador.inicializar();
});
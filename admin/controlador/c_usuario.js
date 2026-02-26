import { sesiones } from "../../public/core/sesiones.js";
import { m_usuario } from "../../public/modelo/m_usuario.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { m_administrativo } from "../modelo/m_administrativo.js";
import { m_facultad } from "../modelo/m_facultad.js";
import { u_usuario } from "../utilidades/u_usuario.js";


export class c_usuario {
    constructor() {
        // Datos principales
        this.usuarios = [];
        this.administrativos = [];
        this.facultades = [];
        
        // Control de edición
        this.modoEdicion = false;
        this.usuarioActual = null;
        
        // DataTables
        this.tablaUsuarios = null;
        this.tablaAdministrativos = null;
        
        // Validaciones
        this.validaciones = {
            login: false,
            rol: false,
            nombre: false,
            apellidos: false,
            correo: false,
            telefono: false,
            facultad: false
        };
    }
    
    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    async inicializar() {
        try {
            // Verificar sesión
            //sesiones.verificarExistenciaSesion();
            
            // Cargar componentes comunes
            await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
            await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
            u_utiles.botonesNavegacionAdministrador();
            
            // Cargar facultades del sessionStorage
            this.cargarFacultades();
            
            // Cargar datos de la base de datos
            await this.cargarUsuarios();
            await this.cargarAdministrativos();
            
            // Inicializar DataTables
            this.inicializarTablas();
            
            // Configurar eventos
            this.configurarEventos();
            this.configurarValidaciones();
            
            // Cargar facultades en el select
            this.cargarSelectFacultades();
        } catch (error) {
            Alerta.notificarError(`Error. No se pudo inicializar el módulo de usuarios: ${error}`, 1500);
        }
    }
    
    // ============================================
    // CARGA DE DATOS
    // ============================================

    async cargarFacultades() {
        try {
            this.facultades = await m_facultad.obtenerFacultades();

            if (this.facultades == []) Alerta.notificar('No hay facultades en la BDD', 1500);
        } catch (error) {
            Alerta.notificarError(`Error. No se pudieron cargar las facultades: ${error}`, 1500);
        }
    }
    
    async cargarUsuarios() {
        try {
            this.usuarios = await m_usuario.obtenerUsuarios();
            console.log(this.usuarios)
            this.actualizarTablaUsuarios();

            if (this.usuarios == []) Alerta.notificar('No hay usuarios en la BDD', 1500);
        } catch (error) {
            Alerta.notificarError(`Error. No se pudieron cargar los usuarios: ${error}`, 1500);
        }
    }
    
    async cargarAdministrativos() {
        try {
            this.administrativos = await m_administrativo.obtenerAdministrativos();
            this.actualizarTablaAdministrativos();

            if (this.administrativos == []) Alerta.notificar('No hay administrativos en la BDD', 1500);
        } catch (error) {
            Alerta.notificarError(`Error cargando administrativos: ${error}` ,1500);
        }
    }
    
    // ============================================
    // CONFIGURACIÓN DE TABLAS
    // ============================================
    
    inicializarTablas() {
        // Tabla de usuarios
        if ($.fn.dataTable.isDataTable('#tablaUsuarios')) {
            $('#tablaUsuarios').DataTable().destroy();
        }
        
        this.tablaUsuarios = $('#tablaUsuarios').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            columnDefs: [
                { orderable: false, targets: [0, 6] } // No ordenar por imagen y acciones
            ]
        });
        
        // Tabla de administrativos
        if ($.fn.dataTable.isDataTable('#tablaAdministrativos')) {
            $('#tablaAdministrativos').DataTable().destroy();
        }
        
        this.tablaAdministrativos = $('#tablaAdministrativos').DataTable({
            language: {
                url: '/guniversidadfrontend/public/nomodules/dataTable/dataTable_es-ES.json'
            },
            columnDefs: [
                { orderable: false, targets: [0] } // No ordenar por imagen
            ]
        });
    }
    
    actualizarTablaUsuarios() {
        console.log('je suis la')
        this.tablaUsuarios.clear();
        
        this.usuarios.forEach(usuario => {
            const estado = usuario.estado || 'Habilitado';
            const fotoHTML = usuario.foto ? 
                `<img src="${usuario.foto}" class="rounded-circle" width="40" height="40">` : 
                '<span class="text-muted">Sin foto</span>';
            
            this.tablaUsuarios.row.add([
                fotoHTML,
                usuario.nombreUsuario || 'Sin nombre',
                usuario.correo || 'Sin correo',
                '********',
                usuario.rol || 'Sin rol',
                `<span class="badge ${estado === 'Habilitado' ? 'bg-success' : 'bg-secondary'}">${estado}</span>`,
                u_usuario.crearBotonesAccion(usuario, estado)
            ]);
        });
        
        this.tablaUsuarios.draw();
        
        // Volver a asignar eventos a los botones después de dibujar la tabla
        this.asignarEventosBotones();
    }
    
    actualizarTablaAdministrativos() {
        this.tablaAdministrativos.clear();
        
        this.administrativos.forEach(admin => {
            // Buscar el usuario relacionado
            const usuario = this.usuarios.find(u => u.idUsuario === admin.idUsuario);
            
            // Buscar la facultad
            const facultad = this.facultades.find(f => f.idFacultad === admin.idFacultad);
            
            const fotoHTML = usuario?.foto ? 
                `<img src="${usuario.foto}" class="rounded-circle" width="40" height="40">` : 
                '<span class="text-muted">Sin foto</span>';
            
            this.tablaAdministrativos.row.add([
                fotoHTML,
                `${admin.nombreAdministrativo || ''} ${admin.apellidosAdministrativo || ''}`,
                admin.correo || 'Sin correo',
                admin.telefono || 'Sin teléfono',
                usuario?.rol || 'Sin rol',
                facultad?.nombreFacultad || 'Sin facultad'
            ]);
        });
        
        this.tablaAdministrativos.draw();
    }
    
    // ============================================
    // CONFIGURACIÓN DE EVENTOS
    // ============================================
    
    configurarEventos() {
        // Botón nuevo usuario
        document.querySelector('.nuevo').addEventListener('click', () => {
            this.modoEdicion = false;
            this.usuarioActual = null;
            document.getElementById('modalNuevoUsuarioLabel').textContent = 'Agregar nuevo usuario';
            u_usuario.limpiarFormulario();
        });
        
        // Cambio en el select de rol
        document.getElementById('rolUsuario').addEventListener('change', (e) => {
            const rol = e.target.value;
            u_usuario.togglePanelDatosPersonales(rol);
            
            if (rol === 'Ninguno' || rol === 'Estudiante' || rol === 'Profesor') {
                // Resetear validaciones de datos personales
                this.validaciones.nombre = true;
                this.validaciones.apellidos = true;
                this.validaciones.correo = true;
                this.validaciones.telefono = true;
                this.validaciones.facultad = true;
            }
        });
        
        // Botón guardar usuario
        document.getElementById('btnGuardarUsuario').addEventListener('click', () => {
            this.guardarUsuario();
        });
        
        // Filtros
        document.getElementById('filtroPorRol').addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('filtroPorEstado').addEventListener('change', () => this.aplicarFiltros());
        document.getElementById('btnLimpiarFiltros').addEventListener('click', () => this.limpiarFiltros());
    }
    
    asignarEventosBotones() {
        // Botones de editar
        document.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editarUsuario(id);
            });
        });
        
        // Botones de deshabilitar
        document.querySelectorAll('.deshabilitar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.cambiarEstadoUsuario(id, 'deshabilitar');
            });
        });
        
        // Botones de habilitar
        document.querySelectorAll('.habilitar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.cambiarEstadoUsuario(id, 'habilitar');
            });
        });
    }
    
    configurarValidaciones() {
        // Validar nombre de usuario o correo
        document.getElementById('nombreOCorreoUsuario').addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            this.validaciones.login = u_usuario.validarLogin(valor);
            u_utiles.colorearCampo(
                this.validaciones.login,
                '#nombreOCorreoUsuario',
                '#errorNombreOCorreoUsuario',
                'Ingrese un nombre de usuario o correo válido'
            );
        });
        
        // Validar rol
        document.getElementById('rolUsuario').addEventListener('change', (e) => {
            const valor = e.target.value;
            this.validaciones.rol = valor !== 'Ninguno';
            u_utiles.colorearCampo(
                this.validaciones.rol,
                '#rolUsuario',
                '#errorRolUsuario',
                'Seleccione un rol'
            );
        });
        
        // Validaciones del panel de datos personales
        document.getElementById('nombreUsuario').addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            this.validaciones.nombre = u_usuario.validarNombre(valor);
            u_utiles.colorearCampo(
                this.validaciones.nombre,
                '#nombreUsuario',
                '#errorNombreUsuario',
                'El nombre debe tener al menos 3 caracteres'
            );
        });
        
        document.getElementById('apellidosUsuario').addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            this.validaciones.apellidos = u_usuario.validarApellidos(valor);
            u_utiles.colorearCampo(
                this.validaciones.apellidos,
                '#apellidosUsuario',
                '#errorApellidosUsuario',
                'Los apellidos deben tener al menos 3 caracteres'
            );
        });
        
        document.getElementById('correoUsuario').addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            this.validaciones.correo = u_usuario.validarCorreo(valor);
            u_utiles.colorearCampo(
                this.validaciones.correo,
                '#correoUsuario',
                '#errorCorreoUsuario',
                'Ingrese un correo válido'
            );
        });
        
        document.getElementById('telefonoUsuario').addEventListener('input', (e) => {
            const valor = e.target.value.trim();
            this.validaciones.telefono = u_usuario.validarTelefono(valor);
            u_utiles.colorearCampo(
                this.validaciones.telefono,
                '#telefonoUsuario',
                '#errorTelefonoUsuario',
                'Formato: +240 222 123 456'
            );
        });
        
        document.getElementById('facultadesUsuario').addEventListener('change', (e) => {
            const valor = e.target.value;
            this.validaciones.facultad = valor !== 'Ninguno';
            u_utiles.colorearCampo(
                this.validaciones.facultad,
                '#facultadesUsuario',
                '#errorFacultadesUsuario',
                'Seleccione una facultad'
            );
        });
    }
    
    // ============================================
    // OPERACIONES CRUD
    // ============================================
    
    async guardarUsuario() {
        // Validar todos los campos según el rol
        const rol = document.getElementById('rolUsuario').value;
        const panelVisible = !document.getElementById('panelDatosPersonales').classList.contains('d-none');
        
        // Validaciones básicas siempre
        if (!this.validaciones.login || !this.validaciones.rol) {
            Alerta.notificarAdvertencia('Campos incompletos. Complete los campos obligatorios', 1500);
            return;
        }
        
        // Si el panel está visible, validar datos personales
        if (panelVisible) {
            if (!this.validaciones.nombre || !this.validaciones.apellidos || !this.validaciones.correo || !this.validaciones.telefono) {
                Alerta.notificarAdvertencia('Campos incompletos. Complete todos los datos personales', 1500);
                return;
            }
        }
        
        try {
            const datos = u_usuario.obtenerDatosFormulario();
            const contraseña = u_usuario.generarContraseña();
            
            // Crear objeto usuario
            const usuarioData = {
                nombreUsuario: datos.nombreUsuario,
                contrasena: contraseña,
                correo: datos.nombreUsuario, // Por ahora usamos el mismo para login
                rol: datos.rol,
                estado: 'Habilitado',
                ultimoAcceso: new Date().toISOString()
            };
            
            let resultado;
            
            if (this.modoEdicion) {
                // Actualizar usuario existente
                usuarioData.idUsuario = this.usuarioActual.idUsuario;
                resultado = await m_usuario.actualizarUsuario(usuarioData);
            } else {
                // Insertar nuevo usuario
                resultado = await m_usuario.insertarUsuario(usuarioData);
            }
            
            if (resultado) {
                // Si hay datos personales y el rol lo requiere, insertar en administrativos
                if (panelVisible && (rol === 'Secretario' || rol === 'Administrador')) {
                    const adminData = {
                        idUsuario: resultado.idUsuario || this.usuarioActual?.idUsuario,
                        nombreAdministrativo: datos.nombre,
                        apellidosAdministrativo: datos.apellidos,
                        correo: datos.correoPersonal,
                        telefono: datos.telefono,
                        idFacultad: datos.idFacultad
                    };
                    
                    if (this.modoEdicion) {
                        await m_administrativo.actualizarAdministrativo(adminData);
                    } else {
                        await m_administrativo.insertarAdministrativo(adminData);
                    }
                }
                
                // Enviar credenciales si es nuevo usuario
                if (!this.modoEdicion) {
                    u_usuario.enviarCredenciales(
                        datos.nombreUsuario,
                        contraseña,
                        datos.telefono,
                        datos.correoPersonal
=======
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
            //sesiones.verificarExistenciaSesion();
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
    configurarValidaciones() { u_usuario.configurarValidaciones(); }

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
            
            // Si es nuevo usuario, añadir contraseña
            if (!this.modoEdicion) {
                const contrasenaGenerada = u_usuario.obtenerContrasenaGenerada();
                if (!contrasenaGenerada) {
                    Alerta.notificarError('Error al generar la contraseña', 1000);
                    return;
                }
                formData.append('contrasena', contrasenaGenerada);
            }
            
            // Si es modo edición, añadir el ID
            if (this.modoEdicion) {
                formData.append('idUsuario', this.usuarioActual.idUsuario);
            }
            
            // Añadir imagen si existe
            const archivoImagen = u_usuario.obtenerImagenParaSubir();
            if (archivoImagen) {
                formData.append('foto', archivoImagen || null); // El backend recibirá el archivo con el nombre 'foto'
            }
            
            let resultado;
            let idUsuario;
            
            if (this.modoEdicion) {
                // Actualizar usuario (enviar FormData)
                resultado = await m_usuario.actualizarUsuario(formData);
                idUsuario = this.usuarioActual.idUsuario;
            } else {
                // Insertar nuevo usuario (enviar FormData)
                console.log(formData)
                resultado = await m_usuario.insertarUsuario(formData);
                idUsuario = resultado?.idUsuario || resultado;
            }
            
            // Guardar datos personales si es administrativo
            if ((rol === 'Secretario' || rol === 'Administrador') || idUsuario) {
                const formDataAdmin = new FormData();
                formDataAdmin.append('idUsuario', idUsuario);
                formDataAdmin.append('nombreAdministrativo', $('#nombreUsuario').val().trim());
                formDataAdmin.append('apellidosAdministrativo', $('#apellidosUsuario').val().trim());
                formDataAdmin.append('correo', $('#correoUsuario').val().trim());
                formDataAdmin.append('telefono', $('#telefonoUsuario').val().trim());
                formDataAdmin.append('idFacultad', $('#facultadesUsuario').val());
                
                if (this.modoEdicion && this.administrativoActual) {
                    formDataAdmin.append('idAdministrativos', this.administrativoActual.idAdministrativos);
                    await m_administrativo.actualizarAdministrativo(formDataAdmin);
                } else {
                    await m_administrativo.insertarAdministrativo(formDataAdmin);
                }
            }
            
            if (resultado) {
                // SOLO AHORA, después de guardar en BDD, mostramos la contraseña si es nuevo usuario
                if (!this.modoEdicion) {
                    const contrasenaGenerada = u_usuario.obtenerContrasenaGenerada();
                    await Alerta.informacion(
                        'Usuario creado correctamente', 
                        `La contraseña para el usuario es: ${contrasenaGenerada}\n\nGuárdala en un lugar seguro.`
>>>>>>> 06dafdbe5a62a4b9354fb22a689ebaa66e2f9429
                    );
                }
                
                // Recargar datos
                await this.cargarUsuarios();
                await this.cargarAdministrativos();
                
                // Cerrar modal
                $('#modalNuevoUsuario').modal('hide');
                
<<<<<<< HEAD
                Alerta.exito(
                    this.modoEdicion ? 'Usuario actualizado' : 'Usuario creado',
                    `El usuario se ${this.modoEdicion ? 'actualizó' : 'creó'} correctamente`
                );
            }
        } catch (error) {
            Alerta.notificarError(`Error. No se pudo guardar el usuario: ${error}`, 1500);
        }
    }
    
    async cambiarEstadoUsuario(id, accion) {
        try {
            const confirmacion = await Alerta.confirmar(
                'Confirmar',
                `¿Está seguro de ${accion === 'deshabilitar' ? 'deshabilitar' : 'habilitar'} este usuario?`
            );
            
            if (confirmacion) {
                let resultado;
                if (accion === 'deshabilitar') {
                    resultado = await m_usuario.deshabilitarUsuario(id);
                } else {
                    resultado = await m_usuario.habilitarUsuario(id);
                }
                
                if (resultado) {
                    // Recargar usuarios
                    await this.cargarUsuarios();
                    
                    Alerta.exito(
                        'Éxito',
                        `Usuario ${accion === 'deshabilitar' ? 'deshabilitado' : 'habilitado'} correctamente`
                    );
                }
            }
        } catch (error) {
            Alerta.notificarError(`Error. No se pudo cambiar el estado del usuario: ${error}`, 1500);
        }
    }
    
    editarUsuario(id) {
        const usuario = this.usuarios.find(u => u.idUsuario == id);
        
        if (usuario) {
            this.modoEdicion = true;
            this.usuarioActual = usuario;
            
            // Cargar datos básicos
            document.getElementById('nombreOCorreoUsuario').value = usuario.nombreUsuario || '';
            document.getElementById('rolUsuario').value = usuario.rol || 'Ninguno';
            
            // Mostrar panel si corresponde
            u_usuario.togglePanelDatosPersonales(usuario.rol);
            
            // Si hay datos administrativos, cargarlos
            if (usuario.rol === 'Secretario' || usuario.rol === 'Administrador') {
                const admin = this.administrativos.find(a => a.idUsuario == id);
                if (admin) {
                    document.getElementById('nombreUsuario').value = admin.nombreAdministrativo || '';
                    document.getElementById('apellidosUsuario').value = admin.apellidosAdministrativo || '';
                    document.getElementById('correoUsuario').value = admin.correo || '';
                    document.getElementById('telefonoUsuario').value = admin.telefono || '';
                    document.getElementById('facultadesUsuario').value = admin.idFacultad || 'Ninguno';
                }
            }
            
            document.getElementById('modalNuevoUsuarioLabel').textContent = 'Editar usuario';
            
            // Forzar validaciones
            document.getElementById('nombreOCorreoUsuario').dispatchEvent(new Event('input'));
            document.getElementById('rolUsuario').dispatchEvent(new Event('change'));
        }
    }
    
    // ============================================
    // FILTROS
    // ============================================
    
    aplicarFiltros() {
        const rol = document.getElementById('filtroPorRol').value;
        const estado = document.getElementById('filtroPorEstado').value;
        
        this.tablaUsuarios.column(4).search(rol !== 'Ninguno' ? rol : '').draw();
        this.tablaUsuarios.column(5).search(estado !== 'Ninguno' ? estado : '').draw();
    }
    
    limpiarFiltros() {
        document.getElementById('filtroPorRol').value = 'Ninguno';
        document.getElementById('filtroPorEstado').value = 'Ninguno';
        this.tablaUsuarios.column(4).search('').draw();
        this.tablaUsuarios.column(5).search('').draw();
    }
    
    // ============================================
    // SELECTORES
    // ============================================
    
    cargarSelectFacultades() {
        const select = document.getElementById('facultadesUsuario');
        select.innerHTML = '<option value="Ninguno">Seleccione facultad...</option>';
        
        this.facultades.forEach(facultad => {
            const option = document.createElement('option');
            option.value = facultad.idFacultad;
            option.textContent = facultad.nombreFacultad;
            select.appendChild(option);
        });
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const controlador = new c_usuario();
    await controlador.inicializar();
=======
document.addEventListener('DOMContentLoaded', function()
{
    // verificamos que existe sesion
    sesiones.verificarExistenciaSesion();
    u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
    u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
    u_utiles.botonesNavegacionAdministrador();
    u_utiles.manejoTabla();
>>>>>>> a62aae651081a91322317b70eb80264ce142e5a0
=======
                // Mostrar mensaje de éxito
                Alerta.exito('Éxito', this.modoEdicion ? 'Usuario actualizado' : 'Usuario creado');
            }
        } catch (error) {
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
                Alerta.notificarExito(`Usuario ${accion}do`, 1000);
            }
        } catch (error) {
            Alerta.error('Error', `No se pudo ${accion} el usuario: ${error}`);
        }
    }

    actualizarTablaUsuarios() { u_usuario.actualizarTablaUsuarios(this.dataTableUsuarios, this.usuarios); }

    // ========== FUNCIONES PARA ADMINISTRATIVOS ==========
    actualizarTablaAdministrativos() {
        u_usuario.actualizarTablaAdministrativos(this.dataTableAdministrativos, this.administrativos, this.usuarios, this.facultades);
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
                function(_settings, data, dataIndex) {
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
>>>>>>> 06dafdbe5a62a4b9354fb22a689ebaa66e2f9429
});
import { u_utiles } from "../../public/utilidades/u_utiles.js";
import { u_verificaciones } from "../../public/utilidades/u_verificaciones.js";
import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_permiso, m_rol, m_rolPermiso } from "../modelo/m_permiso.js";
import { u_permiso } from "../utilidades/u_permiso.js";

export class c_permiso
{
    constructor() {
        this.roles = [];
        this.permisos = [];
        this.tablas = [];
        this.rolSeleccionado = null;
        this.permisosTemporales = [];
        this.modoEdicion = false;
        this.fullControl = false;
    }

    // ============================================
    // MÉTODOS PRINCIPALES
    // ============================================
    async inicializar() {
        try {
            // Cargar datos iniciales
            await this.cargarRoles();
            await this.cargarTablas();
            
            // Configurar eventos
            this.configurarEventos();
            
        } catch (error) {
            console.error('Error al inicializar:', error);
            Alerta.error('Error', 'No se pudo cargar la página correctamente');
        }
    }

    async cargarRoles() {
        try {
            this.roles = await m_rol.obtenerRoles();
            u_permiso.renderizarRoles(
                this.roles, 
                (id, nombre) => this.editarRol(id, nombre),
                (id) => this.eliminarRol(id)
            );
        } catch (error) {
            console.error('Error al cargar roles:', error);
            Alerta.notificarError('Error al cargar los roles');
        }
    }

    async cargarTablas() {
        try {
            this.tablas = await m_permiso.obtenerTablasPermisos();
            u_permiso.llenarSelectTablas(this.tablas);
        } catch (error) {
            console.error('Error al cargar tablas:', error);
            Alerta.notificarError('Error al cargar las tablas');
        }
    }

    async cargarPermisosPorRol(idRol) {
        try {
            // Obtener todos los rol-permiso
            const rolPermisos = await m_rolPermiso.obtenerRolPermisos();
            
            // Filtrar por idRol
            const permisosDelRol = rolPermisos.filter(rp => rp.idRol == idRol);
            
            // Obtener detalles de los permisos
            const todosPermisos = await m_permiso.obtenerPermisos();
            
            const permisosDetalle = permisosDelRol.map(rp => {
                return todosPermisos.find(p => {
                    return p.idPermiso == rp.idPermiso;
                });
            }).filter(p => p); // Filtrar undefined
            
            u_permiso.renderizarPermisosAsignados(permisosDetalle);
            
            return permisosDetalle;
        } catch (error) {
            console.error('Error al cargar permisos del rol:', error);
            Alerta.notificarError('Error al cargar los permisos del rol');
            return [];
        }
    }

    // ============================================
    // MÉTODOS CRUD
    // ============================================

    async guardarRol() {
        try {
            const nombreRol = $('#nombreRol').val().trim();
            
            // USAR u_verificaciones para validar el nombre
            if (!u_verificaciones.validarTexto(nombreRol)) {
                Alerta.advertencia('Nombre inválido', 'El nombre debe tener entre 5 y 100 caracteres y solo letras, números y espacios');
                u_utiles.colorearCampo(false, '#nombreRol', '#errorNombreRol', 'Nombre inválido');
                return;
            }

            // Validar permisos
            if (!this.fullControl && this.permisosTemporales.length === 0) {
                const confirmar = await Alerta.pregunta(
                    '¿Continuar?',
                    'No ha asignado permisos. ¿Desea guardar el rol sin permisos?'
                );
                if (!confirmar) return;
            }

            // 1. GUARDAR ROL
            let idRolGuardado;
            
            if (this.modoEdicion) {
                // Actualizar rol existente
                const rolActualizado = new m_rol(this.rolSeleccionado, nombreRol);
                const resultado = await m_rol.actualizarRol(rolActualizado);
                
                if (resultado) {
                    idRolGuardado = this.rolSeleccionado;
                    Alerta.notificarExito('Rol actualizado correctamente');
                    
                    // Si es edición, eliminar permisos anteriores del rol
                    await this.eliminarPermisosRol(idRolGuardado);
                }
            } else {
                // Insertar nuevo rol
                const nuevoRol = new m_rol(null, nombreRol);
                const resultado = await m_rol.insertarRol(nuevoRol);
                
                if (resultado && resultado.idRol) {
                    idRolGuardado = resultado.idRol;
                    Alerta.notificarExito('Rol creado correctamente');
                }
            }

            // 2. GUARDAR PERMISOS
            if (idRolGuardado) {
                // Determinar qué permisos guardar
                let permisosAGuardar = [];
                
                if (this.fullControl) {
                    // Si es full control, crear permisos para todas las tablas
                    permisosAGuardar = u_permiso.prepararPermisosFullControl();
                } else {
                    // Si no, usar los permisos temporales
                    permisosAGuardar = this.permisosTemporales;
                }
                
                // Guardar permisos y asignarlos al rol
                await this.guardarPermisosYAsignar(idRolGuardado, permisosAGuardar);
            }

            // Cerrar modal y recargar
            $('#modalNuevoRol').modal('hide');
            await this.cargarRoles();
            this.limpiarModal();
            
        } catch (error) {
            console.error('Error al guardar rol:', error);
            Alerta.error('Error', 'No se pudo guardar el rol');
        }
    }

    /**
     * Elimina todos los permisos asignados a un rol
     * @param {number} idRol - ID del rol
     */
    async eliminarPermisosRol(idRol) {
        try {
            // Obtener todos los rol-permiso
            const rolPermisos = await m_rolPermiso.obtenerRolPermisos();
            
            // Filtrar por idRol
            const permisosDelRol = rolPermisos.filter(rp => rp.idRol === idRol);
            
            // Eliminar cada asignación
            for (const rp of permisosDelRol) {
                await m_rolPermiso.eliminarRolPermiso(rp.idRolPermiso);
            }
            
        } catch (error) {
            console.error('Error al eliminar permisos del rol:', error);
        }
    }

    /**
     * Guarda permisos y los asigna a un rol
     * @param {number} idRol - ID del rol
     * @param {Array} permisos - Lista de permisos a guardar
     */
    async guardarPermisosYAsignar(idRol, permisos) {
        try {
            // Obtener todos los permisos existentes
            const todosPermisos = await m_permiso.obtenerPermisos();
            
            for (const permisoData of permisos) {
                let idPermiso;
                
                // Buscar si el permiso ya existe
                const permisoExistente = todosPermisos.find(p => 
                    p.tabla === permisoData.tabla && 
                    p.accionPermiso === permisoData.accionPermiso
                );
                
                if (permisoExistente) {
                    // Si existe, usar su ID
                    idPermiso = permisoExistente.idPermiso;
                } else {
                    // Si no existe, crear el permiso usando el constructor
                    const nuevoPermiso = new m_permiso(
                        null, 
                        permisoData.tabla, 
                        permisoData.accionPermiso
                    );
                    
                    const resultado = await m_permiso.insertarPermiso(nuevoPermiso);
                    
                    if (resultado && resultado.idPermiso) {
                        idPermiso = resultado.idPermiso;
                    } else {
                        console.error('No se pudo crear el permiso:', permisoData);
                        continue;
                    }
                }
                
                // Asignar el permiso al rol usando el constructor
                if (idPermiso) {
                    const nuevaAsignacion = new m_rolPermiso(null, idRol, idPermiso);
                    await m_rolPermiso.insertarRolPermiso(nuevaAsignacion);
                }
            }
            
            Alerta.notificarExito('Permisos asignados correctamente');
            
        } catch (error) {
            console.error('Error al guardar permisos:', error);
            throw error;
        }
    }

    async editarRol(id, nombre) {
        this.modoEdicion = true;
        this.rolSeleccionado = id;
        
        // Cargar datos en el modal
        $('#modalNuevoRolLabel').html('<i class="fas fa-edit me-2"></i> Editar Rol');
        $('#nombreRol').val(nombre);
        $('#nombreRol').addClass('border-success');
        
        // Cargar permisos asignados a este rol (para mostrarlos temporales)
        const permisos = await this.cargarPermisosPorRol(id);
        this.permisosTemporales = permisos.map(p => ({
            tabla: p.tabla,
            accionPermiso: p.accionPermiso,
            nombrePermiso: p.nombrePermiso
        }));
        
        u_permiso.renderizarPermisosTemporales(this.permisosTemporales);
        
        // Abrir modal
        $('#modalNuevoRol').modal('show');
    }

    async eliminarRol(id) {
        try {
            const confirmar = await Alerta.pregunta(
                '¿Eliminar rol?',
                'Esta acción no se puede deshacer. ¿Está seguro?'
            );
            
            if (!confirmar) return;
            
            // Primero eliminar las asignaciones de permisos del rol
            await this.eliminarPermisosRol(id);
            
            // Luego eliminar el rol
            const resultado = await m_rol.eliminarRol(id);
            
            if (resultado) {
                Alerta.notificarExito('Rol eliminado correctamente');
                await this.cargarRoles();
                
                // Limpiar permisos asignados si el rol eliminado era el seleccionado
                if (this.rolSeleccionado === id) {
                    u_permiso.renderizarPermisosAsignados([]);
                    this.rolSeleccionado = null;
                }
            }
            
        } catch (error) {
            console.error('Error al eliminar rol:', error);
            Alerta.error('Error', 'No se pudo eliminar el rol');
        }
    }

    // ============================================
    // MÉTODOS DE ASIGNACIÓN DE PERMISOS
    // ============================================

    asignarPermiso() {
        const tabla = $('#tablasPermiso').val();
        
        if (tabla === 'Ninguno') {
            Alerta.notificarAdvertencia('Seleccione una tabla', 3000);
            return;
        }

        const acciones = [];
        if ($('#insertar').is(':checked')) acciones.push('insertar');
        if ($('#actualizar').is(':checked')) acciones.push('actualizar');
        if ($('#eliminar').is(':checked')) acciones.push('eliminar');

        if (acciones.length === 0) {
            Alerta.notificarAdvertencia('Seleccione al menos una acción', 3000);
            return;
        }

        // Crear permisos y agregar a temporales
        const nuevosPermisos = u_permiso.crearPermisosDesdeSeleccion(tabla, acciones);
        
        // Evitar duplicados (misma tabla y acción)
        nuevosPermisos.forEach(nuevo => {
            const existe = this.permisosTemporales.some(p => 
                p.tabla === nuevo.tabla && p.accionPermiso === nuevo.accionPermiso
            );
            
            if (!existe) {
                this.permisosTemporales.push(nuevo);
            }
        });

        u_permiso.renderizarPermisosTemporales(this.permisosTemporales);
        u_permiso.limpiarFormularioAsignacion();
    }

    quitarPermiso(index) {
        this.permisosTemporales.splice(index, 1);
        u_permiso.renderizarPermisosTemporales(this.permisosTemporales);
    }

    // ============================================
    // CONFIGURACIÓN DE EVENTOS
    // ============================================

    configurarEventos() {
        // Botón nuevo rol
        $('#btnNuevoRol').click(() => {
            this.modoEdicion = false;
            this.rolSeleccionado = null;
            this.permisosTemporales = [];
            this.fullControl = false;
            
            $('#modalNuevoRolLabel').html('<i class="fas fa-circle-plus me-2"></i> Nuevo Rol');
            $('#nombreRol').val('');
            $('#full').prop('checked', false);
            $('#errorNombreRol').text('').hide();
            $('#nombreRol').removeClass('border-success border-danger');
            u_permiso.toggleFullControl(false);
            u_permiso.renderizarPermisosTemporales([]);
            u_permiso.limpiarFormularioAsignacion();
        });

        // Validación en tiempo real del nombre del rol
        $('#nombreRol').on('input', () => {
            const valor = $('#nombreRol').val();
            const valido = u_verificaciones.validarTexto(valor);
            u_utiles.colorearCampo(
                valido, 
                '#nombreRol', 
                '#errorNombreRol', 
                'El nombre debe tener entre 5 y 100 caracteres'
            );
        });

        // Checkbox full control
        $('#full').change((e) => {
            this.fullControl = e.target.checked;
            u_permiso.toggleFullControl(this.fullControl);
        });

        // Botón asignar permiso
        $(document).on('click', '.asignar', (e) => {
            e.preventDefault();
            this.asignarPermiso();
        });

        // Evento personalizado para quitar permiso
        document.addEventListener('quitarPermiso', (e) => {
            this.quitarPermiso(e.detail.index);
        });

        // Botón guardar rol
        $('#btnGuardarRol').click((e) => {
            e.preventDefault();
            this.guardarRol();
        });

        // Botón volver
        $('#btnVolverPanelPrincipal').click(() => {
            window.location.href = '/guniversidadfrontend/admin/index.html';
        });

        // Al cerrar el modal, limpiar
        $('#modalNuevoRol').on('hidden.bs.modal', () => {
            this.limpiarModal();
        });

        // Click en un rol para ver sus permisos
        $(document).on('click', '#contRoles > div[data-id]', (e) => {
            // Evitar si se hizo clic en botones
            if ($(e.target).closest('button').length) return;
            
            const id = $(e.currentTarget).data('id');
            this.seleccionarRol(id);
        });
    }

    async seleccionarRol(id) {
        try {
            // Resaltar el rol seleccionado
            $('#contRoles > div').removeClass('bg-warning bg-opacity-25');
            $(`#contRoles > div[data-id="${id}"]`).addClass('bg-warning bg-opacity-25');
            
            this.rolSeleccionado = id;
            await this.cargarPermisosPorRol(id);
            
        } catch (error) {
            console.error('Error al seleccionar rol:', error);
        }
    }

    limpiarModal() {
        this.modoEdicion = false;
        this.rolSeleccionado = null;
        this.permisosTemporales = [];
        this.fullControl = false;
        
        $('#nombreRol').val('');
        $('#full').prop('checked', false);
        $('#errorNombreRol').text('').hide();
        $('#nombreRol').removeClass('border-success border-danger');
        u_permiso.toggleFullControl(false);
        u_permiso.limpiarFormularioAsignacion();
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
$(document).ready(async function() {
    try {
        // Cargar componentes comunes
        await u_utiles.cargarArchivosImportadosHTML('modalCerrarSesion', '.importandoModalCierreSesion');
        await u_utiles.cargarArchivosImportadosHTML('topBar', '.importandoTopBar');
        u_utiles.botonesNavegacionAdministrador();
        
        // Inicializar controlador de permisos
        const controlador = new c_permiso();
        await controlador.inicializar();
        
        // Guardar instancia global para depuración (opcional)
        window.controladorPermiso = controlador;
        
    } catch (error) {
        console.error('Error en la inicialización:', error);
        Alerta.error('Error', 'No se pudo inicializar la página');
    }
});
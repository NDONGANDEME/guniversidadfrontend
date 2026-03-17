export class u_permiso
{
    /**
     * Renderiza la lista de roles en el contenedor
     * @param {Array} roles - Lista de roles
     * @param {Function} callbackEditar - Función para editar rol
     * @param {Function} callbackEliminar - Función para eliminar rol
     */
    static renderizarRoles(roles, callbackEditar, callbackEliminar) {
        const contRoles = document.querySelector('#contRoles');
        if (!contRoles) return;

        if (!roles || roles.length === 0) {
            contRoles.innerHTML = `
                <h5 class="h4 mb-3 text-gray-800"> Roles </h5>
                <div class="text-center py-4 text-muted">
                    <i class="fas fa-users-slash fa-2x mb-2"></i>
                    <p class="mb-0">SIN ROLES</p>
                </div>
            `;
            return;
        }

        let html = '<h5 class="h4 mb-3 text-gray-800"> Roles </h5>';
        
        roles.forEach(rol => {
            html += `
                <div class="p-2 rounded-3 border-warning border-start border-3 d-flex justify-content-between mb-2" data-id="${rol.idRol}">
                    <span class="h5 fw-light"> ${rol.nombreRol} </span>
                    <span class="text-end">
                        <button class="btn btn-outline-info editar" data-id="${rol.idRol}" data-nombre="${rol.nombreRol}" title="Editar Rol">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger eliminar" data-id="${rol.idRol}" title="Eliminar Rol">
                            <i class="fas fa-trash"></i>
                        </button>
                    </span>
                </div>
            `;
        });

        contRoles.innerHTML = html;

        // Asignar eventos
        contRoles.querySelectorAll('.editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const nombre = btn.dataset.nombre;
                if (callbackEditar) callbackEditar(id, nombre);
            });
        });

        contRoles.querySelectorAll('.eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (callbackEliminar) callbackEliminar(id);
            });
        });
    }

    /**
     * Renderiza los permisos asignados a un rol
     * @param {Array} permisos - Lista de permisos
     */
    static renderizarPermisosAsignados(permisos) {
        const contPermisos = document.querySelector('#contPermisosAsignados .container .row');
        if (!contPermisos) return;

        if (!permisos || permisos.length === 0) {
            contPermisos.innerHTML = `
                <div class="col-12 text-center py-4 text-muted">
                    <i class="fas fa-ban fa-2x mb-2"></i>
                    <p class="mb-0">SIN PERMISOS</p>
                </div>
            `;
            return;
        }

        let html = '';
        permisos.forEach(permiso => {
            html += `
                <div class="mb-3 col-3">
                    <span> <i class="fas fa-check text-success"></i> ${permiso.nombrePermiso}</span>
                </div>
            `;
        });

        contPermisos.innerHTML = html;
    }

    /**
     * Renderiza los permisos asignados temporalmente en el modal
     * @param {Array} permisosTemporales - Lista de permisos temporales
     */
    static renderizarPermisosTemporales(permisosTemporales) {
        const contenedor = document.querySelector('#modalNuevoRol .col-6.border.shadow.rounded-2.p-2');
        if (!contenedor) return;

        if (!permisosTemporales || permisosTemporales.length === 0) {
            contenedor.innerHTML = `
                <div class="border-bottom border-warning">
                    <h5 class="h6 text-gray-800"> Permisos asignados </h5>
                </div>
                <div class="text-center py-3 text-muted">
                    <small>No hay permisos asignados</small>
                </div>
            `;
            return;
        }

        let html = `
            <div class="border-bottom border-warning d-flex justify-content-between align-items-center">
                <h5 class="h6 text-gray-800 mb-0"> Permisos asignados </h5>
                <small class="text-muted">${permisosTemporales.length} permiso(s)</small>
            </div>
        `;

        permisosTemporales.forEach((permiso, index) => {
            html += `
                <div class="d-flex justify-content-between align-items-center mt-2 p-1 border-bottom" data-index="${index}">
                    <span>
                        <i class="fas fa-check-circle text-warning me-1"></i>
                        ${permiso.nombrePermiso}
                    </span>
                    <button class="btn btn-sm btn-link text-danger quitar-permiso" data-index="${index}" title="Quitar permiso">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        contenedor.innerHTML = html;

        // Eventos para quitar permisos
        contenedor.querySelectorAll('.quitar-permiso').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const index = btn.dataset.index;
                // Disparar evento personalizado
                const evento = new CustomEvent('quitarPermiso', { detail: { index: parseInt(index) } });
                document.dispatchEvent(evento);
            });
        });
    }

    /**
     * Llena el select de tablas con las opciones del backend
     * @param {Array} tablas - Lista de tablas
     */
    static llenarSelectTablas(tablas) {
        const select = document.querySelector('#tablasPermiso');
        if (!select) return;

        if (!tablas || tablas.length === 0) {
            select.innerHTML = '<option value="Ninguno">No hay tablas disponibles</option>';
            return;
        }

        let options = '<option value="Ninguno">Seleccione...</option>';
        tablas.forEach(tabla => {
            options += `<option value="${tabla}">${tabla}</option>`;
        });

        select.innerHTML = options;
    }

    /**
     * Crea un objeto permiso a partir de los datos del formulario
     * @param {string} tabla - Nombre de la tabla
     * @param {Array} acciones - Lista de acciones seleccionadas
     * @returns {Array} - Lista de objetos permiso (sin id)
     */
    static crearPermisosDesdeSeleccion(tabla, acciones) {
        if (!tabla || tabla === 'Ninguno' || !acciones || acciones.length === 0) {
            return [];
        }

        return acciones.map(accion => {
            // Formatear la tabla: separar por guiones bajos y capitalizar cada parte
            const partesTabla = tabla.split('_');
            const tablaFormateada = partesTabla.map(parte => 
                parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase()
            ).join('');
            
            return {
                tabla: tabla,
                accionPermiso: accion,
                nombrePermiso: accion.toLowerCase() + tablaFormateada
            };
        });
    }

    /**
     * Prepara los permisos para full control
     * @param {Array} tablas - Lista de todas las tablas
     * @returns {Array} - Lista de objetos permiso full
     */
    static prepararPermisosFullControl() {
        return [{
            tabla: 'Todas',
            accionPermiso: 'full',
            nombrePermiso: 'full'
        }];
    }

    /**
     * Limpia el formulario de asignación de permisos
     */
    static limpiarFormularioAsignacion() {
        $('#tablasPermiso').val('Ninguno');
        $('#insertar, #actualizar, #eliminar').prop('checked', false);
    }

    /**
     * Maneja el checkbox de "Pleno control"
     * @param {boolean} checked - Estado del checkbox
     */
    static toggleFullControl(checked) {
        if (checked) {
            $('.row.mt-4').hide(); // Oculta el contenedor de asignación individual
        } else {
            $('.row.mt-4').show(); // Muestra el contenedor de asignación individual
        }
    }

    /**
     * Crea badge para mostrar tipo de permiso
     */
    static crearBadgePermiso(tipo) {
        const colores = {
            'full': 'bg-warning text-dark',
            'insertar': 'bg-success',
            'actualizar': 'bg-primary',
            'eliminar': 'bg-danger'
        };
        return `<span class="badge ${colores[tipo] || 'bg-secondary'} p-1">${tipo}</span>`;
    }
}
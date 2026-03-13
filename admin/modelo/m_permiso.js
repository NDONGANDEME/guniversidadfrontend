import { fetchPermiso } from "../servicios/fetchPermiso.js";
import { fetchRol } from "../servicios/fetchRol.js";
import { fetchRolPermiso } from "../servicios/fetchRolPermiso.js";

/**
 * CLASE PERMISO
 */
export class m_permiso {
    constructor(idPermiso, nombrePermiso, tabla, accion) {
        this.idPermiso = idPermiso;
        this.nombrePermiso = nombrePermiso;
        this.tabla = tabla;
        this.accion = accion;
    }

    static async obtenerPermisos() {
        return await fetchPermiso.obtenerPermisosDelBackend();
    }

    static async insertarPermiso(objeto) {
        return await fetchPermiso.insertarPermisoEnBackend(objeto);
    }

    static async actualizarPermiso(objeto) {
        return await fetchPermiso.actualizarPermisoEnBackend(objeto);
    }

    static async eliminarPermiso(id) {
        return await fetchPermiso.eliminarPermisoEnBackend(id);
    }
}

/**
 * CLASE ROL
 */
export class m_rol {
    constructor(idRol, nombreRol) {
        this.idRol = idRol;
        this.nombreRol = nombreRol;
    }

    static async obtenerPermisos() {
        return await fetchRol.obtenerRolesDelBackend();
    }

    static async insertarPermiso(objeto) {
        return await fetchRol.insertarRolEnBackend(objeto);
    }

    static async actualizarPermiso(objeto) {
        return await fetchRol.actualizarRolEnBackend(objeto);
    }

    static async eliminarPermiso(id) {
        return await fetchRol.eliminarRolEnBackend(id);
    }
}

/**
 * CLASE ROL_PERMISO
 */
export class m_rolPermiso {
    constructor(idRolPermiso, idRol, idPermiso) {
        this.idRolPermiso = idRolPermiso;
        this.idRol = idRol;
        this.idPermiso = idPermiso;
    }

    static async obtenerPermisos() {
        return await fetchRolPermiso.obtenerRolPermisosDelBackend();
    }

    static async insertarPermiso(objeto) {
        return await fetchRolPermiso.insertarRolPermisoEnBackend(objeto);
    }

    static async actualizarPermiso(objeto) {
        return await fetchRolPermiso.actualizarRolPermisoEnBackend(objeto);
    }

    static async eliminarPermiso(id) {
        return await fetchRolPermiso.eliminarRolPermisoEnBackend(id);
    }
}
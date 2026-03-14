import { fetchPermiso } from "../servicios/fetchPermiso.js";
import { fetchRol } from "../servicios/fetchRol.js";
import { fetchRolPermiso } from "../servicios/fetchRolPermiso.js";

/**
 * CLASE PERMISO
 */
export class m_permiso {
    constructor(idPermiso, tabla, accionPermiso) {
        this.idPermiso = idPermiso;
        this.nombrePermiso = accionPermiso.toLowerCase() + tabla.charAt(0).toUpperCase() + tabla.slice(1).toLowerCase();
        this.tabla = tabla;
        this.accionPermiso = accionPermiso;
    }

    static async obtenerPermisos() {
        return await fetchPermiso.obtenerPermisosDelBackend();
    }

    static async obtenerTablasPermisos() {
        return await fetchPermiso.obtenerTablasPermisosDelBackend();
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

    static async obtenerRoles() {
        return await fetchRol.obtenerRolesDelBackend();
    }

    static async insertarRol(objeto) {
        return await fetchRol.insertarRolEnBackend(objeto);
    }

    static async actualizarRol(objeto) {
        return await fetchRol.actualizarRolEnBackend(objeto);
    }

    static async eliminarRol(id) {
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

    static async obtenerRolPermisos() {
        return await fetchRolPermiso.obtenerRolPermisosDelBackend();
    }

    static async insertarRolPermiso(objeto) {
        return await fetchRolPermiso.insertarRolPermisoEnBackend(objeto);
    }

    static async actualizarRolPermiso(objeto) {
        return await fetchRolPermiso.actualizarRolPermisoEnBackend(objeto);
    }

    static async eliminarRolPermiso(id) {
        return await fetchRolPermiso.eliminarRolPermisoEnBackend(id);
    }
}
import { fetchAdministrativo } from "../../admin/servicios/fetchAdministrativo.js";
import { fetchUsuario } from "../servicios/fetchUsuario.js";

/**
 * CLASE USUARIO
 */
export class m_usuario {
    constructor(idUsuario, nombreUsuario, contrasena, correo, rol, foto, estado, ultimoAcceso) {
        this.idUsuario = idUsuario;
        this.nombreUsuario = nombreUsuario;
        this.contrasena = contrasena;
        this.correo = correo;
        this.rol = rol;
        this.foto = foto;
        this.estado = estado;
        this.ultimoAcceso = ultimoAcceso;
    }

    static async obtenerUsuarios() {
        return await fetchUsuario.obtenerUsuariosEnBDD();
    }

    static async insertarUsuario(formData) {
        return await fetchUsuario.insertarUsuarioEnBDD(formData);
    }

    static async actualizarUsuario(formData) {
        return await fetchUsuario.actualizarUsuarioEnBDD(formData);
    }

    static async eliminarUsuario(id) {
        return await fetchUsuario.eliminarUsuarioEnBDD(id);
    }

    static async obtenerTotalPaginasUsuario(id) {
        return await fetchUsuario.obtenerTotalPaginasUsuarioDelBackend(id);
    }

    static async obtenerUsuariosAPaginar(id) {
        return await fetchUsuario.obtenerUsuariosAPaginarDelBackend(id);
    }

    static async cambioEstadoUsuario(id, estado) {
        return await fetchUsuario.cambioEstadoUsuarioEnBDD(id, estado);
    }
}

/**
 * CLASE ADMINISTRATIVO
 */
export class m_administrativo {
    constructor (idAdministrativo, idUsuario, nombreAdministrativo, apellidosAdministrativo, correo, telefono, idFacultad) {
        this.idAdministrativo = idAdministrativo;
        this.idUsuario = idUsuario;
        this.nombreAdministrativo = nombreAdministrativo;
        this.apellidosAdministrativo = apellidosAdministrativo;
        this.correo = correo;
        this.telefono = telefono;
        this.idFacultad = idFacultad;
    }

    static async obtenerAdministrativos() {
        return await fetchAdministrativo.obtenerAdministrativosDelBackend();
    }

    static async insertarAdministrativo(formDataAdmin) {
        return await fetchAdministrativo.insertarAdministrativoEnBackend(formDataAdmin);
    }

    static async actualizarAdministrativo(formDataAdmin) {
        return await fetchAdministrativo.actualizarAdministrativoEnBackend(formDataAdmin);
    }
}
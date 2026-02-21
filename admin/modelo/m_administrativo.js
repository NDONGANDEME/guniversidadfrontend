import { fetchAdministrativo } from "../servicios/fetchAdministrativo.js";

export class m_administrativo
{
    constructor (idAdministrativos, idUsuario, nombreAdministrativo, apellidosAdministrativo, correo, telefono, idFacultad) {
        this.idAdministrativos = idAdministrativos;
        this.idUsuario = idUsuario;
        this.nombreAdministrativo = nombreAdministrativo;
        this.apellidosAdministrativo = apellidosAdministrativo;
        this.correo = correo;
        this.telefono = telefono;
        this.idFacultad = idFacultad;
    }

    static async obtenerAdministrativos(actor) {
        return await fetchAdministrativo.obtenerAdministrativosDelBackend(actor);
    }

    static async insertarAdministrativo(objeto, actor) {
        return await fetchAdministrativo.insertarAdministrativoEnBackend(objeto, actor);
    }

    static async actualizarAdministrativo(objeto, actor) {
        return await fetchAdministrativo.actualizarAdministrativoEnBackend(objeto, actor);
    }

    static async deshabilitarAdministrativo(id, actor) {
        return await fetchAdministrativo.deshabilitarAdministrativoEnBackend(id, actor);
    }

    static async habilitarAdministrativo(id, actor) {
        return await fetchAdministrativo.habilitarAdministrativoEnBackend(id, actor);
    }
}
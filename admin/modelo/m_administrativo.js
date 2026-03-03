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

    static async obtenerAdministrativos() {
        return await fetchAdministrativo.obtenerAdministrativosDelBackend();
    }

    static async insertarAdministrativo(objeto) {
        return await fetchAdministrativo.insertarAdministrativoEnBackend(objeto);
    }

    static async actualizarAdministrativo(objeto) {
        return await fetchAdministrativo.actualizarAdministrativoEnBackend(objeto);
    }
}
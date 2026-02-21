import { fetchContacto } from "../servicios/fetchContacto.js";

export class m_contacto
{
    constructor(idContacto, contacto, tipo, idStatic, idFacultad, idDepartamento, idProfesor, idEstudiante, idAdministrativo, idResponsablePago, idFamiliar)
    {
        this.idContacto = idContacto;
        this.contacto = contacto;
        this.tipo = tipo;
        this.idStatic = idStatic;
        this.idFacultad = idFacultad;
        this.idDepartamento = idDepartamento;
        this.idProfesor = idProfesor;
        this.idEstudiante = idEstudiante;
        this.idAdministrativo = idAdministrativo;
        this.idResponsablePago = idResponsablePago;
        this.idFamiliar = idFamiliar;
    }

    static async obtenerContactos() {
        return await fetchContacto.obtenerContactosDelBackend();
    }

    static async actualizarContacto(objeto) {
        return await fetchContacto.actualizarContactoEnBackend(objeto);
    }

    static async insertarContacto(objeto) {
        return await fetchContacto.insertarContactoEnBackend(objeto);
    }

    static async eliminarContacto(id) {
        return await fetchContacto.eliminarContactoEnBackend(id);
    }
}
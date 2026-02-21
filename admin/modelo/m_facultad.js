import { fetchFacultad } from "../servicios/fetchFacultad.js";

export class m_facultad
{
    constructor(idFacultad, nombreFacultad, direccionFacultad)
    {
        this.idFacultad = idFacultad;
        this.nombreFacultad = nombreFacultad;
        this.direccionFacultad = direccionFacultad;
    }

    static async obtenerFacultades() {
        return await fetchFacultad.obtenerFacultadesDelBackend();
    }

    static async insertarFacultad(objeto) {
        return await fetchFacultad.insertarFacultadEnBackend(objeto);
    }

    static async actualizarFacultad(objeto) {
        return await fetchFacultad.actualizarFacultadEnBackend(objeto);
    }

    static async deshabilitarFacultad(id) {
        return await fetchFacultad.deshabilitarFacultadEnBackend(id);
    }

    static async habilitarFacultad(objeto) {
        return await fetchFacultad.habilitarFacultadEnBackend(objeto);
    }
}
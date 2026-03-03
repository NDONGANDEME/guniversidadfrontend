import { fetchFacultad } from "../servicios/fetchFacultad.js";

export class m_facultad
{
    constructor(idFacultad, nombreFacultad, direccionFacultad, correo, telefono)
    {
        this.idFacultad = idFacultad;
        this.nombreFacultad = nombreFacultad;
        this.direccionFacultad = direccionFacultad;
        this.correo = correo;
        this.telefono = telefono;
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

    static async eliminarFacultad(id) {
        return await fetchFacultad.eliminarFacultadEnBackend(id);
    }
}
import { fetchAula } from "../servicios/fetchAula.js";

export class m_aula
{
    constructor(idAula, nombreAula, capacidad, idFacultad) {
        this.idAula = idAula;
        this.nombreAula = nombreAula;
        this.capacidad = capacidad;
        this.idFacultad = idFacultad;
    }

    static async obtenerAulas() {
        return await fetchAula.obtenerAulasDelBackend();
    }

    static async insertarAula(objeto) {
        return await fetchAula.insertarAulaEnBackend(objeto);
    }

    static async actualizarAula(objeto) {
        return await fetchAula.actualizarAulaEnBackend(objeto);
    }

    static async deshabilitarAula(id) {
        return await fetchAula.deshabilitarAulaEnBackend(id);
    }

    static async habilitarAula(id) {
        return await fetchAula.habilitarAulaEnBackend(id);
    }
}
import { fetchSemestre } from "../servicios/fetchSemestre.js";

export class m_semestre
{
    constructor (idSemestre, numeroSemestre, tipoSemestre) {
        this.idSemestre = idSemestre;
        this.numeroSemestre = numeroSemestre;
        this.tipoSemestre = tipoSemestre;
    }

    static async obtenerSemestres() {
        return await fetchSemestre.obtenerSemestresDelBackend();
    }

    static async insertarSemestre(objeto) {
        return await fetchSemestre.insertarSemestreEnBackend(objeto);
    }

    static async actualizarSemestre(objeto) {
        return await fetchSemestre.actualizarSemestreEnBackend(objeto);
    }

    static async deshabilitarSemestre(id) {
        return await fetchSemestre.deshabilitarSemestreEnBackend(id);
    }

    static async habilitarSemestre(id) {
        return await fetchSemestre.habilitarSemestreEnBackend(id);
    }
}
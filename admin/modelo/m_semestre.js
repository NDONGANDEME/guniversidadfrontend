import { fetchSemestre } from "../servicios/fetchSemestre.js";

export class m_semestre
{
    constructor (idSemestre, numeroSemestre) {
        this.idSemestre = idSemestre;
        this.numeroSemestre = numeroSemestre;
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

    static async eliminarSemestre(id) {
        return await fetchSemestre.eliminarSemestreEnBackend(id);
    }
}
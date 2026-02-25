import { fetchSemestre } from "../servicios/fetchSemestre.js";

export class m_semestre
{
    constructor (idSemestre, numeroSemestre, tipoSemestre, idCurso) {
        this.idSemestre = idSemestre;
        this.numeroSemestre = numeroSemestre;
        this.tipoSemestre = tipoSemestre;
        this.idCurso = idCurso;
    }

    /*
        en las funcionalidades: el tipo de semestre lo generará una funcion que se llamará: determinarTipoSemestre(numeroSemestre): que devolvera un string que diga si el 
        numero es par o impar.
    */

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
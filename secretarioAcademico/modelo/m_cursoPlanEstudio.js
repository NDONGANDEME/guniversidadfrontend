import { fetchCursoPlanEstudio } from "../servicios/fetchCursoPlanEstudio.js";

export class m_cursoPlanEstudio
{
    constructor (idCursoPlan, idPlanEstudio, idCurso) {
        this.idCursoPlan = idCursoPlan;
        this.idPlanEstudio = idPlanEstudio;
        this.idCurso = idCurso;
    }

    static async obtenerPlanesEstudios() {
        return await fetchCursoPlanEstudio.obtenerCursoPlanesEstudiosDelBackend();
    }

    static async insertarPlanEstudio(objeto) {
        return await fetchCursoPlanEstudio.insertarCursoPlanEstudioEnBDD(objeto);
    }

    static async actualizarPlanEstudio(objeto) {
        return await fetchCursoPlanEstudio.actualizarCursoPlanEstudioEnBDD(objeto);
    }

    static async deshabilitarPlanEstudio(id) {
        return await fetchCursoPlanEstudio.deshabilitarCursoPlanEstudioEnBDD(id);
    }

    static async habilitarPlanEstudio(id) {
        return await fetchCursoPlanEstudio.habilitarCursoPlanEstudioEnBDD(id);
    }
}
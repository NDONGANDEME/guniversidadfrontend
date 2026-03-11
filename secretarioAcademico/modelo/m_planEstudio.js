import { fetchPlanEstudio } from "../servicios/fetchPlanEstudio.js";

export class m_planEstudio
{
    constructor (idPlanEstudio, nombre, idCarrera, fechaElaboracion, periodoPlanEstudio, vigente) {
        this.idPlanEstudio = idPlanEstudio;
        this.nombre = nombre;
        this.idCarrera = idCarrera;
        this.fechaElaboracion = fechaElaboracion;
        this.periodoPlanEstudio = periodoPlanEstudio;
        this.vigente = vigente;
    }

    static async obtenerPlanesEstudios() {
        return await fetchPlanEstudio.obtenerPlanesEstudiosDelBackend();
    }

    static async insertarPlanEstudio(objeto) {
        return await fetchPlanEstudio.insertarPlanEstudioEnBDD(objeto);
    }

    static async actualizarPlanEstudio(objeto) {
        return await fetchPlanEstudio.actualizarPlanEstudioEnBDD(objeto);
    }

    static async deshabilitarPlanEstudio(id) {
        return await fetchPlanEstudio.deshabilitarPlanEstudioEnBDD(id);
    }

    static async habilitarPlanEstudio(id) {
        return await fetchPlanEstudio.habilitarPlanEstudioEnBDD(id);
    }
}
import { fetchPlanSemestreAsignatura } from "../servicios/fetchPlanSemestreAsignatura.js";

export class m_PlanSemestreAsignatura
{
    constructor (idPlanSemestreAsignatura, idPlanEstudio, idSemestre, idAsignatura, creditos, modalidad) {
        this.idPlanSemestreAsignatura = idPlanSemestreAsignatura;
        this.idPlanEstudio = idPlanEstudio;
        this.idSemestre = idSemestre;
        this.idAsignatura = idAsignatura;
        this.creditos = creditos;
        this.modalidad = modalidad;
    }

    static async obtenerPlanSemestreAsignaturas() {
        return await fetchPlanSemestreAsignatura.obtenerPlanSemestreAsignaturasDelBackend();
    }

    static async insertarPlanSemestreAsignatura(objeto) {
        return await fetchPlanSemestreAsignatura.insertarPlanSemestreAsignaturaEnBDD(objeto);
    }

    static async actualizarPlanSemestreAsignatura(objeto) {
        return await fetchPlanSemestreAsignatura.actualizarPlanSemestreAsignaturaEnBDD(objeto);
    }
}
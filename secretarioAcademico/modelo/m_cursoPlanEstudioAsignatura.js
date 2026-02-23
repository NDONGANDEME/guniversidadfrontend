import { fetchCursoPlanEstudioAsignatura } from "../servicios/fetchCursoPlanEstudioAsignatura.js";

export class m_cursoPlanEstudioAsignatura
{
    constructor (idPlanCursoAsignatura, idCursoPlan, idSemestre, idAsignatura, creditos, modalidad, idProfesor) {
        this.idPlanCursoAsignatura = idPlanCursoAsignatura;
        this.idCursoPlan = idCursoPlan;
        this.idSemestre = idSemestre;
        this.idAsignatura = idAsignatura;
        this.creditos = creditos;
        this.modalidad = modalidad;
        this.idProfesor = idProfesor;
    }

    static async obtenerCursoPlanEstudioAsignaturas() {
        return await fetchCursoPlanEstudioAsignatura.obtenerCursoPlanEstudioAsignaturasDelBackend();
    }

    static async insertarCursoPlanEstudioAsignatura(objeto) {
        return await fetchCursoPlanEstudioAsignatura.insertarCursoPlanEstudioAsignaturaEnBDD(objeto);
    }

    static async actualizarCursoPlanEstudioAsignatura(objeto) {
        return await fetchCursoPlanEstudioAsignatura.actualizarCursoPlanEstudioAsignaturaEnBDD(objeto);
    }

    static async deshabilitarCursoPlanEstudioAsignatura(id) {
        return await fetchCursoPlanEstudioAsignatura.deshabilitarCursoPlanEstudioAsignaturaEnBDD(id);
    }

    static async habilitarCursoPlanEstudioAsignatura(id) {
        return await fetchCursoPlanEstudioAsignatura.habilitarCursoPlanEstudioAsignaturaEnBDD(id);
    }
}
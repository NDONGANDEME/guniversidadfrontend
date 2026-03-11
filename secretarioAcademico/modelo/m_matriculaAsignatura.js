import { fetchMatriculaAsignatura } from "../servicios/fetchMatriculaAsignatura.js";

export class m_matriculaAsignatura
{
    constructor (idMatriculaAsignatura, idMatricula, idPlanSemestreAsignatura, convocatoria, notaFinal, estado, numeroVecesMatriculado) {
        this.idMatriculaAsignatura = idMatriculaAsignatura;
        this.idMatricula = idMatricula;
        this.idPlanSemestreAsignatura = idPlanSemestreAsignatura;
        this.convocatoria = convocatoria;
        this.notaFinal = notaFinal;
        this.estado = estado;
        this.numeroVecesMatriculado = numeroVecesMatriculado;
    }

    static async obtenerMatriculaAsignaturas() {
        return await fetchMatriculaAsignatura.obtenerMatriculaAsignaturasDelBackend();
    }

    static async insertarMatriculaAsignatura(objeto) {
        return await fetchMatriculaAsignatura.insertarMatriculaAsignaturaEnBDD(objeto);
    }

    static async actualizarMatriculaAsignatura(objeto) {
        return await fetchMatriculaAsignatura.actualizarMatriculaAsignaturaEnBDD(objeto);
    }
}
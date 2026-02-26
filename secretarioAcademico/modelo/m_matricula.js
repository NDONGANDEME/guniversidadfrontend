import { fetchMatricula } from "../servicios/fetchMatricula.js";

export class m_matricula
{
    constructor (idMatricula, idEstudiante, idPlanEstudio, idSemestre, cursoAcademico, fechaMatricula, modalidadMatricula, totalCreditos, estado) {
        this.idMatricula = idMatricula;
        this.idEstudiante = idEstudiante;
        this.idPlanEstudio = idPlanEstudio;
        this.idSemestre = idSemestre;
        this.cursoAcademico = cursoAcademico;
        this.fechaMatricula = fechaMatricula;
        this.modalidadMatricula = modalidadMatricula;
        this.totalCreditos = totalCreditos;
        this.estado = estado;
    }

    static async obtenerMatriculas() {
        return await fetchMatricula.obtenerMatriculasDelBackend();
    }

    static async insertarMatricula(objeto) {
        return await fetchMatricula.insertarMatriculaEnBDD(objeto);
    }

    static async actualizarMatricula(objeto) {
        return await fetchMatricula.actualizarMatriculaEnBDD(objeto);
    }
}
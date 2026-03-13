import { fetchMatricula } from "../servicios/fetchMatricula.js";
import { fetchPago } from "../servicios/fetchPago.js";
import { fetchMatriculaAsignatura } from "../servicios/fetchMatriculaAsignatura.js";

/**
 * CLASE MATRICULA
 */
export class m_matricula {
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

    /*La modalidadMatricula podra ser: parcial o completa*/

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

/**
 * CLASE PAGO
 */
export class m_pago {
    constructor (idPago, idMatricula, idFamiliar, cuota, monto, fechaPago) {
        this.idPago = idPago;
        this.idMatricula = idMatricula;
        this.idFamiliar = idFamiliar;
        this.cuota = cuota;
        this.monto = monto;
        this.fechaPago = fechaPago;
    }

    static async obtenerPagos() {
        return await fetchPago.obtenerPagosDelBackend();
    }

    static async insertarPago(objeto) {
        return await fetchPago.insertarPagoEnBDD(objeto);
    }

    static async actualizarPago(objeto) {
        return await fetchPago.actualizarPagoEnBDD(objeto);
    }

    static async eliminarPago(id) {
        return await fetchPago.eliminarPagoEnBDD(id);
    }
}

/**
 * CLASE MATRICULAASIGNATURA
 */
export class m_matriculaAsignatura {
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
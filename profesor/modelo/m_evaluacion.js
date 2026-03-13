import { fetchAsistencia } from "../servicios/fetchAsistencia.js";
import { fetchEvaluacion } from "../servicios/fetchEvaluacion.js";
import { fetchNota } from "../servicios/fetchNota.js";
import { fetchTipoEvaluacion } from "../servicios/fetchTipoEvaluacion.js";

/**
 * CLASE EVALUACION
*/
export class m_evaluacion {
    constructor(idEvaluacion, idPlanCursoAsignatura, idTipoEvaluacion) {
        this.idEvaluacion = idEvaluacion;
        this.idPlanCursoAsignatura = idPlanCursoAsignatura;
        this.idTipoEvaluacion = idTipoEvaluacion;
    }

    static async obtenerEvaluaciones() {
        return await fetchEvaluacion.obtenerEvaluacionesDelBackend();
    }

    static async insertarEvaluacion(objeto) {
        return await fetchEvaluacion.insertarEvaluacionEnBackend(objeto);
    }

    static async actualizarEvaluacion(objeto) {
        return await fetchEvaluacion.actualizarEvaluacionEnBackend(objeto);
    }

    static async eliminarEvaluacion(id) {
        return await fetchEvaluacion.eliminarEvaluacionEnBackend(id);
    }
}

/**
 * CLASE ASISTENCIA
*/
export class m_asistencia {
    constructor(idAsistencia, idClase, idEstudiante, fecha, horaEntrada, horaSalida, estado, justificacion) {
        this.idAsistencia = idAsistencia;
        this.idClase = idClase;
        this.idEstudiante = idEstudiante;
        this.fecha = fecha;
        this.horaEntrada = horaEntrada;
        this.horaSalida = horaSalida;
        this.estado = estado;
        this.justificacion = justificacion;
    }

    /**
     * Notas
     * Los estados pueden ser: Presente, Ausente, Tardanza, Justificado
    */

    static async obtenerAsistencias() {
        return await fetchAsistencia.obtenerAsistenciasDelBackend();
    }

    static async insertarAsistencia(objeto) {
        return await fetchAsistencia.insertarAsistenciaEnBackend(objeto);
    }

    static async actualizarAsistencia(objeto) {
        return await fetchAsistencia.actualizarAsistenciaEnBackend(objeto);
    }

    static async eliminarAsistencia(id) {
        return await fetchAsistencia.eliminarAsistenciaEnBackend(id);
    }
}

/**
 * CLASE NOTA
*/
export class m_nota {
    constructor(idNota, idMatriculaAsignatura, idEvaluacion, valorNota, fechaRegistro) {
        this.idNota = idNota;
        this.idMatriculaAsignatura = idMatriculaAsignatura;
        this.idEvaluacion = idEvaluacion;
        this.valorNota = valorNota;
        this.fechaRegistro = fechaRegistro;
    }

    static async obtenerNotas() {
        return await fetchNota.obtenerNotasDelBackend();
    }

    static async insertarNota(objeto) {
        return await fetchNota.insertarNotaEnBackend(objeto);
    }

    static async actualizarNota(objeto) {
        return await fetchNota.actualizarNotaEnBackend(objeto);
    }

    static async eliminarNota(id) {
        return await fetchNota.eliminarNotaEnBackend(id);
    }
}

/**
 * CLASE TIPOEVALUACION
*/
export class m_tipoEvaluacion {
    constructor(idTipoEvaluacion, nombreTipo, porcentaje) {
        this.idTipoEvaluacion = idTipoEvaluacion;
        this.nombreTipo = nombreTipo;
        this.porcentaje = porcentaje;
    }

    static async obtenerEvaluaciones() {
        return await fetchTipoEvaluacion.obtenerTipoEvaluacionesDelBackend();
    }

    static async insertarEvaluacion(objeto) {
        return await fetchTipoEvaluacion.insertarTipoEvaluacionEnBackend(objeto);
    }

    static async actualizarEvaluacion(objeto) {
        return await fetchTipoEvaluacion.actualizarTipoEvaluacionEnBackend(objeto);
    }

    static async eliminarEvaluacion(id) {
        return await fetchTipoEvaluacion.eliminarTipoEvaluacionEnBackend(id);
    }
}

		

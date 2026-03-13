import { fetchCurso } from "../servicios/fetchCurso.js";
import { fetchPlanEstudio } from "../servicios/fetchPlanEstudio.js";
import { fetchSemestre } from "../servicios/fetchSemestre.js";
import { fetchPlanSemestreAsignatura } from "../servicios/fetchPlanSemestreAsignatura.js";
import { fetchPrerequisito } from "../servicios/fetchPrerequisitos.js";

/**
 * CLASE PLANESTUDIO
 */
export class m_planEstudio {
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

/**
 * CLASE CURSO
 */
export class m_curso {
    constructor(idCurso, nombreCurso, nivel) {
        this.idCurso = idCurso;
        this.nombreCurso = nombreCurso;
        this.nivel = nivel;
    }

    static async obtenerCursos() {
        return await fetchCurso.obtenerCursosDelBackend();
    }

    static async insertarCurso(objeto) {
        return await fetchCurso.insertarCursoEnBackend(objeto);
    }

    static async actualizarCurso(objeto) {
        return await fetchCurso.actualizarCursoEnBackend(objeto);
    }

    static async eliminarCurso(id) {
        return await fetchCurso.eliminarCursoEnBackend(id);
    }
}

/**
 * CLASE SEMESTRE
 */
export class m_semestre {
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

/**
 * CLASE PLANSEMESTREASIGNATURA
 */
export class m_PlanSemestreAsignatura {
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

/**
 * CLASE PRERREQUISITO
 */
export class m_prerequisito {
    constructor (idPrerrequisito, idAsignatura, idAsignaturaRequerida) {
        this.idPrerrequisito = idPrerrequisito;
        this.idAsignatura = idAsignatura;
        this.idAsignaturaRequerida = idAsignaturaRequerida;
    }

    static async obtenerPrerequisito() {
        return await fetchPrerequisito.obtenerPrerequisitosDelBackend();
    }

    static async insertarPrerequisito(objeto) {
        return await fetchPrerequisito.insertarPrerequisitoEnBDD(objeto);
    }

    static async actualizarPrerequisito(objeto) {
        return await fetchPrerequisito.actualizarPrerequisitoEnBDD(objeto);
    }
}
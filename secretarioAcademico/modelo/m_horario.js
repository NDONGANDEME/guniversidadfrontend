import { fetchHorario } from "../servicios/fetchHorario.js";
import { fetchAula } from "../servicios/fetchAula.js";
import { fetchClase } from "../servicios/fetchClase.js";
import { fetchClaseHorario } from "../servicios/fetchClaseHorario.js";

/**
 * CLASE HORARIO
 */
export class m_horario {
    constructor (idHorario, nombre) {
        this.idHorario = idHorario;
        this.nombre = nombre;
    }

    static async obtenerHorarios() {
        return await fetchHorario.obtenerHorariosDelBackend();
    }

    static async insertarHorario(objeto) {
        return await fetchHorario.insertarHorarioEnBDD(objeto);
    }

    static async actualizarHorario(objeto) {
        return await fetchHorario.actualizarHorarioEnBDD(objeto);
    }

    static async eliminarHorario(id) {
        return await fetchHorario.eliminarHorarioEnBDD(id);
    }
}

/**
 * CLASE CLASE
 */
export class m_clase {
    constructor (idClase, idPlanSemestreAsignatura, idAula, idProfesor, diaSemanal, horaInicio, horaFinal, tipoSesion, observaciones) {
        this.idClase = idClase;
        this.idPlanSemestreAsignatura = idPlanSemestreAsignatura;
        this.idAula = idAula;
        this.idProfesor = idProfesor;
        this.diaSemanal = diaSemanal;
        this.horaInicio = horaInicio;
        this.horaFinal = horaFinal;
        this.tipoSesion = tipoSesion;
        this.observaciones = observaciones;
    }

    static async obtenerClases() {
        return await fetchClase.obtenerClasesDelBackend();
    }

    static async insertarClase(objeto) {
        return await fetchClase.insertarClaseEnBDD(objeto);
    }

    static async actualizarClase(objeto) {
        return await fetchClase.actualizarClaseEnBDD(objeto);
    }

    static async eliminarClase(id) {
        return await fetchClase.eliminarClaseEnBDD(id);
    }
}

/**
 * CLASE AULA
 */
export class m_aula {
    constructor(idAula, nombreAula, capacidad, idFacultad, estado) {
        this.idAula = idAula;
        this.nombreAula = nombreAula;
        this.capacidad = capacidad;
        this.idFacultad = idFacultad;
        this.estado = estado;
    }

    static async obtenerAulas() {
        return await fetchAula.obtenerAulasDelBackend();
    }

    static async obtenerAulasPorFacultad(idFacultad) {
        return await fetchAula.obtenerAulasPorFacultadDelBackend(idFacultad);
    }

    static async insertarAula(objeto) {
        return await fetchAula.insertarAulaEnBackend(objeto);
    }

    static async actualizarAula(objeto) {
        return await fetchAula.actualizarAulaEnBackend(objeto);
    }

    static async deshabilitarAula(id) {
        return await fetchAula.deshabilitarAulaEnBackend(id);
    }

    static async habilitarAula(id) {
        return await fetchAula.habilitarAulaEnBackend(id);
    }

    static async eliminarAula(id) {
        return await fetchAula.eliminarAulaEnBackend(id);
    }
}

/**
 * CLASE CLASEHORARIO
 */
export class m_claseHorario {
    constructor (idClaseHoario, idClase, idHorario) {
        this.idClaseHoario = idClaseHoario;
        this.idClase = idClase;
        this.idHorario = idHorario;
    }

    static async obtenerClaseHorarios() {
        return await fetchClaseHorario.obtenerClaseHorariosDelBackend();
    }

    static async insertarClaseHorario(objeto) {
        return await fetchClaseHorario.insertarClaseHorarioEnBDD(objeto);
    }

    static async actualizarClaseHorario(objeto) {
        return await fetchClaseHorario.actualizarClaseHorarioEnBDD(objeto);
    }

    static async eliminarClaseHorario(id) {
        return await fetchClaseHorario.eliminarClaseHorarioEnBDD(id);
    }
}
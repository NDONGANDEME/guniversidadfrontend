import { fetchCarrera } from "../servicios/fetchCarrera.js";
import { fetchAsignatura } from "../servicios/fetchAsignatura.js";
import { fetchFacultad } from "../servicios/fetchFacultad.js";
import { fetchDepartamento } from "../servicios/fetchDepartamento.js";

/**
 * CLASE FACULTAD
 */
export class m_facultad {
    constructor(idFacultad, nombreFacultad, direccionFacultad, correo, telefono) {
        this.idFacultad = idFacultad;
        this.nombreFacultad = nombreFacultad;
        this.direccionFacultad = direccionFacultad;
        this.correo = correo;
        this.telefono = telefono;
    }

    static async obtenerFacultades() {
        return await fetchFacultad.obtenerFacultadesDelBackend();
    }

    static async insertarFacultad(objeto) {
        return await fetchFacultad.insertarFacultadEnBackend(objeto);
    }

    static async actualizarFacultad(objeto) {
        return await fetchFacultad.actualizarFacultadEnBackend(objeto);
    }

    static async eliminarFacultad(id) {
        return await fetchFacultad.eliminarFacultadEnBackend(id);
    }
}

/**
 * CLASE DEPARTAMENTO
 */
export class m_departamento {
    constructor(idDepartamento, nombre, idFacultad) {
        this.idDepartamento = idDepartamento;
        this.nombre = nombre;
        this.idFacultad = idFacultad;
    }

    static async obtenerDepartamentos() {
        return await fetchDepartamento.obtenerDepartamentosDelBackend();
    }

    static async obtenerDepartamentosPorFacultad(idFacultad) {
        return await fetchDepartamento.obtenerDepartamentosPorFacultadDelBackend(idFacultad);
    }

    static async insertarDepartamento(objeto) {
        return await fetchDepartamento.insertarDepartamentoEnBackend(objeto);
    }

    static async actualizarDepartamento(objeto) {
        return await fetchDepartamento.actualizarDepartamentoEnBackend(objeto);
    }

    static async eliminarDepartamento(id) {
        return await fetchDepartamento.eliminarDepartamentoEnBackend(id);
    }
}

/**
 * CLASE CARRERA
 */
export class m_carrera {
    constructor(idCarrera, nombreCarrera, idDepartamento, estado) {
        this.idCarrera = idCarrera;
        this.nombreCarrera = nombreCarrera;
        this.idDepartamento = idDepartamento;
        this.estado = estado;
    }

    static async obtenerCarreras() {
        return await fetchCarrera.obtenerCarrerasDelBackend();
    }

    static async insertaCarrera(objeto) {
        return await fetchCarrera.insertarCarreraEnBackend(objeto);
    }

    static async actualizaCarrera(objeto) {
        return await fetchCarrera.actualizarCarreraEnBackend(objeto);
    }

    static async eliminarCarrera(id) {
        return await fetchCarrera.eliminarCarreraEnBackend(id);
    }

    static async obtenerCarrerasAPaginar(pagina) {
        return await fetchCarrera.obtenerCarrerasAPaginarDelBackend(pagina);
    }

    static async obtenerTotalPaginasCarrera() {
        return await fetchCarrera.obtenerTotalPaginasCarreraDelBackend();
    }

    static async cambioEstadoCarrera(id, estado) {
        return await fetchCarrera.cambioEstadoCarreraEnBDD(id, estado);
    }
}

/**
 * CLASE ASIGNATURA
 */
export class m_asignatura {
    constructor(idAsignatura, codigoAsignatura, nombreAsignatura, descripcion, idFacultad) {
        this.idAsignatura = idAsignatura;
        this.codigoAsignatura = codigoAsignatura;
        this.nombreAsignatura = nombreAsignatura;
        this.descripcion = descripcion;
        this.idFacultad = idFacultad;
    }

    /*
        el codigo de la aignatura se generará automaticamente en el metodo generarCodigoAsignatura(nombreFacultad, nombreAsignatura){} y devolverá un string del formato:
        facultad-numero-asignatura. ejemplo: FI-0001-RED (faciltad de ingenierias, numero 0001, asignatura: redes).
    */

    static async obtenerAsignaturas() {
        return await fetchAsignatura.obtenerAsignaturasDelBackend();
    }

    static async obtenerAsignaturasPorSemestre(numeroSemestre) {
        return await fetchAsignatura.obtenerAsignaturasPorSemestreDelBackend(numeroSemestre);
    }

    static async obtenerAsignaturasPorPlanEstudio(idEstudiante) {
        return await fetchAsignatura.obtenerAsignaturasPorPlanEstudioDelBackend(idEstudiante);
    }

    static async obtenerAsignaturasPendientesYBloqueadas(numeroSemestre) {
        return await fetchAsignatura.obtenerAsignaturasPendientesYBloqueadasDelBackend(numeroSemestre);
    }

    static async insertarAsignatura(objeto) {
        return await fetchAsignatura.insertarAsignaturaEnBackend(objeto);
    }

    static async actualizarAsignatura(objeto) {
        return await fetchAsignatura.actualizarAsignaturaEnBackend(objeto);
    }

    static async obtenerAsignaturasPorFacultad(idFacultad) {
        return await fetchAsignatura.obtenerAsignaturasPorFacultadDelBackend(idFacultad);
    }

    static async eliminarAsignatura(idAsignatura) {
        return await fetchAsignatura.eliminarAsignaturaEnBackend(idAsignatura);
    }

    static async obtenerAsignaturasAPaginar(pagina) {
        return await fetchAsignatura.obtenerAsignaturasAPaginarDelBackend(pagina);
    }

    static async obtenerTotalPaginasAsignatura() {
        return await fetchAsignatura.obtenerTotalPaginasAsignaturaDelBackend();
    }
}
import { fetchAsignatura } from "../servicios/fetchAsignatura.js";

export class m_asignatura
{
    constructor(idAsignatura, codigoAsignatura, nombreAsignatura, descripcion, idFacultad)
    {
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

    static async insertarAsignatura(objeto) {
        return await fetchAsignatura.insertarAsignaturaEnBackend(objeto);
    }

    static async actualizarAsignatura(objeto) {
        return await fetchAsignatura.actualizarAsignaturaEnBackend(objeto);
    }

    static async obtenerAsignaturasPorFacultad(idFacultad) {
        return await fetchAsignatura.obtenerAsignaturasPorFacultadDelBackend(idFacultad);
    }
}
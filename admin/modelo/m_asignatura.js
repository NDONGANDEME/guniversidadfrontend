import { fetchAsignatura } from "../servicios/fetchAsignatura.js";

export class m_asignatura
{
    constructor(idAsignatura, nombreAsignatura)
    {
        this.idAsignatura = idAsignatura;
        this.nombreAsignatura = nombreAsignatura;
    }

    static async obtenerAsignaturas() {
        return await fetchAsignatura.obtenerAsignaturasDelBackend();
    }

    static async insertarAsignatura(objeto) {
        return await fetchAsignatura.insertarAsignaturaEnBackend(objeto);
    }

    static async actualizarAsignatura(objeto) {
        return await fetchAsignatura.actualizarAsignaturaEnBackend(objeto);
    }

    static async deshabilitarAsignatura(id) {
        return await fetchAsignatura.deshabilitarAsignaturaEnBackend(id);
    }

    static async habilitarAsignatura(id) {
        return await fetchAsignatura.habilitarAsignaturaEnBackend(id);
    }
}
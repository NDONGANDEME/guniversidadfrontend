import { fetchCurso } from "../servicios/fetchCurso.js";

export class m_curso
{
    constructor(idCurso, nombreCurso, nivel)
    {
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
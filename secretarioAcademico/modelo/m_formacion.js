import { fetchFormacion } from "../servicios/fetchFormacion.js";

export class m_formacion
{
    constructor (idFormacion, institucion, tipoFormacion, titulo, nivel, idProfesor) {
        this.idFormacion = idFormacion;
        this.institucion = institucion;
        this.tipoFormacion = tipoFormacion;
        this.titulo = titulo;
        this.nivel = nivel;
        this.idProfesor = idProfesor;
    }

    static async obtenerFormacionPorProfesor(idProfesor) {
        return await fetchFormacion.obtenerFormacionPorProfesorDelBackend(idProfesor);
    }

    static async insertarFormacion(objeto) {
        return await fetchFormacion.insertarFormacionEnBDD(objeto);
    }

    static async actualizarFormacion(objeto) {
        return await fetchFormacion.actualizarFormacionEnBDD(objeto);
    }
}
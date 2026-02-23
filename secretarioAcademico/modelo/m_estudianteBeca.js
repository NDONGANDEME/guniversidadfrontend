import { fetchEstudianteBeca } from "../servicios/fetchEstudianteBeca.js";

export class m_estudianteBeca
{
    estudiante_beca (idEstudianteBecario, idEstudiante, idBeca, fechaInicio, fechaFinal, estado, observaciones) {
        this.idEstudianteBecario = idEstudianteBecario;
        this.idEstudiante = idEstudiante;
        this.idBeca = idBeca;
        this.fechaInicio = fechaInicio;
        this.fechaFinal = fechaFinal;
        this.estado = estado;
        this.observaciones = observaciones;
    }

    static async obtenerEstudiantes() {
        return await fetchEstudianteBeca.obtenerEstudiantesBecaDelBackend();
    }

    static async insertarEstudiante(objeto) {
        return await fetchEstudianteBeca.insertarEstudianteBecadoEnBDD(objeto);
    }

    static async actualizarEstudiante(objeto) {
        return await fetchEstudianteBeca.actualizarEstudianteBecadoEnBDD(objeto);
    }
}
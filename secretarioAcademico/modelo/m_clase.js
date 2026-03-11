import { fetchClase } from "../servicios/fetchClase.js";


export class m_clase
{
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
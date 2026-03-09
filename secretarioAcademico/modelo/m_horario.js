import { fetchHorario } from "../servicios/fetchHorario.js";

export class m_horario
{
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
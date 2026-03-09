import { fetchClaseHorario } from "../servicios/fetchClaseHorario.js";


export class m_claseHorario
{
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
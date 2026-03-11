import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_horario } from "../modelo/m_horario.js";

export class fetchHorario
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los horarios de la BDD
     * @returns array de horarios
     */
    static async obtenerHorariosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=horario&accion=obtenerHorarios&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchHorario]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo horario en la BDD
     * @param {m_horario} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarHorarioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=horario&accion=insertarHorario&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchHorario]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un horario guardado en la BDD
     * @param {m_horario} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarHorarioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=horario&accion=actualizarHorario&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchHorario]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async eliminarHorarioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=horario&accion=eliminarHorario&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchHorario]. ${error}`, 3000);
            return false;
        }
    }
}
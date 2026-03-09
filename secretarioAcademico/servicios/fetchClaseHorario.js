import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_claseHorario } from "../modelo/m_claseHorario.js";

export class fetchClaseHorario
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar las clases de la BDD
     * @returns array de clases
     */
    static async obtenerClaseHorariosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=clase&accion=obtenerClaseHorarios&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchClaseHorario]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva clase en la BDD
     * @param {m_claseHorario} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarClaseHorarioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=clase&accion=insertarClaseHorario&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchClaseHorario]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una clase guardada en la BDD
     * @param {m_claseHorario} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarClaseHorarioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=clase&accion=actualizarClaseHorario&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchClaseHorario]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async eliminarClaseHorarioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=clase&accion=eliminarClaseHorario&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchClaseHorario]. ${error}`, 3000);
            return false;
        }
    }
}
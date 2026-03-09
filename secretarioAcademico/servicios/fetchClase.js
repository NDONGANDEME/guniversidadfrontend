import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_clase } from "../modelo/m_clase.js";

export class fetchClase
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar las clases de la BDD
     * @returns array de clases
     */
    static async obtenerClasesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=clase&accion=obtenerClases&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchClase]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva clase en la BDD
     * @param {m_clase} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarClaseEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=clase&accion=insertarClase&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchClase]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una clase guardada en la BDD
     * @param {m_clase} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarClaseEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=clase&accion=actualizarClase&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchClase]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async eliminarClaseEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=clase&accion=eliminarClase&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchClase]. ${error}`, 3000);
            return false;
        }
    }
}
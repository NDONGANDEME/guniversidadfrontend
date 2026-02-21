import { m_contacto } from "../modelo/m_contacto.js";
import { Alerta } from "../utilidades/u_alertas.js";

export class fetchContacto
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud
     * @param {String} actor 
     * @returns 
     */
    static async obtenerContactosDelBackend(actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=contactos&accion=obtenerContactos&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchContacto]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Inserta los parametros a para la creacion del nuevo registro en la BDD
     * @param {m_contacto} objeto - que contiene los parametros de contacto a insertar en la tabla
     * @returns el id del nuevo registro insertado
     */
    static async insertarContactoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=contactos&accion=insertarContacto`,{
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchContacto]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @param {m_contacto} objeto 
     * @returns el id del registro actualizado
     */
    static async actualizarContactoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=contactos&accion=actualizarContacto`,{
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchContacto]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @param {m_contacto} id 
     * @returns un booleano que confirme que se ha eliminado el registro indicado
     */
    static async eliminarContactoEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=contactos&accion=eliminarContacto&valor=${id}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchContacto]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns lista de contactos pertenecientes a ese id pasado por la url
     */
    static async obtenerContactoPorIdEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=contactos&accion=obtenerContactoPorId&valor=${id}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchContacto]. ${error}`, 3000);
            return null;
        }
    }
}
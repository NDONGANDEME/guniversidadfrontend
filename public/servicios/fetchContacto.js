import { m_contacto } from "../modelo/m_contacto.js";
import { Alerta } from "../utilidades/u_alertas.js";

export class fetchContacto
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Obtiene todos los contactos almacenados en la BDD
     * @returns array de todos los contactos de la BDD
     */
    static async obtenerContactosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=contactos&accion=obtenerContactos`);
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
    static async insertarContactoEnBDD(objeto) {
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
    static async actualizarContactoEnBDD(objeto) {
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
    static async eliminarContactoEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=contactos&accion=eliminarContacto&valor=${id}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. Estoy en fetchContactos (4). ${error}`);
            return null;
        }
    }
}
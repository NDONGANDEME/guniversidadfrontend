import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_facultad } from "../modelo/m_facultad.js";

export class fetchFacultad
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Obtiene todas las facultades almacenadas en la BDD
     * @returns array de facultades
     */
    static async obtenerFacultadesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&action=obtenerFacultades&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFacultad]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Guarda la nueva facultad creada en la BDD
     * @param {m_facultad} objeto - objeto que contiene los parametros de la clase facultad
     * @returns el nuevo id insertado en la BDD
     */
    static async insertarFacultadEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=insertarFacultad&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFacultad]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Modifica los campos, modificados por el usuario, en la BDD
     * @param {m_facultad} objeto - objeto que contiene los parametros de la clase facultad
     * @returns el id del registro actualizado
     */
    static async actualizarFacultadEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=actualizarNoticia&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFacultad]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns booleano que indique se se ha desabilitado el registro del id pasado por la url
     */
    static async deshabilitarFacultadEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=deshabilitarFacultad&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 99. fetchFacultad]. ${error}`);
            return false;
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns booleano que indique se se ha desabilitado el registro del id pasado por la url
     */
    static async habilitarFacultadEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=habilitarFacultad&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 99. fetchFacultad]. ${error}`);
            return false;
        }
    }
}
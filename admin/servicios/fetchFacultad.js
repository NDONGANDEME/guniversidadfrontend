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
            let solicitud = await fetch(`${this.url}?ruta=facultad&action=obtenerFacultades`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.notificarError(`Error: ${respuesta.mensaje}. [fetchFacultad]`, 3000);
                return [];
            }
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
    static async insertarFacultadEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=insertarFacultad`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarError(`Error: ${respuesta.mensaje}. [fetchFacultad]`, 3000);
                return null;
            }
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
    static async actualizarFacultadEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=actualizarNoticia`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarError(`Error: ${respuesta.mensaje}. [fetchFacultad]`, 3000);
                return null;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFacultad]. ${error}`, 3000);
            return null;
        }
    }


    // NO ESTA EN USO
    static async deshabilitarFacultadEnBDD(id)
    {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=deshabilitarFacultad&valor=${id}`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 90. fetchFacultad]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 95. fetchFacultad]`);
                return;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 99. fetchFacultad]. ${error}`);
            return;
        }
    }
}
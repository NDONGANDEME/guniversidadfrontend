import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchAdministrativo
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * 
     * @param {*} actor 
     * @returns 
     */
    static async obtenerAdministrativosDelBackend(actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&action=obtenerAdministrativos&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAdministrativo]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * 
     * @param {*} objeto 
     * @param {*} actor 
     * @returns 
     */
    static async insertarAdministrativoEnBackend(objeto, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=insertarAdministrativo&actor=${actor}`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAdministrativo]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @param {*} objeto 
     * @param {*} actor 
     * @returns 
     */
    static async actualizarAdministrativoEnBackend(objeto, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=actualizarAdministrativo&actor=${actor}`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAdministrativo]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @param {*} id 
     * @param {*} actor 
     * @returns 
     */
    static async deshabilitarAdministrativoEnBackend(id, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=deshabilitarAdministrativo&valor=${id}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAdministrativo]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * 
     * @param {*} id 
     * @param {*} actor 
     * @returns 
     */
    static async habilitarAdministrativoEnBackend(id, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=habilitarAdministrativo&valor=${id}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAdministrativo]. ${error}`, 3000);
            return false;
        }
    }
}
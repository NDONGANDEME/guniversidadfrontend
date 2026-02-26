import { Alerta } from "../../public/utilidades/u_alertas.js";
import { m_administrativo } from "../modelo/m_administrativo.js";

export class fetchAdministrativo
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar administrativos de la BDD
     * @returns array de administrativos
     */
    static async obtenerAdministrativosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=obtenerAdministrativos&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAdministrativo]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo administrativo en la BDD
     * @param {m_administrativo} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarAdministrativoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=insertarAdministrativo&actor=admin`, {
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
     * Envia solicitud para actualizar un administrativo existente de la BDD
     * @param {m_administrativo} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarAdministrativoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=actualizarAdministrativo&actor=admin`, {
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
}
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchRol
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * YA SON FUNCIONALES
    */

    /**
     * Envia solicitud para cargar los roles de la BDD
     * @returns array de roles
     * Ya es funcional
     */
    static async obtenerRolesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=rol&accion=obtenerRoles&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchRol]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo rol a la BDD
     * @param {m_permiso} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarRolEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=rol&accion=insertarRol&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchRol]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_permiso} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarRolEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=rol&accion=actualizarRol&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchRol]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarRolEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=rol&accion=eliminarRol&idRol=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchRol]. ${error}`);
            return false;
        }
    }
}
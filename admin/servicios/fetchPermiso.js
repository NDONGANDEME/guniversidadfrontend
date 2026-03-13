import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchPermiso
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar las permisos de la BDD
     * @returns array de permisos
     * Ya es funcional
     */
    static async obtenerPermisosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=permiso&accion=obtenerPermisos&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPermiso]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo permiso a la BDD
     * @param {m_permiso} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarPermisoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=permiso&accion=insertarPermiso&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPermiso]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_permiso} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarPermisoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=permiso&accion=actualizarPermiso&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPermiso]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarPermisoEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=permiso&accion=eliminarPermiso&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchPermiso]. ${error}`);
            return false;
        }
    }
}
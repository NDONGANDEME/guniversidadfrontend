import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchRolPermiso
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar las permisos de la BDD
     * @returns array de permisos
     * Ya es funcional
     */
    static async obtenerRolPermisosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=permiso&accion=obtenerRolPermisos&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchRolPermiso]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo permiso a la BDD
     * @param {m_permiso} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarRolPermisoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=permiso&accion=insertarRolPermiso&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchRolPermiso]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_permiso} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarRolPermisoEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=permiso&accion=actualizarRolPermiso&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchRolPermiso]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarRolPermisoEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=permiso&accion=eliminarRolPermiso&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchRolPermiso]. ${error}`);
            return false;
        }
    }
}
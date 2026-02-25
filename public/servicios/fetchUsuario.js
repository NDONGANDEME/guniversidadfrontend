import { Alerta } from "../utilidades/u_alertas.js";

export class fetchUsuario
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para insertar un nuevo usuario en la BDD 
     * @param {m_usuario} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarUsuarioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=insertarUsuario&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_usuario} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarUsuarioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=actualizarUsuario&actor=admin`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar a un usuario habilitado
     * @param {Integer} id 
     * @returns booleano
     */
    static async deshabilitarUsuarioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=deshabilitarUsuario&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar a un usuario deshabilitado
     * @param {Integer} id 
     * @returns booleano
     */
    static async habilitarUsuarioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=habilitarUsuario&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para listar todos los usuarios de la BDD
     * @returns array de usuarios
     */
    static async obtenerUsuariosEnBDD() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=obtenerUsuarios&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return [];
        }
    }
}
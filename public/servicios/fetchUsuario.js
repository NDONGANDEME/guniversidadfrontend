import { Alerta } from "../utilidades/u_alertas.js";

export class fetchUsuario
{
    url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * 
     * @param {*} objeto 
     * @param {*} actor 
     * @returns 
     */
    static async insertarUsuarioEnBDD(objeto, actor) {
        try {
            let solicitud = await fetch(`${url}?ruta=usuario&accion=insertarUsuario&actor=${actor}`, {
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
     * 
     * @param {*} objeto 
     * @param {*} actor 
     * @returns 
     */
    static async actualizarUsuarioEnBDD(objeto, actor) {
        try {
            let solicitud = await fetch(`${url}?ruta=usuario&accion=actualizarUsuario&actor=${actor}`, {
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
     * 
     * @param {*} id 
     * @param {*} actor 
     * @returns 
     */
    static async deshabilitarUsuarioEnBDD(id, actor) {
        try {
            let solicitud = await fetch(`${url}?ruta=usuario&accion=deshabilitarUsuario&valor=${id}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * 
     * @param {*} id 
     * @param {*} actor 
     * @returns 
     */
    static async habilitarUsuarioEnBDD(id, actor) {
        try {
            let solicitud = await fetch(`${url}?ruta=usuario&accion=habilitarUsuario&valor=${id}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * 
     * @param {*} contraseña 
     * @param {*} actor 
     * @returns 
     */
    static async verificarContraseñaExistenteEnBackend(contraseña, actor) {
        try {
            let solicitud = await fetch(`${url}?ruta=usuario&accion=verificarContraseñaExistente&actor=${actor}`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({contrasena: contraseña})
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * 
     * @param {*} actor 
     * @returns 
     */
    static async obtenerUsuariosEnBDD(actor) {
        try {
            let solicitud = await fetch(`${url}?ruta=usuario&accion=obtenerUsuarios&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return [];
        }
    }
}
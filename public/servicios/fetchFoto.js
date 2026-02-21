import { Alerta } from "../utilidades/u_alertas.js";

export class fetchFoto
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar todas las fotos de la BDD
     * @param {String} actor 
     * @returns array de fotos
     */
    static async obtenerFotosEnBDD(actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=obtenerFotos&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFoto]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva foto para la noticia en la BDD
     * @param {m_foto} objeto 
     * @param {String} actor 
     * @returns id del nuevo registro insertado
     */
    static async insertarFotoEnBDD(objeto, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=insertarFoto&actor=${actor}`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFoto]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una foto guardada en la BDD
     * @param {m_foto} objeto 
     * @param {String} actor 
     * @returns id del registro actualizado
     */
    static async actualizarFotoEnBDD(objeto, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=actualizarFoto&actor=${actor}`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFoto]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar una foto
     * @param {Integer} id 
     * @param {String} actor 
     * @returns boolean
     */
    static async eliminarFotoEnBDD(id, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=eliminarFoto&valor=${id}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFoto]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para obteber fotos por noticia
     * @param {Integer} idNoticia 
     * @param {String} actor 
     * @returns array de fotos pertenecientes a una sola noticia
     */
    static async obtenerFotosPorNoticiaEnBDD(idNoticia, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=obtenerFotosPorNoticia&valor=${idNoticia}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFoto]. ${error}`, 3000);
            return [];
        }
    }
}
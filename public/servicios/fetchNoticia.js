import { Alerta } from "../utilidades/u_alertas.js";

export class fetchNoticia
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Enviar solicitud para cargar las noticias mas recientes de la BDD
     * @param {String} actor - indicar el modulo al que le hacemos la solicitud
     * @returns array de noticias recientes
     */
    static async obtenerNoticiasRecientesDelBackend(actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerNoticiasRecientes&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar las noticas de tipo comunicado
     * @param {String} actor 
     * @returns array de noticias de tipo comunicado
     */
    static async obtenerNoticiasPorComunicadoDelBackend(actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerNoticiasPorComunicado&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar todas las noticias
     * @param {String} actor 
     * @returns array de noticias
     */
    static async obtenerNoticiasDelBackend(actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&action=obtenerNoticias&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para insertar una nueva noticia en la BDD
     * @param {m_noticia} objeto 
     * @param {String} actor 
     * @returns id del nuevo registro insertado
     */
    static async insertarNoticiaEnBDD(objeto, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=insertarNoticia&actor=${actor}`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una noticia de la BDD
     * @param {m_noticia} objeto 
     * @param {String} actor 
     * @returns id del registro actualizado
     */
    static async actualizarNoticiaEnBDD(objeto, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=actualizarNoticia&actor=${actor}`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar una noticia
     * @param {Integer} id 
     * @param {String} actor 
     * @returns booleano
     */
    static async eliminarNoticiaEnBDD(id, actor) {
        try  {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=eliminarNoticia&valor=${id}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para obtener el numero de paginas a paginar
     * @param {String} actor 
     * @returns integer (entero)
     */
    static async obtenerCantidadPaginacionEnBDD(actor) {
        try  {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerCantidadPaginacion&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return 0;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return 0;
        }
    }

    /**
     * Envia solicitud para cargar una noticia conociendo el id
     * @param {Integer} id 
     * @param {String} actor 
     * @returns 
     */
    static async obtenerNoticiaPorIdEnBDD(id, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerNoticiaPorId&valor=${id}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }
}
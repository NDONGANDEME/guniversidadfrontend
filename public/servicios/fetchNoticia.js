import { Alerta } from "../utilidades/u_alertas.js";

export class fetchNoticia
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Enviar solicitud para cargar las noticias mas recientes de la BDD
     * @returns array de noticias recientes
     */
    static async obtenerNoticiasRecientesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerNoticiasRecientes&actor=global`);
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
     * @returns array de noticias de tipo comunicado
     */
    static async obtenerNoticiasPorComunicadoDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerNoticiasPorComunicado&actor=global`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para cargar las noticas de tipo interna
     * @returns array de noticias de tipo interna
     */
    static async obtenerNoticiasPorInternaDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerNoticiasPorInterna&actor=global`);
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
     * @returns array de noticias
     */
    static async obtenerNoticiasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerNoticias&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Enviar solicitud para actualizar una noticia existente en la BDD
     * @param {FormData} formData - Objeto FormData con los datos de la noticia y archivos
     * @returns resultado de la operación
     */
    static async actualizarNoticiaEnBDD(formData) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=actualizarNoticia&actor=admin&debug=1`, {
                method: 'POST',
                body: formData
            });
            
            let respuesta = await solicitud.text(); console.log(respuesta)
            
            if (respuesta.estado == 'exito') return respuesta.resultado;
            else {
                console.error('Error del servidor:', respuesta);
                return null;
            }
        } catch(error) {
            console.error('Error en fetchNoticia.actualizarNoticiaEnBDD:', error);
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una noticia existente en la BDD
     * @param {FormData} formData - Objeto FormData con los datos de la noticia y archivos
     * @returns resultado de la operación
     */
    static async insertarNoticiaEnBDD(formData) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=insertarNoticia&actor=admin&debug=1`, {
                method: 'POST',
                body: formData
            });
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            console.error('Error en fetchNoticia.actualizarNoticiaEnBDD:', error);
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar una noticia
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarNoticiaEnBDD(id) {
        try  {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=eliminarNoticia&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para obtener el numero de paginas a paginar
     * @returns integer (entero)
     */
    static async obtenerCantidadPaginacionEnBDD() {
        try  {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerCantidadPaginacion&actor=global`);
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
     * @returns 
     */
    static async obtenerNoticiaPorIdEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerNoticiaPorId&valor=${id}&actor=global`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }
}
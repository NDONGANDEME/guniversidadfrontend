import { Alerta } from "../utilidades/u_alertas.js";

export class fetchArchivo
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los archivos de la BDD
     * @param {String} actor 
     * @returns array de archivos
     */
    static async obtenerArchivosDelBackend(actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=archivos&accion=obtenerArchivos&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchArchivo]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nuevo archivo en la BDD
     * @param {m_archivo} objeto 
     * @param {String} actor 
     * @returns id del nuevo registro insertado
     */
    static async insertarArchivoEnBDD(objeto, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=archivos&accion=insertarArchivo&actor=${actor}`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchArchivo]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un archivo guardado en la BDD
     * @param {m_archivo} objeto 
     * @param {String} actor 
     * @returns id del registro actualizado
     */
    static async actualizarArchivoEnBDD(objeto, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=archivos&accion=actualizarArchivo&actor=${actor}`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchArchivo]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un archivo
     * @param {Integer} id 
     * @param {String} actor 
     * @returns boolean
     */
    static async eliminarArchivoEnBDD(id, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=archivos&accion=eliminarArchivo&valor=${id}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchArchivo]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para obteber archivos por noticia
     * @param {Integer} idNoticia 
     * @param {String} actor 
     * @returns array de archivos pertenecientes a una sola noticia
     */
    static async obtenerArchivosPorNoticiaEnBDD(idNoticia, actor) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=archivos&accion=obtenerArchivosPorNoticia&valor=${idNoticia}&actor=${actor}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchArchivo]. ${error}`, 3000);
            return [];
        }
    }
}
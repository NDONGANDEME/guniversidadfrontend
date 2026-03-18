import { Alerta } from "../utilidades/u_alertas.js";

export class fetchNoticia
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    // =============================== GLOBAL ==================================

    /**
     * Enviar solicitud para cargar las noticias mas recientes de la BDD
     * @returns array de noticias recientes
     * Ya es funcional
     */
    static async obtenerNoticiasRecientesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerNoticiasRecientes&actor=global`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return [];
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para cargar una noticia conociendo el id
     * @param {Integer} id 
     * @returns la noticia solicitada
     */
    static async obtenerNoticiaPorIdEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerNoticiaPorId&id=${id}&actor=global`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return null;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }

    // =============================== ADMIN ==================================

    /**
     * Envia solicitud para obtener el total de paginas
     * @returns integer (entero)
     */
    static async obtenerTotalPaginasNoticiaEnBackend() { 
        try  {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerTotalPaginasNoticia&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return 0;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return 0;
        }
    }

    /**
     * Envia solicitud para cargar una noticia conociendo el id
     * @param {Integer} pagina
     * @returns array de noticias
     */
    static async obtenerNoticiasAPaginarEnBackend(pagina) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerNoticiasAPaginar&id=${pagina}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return null;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para obtener el numero de paginas a paginar
     * @returns integer (entero)
     */
    static async obtenerTotalPaginasNoticiaPorTipoEnBackend(tipo) {
        try  {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerTotalPaginasNoticiaPorTipo&pagina=${tipo}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return 0;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return 0;
        }
    }

    /**
     * Envia solicitud para cargar una noticia conociendo el id
     * @param {Integer} pagina
     * @returns array de noticias
     */
    static async obtenerNoticiasPorTipoAPaginarEnBackend(pagina, tipo) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerNoticiasPorTipoAPaginar&pagina=${pagina}&tipo=${tipo}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return null;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar una noticia existente en la BDD
     * @param {FormData} formData - Objeto FormData con los datos de la noticia y archivos
     * @returns resultado de la operación
     */
    static async actualizarNoticiaEnBDD(formData) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=actualizarNoticia&actor=admin`, {
                method: 'POST',
                body: formData
            });
            
            let respuesta = await solicitud.json();
            
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
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=insertarNoticia&actor=admin`, {
                method: 'POST',
                body: formData
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return null;
            }
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
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=eliminarNoticia&id=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarInfo(respuesta.mensaje, 3000);
                return false;
            }
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return false;
        }
    }
}
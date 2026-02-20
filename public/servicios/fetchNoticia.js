import { Alerta } from "../utilidades/u_alertas.js";

export class fetchNoticia
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * 
     * @returns lista de todas las noticias recientes de la BDD
     */
    static async obtenerNoticasRecientesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerNoticasRecientes`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * 
     * @returns lista de noticias de tipo comunicado
     */
    static async obtenerNoticiasPorComunicadoDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerNoticiasPorComunicado`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * 
     * @returns lista de todas noticias de la BDD
     */
    static async obtenerNoticiasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&action=obtenerNoticias`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * 
     * @param {*} objeto 
     * @returns el id del nuevo registro insertado
     */
    static async insertarNoticiaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=insertarNoticia`, {
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
     * 
     * @param {*} objeto 
     * @returns 
     */
    static async actualizarNoticiaEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=actualizarNoticia`, {
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
     * 
     * @param {*} id 
     * @returns 
     */
    static async eliminarNoticiaEnBDD(id) {
        try  {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=eliminarNoticia&valor=${id}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @returns la cantidas de paginas a paginar
     */
    static async obtenerCantidadPaginacionEnBDD() {
        try  {
            let solicitud = await fetch(`${this.url}?ruta=noticias&accion=obtenerCantidadPaginacion`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return 0;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return 0;
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns 
     */
    static async obtenerNoticiaByIdEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=obtenerNoticiaById&valor=${id}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNoticia]. ${error}`, 3000);
            return null;
        }
    }


    // NO ESTA EN USO
    static async paginacionEnBDD(pagina = 1)
    {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=paginacion&pagina=${pagina}`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 188. fetchNoticia]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 193. fetchNoticia]`);
                return [];
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 197. fetchNoticia]. ${error}`);
            return [];
        }
    }


    // NO ESTA EN USO
    static async paginaSiguienteEnBDD(pagina = 1)
    {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=paginaSiguiente&pagina=${pagina}`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 188. fetchNoticia]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 193. fetchNoticia]`);
                return [];
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 197. fetchNoticia]. ${error}`);
            return [];
        }
    }


    // NO ESTA EN USO
    static async paginaAnteriorEnBDD(pagina = 1)
    {
        try {
            let solicitud = await fetch(`${this.url}?ruta=noticia&accion=paginaAnterior&pagina=${pagina}`);

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. [linea 188. fetchNoticia]');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. [linea 193. fetchNoticia]`);
                return [];
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 197. fetchNoticia]. ${error}`);
            return [];
        }
    }
}
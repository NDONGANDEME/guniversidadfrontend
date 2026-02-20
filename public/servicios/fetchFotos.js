import { Alerta } from "../utilidades/u_alertas.js";

export class fetchFoto
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * 
     * @param {*} objeto 
     * @returns el id del nuevo registro insertado
     */
    static async insertarFotoEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=insertarFoto`,{
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


    // NO ESTA EN USO
    static async actualizarFotoEnBDD(objeto)
    {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=actualizarFoto`,{
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });

            if (!solicitud.ok) Alerta.error('Error', 'Fallo en la solicitud. Estoy en fetchFoto (2)');

            let respuesta = await solicitud.json();
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.error('Error', `${respuesta.mensaje}. Estoy en fetchFoto (2)`);
                return null;
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud, estoy en fetchFoto (2). ${error}`);
            return null;
        }
    }
    
    /**
     * 
     * @returns lista de todas las fotos de la BDD
     */
    static async obtenerFotosEnBDD() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=obtenerFotos`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFoto]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns 
     */
    static async eliminarFotoEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=eliminarFoto&valor=${id}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFoto]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Obtiene las fotos de la BDD por noticias
     * @param {int} idNoticia - id de la noticia la cual queremos obtener sus fotos
     * @returns array de las fotos pertenecientes a la noticia cuyo id disponemos
     */
    static async obtenerFotosPorNoticiaEnBDD(idNoticia) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=foto&accion=obtenerFotosPorNoticia&valor=${idNoticia}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFoto]. ${error}`, 3000);
            return [];
        }
    }
}
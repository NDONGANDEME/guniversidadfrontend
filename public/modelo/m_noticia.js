import { fetchNoticia } from "../servicios/fetchNoticia.js";

export class m_noticia
{
    constructor(idNoticia, asunto, descripcion, tipo, fechaPublicacion, fotos=[]){
        this.idNoticia = idNoticia;
        this.asunto = asunto;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.fechaPublicacion = fechaPublicacion;
        this.fotos = fotos;
    }

    /*
        tipo(comunicado(publico en general),interna(para los de la misma facultad), departamento(miembros del mismo departamento))

        - Para las noticias que tengan muchas imagenes, la parte de imagenes hacerlo como un carrusel para mostrar todas las imagenes
        - para las noticias que se creen en la parte del admin, dar opciones de modificar y de elminar las noticas.
    */

    // obtiene las noticias mas recientes del backend
    static async obtenerNoticiasRecientes() {
        return await fetchNoticia.obtenerNoticiasRecientesDelBackend();
    }

    // obtiene todas las noticias del backend
    static async obtenerNoticias() {
        return await fetchNoticia.obtenerNoticiasDelBackend();
    }

    // obtiene todas las noticias de tipo comunicado del backend
    static async obtenerNoticiasPorComunicado() {
        return await fetchNoticia.obtenerNoticiasPorComunicadoDelBackend(); 
    }

    // obtiene todas las noticias de tipo interna del backend
    static async obtenerNoticiasPorInterna() {
        return await fetchNoticia.obtenerNoticiasPorInternaDelBackend(); 
    }

    static async obtenerCantidadPaginacion() {
        return await fetchNoticia.obtenerCantidadPaginacionEnBDD();
    }

    static async obtenerNoticiaPorId(id) {
        return await fetchNoticia.obtenerNoticiaPorIdEnBDD(id)
    }

    static async insertarNoticia(formData) {
        return await fetchNoticia.insertarNoticiaEnBDD(formData)
    }

    static async actualizarNoticia(formData) {
        return await fetchNoticia.actualizarNoticiaEnBDD(formData)
    }

    static async eliminarNoticia(id) {
        return await fetchNoticia.eliminarNoticiaEnBDD(id)
    }
}
import { fetchNoticia } from "../servicios/fetchNoticia.js";

export class m_noticia
{
    constructor(idNoticia, asunto, descripcion, tipo, fechaPublicacion){
        this.idNoticia = idNoticia;
        this.asunto = asunto;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.fechaPublicacion = fechaPublicacion;
    }

    /*
        tipo(comunicado(publico en general),interna(para los de la misma facultad), departamento(miembros del mismo departamento))
    */

    // obtiene las noticias mas recientes del backend
    static async obtenerNoticiasRecientes(actor) {
        return await fetchNoticia.obtenerNoticiasRecientesDelBackend(actor);
    }

    // obtiene todas las noticias del backend
    static async obtenerNoticias(actor) {
        return await fetchNoticia.obtenerNoticiasDelBackend(actor);
    }

    // obtiene todas las noticias de tipo comunicado del backend
    static async obtenerNoticiasPorComunicado(actor) {
        return await fetchNoticia.obtenerNoticiasPorComunicadoDelBackend(actor); 
    }

    static async obtenerCantidadPaginacion(actor) {
        return await fetchNoticia.obtenerCantidadPaginacionEnBDD(actor);
    }

    static async obtenerNoticiaPorId(id) {
        return await fetchNoticia.obtenerNoticiaPorIdEnBDD(id)
    }

    static async insertarNoticiaEn(objeto, actor) {
        return await fetchNoticia.insertarNoticiaEnBDD(objeto, actor)
    }

    static async actualizarNoticia(objeto, actor) {
        return await fetchNoticia.actualizarNoticiaEnBDD(objeto, actor)
    }

    static async eliminarNoticia(id, actor) {
        return await fetchNoticia.eliminarNoticiaEnBDD(id, actor)
    }
}
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
    static async obtenerNoticiasRecientes() {
        return await fetchNoticia.obtenerNoticasRecientesDelBackend();
    }

    // obtiene todas las noticias del backend
    static async obtenerNoticias() {
        return await fetchNoticia.obtenerNoticiasDelBackend();
    }

    // obtiene todas las noticias de tipo comunicado del backend
    static async obtenerNoticiasPorComunicado() {
        return await fetchNoticia.obtenerNoticiasPorComunicadoDelBackend(); 
    }

    static async obtenerCantidadPaginacion() {
        return await fetchNoticia.obtenerCantidadPaginacionEnBDD();
    }

    static async obtenerNoticiaById(id) {
        return await fetchNoticia.obtenerNoticiaByIdEnBDD(id)
    }
}
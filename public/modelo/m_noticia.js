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

    static async obtenerCantidadPaginacion() {
        return await fetchNoticia.obtenerCantidadPaginacionEnBDD();
    }

    static async obtenerNoticiaPorId(id) {
        return await fetchNoticia.obtenerNoticiaPorIdEnBDD(id)
    }

    static async insertarNoticiaEn(objeto) {
        return await fetchNoticia.insertarNoticiaEnBDD(objeto)
    }

    static async actualizarNoticia(objeto) {
        return await fetchNoticia.actualizarNoticiaEnBDD(objeto)
    }

    static async eliminarNoticia(id) {
        return await fetchNoticia.eliminarNoticiaEnBDD(id)
    }
}
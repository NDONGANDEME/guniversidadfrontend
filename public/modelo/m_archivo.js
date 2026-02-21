import { fetchArchivo } from "../servicios/fetchArchivo.js";

export class m_archivo
{
    constructor(idArchivo, url, tipoArchivo, idReferencia, tablaReferencia)
    {
        this.idArchivo = idArchivo;
        this.url = url;
        this.tipoArchivo = tipoArchivo;
        this.idReferencia = idReferencia;
        this.tablaReferencia = tablaReferencia;
    }

    /*
        tipoArchivo: foto, pdf, word
        idReferencia: con la tabla que esté trabajando: idNoticia, idTitulo...
        tablaReferencia: con la tabla que esta trabajando: noticias, titulos...
    */

    static async obtenerArchivos(actor) {
        return await fetchArchivo.obtenerArchivosDelBackend(actor);
    }

    static async insertarArchivo(objeto, actor) {
        return await fetchArchivo.insertarArchivoEnBDD(objeto, actor);
    }

    static async actualizarArchivo(objeto, actor) {
        return await fetchArchivo.actualizarArchivoEnBDD(objeto, actor);
    }

    static async eliminarArchivo(id, actor) {
        return await fetchArchivo.eliminarArchivoEnBDD(id, actor);
    }

    static async obtenerArchivosPorNoticia(idNoticia, actor) {
        return await fetchArchivo.obtenerArchivosPorNoticiaEnBDD(idNoticia, actor);
    }
}
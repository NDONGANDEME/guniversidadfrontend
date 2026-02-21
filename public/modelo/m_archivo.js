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

    static async obtenerArchivos() {
        return await fetchArchivo.obtenerArchivosDelBackend();
    }

    static async insertarArchivo(objeto) {
        return await fetchArchivo.insertarArchivoEnBDD(objeto);
    }

    static async actualizarArchivo(objeto) {
        return await fetchArchivo.actualizarArchivoEnBDD(objeto);
    }

    static async eliminarArchivo(id) {
        return await fetchArchivo.eliminarArchivoEnBDD(id);
    }

    static async obtenerArchivosPorNoticia(idNoticia) {
        return await fetchArchivo.obtenerArchivosPorNoticiaEnBDD(idNoticia);
    }
}
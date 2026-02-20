import { fetchFoto } from "../servicios/fetchFotos.js";

export class m_foto
{
    constructor(idFoto, url, idNoticia)
    {
        this.idFoto = idFoto;
        this.url = url;       
        this.idNoticia = idNoticia;
    }

    static async obtenerFotosPorNoticia(idNoticia) {
        return await fetchFoto.obtenerFotosPorNoticiaEnBDD(idNoticia);
    }
}
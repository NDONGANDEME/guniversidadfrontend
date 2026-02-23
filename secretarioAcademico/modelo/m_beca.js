import { fetchBeca } from "../servicios/fetchBeca.js";

export class m_beca
{
    constructor (idBeca, institucionBeca, tipoBeca) {
        this.idBeca = idBeca;
        this.institucionBeca = institucionBeca;
        this.tipoBeca = tipoBeca;
    }

    static async obtenerBecas() {
        return await fetchBeca.obtenerBecasDelBackend();
    }

    static async insertarBeca(objeto) {
        return await fetchBeca.insertarBecaEnBDD(objeto);
    }

    static async actualizarBeca(objeto) {
        return await fetchBeca.actualizarBecaEnBDD(objeto);
    }

    static async eliminarBeca(id) {
        return await fetchBeca.eliminarBecaEnBDD(id);
    }
}
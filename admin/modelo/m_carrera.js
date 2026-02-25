import { fetchCarrera } from "../servicios/fetchCarrera.js";

export class m_carrera
{
    constructor(idCarrera, nombreCarrera, idDepartamento, estado)
    {
        this.idCarrera = idCarrera;
        this.nombreCarrera = nombreCarrera;
        this.idDepartamento = idDepartamento;
        this.estado = estado;
    }

    static async obtenerCarreras() {
        return await fetchCarrera.obtenerCarrerasDelBackend();
    }

    static async insertaCarrera(objeto) {
        return await fetchCarrera.insertarCarreraEnBackend(objeto);
    }

    static async actualizaCarrera(objeto) {
        return await fetchCarrera.actualizarCarreraEnBackend(objeto);
    }

    static async deshabilitaCarrera(id) {
        return await fetchCarrera.deshabilitarCarreraEnBackend(id);
    }

    static async habilitaCarrera(id) {
        return await fetchCarrera.habilitarCarreraEnBackend(id);
    }
}
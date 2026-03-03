import { fetchDepartamento } from "../servicios/fetchDepartamento.js";

export class m_departamento
{
    constructor(idDepartamento, nombre, idFacultad)
    {
        this.idDepartamento = idDepartamento;
        this.nombre = nombre;
        this.idFacultad = idFacultad;
    }

    static async obtenerDepartamentos() {
        return await fetchDepartamento.obtenerDepartamentosDelBackend();
    }

    static async obtenerDepartamentosPorFacultad(idFacultad) {
        return await fetchDepartamento.obtenerDepartamentosPorFacultadDelBackend(idFacultad);
    }

    static async insertarDepartamento(objeto) {
        return await fetchDepartamento.insertarDepartamentoEnBackend(objeto);
    }

    static async actualizarDepartamento(objeto) {
        return await fetchDepartamento.actualizarDepartamentoEnBackend(objeto);
    }

    static async eliminarDepartamento(id) {
        return await fetchDepartamento.eliminarDepartamentoEnBackend(id);
    }
}
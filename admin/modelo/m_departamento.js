// m_departamento.js - CORREGIDO
import { fetchDepartamento } from "../servicios/fetchDepartamento.js";

export class m_departamento
{
    constructor(idDepartamento, nombre, idFacultad)
    {
        this.idDepartamento = idDepartamento || null;
        this.nombre = nombre || null;
        this.idFacultad = idFacultad || null;
    }

    // NOTA: Estos métodos estaban mal nombrados (decían Facultad pero son Departamento)
    static async obtenerDepartamentos() {
        return await fetchDepartamento.obtenerDepartamentosDelBackend();
    }

    static async insertarDepartamento(objeto) {
        return await fetchDepartamento.insertarDepartamentoEnBackend(objeto);
    }

    static async actualizarDepartamento(objeto) {
        return await fetchDepartamento.actualizarDepartamentoEnBackend(objeto);
    }

    static async deshabilitarDepartamento(id) {
        return await fetchDepartamento.deshabilitarDepartamentoEnBackend(id);
    }

    static async habilitarDepartamento(id) {
        return await fetchDepartamento.habilitarDepartamentoEnBackend(id);
    }
}
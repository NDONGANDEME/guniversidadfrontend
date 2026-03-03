import { fetchFamiliar } from "../servicios/fetchFamiliar.js";

export class m_familiar
{
    constructor (idFamiliar, nombre, apellidos, dipFamiliar, telefono, correoFamiliar, direccion, parentesco, esContactoIncidentes, esResponsablePago, idEstudiante) {
        this.idFamiliar = idFamiliar;
        this.nombre = nombre;
        this.apellidos = apellidos;
        this.dipFamiliar = dipFamiliar;
        this.telefono = telefono;
        this.correoFamiliar = correoFamiliar;
        this.direccion = direccion;
        this.parentesco = parentesco;
        this.esContactoIncidentes = esContactoIncidentes;
        this.esResponsablePago = esResponsablePago;
        this.idEstudiante = idEstudiante;
    }

    static async obtenerFamiliares() {
        return await fetchFamiliar.obtenerFamiliaresDelBackend();
    }

    static async obtenerFamiliarResponsablePorEstudiante(idEstudiante) {
        return await fetchFamiliar.obtenerFamiliarResponsablePorEstudianteDelBackend(idEstudiante);
    }

    static async insertarFamiliar(objeto) {
        return await fetchFamiliar.insertarFamiliarEnBDD(objeto);
    }

    static async actualizarFamiliar(objeto) {
        return await fetchFamiliar.actualizarFamiliarEnBDD(objeto);
    }

    static async eliminarFamiliar(id) {
        return await fetchFamiliar.eliminarFamiliarEnBDD(id);
    }
}
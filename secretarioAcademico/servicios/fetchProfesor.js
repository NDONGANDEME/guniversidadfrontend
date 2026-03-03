import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchProfesor
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los profesores de la BDD
     * @returns array de profesores
     */
    static async obtenerProfesoresPorFacultadDelBackend(idFacultad) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=profesor&accion=obtenerProfesoresPorFacultad&actor=secretario&valor=${idFacultad}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchProfesor]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para listar los profesores de la BDD
     * @returns array de profesores
     */
    static async obtenerProfesoresPorDepartamentoDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=profesor&accion=obtenerProfesoresPorDepartamento&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchProfesor]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo profesor en la BDD
     * @param {m_profesor} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarProfesorEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=profesor&accion=insertarProfesor&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchProfesor]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un profesor guardado en la BDD
     * @param {m_profesor} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarProfesorEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=profesor&accion=actualizarProfesor&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchProfesor]. ${error}`, 3000);
            return null;
        }
    }
}
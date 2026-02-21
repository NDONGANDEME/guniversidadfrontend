import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchAsignatura
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Obtiene todas las asignaturas almacenadas en la BDD
     * @returns array de asignaturas
     */
    static async obtenerAsignaturasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=obtenerAsignaturas`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Guarda la nueva asignatura creada en la BDD
     * @param {m_asignatura} objeto - objeto que contiene los parametros de la clase asignatura
     * @returns el nuevo id insertado en la BDD
     */
    static async insertarAsignaturaEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=insertarAsignatura`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Modifica los campos, modificados por el usuario, en la BDD
     * @param {m_asignatura} objeto - objeto que contiene los parametros de la clase asignatura
     * @returns el id del registro actualizado
     */
    static async actualizarAsignaturaEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=asignatura&accion=actualizarAsignatura`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAsignatura]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns booleano que indique se se ha desabilitado el registro del id pasado por la url
     */
    static async deshabilitarAsignaturaEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=deshabilitarAsignatura&valor=${id}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 99. fetchAsignatura]. ${error}`);
            return false;
        }
    }

    /**
     * 
     * @param {*} id 
     * @returns booleano que indique se se ha desabilitado el registro del id pasado por la url
     */
    static async habilitarAsignaturaEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=facultad&accion=habilitarAsignatura&valor=${id}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [linea 99. fetchAsignatura]. ${error}`);
            return false;
        }
    }
}
import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchEvaluacion
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar las asistencias de la BDD
     * @returns array de asistencias
     * Ya es funcioanal
     */
    static async obtenerEvaluacionesDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=evaluacion&accion=obtenerEvaluaciones&actor=profesor`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEvaluacion]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva asistencia a la BDD
     * @param {m_asistencia} objeto - objeto que contiene los parametros de la clase curso
     * @returns id del nuevo registro insertado
     */
    static async insertarEvaluacionEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=evaluacion&accion=insertarEvaluacion&actor=profesor`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEvaluacion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_asistencia} objeto - objeto que contiene los parametros de la clase curso
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarEvaluacionEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=evaluacion&accion=actualizarEvaluacion&actor=profesor`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEvaluacion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarEvaluacionEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=evaluacion&accion=eliminarEvaluacion&valor=${id}&actor=profesor`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchEvaluacion]. ${error}`);
            return false;
        }
    }
}
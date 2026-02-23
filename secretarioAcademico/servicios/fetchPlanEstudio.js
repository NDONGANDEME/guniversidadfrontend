import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchPlanEstudio
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los planes de estudios de la BDD
     * @returns array de planes de estudios
     */
    static async obtenerPlanesEstudiosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planEstudio&accion=obtenerPlanesEstudios&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo plan de estudios en la BDD
     * @param {m_archivo} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarPlanEstudioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planEstudio&accion=insertarPlanEstudio&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un plan de estudios guardado en la BDD
     * @param {m_archivo} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarPlanEstudioEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planEstudio&accion=actualizarPlanEstudio&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async deshabilitarPlanEstudioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planEstudio&accion=deshabilitarPlanEstudio&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async habilitarPlanEstudioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=planEstudio&accion=habilitarPlanEstudio&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPlanEstudio]. ${error}`, 3000);
            return false;
        }
    }
}
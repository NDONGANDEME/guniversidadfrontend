import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchNota
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar las asistencias de la BDD
     * @returns array de asistencias
     * Ya es funcioanal
     */
    static async obtenerNotasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=nota&accion=obtenerNotas&actor=profesor`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNota]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva asistencia a la BDD
     * @param {m_asistencia} objeto - objeto que contiene los parametros de la clase curso
     * @returns id del nuevo registro insertado
     */
    static async insertarNotaEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=nota&accion=insertarNota&actor=profesor`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNota]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_asistencia} objeto - objeto que contiene los parametros de la clase curso
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarNotaEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=nota&accion=actualizarNota&actor=profesor`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchNota]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async eliminarNotaEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=nota&accion=eliminarNota&valor=${id}&actor=profesor`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchNota]. ${error}`);
            return false;
        }
    }
}
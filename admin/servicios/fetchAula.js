import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchAula
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Enviar solicitud para cargar las aulas de la BDD
     * @returns array de aulas
     */
    static async obtenerAulasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=aula&accion=obtenerAulas&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAula]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva aula en la BDD
     * @param {m_asignatura} objeto - objeto que contiene los parametros de la clase aula
     * @returns id del nuevo registro insertado
     */
    static async insertarAulaEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=aula&accion=insertarAula&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAula]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_asignatura} objeto - objeto que contiene los parametros de la clase aula
     * @returns id del registro actualizado
     */
    static async actualizarAulaEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=aula&accion=actualizarAula&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAula]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async deshabilitarAulaEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=aula&accion=deshabilitarAula&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchAula]. ${error}`);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async habilitarAulaEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=aula&accion=habilitarAula&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchAula]. ${error}`);
            return false;
        }
    }
}
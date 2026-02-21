import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchCarrera
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar las carreras de la BDD
     * @returns array de carreras
     */
    static async obtenerCarrerasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&action=obtenerCarreras&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva carrera a la BDD
     * @param {m_carrera} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del nuevo registro insertado
     */
    static async insertarCarreraEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=insertarCarrera&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();
            
            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_carrera} objeto - objeto que contiene los parametros de la clase facultad
     * @returns id del registro actualizado
     */
    static async actualizarCarreraEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=actualizarCarrera&actor=admin`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchCarrera]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async deshabilitarCarreraEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=deshabilitarCarrera&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchCarrera]. ${error}`);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns booleano
     */
    static async habilitarCarreraEnBackend(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=carrera&accion=habilitarCarrera&valor=${id}&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.error('Error', `No se ha realizado la solicitud. [fetchCarrera]. ${error}`);
            return false;
        }
    }
}
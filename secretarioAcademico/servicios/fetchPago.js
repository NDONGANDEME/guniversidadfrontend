import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchPago
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los pagos de la BDD
     * @returns array de pagos
     */
    static async obtenerPagosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=pago&accion=obtenerPagos&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPago]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo pago en la BDD
     * @param {m_pago} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarPagoEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=pago&accion=insertarPago&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPago]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un pago guardado en la BDD
     * @param {m_pago} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarPagoEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=pago&accion=actualizarPago&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPago]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async eliminarPagoEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=pago&accion=eliminarPago&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPago]. ${error}`, 3000);
            return false;
        }
    }
}
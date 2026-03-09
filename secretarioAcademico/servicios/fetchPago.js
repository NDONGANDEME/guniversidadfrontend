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
     * @param {m_pago|FormData} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarPagoEnBDD(objeto) {
        objeto.forEach((valor, clave) => {
            console.log(clave + ': ' + valor);
        });
        try {
            // Detectar si es FormData
            const esFormData = objeto instanceof FormData;
            
            const options = {
                method: 'POST',
                body: esFormData ? objeto : JSON.stringify(objeto)
            };
            
            // Solo agregar headers si NO es FormData
            if (!esFormData) {
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            let solicitud = await fetch(`${this.url}?ruta=pago&accion=insertarPago&actor=secretario`, options);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insertar]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un pago guardado en la BDD
     * @param {m_pago|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarPagoEnBDD(objeto) {
        objeto.forEach((valor, clave) => {
            console.log(clave + ': ' + valor);
        });
        try {
            // Detectar si es FormData
            const esFormData = objeto instanceof FormData;
            
            const options = {
                method: 'POST',
                body: esFormData ? objeto : JSON.stringify(objeto)
            };
            
            // Solo agregar headers si NO es FormData
            if (!esFormData) {
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            let solicitud = await fetch(`${this.url}?ruta=pago&accion=actualizarPago&actor=secretario`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. actualizar]. ${error}`, 3000);
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
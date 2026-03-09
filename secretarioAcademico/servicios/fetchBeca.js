import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchBeca
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar las becas de la BDD
     * @returns array de becas
     */
    static async obtenerBecasDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=beca&accion=obtenerBecas&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchBeca]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar una nueva beca en la BDD
     * @param {m_beca|FormData} objeto 
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarBecaEnBDD(objeto) {
        console.log(objeto)
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
            
            let solicitud = await fetch(`${this.url}?ruta=beca&accion=insertarBeca&actor=secretario`, options);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insertar]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un familiar guardado en la BDD
     * @param {m_beca|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarBecaEnBDD(objeto) {
        console.log(objeto)
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
            
            let solicitud = await fetch(`${this.url}?ruta=beca&accion=actualizarBeca&actor=secretario`, options);
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
    static async eliminarBecaEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=beca&accion=eliminarBeca&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchBeca]. ${error}`, 3000);
            return false;
        }
    }
}
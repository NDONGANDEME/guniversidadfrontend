import { Alerta } from "../../public/utilidades/u_alertas.js";
export class fetchEstudianteBeca
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los estudiante becados de la BDD
     * @returns array de estudiante becados
     */
    static async obtenerEstudiantesBecaDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=obtenerEstudiantesBeca&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudianteBeca]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo estudiante becado en la BDD
     * @param {m_estudianteBeca|FormData} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarEstudianteBecadoEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=insertarEstudianteBecado&actor=secretario`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insertar]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un estudiante becado guardado en la BDD
     * @param {m_estudianteBeca|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarEstudianteBecadoEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=actualizarEstudianteBecado&actor=secretario`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. actualizar]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para deshabilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async deshabilitarEstudianteBecadoEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=deshabilitarEstudianteBecado&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudianteBeca]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async habilitarEstudianteBecadoEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudiante&accion=habilitarEstudianteBecado&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudianteBeca]. ${error}`, 3000);
            return false;
        }
    }
}
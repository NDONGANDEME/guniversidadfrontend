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
            let solicitud = await fetch(`${this.url}?ruta=estudianteBeca&accion=obtenerEstudiantesBeca&actor=secretario`);
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
     * @param {m_estudianteBeca} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarEstudianteBecadoEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudianteBeca&accion=insertarEstudianteBecado&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudianteBeca]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un estudiante becado guardado en la BDD
     * @param {m_estudianteBeca} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarEstudianteBecadoEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=estudianteBeca&accion=actualizarEstudianteBecado&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudianteBeca]. ${error}`, 3000);
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
            let solicitud = await fetch(`${this.url}?ruta=estudianteBeca&accion=deshabilitarEstudianteBecado&valor=${id}&actor=secretario`);
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
            let solicitud = await fetch(`${this.url}?ruta=estudianteBeca&accion=habilitarEstudianteBecado&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchEstudianteBeca]. ${error}`, 3000);
            return false;
        }
    }
}
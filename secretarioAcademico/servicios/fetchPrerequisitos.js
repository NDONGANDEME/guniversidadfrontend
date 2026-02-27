import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchPrerequisito
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los prerequisitos de la BDD
     * @returns array de prerequisitos
     * Ya es funcional
     */
    static async obtenerPrerequisitosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=prerrequisito&accion=obtenerPrerrequisitos&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPrerequisito]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo prerequisito en la BDD
     * @param {m_prerequisito} objeto 
     * @returns id del nuevo registro insertado
     * Ya es funcional
     */
    static async insertarPrerequisitoEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=prerrequisito&accion=insertarPrerrequisito&actor=secretario`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPrerequisito]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Enviar solicitud para actualizar un prerequisito guardado en la BDD
     * @param {m_prerequisito} objeto 
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarPrerequisitoEnBDD(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=prerrequisito&accion=actualizarPrrerequisito&actor=secretario`, {
                method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchPrerequisito]. ${error}`, 3000);
            return null;
        }
    }
}
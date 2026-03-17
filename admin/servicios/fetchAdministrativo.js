import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchAdministrativo
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para cargar administrativos de la BDD
     * @returns array de administrativos
     */
    static async obtenerAdministrativosDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=obtenerAdministrativos&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado; 
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchAdministrativo]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo administrativo en la BDD
     * @param {m_administrativo} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarAdministrativoEnBackend(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=insertarAdministrativo&actor=admin`, options);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchAdministrativo. insercion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un administrativo existente de la BDD
     * @param {m_administrativo|FormData} objeto
     * @returns id del registro actualizado
     */
    static async actualizarAdministrativoEnBackend(objeto) {
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
            
            // El ID va en el body, no en la URL
            let solicitud = await fetch(`${this.url}?ruta=administrativo&accion=actualizarAdministrativo&actor=admin`, options);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchAdministrativo. actualizacion]. ${error}`, 3000);
            return null;
        }
    }
}
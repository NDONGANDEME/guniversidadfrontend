import { Alerta } from "../../public/utilidades/u_alertas.js";

export class fetchFamiliar
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para listar los familiares de la BDD
     * @returns array de familiares
     */
    static async obtenerFamiliaresDelBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=familiar&accion=obtenerFamiliares&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFamiliar]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para cargar al familiar responsable de pago
     * @param {Integer} idEstudiante 
     * @returns el nombre del familiar responsable de pago
     */
    static async obtenerFamiliarResponsablePorEstudianteDelBackend(idEstudiante) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=familiar&accion=obtenerFamiliarResponsablePorEstudiante&actor=secretario&valor=${idEstudiante}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFamiliar]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para cargar al familiar responsable de pago
     * @param {Integer} idEstudiante 
     * @returns el nombre del familiar responsable de pago
     */
    static async obtenerFamiliarPorEstudianteDelBackend(idEstudiante) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=familiar&accion=obtenerFamiliarPorEstudiante&actor=secretario&valor=${idEstudiante}`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFamiliar]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo familiar en la BDD
     * @param {m_familiar|FormData} objeto 
     * @returns id del nuevo registro insertado
     */
    static async insertarFamiliarEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=familiar&accion=insertarFamiliar&actor=secretario`, options);
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
     * @param {m_familiar|FormData} objeto 
     * @returns id del registro actualizado
     */
    static async actualizarFamiliarEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=familiar&accion=actualizarFamiliar&actor=secretario`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. actualizacion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para eliminar un registro de la BDD
     * @param {Integer} id 
     * @returns boolean
     */
    static async eliminarFamiliarEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=familiar&accion=eliminarFamiliar&valor=${id}&actor=secretario`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`Error: No se ha realizado la solicitud. [fetchFamiliar]. ${error}`, 3000);
            return false;
        }
    }
}
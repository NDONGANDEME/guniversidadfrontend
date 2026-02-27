import { Alerta } from "../utilidades/u_alertas.js";

export class fetchUsuario
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para deshabilitar a un usuario habilitado
     * @param {Integer} id 
     * @returns booleano
     */
    static async deshabilitarUsuarioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=deshabilitarUsuario&valor=${id}&actor=admin`);
            let respuesta = await solicitud.text();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para habilitar a un usuario deshabilitado
     * @param {Integer} id 
     * @returns booleano
     */
    static async habilitarUsuarioEnBDD(id) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=habilitarUsuario&valor=${id}&actor=admin`);
            let respuesta = await solicitud.text();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return false;
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return false;
        }
    }

    /**
     * Envia solicitud para listar todos los usuarios de la BDD
     * @returns array de usuarios
     * Ya es funcional
     */
    static async obtenerUsuariosEnBDD() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=obtenerUsuarios&actor=admin`);
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return [];
        } catch(error) {
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario]. ${error}`, 3000);
            return [];
        }
    }

    /**
     * Envia solicitud para insertar un nuevo registro en la BDD
     * @param {m_usuario|FormData} objeto 
     * @returns id del registro insertado
     * Ya es funcional
     */
    static async insertarUsuarioEnBDD(objeto) {
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
            
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=insertarUsuario&actor=admin`, options);
            let respuesta = await solicitud.text(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. insercion]. ${error}`, 3000);
            return null;
        }
    }

    /**
     * Envia solicitud para actualizar un registro existente de la BDD
     * @param {m_usuario|FormData} objeto 
     * @returns id del registro actualizado
     * Ya es funcional
     */
    static async actualizarUsuarioEnBDD(objeto) {
        try {
            // Detectar si es FormData
            const esFormData = objeto instanceof FormData;
            
            const options = {
                method: 'PUT',
                body: esFormData ? objeto : JSON.stringify(objeto)
            };
            
            // Solo agregar headers si NO es FormData
            if (!esFormData) {
                options.headers = { 'Content-Type': 'application/json' };
            }
            
            // El ID va en el body, no en la URL
            let solicitud = await fetch(`${this.url}?ruta=usuario&accion=actualizarUsuario&actor=admin`, options);
            let respuesta = await solicitud.text();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return null;
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud. [fetchUsuario. actualizacion]. ${error}`, 3000);
            return null;
        }
    }
}
import { Alerta } from "../utilidades/u_alertas.js";

export class fetchSesion
{
    url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Verifica las credenciales del usuario en el backend
     * @param {m_sesion} objeto - objeto que contiene las credenciales: nombreOCorreo y contraseña 
     * @returns {objetoJSON} - que contiene: nombreUsuario, estado, rol, facultad (si es que es un administrativo)
     */
    static async verificarCredencialesEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${url}?ruta=sesion&action=verificarCredenciales`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarError(`Error [fetchSesion]: ${respuesta.mensaje}.`, 3000);
                return[];
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud [fetchSesion]. ${error}`);
            return[];
        }
    }

    /**
     * Verifica la existencia de un correo en la base de datos
     * @param {string} correo - correo a verificar en la base de datos 
     * @returns 1 (true) o 0 (false)
     */
    static async verificarExistenciaCorreoEnBackend(correo) {
        try {
            let solicitud = await fetch(`${url}?ruta=sesion&action=verificarExistenciaCorreo`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({correo: correo})
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else {
                Alerta.notificarError(`Error [fetchSesion]: ${respuesta.mensaje}.`, 3000);
                return[];
            }
        } catch(error){
            Alerta.error('Error', `No se ha realizado la solicitud [fetchSesion]. ${error}`);
            return[];
        }
    }
}
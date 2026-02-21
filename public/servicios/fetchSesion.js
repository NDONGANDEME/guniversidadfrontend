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
            let solicitud = await fetch(`${url}?ruta=sesion&accion=verificarCredenciales&actor=global`, {
                method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(objeto)
            });
            let respuesta = await solicitud.json();

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return[];
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud [fetchSesion]. ${error}`, 3000);
            return[];
        }
    }
}
import { Alerta } from "../utilidades/u_alertas.js";

export class fetchSesion
{
    static url = '/guniversidadfrontend/public/core/endpoint.php';

    /**
     * Envia solicitud para verificar las credenciales del usuario en el backend
     * @param {m_sesion} objeto - objeto que contiene las credenciales: nombreOCorreo y contraseña 
     * @returns al usuario al que pertenecen las credenciales introducidas en el formulario (se recibe toda su informacion)
     * Ya es funcional
     */
    static async verificarCredencialesEnBackend(objeto) {
        try {
            let solicitud = await fetch(`${this.url}?ruta=sesion&accion=verificarCredenciales&actor=global`, {
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

    /**
     * Enviar solicitud de cierre de sesion
     * @returns boolean
     */
    static async cerrarSesionEnBackend() {
        try {
            let solicitud = await fetch(`${this.url}?ruta=sesion&accion=cerrarSesion&actor=global`);
            let respuesta = await solicitud.json(); console.log(respuesta)

            if(respuesta.estado == 'exito') return respuesta.resultado;
            else return[];
        } catch(error){
            Alerta.notificarError(`No se ha realizado la solicitud [fetchSesion]. ${error}`, 3000);
            return[];
        }
    }
}